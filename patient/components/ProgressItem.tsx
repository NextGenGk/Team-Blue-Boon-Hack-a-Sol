"use client";

import { useState } from "react";
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Pill, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";

interface ChecklistItem {
  item: string;
  time: string;
  completed?: boolean;
}

interface ProgressItemProps {
  id: string;
  checklist_type: string;
  checklist_items: ChecklistItem[];
  completion_percentage: number;
  date: string;
  created_at: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function ProgressItem({
  id,
  checklist_type,
  checklist_items,
  completion_percentage,
  date,
  created_at,
  onEdit,
  onDelete,
  showActions = false
}: ProgressItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-yellow-400 to-yellow-600';
    if (percentage >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const completedItems = checklist_items.filter(item => item.completed).length;
  const totalItems = checklist_items.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              checklist_type === 'medication' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {checklist_type === 'medication' ? (
                <Pill className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 capitalize">
                {checklist_type} Tracking
              </h4>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{completedItems}/{totalItems} completed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(completion_percentage)}`}>
              {completion_percentage.toFixed(1)}%
            </span>
            
            {showActions && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(id);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(id);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 bg-gradient-to-r ${getProgressBarColor(completion_percentage)} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${completion_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Items */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Checklist Items
            </h5>
            {checklist_items.map((item, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  item.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    item.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {item.completed && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm ${
                      item.completed
                        ? "text-green-900 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {item.item}
                  </span>
                  {item.time && (
                    <span className="text-xs text-gray-500 ml-2">
                      • {item.time}
                    </span>
                  )}
                </div>
                {item.completed && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {new Date(created_at).toLocaleDateString()}</span>
          <span>ID: {id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
}