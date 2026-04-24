import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Local event bus — replaces the WebSocket connection.
 * Allows components to communicate in real-time without a backend server.
 * Works identically to the old WebSocket hook from the consumer's perspective.
 */

type EventHandler = (payload: any) => void;

class LocalEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(topic: string, handler: EventHandler): void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(handler);
  }

  off(topic: string, handler: EventHandler): void {
    this.listeners.get(topic)?.delete(handler);
  }

  emit(topic: string, payload: any): void {
    // Notify topic-specific listeners
    this.listeners.get(topic)?.forEach(handler => {
      try { handler(payload); } catch (err) { console.error('EventBus handler error:', err); }
    });
    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(handler => {
      try { handler({ topic, payload }); } catch (err) { console.error('EventBus handler error:', err); }
    });
  }
}

// Singleton event bus shared across all components
export const eventBus = new LocalEventBus();

export interface WSEvent {
  topic: string;
  payload: any;
}

/**
 * Drop-in replacement for the WebSocket hook.
 * Uses the local event bus instead of a real WebSocket connection.
 * Always reports as "connected" since there's no network dependency.
 */
export function useWebSocket(topics: string[]) {
  const [messages, setMessages] = useState<WSEvent[]>([]);
  const [lastMessage, setLastMessage] = useState<WSEvent | null>(null);
  const [isConnected] = useState(true); // Always connected locally
  const topicsRef = useRef(topics);

  // Keep topics ref updated
  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  useEffect(() => {
    const handlers: Array<{ topic: string; handler: EventHandler }> = [];

    // Subscribe to each topic
    for (const topic of topics) {
      if (topic === '*') {
        // Wildcard: listen to everything
        const handler = (evt: WSEvent) => {
          setLastMessage(evt);
          setMessages(prev => [...prev, evt].slice(-100));
        };
        eventBus.on('*', handler);
        handlers.push({ topic: '*', handler });
      } else {
        const handler = (payload: any) => {
          const evt: WSEvent = { topic, payload };
          setLastMessage(evt);
          setMessages(prev => [...prev, evt].slice(-100));
        };
        eventBus.on(topic, handler);
        handlers.push({ topic, handler });
      }
    }

    return () => {
      for (const { topic, handler } of handlers) {
        eventBus.off(topic, handler);
      }
    };
  }, [topics.join(',')]); // Re-subscribe if topics change

  const send = useCallback((message: any) => {
    // For local mode, emit the message locally
    if (message?.topic) {
      eventBus.emit(message.topic, message.payload);
    }
  }, []);

  return { messages, lastMessage, isConnected, send };
}
