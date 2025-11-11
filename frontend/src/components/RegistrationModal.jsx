// src/components/RegistrationModal.jsx
import React, { useState } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';

export default function RegistrationModal({ eventId, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/events/${eventId}/register`, { message });
      toast.success('Đăng ký thành công');
      onSuccess && onSuccess(data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal">
      <div className="modal-body">
        <h3>Xác nhận đăng ký</h3>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Ghi chú (kỹ năng, lưu ý)"></textarea>
        <div className="actions">
          <button onClick={onClose} disabled={loading}>Huỷ</button>
          <button onClick={handleConfirm} disabled={loading}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
