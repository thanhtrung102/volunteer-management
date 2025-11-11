// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(namespace = '/') {
  const socketRef = useRef();

  useEffect(() => {
    const url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(url, { path: '/socket.io', transports: ['websocket'] });

    return () => {
      socketRef.current.disconnect();
    };
  }, [namespace]);

  return socketRef;
}
