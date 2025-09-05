import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaFileAlt, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';

const KnowledgeBaseNode = ({ data }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setUploadStatus('Only PDF files are supported');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://192.168.0.148:8000/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        setUploadedFile(file.name);
        setUploadStatus('✅ Uploaded successfully!');
      } else {
        setUploadStatus(`❌ ${result.detail || 'Upload failed'}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Upload error: ${error.message}`);
    }

    setUploading(false);
  };

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border border-gray-300 min-w-[240px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FaFileAlt className="text-green-600" />
        <div className="text-gray-900 font-medium">Knowledge Base</div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        Upload PDF for AI context
      </div>

      {/* File Upload */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload PDF File</label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {uploading ? (
              <FaSpinner className="animate-spin text-blue-500" size={12} />
            ) : uploadedFile ? (
              <FaCheck className="text-green-600" size={12} />
            ) : (
              <FaUpload className="text-gray-500" size={12} />
            )}
            <span className="text-sm text-gray-700 truncate">
              {uploadedFile || 'Choose PDF file...'}
            </span>
          </label>
        </div>
        {uploadStatus && (
          <p className="text-xs mt-1 text-gray-500">{uploadStatus}</p>
        )}
      </div>

      {/* Model Select */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Embedding Model</label>
        <select className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none">
          <option>Built-in AI Processing</option>
        </select>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"
      />
    </div>
  );
};

export default KnowledgeBaseNode;

