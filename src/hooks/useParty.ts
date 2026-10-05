import { useEffect, useState, useCallback, useRef } from 'react';
import type { Todo, Priority } from './useTodos';

interface UsePartyOptions {
  roomId?: string;
}

export function useParty({ roomId }: UsePartyOptions = {}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(roomId || null);
  const wsRef = useRef<WebSocket | null>(null!);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  const connect = useCallback((room: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const partyUrl = `wss://subot-todo.partykit.dev/room/${room}`;
    const ws = new WebSocket(partyUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to PartyKit');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sync') {
          setTodos(data.todos);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect(room);
      }, 2000);
    };

    ws.onerror = () => {
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    const room = roomId || new URLSearchParams(window.location.search).get('room');
    if (room) {
      setCurrentRoom(room);
      connect(room);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [roomId, connect]);

  useEffect(() => {
    if (currentRoom) {
      const url = new URL(window.location.href);
      url.searchParams.set('room', currentRoom);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentRoom]);

  const updateTodos = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'update', todos: newTodos }));
    }
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
      const room = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      setCurrentRoom(room);
      connect(room);
      const url = new URL(window.location.href);
      url.searchParams.set('room', room);
      navigator.clipboard.writeText(url.toString());
      return url.toString();
    }
    const url = new URL(window.location.href);
    url.searchParams.set('room', currentRoom);
    navigator.clipboard.writeText(url.toString());
    return url.toString();
  }, [currentRoom, connect]);

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
