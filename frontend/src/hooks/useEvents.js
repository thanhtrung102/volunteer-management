// ==================== frontend/src/hooks/useEvents.js ====================
import { useState, useEffect } from 'react';
import { eventsAPI } from '@/api/events';
import toast from 'react-hot-toast';

export const useEvents = (initialFilters = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters)]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsAPI.getAll(filters);
      if (data.success) {
        setEvents(data.data);
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          pages: data.pages || 0,
        });
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return { 
    events, 
    loading, 
    error, 
    filters,
    pagination,
    updateFilters,
    clearFilters,
    refetch: fetchEvents 
  };
};

export const useEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsAPI.getById(eventId);
      if (data.success) {
        setEvent(data.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const registerEvent = async (notes = '') => {
    try {
      const data = await eventsAPI.register(eventId, { notes });
      if (data.success) {
        toast.success('Đăng ký thành công!');
        await fetchEvent(); // Refresh event data
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại');
      return { success: false, message: err.message };
    }
  };

  return { event, loading, error, refetch: fetchEvent, registerEvent };
};