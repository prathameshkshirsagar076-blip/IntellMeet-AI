import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMeetings } from '../../context/MeetingContext';
import { usersApi } from '../../api/users.api';
import { chatApi } from '../../api/chat.api';
import { chatSocketService, type ConnectionStatus } from '../../services/chatSocket.service';
import type { UserItem } from '../../types/user';
import type {
  ChatConversation,
  ChatMessage,
  ChatSearchItem,
  RawChatMessageItem,
  ChatParticipant,
} from '../../types/chat';
import { toast } from '../toast/toast';
import {
  SearchIcon,
  VideoIcon,
  SendIcon,
  ChatIcon,
  PaperclipIcon,
  ChevronLeftIcon,
  UsersIcon,
} from '../icons';

export interface TeamChatModuleProps {
  selectedRecipient?: UserItem | null;
  onClearSelectedRecipient?: () => void;
  fullHeight?: boolean;
}

const TrashIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const EditIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const InfoIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

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

function normalizeConversation(
  raw: unknown,
  currentUserId?: string
): ChatConversation {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const id = String(item.id || item._id || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const type = item.type === 'group' ? 'group' : 'direct';

  // Extract otherParticipant safely
  let otherParticipant: ChatParticipant = {
    id: 'unknown',
    name: 'Teammate',
    email: '',
    role: 'Member',
    isActive: false,
  };

  const rawOther = item.otherParticipant as Record<string, unknown> | undefined;
  const rawParticipants = Array.isArray(item.participants) ? (item.participants as Array<Record<string, unknown> | string>) : [];

  if (rawOther && typeof rawOther === 'object') {
    otherParticipant = {
      id: String(rawOther.id || rawOther._id || 'unknown'),
      name: String(rawOther.name || rawOther.fullName || rawOther.email || 'Teammate'),
      email: String(rawOther.email || ''),
      role: String(rawOther.role || 'Member'),
      isActive: Boolean(rawOther.isActive),
    };
  } else if (rawParticipants.length > 0) {
    const foundOther = rawParticipants.find((p) => {
      const pid = typeof p === 'object' && p ? String(p.id || p._id || '') : String(p || '');
      return pid && pid !== currentUserId;
    });

    if (foundOther && typeof foundOther === 'object') {
      otherParticipant = {
        id: String(foundOther.id || foundOther._id || 'unknown'),
        name: String(foundOther.name || foundOther.fullName || foundOther.email || 'Teammate'),
        email: String(foundOther.email || ''),
        role: String(foundOther.role || 'Member'),
        isActive: Boolean(foundOther.isActive),
      };
    } else if (typeof foundOther === 'string' && foundOther) {
      otherParticipant = {
        id: foundOther,
        name: 'Teammate',
        email: '',
        role: 'Member',
        isActive: false,
      };
    } else {
      const first = rawParticipants[0];
      if (first && typeof first === 'object') {
        otherParticipant = {
          id: String(first.id || first._id || 'unknown'),
          name: String(first.name || first.fullName || first.email || 'Teammate'),
          email: String(first.email || ''),
          role: String(first.role || 'Member'),
          isActive: Boolean(first.isActive),
        };
      }
    }
  }

  const rawLastMsg = item.lastMessage;
  let lastMessageText: string | null = null;
  if (typeof rawLastMsg === 'string') {
    lastMessageText = rawLastMsg;
  } else if (rawLastMsg && typeof rawLastMsg === 'object' && 'content' in rawLastMsg) {
    lastMessageText = String((rawLastMsg as { content?: unknown }).content || '');
  }

  return {
    id,
    type,
    otherParticipant,
    participants: Array.isArray(item.participants) ? (item.participants as ChatParticipant[]) : undefined,
    lastMessageId: item.lastMessageId ? String(item.lastMessageId) : null,
    lastMessage: lastMessageText,
    lastMessageAt: item.lastMessageAt ? String(item.lastMessageAt) : item.updatedAt ? String(item.updatedAt) : item.createdAt ? String(item.createdAt) : null,
    unreadCount: typeof item.unreadCount === 'number' ? item.unreadCount : 0,
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
    updatedAt: item.updatedAt ? String(item.updatedAt) : new Date().toISOString(),
  };
}

function normalizeRawMessage(raw: RawChatMessageItem, currentUserId?: string, fallbackOtherName = 'Teammate'): ChatMessage {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId: '',
      senderId: '',
      senderName: fallbackOtherName,
      content: '',
      createdAt: new Date().toISOString(),
      status: 'sent',
      isMine: false,
    };
  }

  const senderIdStr =
    typeof raw.senderId === 'object' && raw.senderId
      ? String((raw.senderId as { id?: string; _id?: string }).id || (raw.senderId as { _id?: string })._id)
      : String(raw.senderId || '');

  const isMine = Boolean(currentUserId && senderIdStr === currentUserId);
  const senderName = isMine
    ? 'You'
    : typeof raw.senderId === 'object' && (raw.senderId as { name?: string })?.name
    ? (raw.senderId as { name?: string }).name!
    : fallbackOtherName;

  let status: ChatMessage['status'] = 'sent';
  if (raw.receipt?.readAt) {
    status = 'read';
  } else if (raw.receipt?.deliveredAt) {
    status = 'delivered';
  }

  return {
    id: String(raw.id || raw._id || `msg-${Math.random()}`),
    conversationId: String(raw.conversationId || ''),
    senderId: senderIdStr,
    senderName,
    clientMessageId: raw.clientMessageId,
    content: raw.isDeleted ? 'This message was deleted' : raw.content || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    status,
    isMine,
    isDeleted: Boolean(raw.isDeleted),
    editedAt: raw.editedAt || null,
    receipt: raw.receipt,
  };
}

