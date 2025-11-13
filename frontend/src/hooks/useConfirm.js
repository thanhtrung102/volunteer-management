// ============= src/hooks/useConfirm.js =============
import { useState } from 'react';

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (options = {}) => {
    setConfig({
      title: options.title || 'Xác nhận',
      message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      type: options.type || 'warning', // success, warning, danger
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  return {
    confirm,
    isOpen,
    config,
    handleConfirm,
    handleCancel,
  };
};