// ============= src/hooks/useDashboard.js =============
import { useState, useEffect } from 'react';
import { dashboardAPI } from '@api/dashboard';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardAPI.getVolunteerDashboard();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
};