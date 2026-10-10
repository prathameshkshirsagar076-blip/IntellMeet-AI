import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMeetings } from '../../context/MeetingContext';
import { usersApi } from '../../api/users.api';
import { chatApi } from '../../api/chat.api';
import { chatSocketService } from '../../services/chatSocket.service';
import type { UserItem } from '../../types/user';
import type { ChatConversation, ChatMessage } from '../../types/chat';
import { toast } from '../toast/toast';
import {
  SearchIcon,
  VideoIcon,
  SendIcon,
  ChatIcon,
  PaperclipIcon,
  ChevronLeftIcon,
} from '../icons';

export interface TeamChatModuleProps {
  selectedRecipient?: UserItem | null;
  onClearSelectedRecipient?: () => void;
  fullHeight?: boolean;
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatChatTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export const TeamChatModule: React.FC<TeamChatModuleProps> = ({
  selectedRecipient,
  onClearSelectedRecipient,
  fullHeight = false,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { createMeeting } = useMeetings();

  // Search box state for searching all workspace users via API
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Conversations list & active selection
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  // Messages thread for currently active conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Real-time presence & typing state
  const [presenceMap, setPresenceMap] = useState<Record<string, 'online' | 'offline'>>({});
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Mobile navigation pane toggle ('list' | 'chat')
  const [mobileActivePane, setMobileActivePane] = useState<'list' | 'chat'>('list');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const selectedConvRef = useRef<ChatConversation | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingEmittedRef = useRef<boolean>(false);

  // Sync ref for access inside socket callbacks
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // 1. Initial conversations load from backend API
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationsError(null);
    try {
      const res = await chatApi.getConversations({ limit: 50 });
      const fetched = res?.data?.conversations || [];
      setConversations(fetched);
      if (fetched.length > 0 && !selectedConvRef.current) {
        setSelectedConv(fetched[0]);
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to load conversations';
      setConversationsError(msg);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Real-time Socket.IO Connection & Listeners
  useEffect(() => {
    chatSocketService.connect();

    // Listener: Incoming new message
    const unsubMessage = chatSocketService.onMessageNew((data) => {
      const incoming = data.message;
      if (!incoming) return;

      const convId = String(incoming.conversationId);
      const senderIdStr =
        typeof incoming.senderId === 'object' && incoming.senderId
          ? String((incoming.senderId as { id?: string; _id?: string }).id || (incoming.senderId as { _id?: string })._id)
          : String(incoming.senderId || '');
      const isMine = senderIdStr === currentUser?.id;

      // Update messages thread if this message belongs to active conversation
      if (selectedConvRef.current && selectedConvRef.current.id === convId) {
        setMessages((prev) => {
          // Prevent duplicates by clientMessageId or id
          const incomingMsgId = String(incoming.id || incoming._id);
          const alreadyExists = prev.some(
            (m) =>
              m.id === incomingMsgId ||
              (incoming.clientMessageId && m.id === incoming.clientMessageId)
          );
          if (alreadyExists) {
            return prev.map((m) =>
              m.id === incoming.clientMessageId || m.id === incomingMsgId
                ? { ...m, id: incomingMsgId, status: 'delivered' }
                : m
            );
          }

          const senderName = isMine
            ? 'You'
            : typeof incoming.senderId === 'object' && (incoming.senderId as { name?: string })?.name
            ? (incoming.senderId as { name?: string }).name!
            : selectedConvRef.current?.otherParticipant.name || 'Teammate';

          return [
            ...prev,
            {
              id: incomingMsgId || `msg-${Date.now()}`,
              conversationId: convId,
              senderId: senderIdStr,
              senderName,
              content: incoming.content,
              createdAt: incoming.createdAt || new Date().toISOString(),
              status: 'delivered',
              isMine,
            },
          ];
        });

        // Acknowledge read receipt if peer sent it
        if (!isMine) {
          chatSocketService.markAsRead(convId);
          chatApi.markAsRead(convId).catch(() => {});
        }
      }

      // Update conversations list with latest snippet and unread count
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === convId);
        const nowIso = incoming.createdAt || new Date().toISOString();
        const isCurrentlyViewed = selectedConvRef.current?.id === convId;

        if (existingIdx >= 0) {
          const current = prev[existingIdx];
          const updated: ChatConversation = {
            ...current,
            lastMessage: incoming.content,
            lastMessageAt: nowIso,
            unreadCount: isCurrentlyViewed ? 0 : (current.unreadCount || 0) + 1,
          };
          const others = prev.filter((_, idx) => idx !== existingIdx);
          return [updated, ...others];
        } else {
          // If conversation wasn't listed, refresh list from backend
          chatApi.getConversations({ limit: 50 }).then((res) => {
            if (res?.data?.conversations) {
              setConversations(res.data.conversations);
            }
          }).catch(() => {});
          return prev;
        }
      });
    });

    // Listener: Peer typing indicator
    const unsubTyping = chatSocketService.onTypingUpdate(({ conversationId, userId, isTyping }) => {
      if (selectedConvRef.current?.id === conversationId && userId !== currentUser?.id) {
        setIsPeerTyping(isTyping);
      }
    });

    // Listener: Real-time presence updates
    const unsubPresence = chatSocketService.onPresenceUpdate(({ userId, status }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [userId]: status,
      }));
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubPresence();
    };
  }, [currentUser?.id]);

  // 3. Load messages & join room whenever selected conversation changes
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    const convId = selectedConv.id;
    setIsLoadingMessages(true);
    setIsPeerTyping(false);

    // Join real-time Socket.IO room for this conversation
    chatSocketService.joinConversation(convId);

    // Fetch conversation message history
    chatApi.getMessages(convId, { limit: 50 })
      .then((res) => {
        if (res?.data?.messages && Array.isArray(res.data.messages)) {
          const mapped: ChatMessage[] = res.data.messages.map((m) => {
            const senderIdStr =
              typeof m.senderId === 'object' && m.senderId
                ? String((m.senderId as { id?: string; _id?: string }).id || (m.senderId as { _id?: string })._id)
                : String(m.senderId || '');
            const isMine = senderIdStr === currentUser?.id;
            const senderName = isMine
              ? 'You'
              : typeof m.senderId === 'object' && (m.senderId as { name?: string })?.name
              ? (m.senderId as { name?: string }).name!
              : selectedConv.otherParticipant.name;

            return {
              id: String(m.id || m._id || `msg-${Math.random()}`),
              conversationId: convId,
              senderId: senderIdStr,
              senderName,
              content: m.content,
              createdAt: m.createdAt,
              status: 'sent',
              isMine,
            };
          });
          setMessages(mapped);
        } else {
          setMessages([]);
        }

        // Mark conversation as read
        chatSocketService.markAsRead(convId);
        chatApi.markAsRead(convId).catch(() => {});
      })
      .catch(() => {
        setMessages([]);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });

    return () => {
      chatSocketService.leaveConversation(convId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?.id, currentUser?.id]);

  // Scroll to bottom on message list change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // 4. Debounced user search using the All Users API (GET /api/v1/users?k=...)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    setIsSearchingUsers(true);

    const timer = setTimeout(async () => {
      try {
        const res = await usersApi.getUsers({
          k: trimmed,
          limit: 10,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const usersList = (res?.data?.users || []).filter(
          (u) => u.id !== currentUser?.id
        );
        setSearchResults(usersList);
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, currentUser?.id]);

  // 5. Select or start a conversation with a chosen user
  const handleSelectUser = useCallback(
    async (recipient: UserItem) => {
      setSearchQuery('');
      setSearchResults([]);
      setMobileActivePane('chat');

      // Check if conversation already exists in current list
      const existing = conversations.find(
        (c) => c.otherParticipant.id === recipient.id
      );

      if (existing) {
        setSelectedConv(existing);
        return;
      }

      // Create conversation on backend via POST /api/v1/chat/conversations
      try {
        const res = await chatApi.createConversation(recipient.id);
        const convData = res?.data?.conversation;
        const convId = String(convData?.id || convData?._id || `conv-${recipient.id}`);

        const newConversation: ChatConversation = {
          id: convId,
          type: 'direct',
          otherParticipant: {
            id: recipient.id,
            name: recipient.name,
            email: recipient.email,
            role: recipient.role,
            isActive: recipient.isActive,
          },
          lastMessage: null,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          createdAt: convData?.createdAt || new Date().toISOString(),
        };

        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConv(newConversation);
      } catch (err: unknown) {
        toast.error((err as Error)?.message || 'Failed to initialize conversation');
      }
    },
    [conversations]
  );

  // Sync external recipient prop (e.g., navigated from Team directory card)
  useEffect(() => {
    if (selectedRecipient) {
      handleSelectUser(selectedRecipient);
      onClearSelectedRecipient?.();
    }
  }, [selectedRecipient, handleSelectUser, onClearSelectedRecipient]);

  // 6. Handle input typing notification
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (!selectedConv) return;

    if (!isTypingEmittedRef.current && val.trim()) {
      isTypingEmittedRef.current = true;
      chatSocketService.startTyping(selectedConv.id);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      if (selectedConv) {
        chatSocketService.stopTyping(selectedConv.id);
      }
      isTypingEmittedRef.current = false;
    }, 1500);
  };

  // 7. Send message via Socket.IO
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || messageInput).trim();
    if (!text || !selectedConv || isSending) return;

    setIsSending(true);
    const convId = selectedConv.id;
    const clientMessageId = `cmsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    // Optimistic message update
    const optimisticMsg: ChatMessage = {
      id: clientMessageId,
      conversationId: convId,
      senderId: currentUser?.id || 'me',
      senderName: 'You',
      content: text,
      createdAt: nowIso,
      status: 'sending',
      isMine: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageInput('');

    // Clear typing state
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingEmittedRef.current = false;
    chatSocketService.stopTyping(convId);

    // Update conversation item snippet & move to top
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== convId);
      const updatedConv: ChatConversation = {
        ...selectedConv,
        lastMessage: text,
        lastMessageAt: nowIso,
        unreadCount: 0,
      };
      return [updatedConv, ...remaining];
    });

    // Send through authenticated Socket.IO connection
    chatSocketService.sendMessage(
      {
        conversationId: convId,
        clientMessageId,
        content: text,
        messageType: 'text',
      },
      (ack) => {
        setIsSending(false);
        if (ack?.success && ack.message) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === clientMessageId
                ? {
                    ...m,
                    id: String(ack.message?.id || clientMessageId),
                    status: 'sent',
                  }
                : m
            )
          );
        } else {
          toast.error(ack?.error?.message || 'Message delivery failed. Reconnecting...');
        }
      }
    );
  };

  // 8. Instant Quick Meeting action from chat header
  const handleStartInstantMeet = () => {
    if (!selectedConv) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const meeting = createMeeting({
      title: `1:1 Chat Call with ${selectedConv.otherParticipant.name}`,
      date: todayStr,
      startTime: new Date().toTimeString().slice(0, 5),
      durationMinutes: 30,
      participantsEmails: [selectedConv.otherParticipant.email],
      isInstant: true,
    });
    toast.success(`Starting 1:1 meeting with ${selectedConv.otherParticipant.name}`);
    navigate(`/meeting/${meeting.id}`);
  };

  const isOtherOnline = (userId: string, defaultActive?: boolean) => {
    if (presenceMap[userId] === 'online') return true;
    if (presenceMap[userId] === 'offline') return false;
    return Boolean(defaultActive);
  };

  return (
    <div className={`im-chat-page-card ${fullHeight ? 'im-chat-page-container' : ''}`}>
      {/* Module Header */}
      <div className="im-chat-module-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--im-radius-lg)',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              color: 'var(--im-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatIcon size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--im-text-primary)' }}>
                Team Direct Messaging & Chat
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--im-radius-full)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--im-success)',
                }}
              >
                Live Direct
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', margin: '2px 0 0 0' }}>
              Real-time collaboration with teammates, presence status, and message history.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Container */}
      <div
        className={`im-chat-container ${
          mobileActivePane === 'chat' ? 'mobile-show-chat' : 'mobile-show-list'
        } ${fullHeight ? 'im-chat-page-container' : ''}`}
      >
        {/* Left Sidebar: Conversations & Search */}
        <div className="im-chat-sidebar">
          <div className="im-chat-sidebar-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                Conversations
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--im-text-muted)',
                  backgroundColor: 'var(--im-bg-subtle)',
                  padding: '1px 6px',
                  borderRadius: 'var(--im-radius-full)',
                }}
              >
                {conversations.length}
              </span>
            </div>

            {/* Search Box on Top */}
            <div style={{ position: 'relative', width: '100%' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--im-text-muted)',
                  display: 'flex',
                }}
              >
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                className="im-input"
                style={{
                  paddingLeft: 32,
                  paddingRight: searchQuery ? 28 : 10,
                  height: 34,
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--im-radius-md)',
                }}
                placeholder="Search all users by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search all users for chat"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--im-text-muted)',
                    padding: 2,
                    fontSize: '0.75rem',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conversation List / Search Results */}
          <div className="im-chat-conv-list">
            {/* Case A: Searching users */}
            {searchQuery.trim() ? (
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--im-text-muted)',
                    padding: '8px 8px 4px',
                  }}
                >
                  {isSearchingUsers ? 'Searching Users...' : `Found ${searchResults.length} Users`}
                </div>

                {isSearchingUsers ? (
                  <div style={{ padding: 16, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                    Searching workspace users...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--im-text-muted)', fontSize: '0.8125rem' }}>
                    No team members match &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  searchResults.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      className="im-chat-conv-item"
                      onClick={() => handleSelectUser(usr)}
                    >
                      <div
                        className="im-avatar-pill"
                        style={{
                          width: 36,
                          height: 36,
                          fontSize: '0.75rem',
                          marginLeft: 0,
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(124, 58, 237, 0.2))',
                        }}
                      >
                        {getInitials(usr.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                            {usr.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 5px',
                              borderRadius: 'var(--im-radius-full)',
                              backgroundColor: usr.role === 'admin' ? 'rgba(124, 58, 237, 0.12)' : 'var(--im-bg-subtle)',
                              color: usr.role === 'admin' ? '#7c3aed' : 'var(--im-text-muted)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {usr.role}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usr.email}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : isLoadingConversations ? (
              /* Case B: Loading conversations */
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                Loading conversations...
              </div>
            ) : conversationsError ? (
              /* Case C: Error loading conversations */
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--im-danger)', marginBottom: 8 }}>
                  {conversationsError}
                </div>
                <button
                  type="button"
                  className="im-btn im-btn-secondary im-btn-sm"
                  onClick={loadConversations}
                >
                  Retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              /* Case D: Empty state */
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'var(--im-bg-surface)',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--im-text-muted)',
                  }}
                >
                  <ChatIcon size={20} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: 4 }}>
                  No conversations yet
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  Search any teammate in the box above to start chatting.
                </p>
              </div>
            ) : (
              /* Case E: Active conversations list */
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const initials = getInitials(conv.otherParticipant.name);
                const isOnline = isOtherOnline(conv.otherParticipant.id, conv.otherParticipant.isActive);

                return (
                  <button
                    key={conv.id}
                    type="button"
                    className={`im-chat-conv-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedConv(conv);
                      setMobileActivePane('chat');
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        className="im-avatar-pill"
                        style={{
                          width: 38,
                          height: 38,
                          fontSize: '0.8125rem',
                          marginLeft: 0,
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(124, 58, 237, 0.25))'
                            : 'var(--im-bg-surface)',
                          color: 'var(--im-text-primary)',
                          border: isSelected ? '2px solid var(--im-primary)' : '2px solid var(--im-border)',
                        }}
                      >
                        {initials}
                      </div>
                      {isOnline && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: 'var(--im-success)',
                            border: '2px solid var(--im-bg-surface)',
                          }}
                          title="Online"
                        />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: isSelected ? 700 : 600,
                            color: 'var(--im-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.otherParticipant.name}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--im-text-muted)', whiteSpace: 'nowrap', marginLeft: 6 }}>
                          {formatChatTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: isSelected ? 'var(--im-text-secondary)' : 'var(--im-text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px',
                          }}
                        >
                          {conv.lastMessage || 'Click to start chatting...'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--im-primary)',
                              color: '#ffffff',
                              borderRadius: 'var(--im-radius-full)',
                              padding: '1px 6px',
                              minWidth: 16,
                              textAlign: 'center',
                            }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane: Message Stream & Composer */}
        <div className="im-chat-main">
          {selectedConv ? (
            <>
              {/* Active Chat Header */}
              <div className="im-chat-pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    className="im-chat-mobile-back"
                    onClick={() => setMobileActivePane('list')}
                    aria-label="Back to conversations list"
                  >
                    <ChevronLeftIcon size={16} />
                    <span>Chats</span>
                  </button>

                  <div
                    className="im-avatar-pill"
                    style={{
                      width: 38,
                      height: 38,
                      fontSize: '0.8125rem',
                      marginLeft: 0,
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(124, 58, 237, 0.2))',
                      color: 'var(--im-text-primary)',
                      border: '2px solid var(--im-border)',
                    }}
                  >
                    {getInitials(selectedConv.otherParticipant.name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                        {selectedConv.otherParticipant.name}
                      </span>
                      <span
                        className={`im-role-badge ${selectedConv.otherParticipant.role === 'admin' ? 'im-role-badge-admin' : 'im-role-badge-user'}`}
                      >
                        {selectedConv.otherParticipant.role || 'Member'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{selectedConv.otherParticipant.email}</span>
                      <span>•</span>
                      <span
                        style={{
                          color: isOtherOnline(selectedConv.otherParticipant.id, selectedConv.otherParticipant.isActive)
                            ? 'var(--im-success)'
                            : 'var(--im-text-muted)',
                        }}
                      >
                        {isOtherOnline(selectedConv.otherParticipant.id, selectedConv.otherParticipant.isActive)
                          ? 'Online'
                          : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="im-btn im-btn-primary im-btn-sm"
                    onClick={handleStartInstantMeet}
                    title="Start instant 1:1 video meeting"
                  >
                    <VideoIcon size={14} />
                    Quick Meet
                  </button>
                  <button
                    type="button"
                    className="im-btn im-btn-secondary im-btn-sm"
                    onClick={() => {
                      navigate('/meetings/new');
                      toast.info(`Schedule meeting with ${selectedConv.otherParticipant.name}`);
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="im-chat-messages-stream">
                <div className="im-chat-date-separator">
                  <span>Direct Message Thread</span>
                </div>

                {isLoadingMessages ? (
                  <div style={{ margin: 'auto', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                    Loading message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 360, padding: 24 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'var(--im-bg-surface)',
                        margin: '0 auto 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--im-primary)',
                      }}
                    >
                      <ChatIcon size={24} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--im-text-primary)' }}>
                      Start a conversation
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                      Send your first message to {selectedConv.otherParticipant.name} to connect.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        type="button"
                        className="im-btn im-btn-secondary im-btn-sm"
                        onClick={() => handleSendMessage('👋 Hi there! Hope you are having a productive day.')}
                      >
                        👋 Say hello!
                      </button>
                      <button
                        type="button"
                        className="im-btn im-btn-secondary im-btn-sm"
                        onClick={() => handleSendMessage('Hey! Are you free for a quick sync regarding our upcoming meeting?')}
                      >
                        💬 Are you free for a quick sync?
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`im-chat-bubble-row ${msg.isMine ? 'mine' : 'theirs'}`}
                    >
                      <div className={`im-chat-bubble ${msg.isMine ? 'mine' : 'theirs'}`}>
                        {msg.content}
                      </div>
                      <div className="im-chat-bubble-meta">
                        <span>{formatChatTime(msg.createdAt)}</span>
                        {msg.isMine && (
                          <span style={{ color: 'var(--im-primary)', fontWeight: 700 }} title={msg.status}>
                            {msg.status === 'sending' ? '⏳' : '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Peer Typing Indicator Bubble */}
                {isPeerTyping && (
                  <div className="im-chat-typing-indicator">
                    <span>{selectedConv.otherParticipant.name} is typing</span>
                    <span className="im-chat-typing-dot" />
                    <span className="im-chat-typing-dot" />
                    <span className="im-chat-typing-dot" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="im-chat-input-bar">
                {/* Quick Reactions Bar */}
                <div className="im-chat-quick-reactions">
                  <span style={{ fontSize: '0.6875rem', color: 'var(--im-text-muted)', marginRight: 2 }}>Quick:</span>
                  {['👋', '👍', '❤️', '🚀', '🎉', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="im-chat-reaction-btn"
                      onClick={() => handleSendMessage(emoji)}
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Message Composer Form */}
                <form
                  className="im-chat-input-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <button
                    type="button"
                    className="im-btn im-btn-secondary im-btn-sm"
                    style={{ height: 38, width: 38, padding: 0, borderRadius: 'var(--im-radius-md)' }}
                    onClick={() => toast.info('File attachments feature is available for project assets.')}
                    title="Attach file"
                  >
                    <PaperclipIcon size={16} />
                  </button>

                  <input
                    type="text"
                    className="im-input"
                    style={{ height: 38, fontSize: '0.875rem', borderRadius: 'var(--im-radius-md)' }}
                    placeholder={`Message ${selectedConv.otherParticipant.name}... (Press Enter to send)`}
                    value={messageInput}
                    onChange={handleInputChange}
                  />

                  <button
                    type="submit"
                    className="im-btn im-btn-primary"
                    style={{ height: 38, padding: '0 16px', borderRadius: 'var(--im-radius-md)' }}
                    disabled={!messageInput.trim() || isSending}
                  >
                    <SendIcon size={15} />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state when no conversation is selected */
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                maxWidth: 420,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--im-radius-xl)',
                  backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  color: 'var(--im-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <ChatIcon size={32} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--im-text-primary)' }}>
                Select or Search a Teammate
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--im-text-muted)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Choose a conversation from the left sidebar, or type any team member&apos;s name in the search box to begin a 1:1 chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamChatModule;
