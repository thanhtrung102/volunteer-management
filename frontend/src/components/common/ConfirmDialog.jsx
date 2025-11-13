// ============= src/components/common/ConfirmDialog.jsx =============
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const icons = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  danger: AlertTriangle,
};

const colors = {
  warning: 'text-yellow-600',
  success: 'text-green-600',
  info: 'text-blue-600',
  danger: 'text-red-600',
};

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const Icon = icons[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${colors[type]}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};