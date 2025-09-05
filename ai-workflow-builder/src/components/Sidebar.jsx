import React from 'react';
import { FaQuestionCircle, FaDatabase, FaBrain, FaFileExport, FaPlus } from 'react-icons/fa';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const components = [
    {
      type: 'userQuery',
      label: 'User Query',
      icon: FaQuestionCircle,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      description: 'Input queries and prompts'
    },
    {
      type: 'knowledgeBase',
      label: 'Knowledge Base',
      icon: FaDatabase,
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      description: 'Upload and process documents'
    },
    {
      type: 'llmEngine',
      label: 'LLM Engine',
      icon: FaBrain,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      description: 'AI processing and generation'
    },
    {
      type: 'output',
      label: 'Output',
      icon: FaFileExport,
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      description: 'Display final results'
    },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaBrain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">GenAI Stack</h1>
            <p className="text-sm text-gray-500">Chat With AI</p>
          </div>
        </div>
      </div>

      {/* Components Section */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-gray-700">Components</h3>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div className="space-y-3">
            {components.map((component) => {
              const IconComponent = component.icon;
              return (
                <div
                  key={component.type}
                  onDragStart={(event) => onDragStart(event, component.type)}
                  draggable
                  className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${component.color}`}
                >
                  <div className="flex-shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{component.label}</div>
                    <div className="text-gray-500 text-xs truncate">{component.description}</div>
                  </div>
                  <FaPlus className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