export const TeamChatModule: React.FC<TeamChatModuleProps> = ({
  selectedRecipient,
  onClearSelectedRecipient,
  fullHeight = false,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { createMeeting } = useMeetings();

  // Search box state: integrates GET /api/v1/users?k=... & GET /chat/contacts & GET /chat/search?q=...
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserItem[]>([]);
  const [msgSearchResults, setMsgSearchResults] = useState<ChatSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState<'users' | 'messages'>('users');

  // Conversations list & active selection (GET /chat/conversations & GET /chat/conversations/:id)
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  // Messages thread for currently active conversation (GET /chat/conversations/:id/messages)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Pagination for message history (cursor pagination)
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // Highlight effect when jumping to a searched message
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  // Editing message state (PATCH /chat/messages/:id)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');

  // Browse all teammates & contacts modal state (GET /chat/contacts & GET /api/v1/users)
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [browseModalTab, setBrowseModalTab] = useState<'contacts' | 'directory'>('contacts');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [contactsList, setContactsList] = useState<UserItem[]>([]);
  const [directoryList, setDirectoryList] = useState<UserItem[]>([]);
  const [isLoadingModalList, setIsLoadingModalList] = useState(false);

  // Real-time presence & typing state
  const [presenceMap, setPresenceMap] = useState<Record<string, 'online' | 'offline'>>({});
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Mobile navigation pane toggle ('list' | 'chat')
  const [mobileActivePane, setMobileActivePane] = useState<'list' | 'chat'>('list');

  // Socket.IO real-time connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    chatSocketService.getConnectionStatus()
  );

  // Hide conversation confirmation modal
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [isHidingConv, setIsHidingConv] = useState(false);

  // Message details modal (GET /chat/messages/:id)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState<RawChatMessageItem | null>(null);
  const [detailsMsgId, setDetailsMsgId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const selectedConvRef = useRef<ChatConversation | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingEmittedRef = useRef<boolean>(false);
  const hasConnectedSocketRef = useRef<boolean>(false);

  // Sync ref for access inside socket callbacks
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // 1. Initial conversations load from backend API: GET /chat/conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationsError(null);
    try {
      const res = await chatApi.getConversations({ limit: 50 });
      const rawList = Array.isArray(res?.data?.conversations)
        ? res.data.conversations
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray((res as unknown as { conversations?: unknown[] })?.conversations)
        ? (res as unknown as { conversations: unknown[] }).conversations
        : Array.isArray(res)
        ? res
        : [];

      const fetched = rawList.map((item: unknown) => normalizeConversation(item, currentUser?.id));
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
  }, [currentUser?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Real-time Socket.IO Connection & Listeners - Strictly connects ONCE
  useEffect(() => {
    if (!hasConnectedSocketRef.current) {
      hasConnectedSocketRef.current = true;
      chatSocketService.connect();
    }

    // Listener: Incoming new message
    const unsubMessage = chatSocketService.onMessageNew((data) => {
      const incoming = data.message;
      if (!incoming) return;

      const convId = String(incoming.conversationId);
      const incomingMsgId = String(incoming.id || incoming._id);
      const senderIdStr =
        typeof incoming.senderId === 'object' && incoming.senderId
          ? String((incoming.senderId as { id?: string; _id?: string }).id || (incoming.senderId as { _id?: string })._id)
          : String(incoming.senderId || '');
      const isMine = senderIdStr === currentUser?.id;

      // Automatically acknowledge delivery: POST /chat/messages/:id/delivered & Socket.IO message:delivered
      if (!isMine && incomingMsgId) {
        chatSocketService.markAsDelivered(incomingMsgId);
        chatApi.markAsDelivered(incomingMsgId).catch(() => {});
      }

      // Update messages thread if this message belongs to active conversation
      if (selectedConvRef.current && selectedConvRef.current.id === convId) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (m) =>
              m.id === incomingMsgId ||
              (incoming.clientMessageId && m.clientMessageId === incoming.clientMessageId) ||
              (incoming.clientMessageId && m.id === incoming.clientMessageId)
          );

          if (alreadyExists) {
            return prev.map((m) =>
              m.id === incoming.clientMessageId || m.id === incomingMsgId
                ? {
                    ...m,
                    id: incomingMsgId,
                    status: m.status === 'read' ? 'read' : incoming.receipt?.readAt ? 'read' : 'delivered',
                  }
                : m
            );
          }

          const senderName = isMine
            ? 'You'
            : typeof incoming.senderId === 'object' && (incoming.senderId as { name?: string })?.name
            ? (incoming.senderId as { name?: string }).name!
            : selectedConvRef.current?.otherParticipant?.name || 'Teammate';

          return [
            ...prev,
            {
              id: incomingMsgId || `msg-${Date.now()}`,
              conversationId: convId,
              senderId: senderIdStr,
              senderName,
              content: incoming.content,
              createdAt: incoming.createdAt || new Date().toISOString(),
              status: isMine ? 'sent' : 'delivered',
              isMine,
            },
          ];
        });

        // Acknowledge read receipt if peer sent it: POST /chat/conversations/:id/read & Socket.IO message:read
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
          // If brand new conversation, re-fetch list from backend
          chatApi.getConversations({ limit: 50 }).then((res) => {
            const rawList = Array.isArray(res?.data?.conversations)
              ? res.data.conversations
              : Array.isArray(res?.data)
              ? res.data
              : [];
            if (rawList.length > 0) {
              setConversations(rawList.map((item: unknown) => normalizeConversation(item, currentUser?.id)));
            }
          }).catch(() => {});
          return prev;
        }
      });
    });

    // Listener: Message edited (PATCH /chat/messages/:id response broadcast)
    const unsubMsgEdited = chatSocketService.onMessageEdited((data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, content: data.content, editedAt: data.editedAt || new Date().toISOString() }
            : m
        )
      );

      // Also update snippet in conversations list if matching last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.content }
            : c
        )
      );
    });

    // Listener: Message deleted (DELETE /chat/messages/:id response broadcast)
    const unsubMsgDeleted = chatSocketService.onMessageDeleted((data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, content: 'This message was deleted', isDeleted: true }
            : m
        )
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: 'This message was deleted' }
            : c
        )
      );
    });

    // Listener: Real-time Message Read Receipt
    const unsubMsgRead = chatSocketService.onMessageRead((data) => {
      if (selectedConvRef.current?.id === data.conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.isMine
              ? {
                  ...m,
                  status: 'read',
                  receipt: {
                    deliveredAt: m.receipt?.deliveredAt || data.readAt,
                    readAt: data.readAt,
                  },
                }
              : m
          )
        );
      }
    });

    // Listener: Real-time Message Delivery Receipt
    const unsubMsgDelivered = chatSocketService.onMessageDelivered((data) => {
      if (selectedConvRef.current?.id === data.conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId && m.status !== 'read'
              ? {
                  ...m,
                  status: 'delivered',
                  receipt: {
                    ...m.receipt,
                    deliveredAt: data.deliveredAt,
                  },
                }
              : m
          )
        );
      }
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

    // Listener: Socket.IO Connection state tracking
    const unsubConnStatus = chatSocketService.onConnectionChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubMessage();
      unsubMsgEdited();
      unsubMsgDeleted();
      unsubMsgRead();
      unsubMsgDelivered();
      unsubTyping();
      unsubPresence();
      unsubConnStatus();
      chatSocketService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Load active conversation details & messages:
  // Calls GET /chat/conversations/:id
  // Calls GET /chat/conversations/:id/unread-count
  // Calls GET /chat/conversations/:id/messages
  // Calls POST /chat/conversations/:id/read
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      setNextCursor(null);
      setHasMoreMessages(false);
      return;
    }

    const convId = selectedConv.id;
    setIsLoadingMessages(true);
    setIsPeerTyping(false);
    setEditingMsgId(null);

    // Join real-time Socket.IO room for this conversation
    chatSocketService.joinConversation(convId);

    // Query 1: Get Conversation Details: GET /chat/conversations/:id
    chatApi.getConversationById(convId).then((res) => {
      if (res?.data?.conversation) {
        const fetchedConv = res.data.conversation;
        const normalized = normalizeConversation(fetchedConv, currentUser?.id);
        setSelectedConv((prev) =>
          prev && prev.id === convId
            ? {
                ...prev,
                ...normalized,
                otherParticipant: normalized.otherParticipant || prev.otherParticipant,
              }
            : prev
        );
      }
    }).catch(() => {});

    // Query 2: Get Unread Count: GET /chat/conversations/:id/unread-count
    chatApi.getUnreadCount(convId).then((res) => {
      if (res?.data) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, unreadCount: res.data.unreadCount } : c
          )
        );
      }
    }).catch(() => {});

    // Query 3: Fetch conversation message history: GET /chat/conversations/:id/messages
    chatApi.getMessages(convId, { limit: 50 })
      .then((res) => {
        if (res?.data?.messages && Array.isArray(res.data.messages)) {
          const rawList = res.data.messages;
          const mapped: ChatMessage[] = rawList.map((m) =>
            normalizeRawMessage(m, currentUser?.id, selectedConv.otherParticipant?.name || 'Teammate')
          );

          setMessages(mapped);
          setNextCursor(res.data.nextCursor || null);
          setHasMoreMessages(Boolean(res.data.hasMore));

          // Automatically acknowledge delivery for any undelivered incoming messages:
          // POST /chat/messages/:id/delivered
          rawList.forEach((m) => {
            const senderIdStr =
              typeof m.senderId === 'object' && m.senderId
                ? String((m.senderId as { id?: string; _id?: string }).id || (m.senderId as { _id?: string })._id)
                : String(m.senderId || '');
            const isMine = senderIdStr === currentUser?.id;
            const messageId = String(m.id || m._id);

            if (!isMine && !m.receipt?.deliveredAt && messageId) {
              chatApi.markAsDelivered(messageId).catch(() => {});
            }
          });
        } else {
          setMessages([]);
          setNextCursor(null);
          setHasMoreMessages(false);
        }

        // Mark conversation as read: POST /chat/conversations/:id/read
        chatSocketService.markAsRead(convId);
        chatApi.markAsRead(convId)
          .then(() => {
            // Patch unread count in conversations list to 0
            setConversations((prev) =>
              prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
            );
          })
          .catch(() => {});
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

  // 4. Cursor Pagination - Load older messages: GET /chat/conversations/:id/messages?cursor=...
  const handleLoadOlderMessages = async () => {
    if (!selectedConv || !nextCursor || isLoadingOlder) return;

    setIsLoadingOlder(true);
    const convId = selectedConv.id;
    try {
      const res = await chatApi.getMessages(convId, {
        cursor: nextCursor,
        direction: 'before',
        limit: 25,
      });

      if (res?.data?.messages && Array.isArray(res.data.messages)) {
        const older = res.data.messages.map((m) =>
          normalizeRawMessage(m, currentUser?.id, selectedConv.otherParticipant?.name || 'Teammate')
        );

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const filteredOlder = older.filter((m) => !existingIds.has(m.id));
          return [...filteredOlder, ...prev];
        });

        setNextCursor(res.data.nextCursor || null);
        setHasMoreMessages(Boolean(res.data.hasMore));
      }
    } catch {
      toast.error('Failed to load older messages');
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Scroll to bottom on message list change unless loading older messages
  useEffect(() => {
    if (!isLoadingOlder) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPeerTyping, isLoadingOlder]);

  // 5. Integrated Search in Chat Search Box:
  // Calls GET /api/v1/users?k=query (All Users API with search query parameter)
  // Calls GET /chat/contacts?search=query (List Contacts API)
  // Calls GET /chat/search?q=query (Chat Messages Search API)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setUserSearchResults([]);
      setMsgSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        // Query 1: Users API with query keyword 'k': GET /api/v1/users?k=...
        const usersReq = usersApi.getUsers({
          k: trimmed,
          limit: 20,
          signal: controller.signal,
        });

        // Query 2: Contacts API with query search: GET /chat/contacts?search=...
        const contactsReq = chatApi.getContacts({
          search: trimmed,
          limit: 20,
        }).catch(() => null);

        // Query 3: Chat Search API with query 'q': GET /chat/search?q=...
        const chatReq = chatApi.search({
          q: trimmed,
          limit: 20,
        }).catch(() => null);

        const [usersRes, contactsRes, chatRes] = await Promise.all([
          usersReq,
          contactsReq,
          chatReq,
        ]);

        if (controller.signal.aborted) return;

        // Combine Users API + Contacts API, deduplicate by user ID, filter out current user
        const combinedMap = new Map<string, UserItem>();

        (usersRes?.data?.users || []).forEach((u) => {
          if (u.id !== currentUser?.id) {
            combinedMap.set(u.id, u);
          }
        });

        (contactsRes?.data?.contacts || []).forEach((c) => {
          if (c.id !== currentUser?.id && !combinedMap.has(c.id)) {
            combinedMap.set(c.id, c);
          }
        });

        setUserSearchResults(Array.from(combinedMap.values()));

        // Patch message search results: GET /chat/search
        if (chatRes?.data?.messages && Array.isArray(chatRes.data.messages)) {
          setMsgSearchResults(chatRes.data.messages);
        } else {
          setMsgSearchResults([]);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        setUserSearchResults([]);
        setMsgSearchResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 260);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, currentUser?.id]);

  // 6. Select or start a conversation with a chosen user: POST /chat/conversations
  const handleSelectUser = useCallback(
    async (recipient: UserItem) => {
      setSearchQuery('');
      setUserSearchResults([]);
      setMsgSearchResults([]);
      setBrowseModalOpen(false);
      setMobileActivePane('chat');

      // Check if conversation already exists in current list
      const existing = conversations.find(
        (c) => c.otherParticipant?.id === recipient.id
      );

      if (existing) {
        setSelectedConv(existing);
        return;
      }

      // Create or get conversation on backend: POST /chat/conversations
      try {
        const res = await chatApi.createConversation(recipient.id);
        const convData = res?.data?.conversation;
        const convId = String(convData?.id || convData?._id || `conv-${recipient.id}`);

        const newConversation = normalizeConversation(convData, currentUser?.id);
        if (!newConversation.otherParticipant || newConversation.otherParticipant.id === 'unknown') {
          newConversation.otherParticipant = {
            id: recipient.id,
            name: recipient.name || 'Teammate',
            email: recipient.email || '',
            role: recipient.role,
            isActive: recipient.isActive,
          };
        }

        // Proper response patching: update conversations list and select active
        setConversations((prev) => [newConversation, ...prev.filter((c) => c.id !== convId)]);
        setSelectedConv(newConversation);
      } catch (err: unknown) {
        toast.error((err as Error)?.message || 'Failed to initialize conversation');
      }
    },
    [conversations, currentUser?.id]
  );

  // Sync external recipient prop (from Team & People page navigation)
  useEffect(() => {
    if (selectedRecipient) {
      handleSelectUser(selectedRecipient);
      onClearSelectedRecipient?.();
    }
  }, [selectedRecipient, handleSelectUser, onClearSelectedRecipient]);

  // 7. Click on a searched message result:
  // Calls GET /chat/messages/:messageId & GET /chat/conversations/:conversationId
  const handleSelectSearchedMessage = async (searchItem: ChatSearchItem) => {
    setSearchQuery('');
    setMobileActivePane('chat');

    try {
      // 1. Fetch single message details: GET /chat/messages/:messageId
      const msgRes = await chatApi.getMessageById(searchItem.id);
      const rawMsg = msgRes?.data?.message;

      // 2. Fetch conversation details if not active: GET /chat/conversations/:conversationId
      if (!selectedConv || selectedConv.id !== searchItem.conversationId) {
        let targetConv = conversations.find((c) => c.id === searchItem.conversationId);
        if (!targetConv) {
          const convRes = await chatApi.getConversationById(searchItem.conversationId);
          if (convRes?.data?.conversation) {
            const fetched = convRes.data.conversation;
            const otherP =
              fetched.otherParticipant ||
              fetched.participants?.find((p) => p.id !== currentUser?.id) || {
                id: 'unknown',
                name: 'Teammate',
                email: '',
              };

            targetConv = {
              id: fetched.id,
              type: 'direct',
              otherParticipant: otherP,
              lastMessage: fetched.lastMessage,
              lastMessageAt: fetched.lastMessageAt,
              unreadCount: 0,
            };
            setConversations((prev) => [targetConv!, ...prev]);
          }
        }

        if (targetConv) {
          setSelectedConv(targetConv);
        }
      }

      // 3. Patch message into stream and highlight
      if (rawMsg) {
        const norm = normalizeRawMessage(rawMsg, currentUser?.id, selectedConv?.otherParticipant?.name || 'Teammate');
        setMessages((prev) => {
          if (!prev.some((m) => m.id === norm.id)) {
            return [...prev, norm];
          }
          return prev;
        });
      }

      setHighlightedMsgId(searchItem.id);
      setTimeout(() => setHighlightedMsgId(null), 3000);
    } catch {
      toast.error('Unable to retrieve message details');
    }
  };

  // 8. Open Browse Modal & Fetch Contacts (GET /chat/contacts) or Directory (GET /api/v1/users)
  const handleOpenBrowseModal = async () => {
    setBrowseModalOpen(true);
    setBrowseModalTab('contacts');
    setModalSearchQuery('');
    loadModalData('contacts', '');
  };

  const loadModalData = async (tab: 'contacts' | 'directory', search: string) => {
    setIsLoadingModalList(true);
    try {
      if (tab === 'contacts') {
        // GET /chat/contacts
        const res = await chatApi.getContacts({ search: search.trim() || undefined, limit: 50 });
        const list = (res?.data?.contacts || []).filter((u) => u.id !== currentUser?.id);
        setContactsList(list);
      } else {
        // GET /api/v1/users?k=...
        const res = await usersApi.getUsers({ k: search.trim() || undefined, page: 1, limit: 50 });
        const list = (res?.data?.users || []).filter((u) => u.id !== currentUser?.id);
        setDirectoryList(list);
      }
    } catch {
      toast.error('Failed to load teammates list');
    } finally {
      setIsLoadingModalList(false);
    }
  };

  const handleModalTabChange = (tab: 'contacts' | 'directory') => {
    setBrowseModalTab(tab);
    loadModalData(tab, modalSearchQuery);
  };

  const handleModalSearchChange = (val: string) => {
    setModalSearchQuery(val);
    loadModalData(browseModalTab, val);
  };

  // 9. Typing Notification Handlers
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

  // 10. Send message via Socket.IO
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || messageInput).trim();
    if (!text || !selectedConv || isSending) return;
    if (text.length > 5000) {
      toast.warning('Message cannot exceed 5000 characters');
      return;
    }

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
      clientMessageId,
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
              m.id === clientMessageId || m.clientMessageId === clientMessageId
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

  // 11. Edit message: PATCH /chat/messages/:messageId
  const handleSaveEditMessage = async (messageId: string) => {
    const text = editInput.trim();
    if (!text) {
      toast.warning('Message content cannot be empty');
      return;
    }
    if (text.length > 5000) {
      toast.warning('Message cannot exceed 5000 characters');
      return;
    }

    try {
      const res = await chatApi.editMessage(messageId, text);
      const updatedMsg = res?.data?.message;

      // Patch message into state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: text,
                editedAt: updatedMsg?.editedAt || new Date().toISOString(),
              }
            : m
        )
      );

      // If this was the last message, patch conversation preview
      if (selectedConv) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id ? { ...c, lastMessage: text } : c
          )
        );
      }

      setEditingMsgId(null);
      setEditInput('');
      toast.success('Message updated');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to edit message');
    }
  };

  // 12. Delete message: DELETE /chat/messages/:messageId
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message? This action will remove its content for all participants.')) return;

    try {
      await chatApi.deleteMessage(messageId);

      // Proper response patching: mark deleted
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: 'This message was deleted', isDeleted: true }
            : m
        )
      );

      if (selectedConv) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id ? { ...c, lastMessage: 'This message was deleted' } : c
          )
        );
      }

      toast.success('Message deleted');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to delete message');
    }
  };

  // 13. Message Details: GET /chat/messages/:messageId
  const handleViewMessageDetails = async (messageId: string) => {
    setDetailsMsgId(messageId);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await chatApi.getMessageById(messageId);
      if (res?.data?.message) {
        setDetailsMessage(res.data.message);
      } else {
        const local = messages.find((m) => m.id === messageId);
        if (local) {
          setDetailsMessage({
            id: local.id,
            conversationId: local.conversationId,
            senderId: local.senderId,
            content: local.content,
            createdAt: local.createdAt,
            editedAt: local.editedAt,
            deletedAt: local.deletedAt,
            isDeleted: local.isDeleted,
            receipt: local.receipt,
          });
        }
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to retrieve message details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // 14. Hide conversation: DELETE /chat/conversations/:conversationId
  const handleConfirmHideConversation = async () => {
    if (!selectedConv || isHidingConv) return;
    setIsHidingConv(true);
    const convId = selectedConv.id;
    try {
      await chatApi.deleteConversation(convId);

      // Proper response patching: remove conversation from user's state
      setConversations((prev) => {
        const nextList = prev.filter((c) => c.id !== convId);
        if (nextList.length > 0) {
          setSelectedConv(nextList[0]);
        } else {
          setSelectedConv(null);
        }
        return nextList;
      });

      setMessages([]);
      setHideModalOpen(false);
      toast.success('Conversation hidden from inbox');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to hide conversation');
    } finally {
      setIsHidingConv(false);
    }
  };

  // Quick 1:1 Instant Meeting
  const handleStartInstantMeet = async () => {
    if (!selectedConv) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const otherName = selectedConv.otherParticipant?.name || 'Teammate';
      const meeting = await createMeeting({
        title: `1:1 Chat Call with ${otherName}`,
        date: todayStr,
        startTime: new Date().toTimeString().slice(0, 5),
        durationMinutes: 30,
        participantsEmails: selectedConv.otherParticipant?.email ? [selectedConv.otherParticipant.email] : [],
        isInstant: true,
      });
      toast.success(`Starting 1:1 meeting with ${otherName}`);
      navigate(`/meetings/join?code=${meeting.meetingCode || meeting.id}`);
    } catch {
      // Toast handled by context
    }
  };

  const isOtherOnline = (userId?: string, defaultActive?: boolean) => {
    if (!userId) return Boolean(defaultActive);
    if (presenceMap[userId] === 'online') return true;
    if (presenceMap[userId] === 'offline') return false;
    return Boolean(defaultActive);
  };

  return (
    <div className={`im-chat-page-card ${fullHeight ? 'im-chat-page-container' : ''}`}>
      {/* Main Split Container */}
      <div
        className={`im-chat-container ${
          mobileActivePane === 'chat' ? 'mobile-show-chat' : 'mobile-show-list'
        } ${fullHeight ? 'im-chat-page-container' : ''}`}
      >
        {/* Left Sidebar: Conversations & Integrated Search */}
        <div className="im-chat-sidebar">
          <div className="im-chat-sidebar-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                  Conversations
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.625rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--im-radius-full)',
                    backgroundColor:
                      connectionStatus === 'connected'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : connectionStatus === 'connecting'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(156, 163, 175, 0.12)',
                    color:
                      connectionStatus === 'connected'
                        ? '#10b981'
                        : connectionStatus === 'connecting'
                        ? '#f59e0b'
                        : '#9ca3af',
                    fontWeight: 600,
                  }}
                  title={`Socket.IO Real-time: ${connectionStatus}`}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor:
                        connectionStatus === 'connected'
                          ? '#10b981'
                          : connectionStatus === 'connecting'
                          ? '#f59e0b'
                          : '#9ca3af',
                    }}
                  />
                  {connectionStatus === 'connected'
                    ? 'Live'
                    : connectionStatus === 'connecting'
                    ? 'Connecting'
                    : 'Offline'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                <button
                  type="button"
                  onClick={handleOpenBrowseModal}
                  className="im-btn im-btn-secondary im-btn-sm"
                  style={{ height: 26, padding: '0 8px', fontSize: '0.7rem', borderRadius: 'var(--im-radius-md)' }}
                  title="Browse contacts and team directory to chat"
                >
                  <UsersIcon size={12} />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            {/* Search Box on Top: Queries GET /api/v1/users?k=... & GET /chat/contacts & GET /chat/search?q=... */}
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
                placeholder="Search teammates or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search all users and chat messages"
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

            {/* Search Mode Tabs (shown when typing search query) */}
            {searchQuery.trim() && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setSearchTab('users')}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    fontSize: '0.7rem',
                    fontWeight: searchTab === 'users' ? 700 : 500,
                    borderRadius: 'var(--im-radius-sm)',
                    backgroundColor: searchTab === 'users' ? 'var(--im-primary)' : 'var(--im-bg-subtle)',
                    color: searchTab === 'users' ? '#ffffff' : 'var(--im-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Teammates ({userSearchResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('messages')}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    fontSize: '0.7rem',
                    fontWeight: searchTab === 'messages' ? 700 : 500,
                    borderRadius: 'var(--im-radius-sm)',
                    backgroundColor: searchTab === 'messages' ? 'var(--im-primary)' : 'var(--im-bg-subtle)',
                    color: searchTab === 'messages' ? '#ffffff' : 'var(--im-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Messages ({msgSearchResults.length})
                </button>
              </div>
            )}
          </div>

          {/* Conversation List / Search Results */}
          <div className="im-chat-conv-list">
            {/* Case A: Searching users or messages */}
            {searchQuery.trim() ? (
              <div>
                {searchTab === 'users' ? (
                  /* Users Search Results (GET /api/v1/users?k=... and GET /chat/contacts?search=...) */
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
                      {isSearching ? 'Searching Users...' : `Found ${userSearchResults.length} Team Members`}
                    </div>

                    {isSearching ? (
                      <div style={{ padding: 16, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                        Searching workspace users...
                      </div>
                    ) : userSearchResults.length === 0 ? (
                      <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--im-text-muted)', fontSize: '0.8125rem' }}>
                        No team members match &ldquo;{searchQuery}&rdquo;.
                      </div>
                    ) : (
                      userSearchResults.map((usr) => (
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
                          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
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
                                {usr.role || 'Member'}
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
                ) : (
                  /* Message Search Results (GET /chat/search?q=...) */
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
                      {isSearching ? 'Searching Messages...' : `Found ${msgSearchResults.length} Messages`}
                    </div>

                    {isSearching ? (
                      <div style={{ padding: 16, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                        Searching messages...
                      </div>
                    ) : msgSearchResults.length === 0 ? (
                      <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--im-text-muted)', fontSize: '0.8125rem' }}>
                        No messages match &ldquo;{searchQuery}&rdquo;.
                      </div>
                    ) : (
                      msgSearchResults.map((m) => {
                        const targetConv = conversations.find((c) => c.id === m.conversationId);
                        const senderName =
                          typeof m.senderId === 'object' && (m.senderId as { name?: string })?.name
                            ? (m.senderId as { name?: string }).name
                            : targetConv?.otherParticipant.name || 'Chat Message';

                        return (
                          <button
                            key={m.id}
                            type="button"
                            className="im-chat-conv-item"
                            onClick={() => handleSelectSearchedMessage(m)}
                          >
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                                  {senderName}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--im-text-muted)' }}>
                                  {formatChatTime(m.createdAt)}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.content}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
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
              /* Case D: Empty state with call-to-action */
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
                  Search any teammate in the box above or browse contacts.
                </p>
                <button
                  type="button"
                  className="im-btn im-btn-primary im-btn-sm"
                  onClick={handleOpenBrowseModal}
                >
                  <UsersIcon size={14} />
                  Start a Chat
                </button>
              </div>
            ) : (
              /* Case E: Active conversations list */
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const otherName = conv.otherParticipant?.name || 'Teammate';
                const initials = getInitials(otherName);
                const isOnline = isOtherOnline(conv.otherParticipant?.id, conv.otherParticipant?.isActive);

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

                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
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
                          {otherName}
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
                    {getInitials(selectedConv.otherParticipant?.name || 'Teammate')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                        {selectedConv.otherParticipant?.name || 'Teammate'}
                      </span>
                      <span
                        className={`im-role-badge ${selectedConv.otherParticipant?.role === 'admin' ? 'im-role-badge-admin' : 'im-role-badge-user'}`}
                      >
                        {selectedConv.otherParticipant?.role || 'Member'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{selectedConv.otherParticipant?.email || ''}</span>
                      <span>•</span>
                      <span
                        style={{
                          color: isOtherOnline(selectedConv.otherParticipant?.id, selectedConv.otherParticipant?.isActive)
                            ? 'var(--im-success)'
                            : 'var(--im-text-muted)',
                        }}
                      >
                        {isOtherOnline(selectedConv.otherParticipant?.id, selectedConv.otherParticipant?.isActive)
                          ? 'Online'
                          : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Actions: Quick Meet, Schedule, Delete Conversation */}
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
                      toast.info(`Schedule meeting with ${selectedConv.otherParticipant?.name || 'Teammate'}`);
                    }}
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    className="im-btn im-btn-secondary im-btn-sm"
                    onClick={() => setHideModalOpen(true)}
                    title="Hide conversation (DELETE /chat/conversations/:id)"
                    style={{ padding: '6px 10px', color: 'var(--im-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <TrashIcon size={13} />
                    <span>Hide</span>
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="im-chat-messages-stream">
                {/* Cursor Pagination: Load Earlier Messages Button */}
                {hasMoreMessages && (
                  <div className="im-chat-load-older">
                    <button
                      type="button"
                      className="im-chat-load-older-btn"
                      onClick={handleLoadOlderMessages}
                      disabled={isLoadingOlder}
                    >
                      {isLoadingOlder ? 'Loading older messages...' : '↑ Load older messages'}
                    </button>
                  </div>
                )}

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
                      Send your first message to {selectedConv.otherParticipant?.name || 'your teammate'} to connect.
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
                  messages.map((msg) => {
                    const isHighlighted = highlightedMsgId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`im-chat-bubble-row ${msg.isMine ? 'mine' : 'theirs'} ${
                          isHighlighted ? 'highlighted' : ''
                        }`}
                      >
                        {editingMsgId === msg.id ? (
                          /* Editing form (PATCH /chat/messages/:id) */
                          <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 420 }}>
                            <input
                              type="text"
                              className="im-input"
                              style={{ height: 32, fontSize: '0.8125rem' }}
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditMessage(msg.id);
                                if (e.key === 'Escape') setEditingMsgId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="im-btn im-btn-primary im-btn-sm"
                              style={{ height: 32, padding: '0 8px' }}
                              onClick={() => handleSaveEditMessage(msg.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="im-btn im-btn-secondary im-btn-sm"
                              style={{ height: 32, padding: '0 8px' }}
                              onClick={() => setEditingMsgId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className={`im-chat-bubble ${msg.isMine ? 'mine' : 'theirs'}`}>
                            {msg.content}
                            {msg.editedAt && !msg.isDeleted && (
                              <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: 6 }}>
                                (edited)
                              </span>
                            )}
                          </div>
                        )}

                        <div className="im-chat-bubble-meta">
                          <span>{formatChatTime(msg.createdAt)}</span>
                          {msg.isMine && (
                            <span
                              style={{
                                color: msg.status === 'read' ? '#0284c7' : 'var(--im-text-muted)',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              }}
                              title={`Status: ${msg.status || 'sent'}`}
                            >
                              {msg.status === 'sending' ? '⏳' : msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}

                          {/* Action buttons: Details for all messages, Edit/Delete for own messages */}
                          <div className="im-chat-msg-actions">
                            {!msg.isDeleted && (
                              <button
                                type="button"
                                className="im-chat-msg-action-btn"
                                onClick={() => handleViewMessageDetails(msg.id)}
                                title="Message details (GET /chat/messages/:id)"
                              >
                                <InfoIcon size={12} />
                              </button>
                            )}

                            {msg.isMine && !msg.isDeleted && editingMsgId !== msg.id && (
                              <>
                                <button
                                  type="button"
                                  className="im-chat-msg-action-btn"
                                  onClick={() => {
                                    setEditingMsgId(msg.id);
                                    setEditInput(msg.content);
                                  }}
                                  title="Edit message (PATCH /chat/messages/:id)"
                                >
                                  <EditIcon size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="im-chat-msg-action-btn danger"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  title="Delete message (DELETE /chat/messages/:id)"
                                >
                                  <TrashIcon size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Peer Typing Indicator Bubble */}
                {isPeerTyping && (
                  <div className="im-chat-typing-indicator">
                    <span>{selectedConv.otherParticipant?.name || 'Teammate'} is typing</span>
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
                    placeholder={`Message ${selectedConv.otherParticipant?.name || 'teammate'}... (Press Enter to send)`}
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
              <button
                type="button"
                className="im-btn im-btn-primary im-btn-sm"
                onClick={handleOpenBrowseModal}
              >
                <UsersIcon size={14} />
                Browse Contacts & Directory
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Browse All Contacts & Directory Modal (calls GET /chat/contacts and GET /api/v1/users) */}
      {browseModalOpen && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="browse-users-title">
          <div className="im-modal" style={{ maxWidth: 500 }}>
            <div className="im-modal-header">
              <h2 id="browse-users-title" className="im-modal-title">New Direct Message</h2>
              <button
                type="button"
                className="im-modal-close"
                onClick={() => setBrowseModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs: Contacts vs All Directory */}
            <div style={{ padding: '0 20px', marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--im-border)', paddingBottom: 8 }}>
                <button
                  type="button"
                  className={`im-tab-btn ${browseModalTab === 'contacts' ? 'active' : ''}`}
                  onClick={() => handleModalTabChange('contacts')}
                >
                  Chat Contacts (GET /chat/contacts)
                </button>
                <button
                  type="button"
                  className={`im-tab-btn ${browseModalTab === 'directory' ? 'active' : ''}`}
                  onClick={() => handleModalTabChange('directory')}
                >
                  All Users (GET /api/v1/users)
                </button>
              </div>

              {/* Live search input in modal */}
              <div style={{ marginTop: 12, position: 'relative' }}>
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
                  style={{ paddingLeft: 32, height: 34, fontSize: '0.8125rem' }}
                  placeholder={browseModalTab === 'contacts' ? 'Search contacts by name or email...' : 'Search workspace users...'}
                  value={modalSearchQuery}
                  onChange={(e) => handleModalSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="im-modal-body" style={{ maxHeight: 360, overflowY: 'auto', padding: '16px 20px' }}>
              {isLoadingModalList ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--im-text-muted)' }}>
                  Loading {browseModalTab === 'contacts' ? 'contacts' : 'users directory'}...
                </div>
              ) : (browseModalTab === 'contacts' ? contactsList : directoryList).length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--im-text-muted)' }}>
                  No members found in {browseModalTab === 'contacts' ? 'chat contacts' : 'directory'}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(browseModalTab === 'contacts' ? contactsList : directoryList).map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      className="im-chat-conv-item"
                      style={{ padding: '8px 10px' }}
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
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
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
                            {usr.role || 'Member'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usr.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="im-modal-footer">
              <button
                type="button"
                className="im-btn im-btn-secondary"
                onClick={() => setBrowseModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Conversation Confirmation Modal (DELETE /chat/conversations/:id) */}
      {hideModalOpen && selectedConv && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="hide-conv-title">
          <div className="im-modal" style={{ maxWidth: 440 }}>
            <div className="im-modal-header">
              <h2 id="hide-conv-title" className="im-modal-title">Hide Conversation</h2>
              <button
                type="button"
                className="im-modal-close"
                onClick={() => setHideModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="im-modal-body" style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--im-text-primary)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                Are you sure you want to hide this conversation with <strong>{selectedConv.otherParticipant?.name || 'this contact'}</strong>?
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', margin: 0, lineHeight: 1.45 }}>
                This will remove the conversation from your active inbox without deleting message history for the other participant. New incoming messages will restore it to your inbox automatically.
              </p>
            </div>
            <div className="im-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="im-btn im-btn-secondary"
                onClick={() => setHideModalOpen(false)}
                disabled={isHidingConv}
              >
                Cancel
              </button>
              <button
                type="button"
                className="im-btn im-btn-danger"
                onClick={handleConfirmHideConversation}
                disabled={isHidingConv}
                style={{ backgroundColor: 'var(--im-danger, #ef4444)', color: '#ffffff' }}
              >
                {isHidingConv ? 'Hiding...' : 'Hide Conversation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Modal (GET /chat/messages/:id) */}
      {detailsModalOpen && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="msg-details-title">
          <div className="im-modal" style={{ maxWidth: 480 }}>
            <div className="im-modal-header">
              <h2 id="msg-details-title" className="im-modal-title">Message Details</h2>
              <button
                type="button"
                className="im-modal-close"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setDetailsMessage(null);
                  setDetailsMsgId(null);
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="im-modal-body" style={{ padding: '20px' }}>
              {detailsLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--im-text-muted)', fontSize: '0.875rem' }}>
                  Loading message metadata...
                </div>
              ) : detailsMessage ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Content
                    </span>
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--im-bg-subtle)',
                        borderRadius: 'var(--im-radius-md)',
                        color: 'var(--im-text-primary)',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}
                    >
                      {detailsMessage.content}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>
                        Sent Time
                      </span>
                      <span style={{ color: 'var(--im-text-primary)' }}>
                        {detailsMessage.createdAt ? new Date(detailsMessage.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>
                        Edited
                      </span>
                      <span style={{ color: 'var(--im-text-primary)' }}>
                        {detailsMessage.editedAt ? new Date(detailsMessage.editedAt).toLocaleString() : 'No'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>
                        Delivered
                      </span>
                      <span style={{ color: 'var(--im-text-primary)' }}>
                        {detailsMessage.receipt?.deliveredAt ? new Date(detailsMessage.receipt.deliveredAt).toLocaleString() : 'Delivered'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>
                        Read
                      </span>
                      <span style={{ color: detailsMessage.receipt?.readAt ? 'var(--im-primary)' : 'var(--im-text-muted)' }}>
                        {detailsMessage.receipt?.readAt ? new Date(detailsMessage.receipt.readAt).toLocaleString() : 'Unread'}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--im-border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--im-text-muted)' }}>Message ID:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--im-text-secondary)' }}>
                        {String(detailsMessage.id || detailsMessage._id || detailsMsgId)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--im-text-muted)' }}>Conversation ID:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--im-text-secondary)' }}>
                        {String(detailsMessage.conversationId || selectedConv?.id)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--im-text-muted)' }}>
                  Message details not available.
                </div>
              )}
            </div>
            <div className="im-modal-footer">
              <button
                type="button"
                className="im-btn im-btn-secondary"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setDetailsMessage(null);
                  setDetailsMsgId(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChatModule;
