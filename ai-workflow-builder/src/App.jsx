import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FaBrain, FaCommentDots } from 'react-icons/fa';
import UserQueryNode from './components/UserQueryNode';
import KnowledgeBaseNode from './components/KnowledgeBaseNode';
import LLMEngineNode from './components/LLMEngineNode';
import OutputNode from './components/OutputNode';
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';

const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  output: OutputNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'userQuery',
    position: { x: 100, y: 100 },
    data: { label: 'User Query' },
  },
];

const initialEdges = [];

function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes.length, setNodes]
  );

  const handleBuildStack = async () => {
    try {
      const response = await fetch('http://192.168.0.148:8000/api/validate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        alert(`✅ Stack Built Successfully!\n\n${result.message}\n\nWorkflow: ${result.workflow_description}`);
      } else {
        alert(`❌ Cannot Build Stack!\n\n${result.message}\n\nSuggestion: ${result.suggestion}`);
      }
      
    } catch (error) {
      alert(`❌ Build Stack Failed!\n\nError: ${error.message}`);
    }
  };

  const handleChatOpen = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ReactFlowProvider>
        <Sidebar />
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Workflow Builder</h2>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="text-sm text-gray-500">Untitled Workflow</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300">
                Save
              </button>
              <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Deploy
              </button>
            </div>
          </div>

          {/* React Flow Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Controls className="!bg-white !border-gray-300" />
              <MiniMap 
                className="!bg-white !border-gray-300"
                nodeColor="#ffffff"
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Background 
                variant="dots" 
                gap={20} 
                size={1} 
                color="#e5e7eb" 
              />
            </ReactFlow>
          </div>
        </div>

        {/* Right Actions Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
          {/* Actions Header */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Actions</h3>
            <p className="text-sm text-gray-500">Build and test your workflow</p>
          </div>

          {/* Action Buttons */}
          <div className="p-6 space-y-4">
            <button
              onClick={handleBuildStack}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FaBrain className="w-4 h-4" />
              Build Stack
            </button>
            
            <button
              onClick={handleChatOpen}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FaCommentDots className="w-4 h-4" />
              Chat with Stack
            </button>
          </div>

          {/* Stack Information */}
          <div className="p-6 border-t border-gray-200 mt-auto">
            <h4 className="text-md font-medium text-gray-700 mb-3">Stack Info</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Components</span>
                <span className="text-sm font-medium text-gray-900">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Connections</span>
                <span className="text-sm font-medium text-gray-900">{edges.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Status</span>
                <span className={
                  edges.length > 0 
                    ? 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200' 
                    : 'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200'
                }>
                  {edges.length > 0 ? 'Connected' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </ReactFlowProvider>
      
      {isChatOpen && (
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}

export default App;

