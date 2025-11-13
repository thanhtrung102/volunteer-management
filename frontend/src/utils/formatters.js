// ==================== frontend/src/utils/formatters.js ====================
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toLocaleDateString('vi-VN');
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};