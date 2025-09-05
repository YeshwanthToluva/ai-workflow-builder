import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';

const ChatModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. Ask me anything!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // API call to your backend
  const callBackendAPI = async (query) => {
    try {
      const response = await fetch('http://192.168.0.148:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.result;
      } else {
        throw new Error(data.detail || 'API call failed');
      }
    } catch (error) {
      console.error('API Error:', error);
      return `Sorry, I couldn't process your request. Error: ${error.message}`;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      // Add user message
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      
      const userQuery = message;
      setMessage('');
      setIsLoading(true);
      
      // Call your backend API
      const aiResponse = await callBackendAPI(userQuery);
      
      // Add AI response
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">AI Web Search Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {msg.sender === 'user' ? <FaUser size={12} /> : <FaRobot size={12} />}
                </div>
                <div className={`p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white ml-auto' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
                  <FaRobot size={12} />
                </div>
                <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                  <p className="text-sm">🤔 Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;

