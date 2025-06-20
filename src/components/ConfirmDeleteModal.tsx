import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  type?: 'danger' | 'warning';
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'حذف',
  cancelText = 'إلغاء',
  loading = false,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                type === 'danger' ? 'text-red-600' : 'text-yellow-600'
              }`} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed" dir="rtl">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
