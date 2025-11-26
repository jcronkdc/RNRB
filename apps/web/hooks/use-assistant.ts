import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface UseAssistantOptions {
  onError?: (error: Error) => void;
}

interface UseAssistantReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  reset: () => void;
}

export function useAssistant(options: UseAssistantOptions = {}): UseAssistantReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        return;
      }

      // Add user message immediately
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId,
            conversationHistory: messages,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(
              data.error || 'Upgrade to Studio tier or add AI Assistant add-on to use this feature'
            );
          }
          if (response.status === 429) {
            throw new Error(
              data.error || 'You have reached your monthly conversation limit. Upgrade for more!'
            );
          }
          throw new Error(data.error || 'Failed to get response from AI Assistant');
        }

        // Add assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Store conversation ID for follow-up messages
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        
        // Remove the user message since we couldn't get a response
        setMessages((prev) => prev.slice(0, -1));
        
        if (options.onError) {
          options.onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, conversationId, options]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setConversationId(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    reset,
  };
}


