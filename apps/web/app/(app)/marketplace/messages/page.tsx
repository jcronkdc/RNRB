'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Package,
  User,
  MessageSquare,
  Loader2,
  Check,
  Clock,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { trpc as api } from '@cronkwaters/trpc/client/react';
import { Suspense } from 'react';

import { EmptyState } from '@/components/empty-states';
import { InboxSkeleton } from '@/components/loading-skeletons';

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Less than 24 hours - show time
  if (diff < 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Less than 7 days - show day
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Otherwise show date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left transition-all ${
        isActive
          ? 'border border-orange-500/30 bg-linear-to-r from-orange-500/20 to-amber-500/20'
          : 'hover:bg-white/5'
      }`}
    >
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="relative h-12 w-12 shrink-0">
          {conversation.otherUser?.image ? (
            <img
              src={conversation.otherUser.image}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-amber-500">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
          {conversation.unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate font-medium ${isActive ? 'text-white' : 'text-white/90'}`}>
              {conversation.otherUser?.name || 'Unknown User'}
            </span>
            <span className="shrink-0 text-xs text-white/40">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-white/50">{conversation.listing?.title}</p>
          <p
            className={`mt-0.5 truncate text-sm ${conversation.unreadCount > 0 ? 'font-medium text-white/70' : 'text-white/40'}`}
          >
            {conversation.lastMessage.content}
          </p>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white'
            : 'bg-white/10 text-white/90'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${isOwn ? 'text-white/70' : 'text-white/40'}`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwn &&
            (message.isRead ? (
              <Check className="h-3 w-3 text-emerald-300" />
            ) : (
              <Clock className="h-3 w-3" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const [selectedConversation, setSelectedConversation] = useState<{
    listingId: string;
    otherUserId: string;
    listing?: any;
    otherUser?: any;
  } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // Get conversations
  const { data: conversations, isLoading: loadingConversations } =
    api.marketplace.getConversations.useQuery(undefined, { enabled: !!session });

  // Get messages for selected conversation
  const { data: messages, isLoading: loadingMessages } =
    api.marketplace.getListingMessages.useQuery(
      {
        listingId: selectedConversation?.listingId || '',
        otherUserId: selectedConversation?.otherUserId || '',
      },
      {
        enabled: !!selectedConversation,
        refetchInterval: 5000, // Poll every 5 seconds
      }
    );

  // Send message mutation
  const sendMessageMutation = api.marketplace.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage('');
      utils.marketplace.getListingMessages.invalidate();
      utils.marketplace.getConversations.invalidate();
    },
  });

  // Handle URL params for direct message links
  useEffect(() => {
    const listingId = searchParams.get('listing');
    const userId = searchParams.get('to');

    if (listingId && userId) {
      setSelectedConversation({
        listingId,
        otherUserId: userId,
      });
    }
  }, [searchParams]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversation && conversations?.length) {
      const first = conversations[0];
      setSelectedConversation({
        listingId: first.listingId,
        otherUserId: first.otherUser.id,
        listing: first.listing,
        otherUser: first.otherUser,
      });
    }
  }, [conversations, selectedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      listingId: selectedConversation.listingId,
      recipientId: selectedConversation.otherUserId,
      content: newMessage.trim(),
    });
  };

  if (sessionStatus === 'loading') {
    return (
      <div
        className="min-h-screen p-6"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
      >
        <InboxSkeleton count={6} />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-linear-to-br from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-linear-to-tl from-violet-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex flex-col items-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={120}
              height={49}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-2xl font-bold text-white"
        >
          Messages
        </motion.h1>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex h-[calc(100vh-280px)] min-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-white/2"
        >
          {/* Conversations List */}
          <div className="w-80 shrink-0 overflow-y-auto border-r border-white/10">
            <div className="p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                Conversations
              </h2>

              {loadingConversations ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : conversations?.length === 0 ? (
                <div className="px-2 py-8">
                  <EmptyState
                    type="messages"
                    title="No messages yet"
                    description="Conversations with buyers/sellers will appear here"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations?.map((conv: any) => (
                    <ConversationItem
                      key={`${conv.listingId}-${conv.otherUser.id}`}
                      conversation={conv}
                      isActive={
                        selectedConversation?.listingId === conv.listingId &&
                        selectedConversation?.otherUserId === conv.otherUser.id
                      }
                      onClick={() =>
                        setSelectedConversation({
                          listingId: conv.listingId,
                          otherUserId: conv.otherUser.id,
                          listing: conv.listing,
                          otherUser: conv.otherUser,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex flex-1 flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-4 border-b border-white/10 p-4">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-orange-500 to-amber-500">
                    {selectedConversation.otherUser?.image ? (
                      <img
                        src={selectedConversation.otherUser.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">
                      {selectedConversation.otherUser?.name || 'User'}
                    </div>
                    {selectedConversation.listing && (
                      <Link
                        href={`/marketplace/${selectedConversation.listingId}`}
                        className="block truncate text-sm text-orange-400 hover:underline"
                      >
                        Re: {selectedConversation.listing.title}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <InboxSkeleton count={5} />
                  ) : messages?.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <EmptyState
                        type="messages"
                        title="No messages yet"
                        description="Start the conversation"
                      />
                    </div>
                  ) : (
                    <>
                      {messages?.map((msg: any) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.senderId === session.user?.id}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-hidden focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="flex items-center justify-center rounded-xl bg-linear-to-r from-orange-500 to-amber-500 px-5 text-white disabled:opacity-50"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageSquare className="mb-4 h-16 w-16 text-white/20" />
                <h3 className="text-lg font-semibold text-white">Select a conversation</h3>
                <p className="mt-1 text-white/50">Choose a conversation to view messages</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen p-6"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1025 50%, #0d1520 100%)' }}
        >
          <InboxSkeleton count={6} />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
