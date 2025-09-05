import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { FaBrain, FaToggleOn, FaToggleOff, FaSave, FaCheck } from 'react-icons/fa';

const LLMEngineNode = ({ data, id }) => {
  // State for all LLM configuration
  const [config, setConfig] = useState({
    model: 'gemini-1.5-flash',
    apiKey: '',
    prompt: 'You are a helpful AI assistant. Use the provided context to answer questions accurately.',
    temperature: 0.75,
    webSearchEnabled: true,
    serpApiKey: ''
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Available models
  const models = [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Better)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Latest)' }
  ];

  // Save configuration to backend
  const saveConfiguration = async () => {
    setIsConfiguring(true);
    try {
      const response = await fetch('http://192.168.0.148:8000/api/llm-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: id,
          config: config
        })
      });

      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save LLM config:', error);
    }
    setIsConfiguring(false);
  };

  // Update configuration
  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  // Load saved configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`http://192.168.0.148:8000/api/llm-config/${id}`);
        if (response.ok) {
          const savedConfig = await response.json();
          setConfig(savedConfig.config);
        }
      } catch (error) {
        console.error('Failed to load LLM config:', error);
      }
    };
    loadConfig();
  }, [id]);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border border-gray-300 min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaBrain className="text-purple-600" />
          <div className="text-gray-900 font-medium">LLM Engine</div>
        </div>
        <button
          onClick={saveConfiguration}
          disabled={isConfiguring}
          className={`p-1 rounded transition-colors ${
            isSaved 
              ? 'text-green-600' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          title="Save Configuration"
        >
          {isConfiguring ? (
            <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          ) : isSaved ? (
            <FaCheck size={14} />
          ) : (
            <FaSave size={14} />
          )}
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        AI processing with configurable settings
      </div>
      
      <div className="space-y-3">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
          <select 
            value={config.model}
            onChange={(e) => updateConfig('model', e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            {models.map(model => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* API Key */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Gemini API Key
            {config.apiKey && <span className="text-green-600 ml-1">✓</span>}
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>
        
        {/* System Prompt */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">System Prompt</label>
          <textarea
            value={config.prompt}
            onChange={(e) => updateConfig('prompt', e.target.value)}
            placeholder="System instructions for the AI..."
            rows="3"
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>
        
        {/* Temperature */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Temperature: {config.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Focused</span>
            <span>Creative</span>
          </div>
        </div>
        
        {/* Web Search Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600">Web Search</label>
          <button
            onClick={() => updateConfig('webSearchEnabled', !config.webSearchEnabled)}
            className={config.webSearchEnabled ? 'text-green-600' : 'text-gray-400'}
          >
            {config.webSearchEnabled ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
          </button>
        </div>
        
        {/* SERP API Key */}
        {config.webSearchEnabled && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SERP API Key (Optional)
              {config.serpApiKey && <span className="text-green-600 ml-1">✓</span>}
            </label>
            <input
              type="password"
              value={config.serpApiKey}
              onChange={(e) => updateConfig('serpApiKey', e.target.value)}
              placeholder="For enhanced web search"
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="query"
        style={{ top: '25%' }}
        className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="context"
        style={{ top: '75%' }}
        className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-600 border-2 border-white rounded-full shadow-sm"
      />
    </div>
  );
};

export default LLMEngineNode;

