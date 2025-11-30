import { useState, useCallback, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

interface ActionEvent {
  action: string;
  status: 'executing' | 'completed';
  result?: unknown;
}

interface UseAssistantOptions {
  onError?: (error: Error) => void;
  onAction?: (action: ActionEvent) => void;
  streaming?: boolean;
}

interface UseAssistantReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  conversationId: string | null;
  currentAction: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  reset: () => void;
  stopStreaming: () => void;
}

export function useAssistant(options: UseAssistantOptions = {}): UseAssistantReturn {
  const { streaming = true } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

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
      setCurrentAction(null);

      // Create abort controller for streaming
      abortControllerRef.current = new AbortController();

      try {
        if (streaming) {
          // Use streaming endpoint
          const response = await fetch('/api/assistant/chat/stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              conversationId,
              conversationHistory: messages,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            // Try to parse as JSON first (error responses should be JSON now)
            let errorData: { error?: string; code?: string } = {};
            try {
              const text = await response.text();
              // Try parsing as JSON
              errorData = JSON.parse(text);
            } catch {
              // If not JSON, use generic error based on status
            }

            if (response.status === 401) {
              throw new Error('Please sign in to use the AI Assistant');
            }
            if (response.status === 403) {
              throw new Error(errorData.error || 'Upgrade to Studio tier to use AI Assistant');
            }
            if (response.status === 429) {
              throw new Error(errorData.error || 'Monthly conversation limit reached');
            }
            if (response.status === 503) {
              throw new Error(errorData.error || 'AI service is temporarily unavailable');
            }
            throw new Error(errorData.error || `Error ${response.status}: Failed to get response`);
          }

          if (!response.body) {
            throw new Error('No response body');
          }

          setIsStreaming(true);
          setIsLoading(false);

          // Add empty assistant message that we'll stream into
          const assistantMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Read the stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    // Handle text chunks
                    if (data.text) {
                      accumulatedContent += data.text;
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === 'assistant') {
                          lastMessage.content = accumulatedContent;
                        }
                        return newMessages;
                      });
                    }

                    // Handle action events
                    if (data.action) {
                      setCurrentAction(data.status === 'executing' ? data.action : null);
                      if (options.onAction) {
                        options.onAction(data as ActionEvent);
                      }
                    }

                    // Handle completion
                    if (data.done) {
                      if (data.conversationId) {
                        setConversationId(data.conversationId);
                      }
                      // Mark message as no longer streaming
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === 'assistant') {
                          lastMessage.isStreaming = false;
                        }
                        return newMessages;
                      });
                    }

                    // Handle errors
                    if (data.error) {
                      throw new Error(data.error);
                    }
                  } catch (parseError) {
                    // Skip invalid JSON lines
                    if (line.slice(6).trim()) {
                      console.warn('Failed to parse SSE data:', line);
                    }
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } else {
          // Use non-streaming endpoint
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
            signal: abortControllerRef.current.signal,
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Please sign in to use the AI Assistant');
            }
            if (response.status === 403) {
              throw new Error(data.error || 'Upgrade to Studio tier to use AI Assistant');
            }
            if (response.status === 429) {
              throw new Error(data.error || 'Monthly conversation limit reached');
            }
            if (response.status === 503) {
              throw new Error(data.error || 'AI service is temporarily unavailable');
            }
            throw new Error(data.error || `Error ${response.status}: Failed to get response`);
          }

          const assistantMessage: Message = {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (data.conversationId) {
            setConversationId(data.conversationId);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled, don't show error
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        // Remove the incomplete messages
        setMessages((prev) => {
          const filtered = prev.filter((m) => !(m.role === 'assistant' && m.isStreaming));
          // Also remove the user message if we got an error
          if (filtered.length > 0 && filtered[filtered.length - 1]?.role === 'user') {
            return filtered.slice(0, -1);
          }
          return filtered;
        });

        if (options.onError) {
          options.onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setCurrentAction(null);
        abortControllerRef.current = null;
      }
    },
    [messages, conversationId, options, streaming]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(null);
    setConversationId(null);
    setIsLoading(false);
    setIsStreaming(false);
    setCurrentAction(null);
  }, [stopStreaming]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    conversationId,
    currentAction,
    sendMessage,
    clearMessages,
    reset,
    stopStreaming,
  };
}
