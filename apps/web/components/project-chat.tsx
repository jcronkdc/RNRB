'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { Button } from '@cronkwaters/ui';
import Ably from 'ably';

type Message = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: Date;
  avatar?: string;
};

type TypingUser = {
  userId: string;
  userName: string;
  timestamp: number;
};

interface ProjectChatProps {
  projectSlug: string;
  projectName: string;
}

export function ProjectChat({ projectSlug, projectName }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Ably and current user
  useEffect(() => {
    const initChat = async () => {
      // Get current user from Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase!.auth.getUser();
      
      if (!user) return;
      
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url,
      });

      // Initialize Ably
      const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
      if (!ablyKey) {
        console.warn('ABLY_API_KEY not configured');
        return;
      }

      const ablyClient = new Ably.Realtime({
        key: ablyKey,
        clientId: user.id,
      });

      setAbly(ablyClient);

      // Subscribe to project chat channel
      const chatChannel = ablyClient.channels.get(`chat:project:${projectSlug}`);
      setChannel(chatChannel);

      // Listen for new messages
      chatChannel.subscribe('message', (message) => {
        const newMessage: Message = {
          id: message.id || `${Date.now()}-${Math.random()}`,
          userId: message.clientId || 'unknown',
          userName: message.data.userName || 'Unknown',
          userEmail: message.data.userEmail || '',
          content: message.data.content,
          timestamp: new Date(message.timestamp || Date.now()),
          avatar: message.data.avatar,
        };
        
        setMessages((prev) => [...prev, newMessage]);
        
        // Clear typing indicator for this user when they send a message
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(message.clientId || '');
          return newMap;
        });
      });

      // Listen for typing indicators
      chatChannel.subscribe('typing', (message) => {
        const typingUser: TypingUser = {
          userId: message.clientId || 'unknown',
          userName: message.data.userName || 'Unknown',
          timestamp: Date.now(),
        };
        
        // Don't show own typing indicator
        if (typingUser.userId === user.id) return;
        
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(typingUser.userId, typingUser);
          return newMap;
        });
        
        // Auto-remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            // Only remove if timestamp hasn't been updated (no new typing events)
            const current = newMap.get(typingUser.userId);
            if (current && current.timestamp === typingUser.timestamp) {
              newMap.delete(typingUser.userId);
            }
            return newMap;
          });
        }, 3000);
      });

      // Listen for typing stopped
      chatChannel.subscribe('typing-stop', (message) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(message.clientId || '');
          return newMap;
        });
      });

      // Get message history (last 50 messages)
      chatChannel.history({ limit: 50 }, (err, resultPage) => {
        if (err) {
          console.error('Error fetching chat history:', err);
          return;
        }
        
        if (resultPage && resultPage.items.length > 0) {
          const historicalMessages: Message[] = resultPage.items.reverse().map((msg) => ({
            id: msg.id || `${Date.now()}-${Math.random()}`,
            userId: msg.clientId || 'unknown',
            userName: msg.data.userName || 'Unknown',
            userEmail: msg.data.userEmail || '',
            content: msg.data.content,
            timestamp: new Date(msg.timestamp || Date.now()),
            avatar: msg.data.avatar,
          }));
          
          setMessages(historicalMessages);
        }
      });
    };

    initChat();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channel) {
        channel.unsubscribe();
      }
      if (ably) {
        ably.close();
      }
    };
  }, [projectSlug]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !channel || !currentUser) return;

    setSending(true);
    try {
      // Send typing-stop event
      await channel.publish('typing-stop', {
        userName: currentUser.name,
      });
      
      await channel.publish('message', {
        content: inputValue.trim(),
        userName: currentUser.name,
        userEmail: currentUser.email,
        avatar: currentUser.avatar,
      });
      
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Broadcast typing indicator
    if (value.trim() && channel && currentUser) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing event
      channel.publish('typing', {
        userName: currentUser.name,
      });
      
      // Auto-stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        channel.publish('typing-stop', {
          userName: currentUser.name,
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Project Chat</h3>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <Button variant="secondary" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.userId === currentUser.id;
            const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-foreground text-sm font-semibold">
                      {message.avatar ? (
                        <img src={message.avatar} alt={message.userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        message.userName[0].toUpperCase()
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{message.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-brand-primary text-brand-primary-foreground'
                        : 'bg-surface border border-border text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing Indicators */}
        <AnimatePresence>
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-brand-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-brand-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-brand-primary"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Array.from(typingUsers.values()).length === 1
                  ? `${Array.from(typingUsers.values())[0].userName} is typing...`
                  : `${Array.from(typingUsers.values()).length} people are typing...`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Button variant="secondary" size="sm" className="mb-2">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <Button variant="secondary" size="sm" className="mb-2">
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            className="mb-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
