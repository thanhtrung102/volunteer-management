// ============= src/hooks/useRegistrations.js =============
import { useState, useEffect } from 'react';
import { registrationsAPI } from '@api/registrations';
import toast from 'react-hot-toast';

export const useRegistrations = (filters = {}) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [JSON.stringify(filters)]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await registrationsAPI.getMyRegistrations(filters);
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async (id, reason = '') => {
    try {
      const data = await registrationsAPI.cancel(id, { reason });
      if (data.success) {
        toast.success('Đã hủy đăng ký');
        fetchRegistrations(); // Refresh list
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Không thể hủy đăng ký');
      return { success: false, message: err.message };
    }
  };

  const addFeedback = async (id, feedback) => {
    try {
      const data = await registrationsAPI.addFeedback(id, feedback);
      if (data.success) {
        toast.success('Đã gửi đánh giá');
        fetchRegistrations();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Không thể gửi đánh giá');
      return { success: false, message: err.message };
    }
  };

  return { 
    registrations, 
    loading, 
    error, 
    refetch: fetchRegistrations,
    cancelRegistration,
    addFeedback
  };
};