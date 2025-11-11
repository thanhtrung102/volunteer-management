// src/pages/EventChannel.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import api from '../api/api';
import PostItem from '../components/PostItem';

export default function EventChannel() {
  const { id: eventId } = useParams();
  const socketRef = useSocket();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    api.get(`/api/events/${eventId}/posts`)
      .then(res => setPosts(Array.isArray(res.data) ? res.data : res.data.items || []))
      .catch(console.error);

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('join_event_room', { eventId });

    socket.on('post_created', post => {
      setPosts(prev => [post, ...prev]);
    });

    socket.on('post_updated', updated => {
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
    });

    socket.on('comment_created', ({ postId, comment }) => {
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...(p.comments||[]), comment] } : p));
    });

    socket.on('post_deleted', ({ postId }) => {
      setPosts(prev => prev.filter(p => p._id !== postId));
    });

    return () => {
      socket.emit('leave_event_room', { eventId });
      socket.off('post_created');
      socket.off('post_updated');
      socket.off('comment_created');
      socket.off('post_deleted');
    };
    // eslint-disable-next-line
  }, [eventId, socketRef]);

  async function handlePost() {
    if (!text && !file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('text', text);
      if (file) fd.append('image', file);
      await api.post(`/api/events/${eventId}/posts`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setText('');
      setFile(null);
      // server should broadcast created post via socket
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi đăng bài');
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId) {
    try {
      await api.post(`/api/posts/${postId}/like`);
      // server will broadcast update
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container">
      <h2>Kênh sự kiện</h2>

      <div className="composer card">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Viết bài..." rows={4} />
        <div className="composer-actions">
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          <button onClick={handlePost} disabled={loading}>{loading ? 'Đang đăng...' : 'Đăng'}</button>
        </div>
      </div>

      <div className="posts">
        {posts.length === 0 ? <p>Chưa có bài viết nào.</p> :
          posts.map(p => (
            <PostItem key={p._id || p.id} post={p} onLike={() => handleLike(p._id || p.id)} />
          ))
        }
      </div>
    </div>
  );
}
