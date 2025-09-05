import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaFileExport } from 'react-icons/fa';

const OutputNode = ({ data, selected }) => {
  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-2xl bg-white border-2 min-w-[280px] transition-all duration-200 ${
        selected
          ? 'border-orange-500 shadow-orange-200'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <FaFileExport className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <div className="text-gray-900 font-semibold">Output</div>
          <div className="text-xs text-gray-500">Final results display</div>
        </div>
      </div>

      {/* Output Display */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">Result</label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px] max-h-[200px] overflow-y-auto">
          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {data?.result || 'Output will be generated based on your query...'}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-xs text-gray-600">Ready</span>
      </div>

      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-orange-500 border-2 border-white rounded-full shadow-md hover:bg-orange-400 transition-colors"
        style={{ left: '-10px' }}
      />
    </div>
  );
};

export default OutputNode;

