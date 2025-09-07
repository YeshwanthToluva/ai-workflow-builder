# AI Workflow Backend (FastAPI)

A backend service for an **AI-powered workflow application**, supporting **document uploads (PDFs)**, **LLM configuration**, and **workflow validation**. Designed to integrate with a **React frontend**.

---

## Features

- **PDF Upload and Processing**: Extracts text from user-uploaded PDFs.  
- **Gemini LLM Integration**: Configurable AI model via **Google Generative AI**.  
- **Workflow Validation**: Validates AI workflow structure and connections.  
- **CORS Enabled**: Ready for local React frontend and remote development.  

---

## Getting Started

### 1. Clone the Repository
```bash
git clone git@github.com:your-username/your-repo-name.git
cd your-repo-name
2. Install Dependencies

Create a virtual environment (recommended):

python -m venv venv
# On Windows (CMD):
venv\Scripts\activate
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate


Install requirements:

pip install -r requirements.txt

3. Environment Setup

Copy the example environment file and set your API key:

cp .env.example .env


Edit the .env file:

GEMINI_API_KEY=your_gemini_api_key_here

Usage
1. Run the Server

To allow access from other devices on your private network, bind to all interfaces:

uvicorn main:app --host 0.0.0.0 --port 8000


Replace main:app if your FastAPI app is defined in a different file (e.g., backend:app).

2. Accessing the API

Local machine: http://localhost:8000/

Other devices: http://<your-server-ip>:8000/

Find your server’s IP:

ip a


(Look for your LAN/intranet address, e.g., 192.168.x.y)

3. CORS and Frontend Setup

The backend’s default CORS settings allow requests from:

http://localhost:3000

http://127.0.0.1:3000

For development, allow_origins=["*"] is enabled. For production, restrict origins in main.py.

API Endpoints
Method	Endpoint	Description
GET	/	Health check
POST	/api/upload-document	Upload and process a PDF file
GET	/api/documents	List uploaded PDFs
DELETE	/api/documents/{filename}	Delete a PDF file
POST	/api/llm-config	Save LLM configuration
GET	/api/llm-config/{node_id}	Get LLM configuration for a node
POST	/api/search	Perform AI-powered search
POST	/api/validate-workflow	Validate workflow structure
Development Notes

Firewalls: Open port 8000 if accessing the server remotely.

Security: Development only. Do not use allow_origins=["*"] in production.

PDF Storage: Uploaded PDFs are stored in memory and are volatile.
