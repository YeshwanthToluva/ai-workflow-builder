import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestionCircle } from 'react-icons/fa';

const UserQueryNode = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border border-gray-300 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <FaQuestionCircle className="text-blue-600" />
        <div className="text-gray-900 font-medium">User Query</div>
      </div>
      <div className="text-sm text-gray-600">
        Enter query for queries
      </div>
      <textarea
        className="w-full mt-2 p-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        placeholder="Write your query here"
        rows="2"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-blue-300"
      />
    </div>
  );
};

export default UserQueryNode;

