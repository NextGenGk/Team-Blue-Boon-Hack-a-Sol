"use client";

import { useState } from "react";
import { 
  Pill, 
  Clock, 
  Eye, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User
} from "lucide-react";

interface PrescriptionItem {
  name: string;
  dose: string;
  qty: number;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  items: PrescriptionItem[];
  is_approved: boolean;
  created_at: string;
  caregiver_name?: string;
  caregiver_specializations?: string[];
}

interface PrescriptionCardProps {
  prescription: Prescription;
  onViewDetails?: (prescription: Prescription) => void;
  onDownload?: (prescription: Prescription) => void;
  onShare?: (prescription: Prescription) => void;
}

export default function PrescriptionCard({ 
  prescription, 
  onViewDetails, 
  onDownload, 
  onShare 
}: PrescriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalMedications = () => {
    return prescription.items?.length || 0;
  };

  const getTotalQuantity = () => {
    return prescription.items?.reduce((total, item) => total + (item.qty || 0), 0) || 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              prescription.is_approved 
                ? 'bg-green-100 text-green-600' 
                : 'bg-amber-100 text-amber-600'
            }`}>
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Prescription #{prescription.id.slice(0, 8)}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {prescription.caregiver_name || "Dr. [Caregiver Name]"}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatDate(prescription.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
              prescription.is_approved
                ? "text-green-700 bg-green-100 border border-green-200"
                : "text-amber-700 bg-amber-100 border border-amber-200"
            }`}>
              {prescription.is_approved ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Approved</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Pending</span>
                </>
              )}
            </span>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{getTotalMedications()} meds</span>
              <span>{getTotalQuantity()} total qty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">
            Medications ({getTotalMedications()})
          </h5>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>{isExpanded ? 'Hide' : 'View'} Details</span>
          </button>
        </div>

        {/* Medication Preview */}
        <div className="space-y-2">
          {prescription.items?.slice(0, isExpanded ? undefined : 2).map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200 text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {item.dose}
                      </span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Qty: {item.qty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && (item.frequency || item.duration || item.instructions) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                    {item.frequency && (
                      <div>
                        <span className="font-medium">Frequency:</span> {item.frequency}
                      </div>
                    )}
                    {item.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {item.duration}
                      </div>
                    )}
                    {item.instructions && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Instructions:</span> {item.instructions}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {!isExpanded && prescription.items?.length > 2 && (
            <div className="text-center py-2">
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                +{prescription.items.length - 2} more medications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated: {formatDate(prescription.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onDownload && (
              <button
                onClick={() => onDownload(prescription)}
                className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors"
              >
                <Download className="w-3 h-3 inline mr-1" />
                Download
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(prescription)}
                className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <Share2 className="w-3 h-3 inline mr-1" />
                Share
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(prescription)}
                className="text-xs text-green-600 hover:text-green-800 px-3 py-1 border border-green-200 rounded hover:bg-green-50 transition-colors"
              >
                <Eye className="w-3 h-3 inline mr-1" />
                Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}