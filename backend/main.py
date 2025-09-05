from fastapi import FastAPI, HTTPException, File, UploadFile
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import pypdf
import io

load_dotenv()

app = FastAPI(title="AI Workflow API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# Simple in-memory storage for PDFs
pdf_storage = {}

class SearchRequest(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"message": "AI Workflow API is running!"}

@app.post("/api/upload-document")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process PDF document"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files supported")
    
    try:
        # Read PDF content
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Store in memory
        pdf_storage[file.filename] = {
            "text": text,
            "filename": file.filename
        }
        
        return {
            "message": "PDF uploaded successfully!",
            "filename": file.filename,
            "text_length": len(text),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
llm_configs = {}  # Store LLM configurations

# Add these new endpoints before the existing ones

@app.post("/api/llm-config")
async def save_llm_config(request: dict):
    """Save LLM node configuration"""
    node_id = request.get('nodeId')
    config = request.get('config')
    
    if not node_id or not config:
        raise HTTPException(status_code=400, detail="Missing nodeId or config")
    
    # Store configuration
    llm_configs[node_id] = config
    
    return {
        "message": "LLM configuration saved",
        "nodeId": node_id,
        "status": "success"
    }

@app.get("/api/llm-config/{node_id}")
async def get_llm_config(node_id: str):
    """Get LLM node configuration"""
    if node_id in llm_configs:
        return {
            "config": llm_configs[node_id],
            "status": "success"
        }
    else:
        # Return default config
        return {
            "config": {
                "model": "gemini-1.5-flash",
                "apiKey": "",
                "prompt": "You are a helpful AI assistant. Use the provided context to answer questions accurately.",
                "temperature": 0.75,
                "webSearchEnabled": True,
                "serpApiKey": ""
            },
            "status": "default"
        }

# Update your existing search endpoint to use the configuration
@app.post("/api/search")
async def ai_search(request: SearchRequest):
    """AI search with LLM configuration support"""
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # Get LLM configuration (use first available or default)
        llm_config = next(iter(llm_configs.values())) if llm_configs else {
            "model": "gemini-1.5-flash",
            "prompt": "You are a helpful AI assistant.",
            "temperature": 0.75,
            "webSearchEnabled": True
        }
        
        # Build context from uploaded PDFs
        pdf_context = ""
        if pdf_storage:
            pdf_context = "\n\nAvailable PDF Content:\n"
            for filename, data in pdf_storage.items():
                # Use first 2000 chars of each PDF
                pdf_context += f"\nFrom {filename}:\n{data['text'][:2000]}...\n"
        
        # Create prompt with configuration
        system_prompt = llm_config.get('prompt', 'You are a helpful AI assistant.')
        full_prompt = f"""
        System: {system_prompt}
        
        User Query: {request.query}
        
        {pdf_context}
        
        Please provide a helpful response based on the context above.
        """
        
        # Use configured temperature
        temperature = llm_config.get('temperature', 0.75)
        
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(temperature=temperature)
        )
        
        return {
            "query": request.query,
            "result": response.text,
            "used_pdfs": list(pdf_storage.keys()) if pdf_storage else [],
            "llm_config": {
                "model": llm_config.get('model', 'gemini-1.5-flash'),
                "temperature": temperature
            },
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/documents")
async def list_documents():
    """List uploaded PDFs"""
    return {
        "documents": [
            {
                "filename": filename,
                "text_length": len(data["text"])
            }
            for filename, data in pdf_storage.items()
        ]
    }

@app.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    """Delete uploaded PDF"""
    if filename in pdf_storage:
        del pdf_storage[filename]
        return {"message": f"Deleted {filename}"}
    else:
        raise HTTPException(status_code=404, detail="Document not found")


class WorkflowValidation(BaseModel):
    nodes: list
    edges: list

@app.post("/api/validate-workflow")
async def validate_workflow(workflow: WorkflowValidation):
    """Validate workflow connections and structure"""
    
    try:
        nodes = {node['id']: node for node in workflow.nodes}
        edges = workflow.edges
        
        # Check minimum nodes
        if len(nodes) < 2:
            return {
                "status": "error",
                "message": "Workflow needs at least 2 components to build a stack!",
                "suggestion": "Drag more components from the sidebar.",
                "workflow_description": ""
            }
        
        # Check for connections
        if len(edges) == 0:
            return {
                "status": "error", 
                "message": "Components are not connected!",
                "suggestion": "Connect the nodes by dragging from output handles to input handles.",
                "workflow_description": ""
            }
        
        # Validate workflow types and connections
        validation_result = validate_workflow_structure(nodes, edges)
        
        if validation_result['valid']:
            return {
                "status": "success",
                "message": validation_result['message'],
                "workflow_description": validation_result['description'],
                "components": list(nodes.keys())
            }
        else:
            return {
                "status": "error",
                "message": validation_result['message'],
                "suggestion": validation_result['suggestion'],
                "workflow_description": ""
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Workflow validation failed: {str(e)}",
            "suggestion": "Check your workflow structure and try again.",
            "workflow_description": ""
        }

def validate_workflow_structure(nodes, edges):
    """Validate the actual workflow logic"""
    
    node_types = [node['type'] for node in nodes.values()]
    
    # Required component checks
    has_user_query = 'userQuery' in node_types
    has_llm = 'llmEngine' in node_types
    has_output = 'output' in node_types
    has_knowledge = 'knowledgeBase' in node_types
    
    # Build connection map
    connections = {}
    for edge in edges:
        source = edge['source']
        target = edge['target']
        if source not in connections:
            connections[source] = []
        connections[source].append(target)
    
    # Validation rules
    if not has_user_query:
        return {
            'valid': False,
            'message': 'Missing User Query component!',
            'suggestion': 'Add a User Query node to start your workflow.'
        }
    
    if not has_llm:
        return {
            'valid': False,
            'message': 'Missing LLM Engine component!',
            'suggestion': 'Add an LLM Engine node to process queries.'
        }
    
    if not has_output:
        return {
            'valid': False,
            'message': 'Missing Output component!',
            'suggestion': 'Add an Output node to display results.'
        }
    
    # Check if User Query connects to something
    user_query_nodes = [node_id for node_id, node in nodes.items() if node['type'] == 'userQuery']
    user_connected = any(uq in connections for uq in user_query_nodes)
    
    if not user_connected:
        return {
            'valid': False,
            'message': 'User Query is not connected to anything!',
            'suggestion': 'Connect User Query to Knowledge Base or LLM Engine.'
        }
    
    # Check if LLM connects to output
    llm_nodes = [node_id for node_id, node in nodes.items() if node['type'] == 'llmEngine']
    output_nodes = [node_id for node_id, node in nodes.items() if node['type'] == 'output']
    
    llm_to_output = any(
        any(target in output_nodes for target in connections.get(llm, []))
        for llm in llm_nodes
    )
    
    if not llm_to_output:
        return {
            'valid': False,
            'message': 'LLM Engine is not connected to Output!',
            'suggestion': 'Connect LLM Engine output to the Output component.'
        }
    
    # Determine workflow type and create description
    workflow_description = create_workflow_description(node_types, has_knowledge, connections, nodes)
    
    return {
        'valid': True,
        'message': f'Perfect! Your AI workflow is ready with {len(nodes)} components and {len(edges)} connections.',
        'description': workflow_description
    }

def create_workflow_description(node_types, has_knowledge, connections, nodes):
    """Create a human-readable workflow description"""
    
    if has_knowledge:
        return f"""
📄 PDF-Powered AI Assistant
• User asks questions
• System searches uploaded PDFs for context
• AI generates intelligent responses using document knowledge
• Results displayed to user

This creates a smart document Q&A system!
        """.strip()
    else:
        return f"""
🤖 General AI Assistant  
• User asks questions
• AI processes queries directly
• Smart responses generated
• Results displayed to user

This creates a general-purpose AI chatbot!
        """.strip()


# CORS for React frontend - MORE PERMISSIVE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.148:3000", "*"],  # Add wildcard for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

