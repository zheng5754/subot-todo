import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Todo, Priority } from './useTodos';

interface UseSocketOptions {
  roomId?: string;
}

export function useSocket({ roomId }: UseSocketOptions = {}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(roomId || null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : `http://${window.location.hostname}:3001`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      const room = roomId || new URLSearchParams(window.location.search).get('room') || undefined;
      socket.emit('join', room);
    });

    socket.on('sync', (serverTodos: Todo[]) => {
      setTodos(serverTodos);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      const url = new URL(window.location.href);
      url.searchParams.set('room', currentRoom);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentRoom]);

  const updateTodos = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos);
    socketRef.current?.emit('update', newTodos);
  }, []);

  const addTodo = useCallback((text: string, priority: Priority = 'medium', assignee: string = '', image: string = '') => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      priority,
      assignee,
      image,
    };
    updateTodos([newTodo, ...todos]);
  }, [todos, updateTodos]);

  const toggleTodo = useCallback((id: number) => {
    updateTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [todos, updateTodos]);

  const deleteTodo = useCallback((id: number) => {
    updateTodos(todos.filter(t => t.id !== id));
  }, [todos, updateTodos]);

  const clearCompleted = useCallback(() => {
    updateTodos(todos.filter(t => !t.completed));
  }, [todos, updateTodos]);

  const shareRoom = useCallback(() => {
    if (!currentRoom) {
      const room = Date.now().toString(36) + Math.random().toString(36).slice(2);
      setCurrentRoom(room);
      if (socketRef.current) {
        socketRef.current.emit('join', room);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('room', room);
      navigator.clipboard.writeText(url.toString());
      return url.toString();
    }
    const url = new URL(window.location.href);
    url.searchParams.set('room', currentRoom);
    navigator.clipboard.writeText(url.toString());
    return url.toString();
  }, [currentRoom]);

  return {
    todos,
    connected,
    roomUrl: currentRoom ? `${window.location.origin}?room=${currentRoom}` : null,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    shareRoom,
  };
}
