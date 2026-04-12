import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8085/ws';

export interface WSEvent {
  topic: string;
  payload: any;
}

export function useWebSocket(topics: string[]) {
  const [messages, setMessages] = useState<WSEvent[]>([]);
  const [lastMessage, setLastMessage] = useState<WSEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const topicsRef = useRef(topics);

  // Keep topics ref updated
  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WS Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSEvent;
        // Only process if we are subscribed to the topic or listening to all ('*')
        if (topicsRef.current.includes('*') || topicsRef.current.includes(data.topic)) {
          setLastMessage(data);
          setMessages((prev) => [...prev, data].slice(-100)); // Keep last 100
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
      setIsConnected(false);
      // Reconnect after delay
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('WS Error:', err);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('Cannot send WS message: not connected');
    }
  }, []);

  return { messages, lastMessage, isConnected, send };
}
