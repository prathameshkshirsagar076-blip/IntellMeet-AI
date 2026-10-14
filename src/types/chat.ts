import type { UserItem } from './user';

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  otherParticipant: ChatParticipant;
  participants?: ChatParticipant[];
  lastMessageId?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  clientMessageId?: string;
  content: string;
  messageType?: string;
  createdAt: string;
  updatedAt?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isMine?: boolean;
  editedAt?: string | null;
  deletedAt?: string | null;
  isDeleted?: boolean;
  receipt?: {
    deliveredAt?: string | null;
    readAt?: string | null;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 1. POST /chat/conversations
export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversation: {
      id: string;
      _id?: string;
      type: string;
      participants: ChatParticipant[];
      canonicalKey?: string;
      lastMessageId?: string | null;
      lastMessage?: string | null;
      lastMessageAt?: string | null;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

// 2. GET /chat/conversations
export interface GetConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: ChatConversation[];
    pagination?: PaginationMeta;
  };
}

// 3. GET /chat/conversations/:conversationId
export interface GetConversationByIdResponse {
  success: boolean;
  message: string;
  data: {
    conversation: {
      id: string;
      _id?: string;
      type: string;
      participants: ChatParticipant[];
      otherParticipant?: ChatParticipant | null;
      lastMessageId?: string | null;
      lastMessage?: string | null;
      lastMessageAt?: string | null;
      unreadCount?: number;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

// 4. DELETE /chat/conversations/:conversationId
export interface DeleteConversationResponse {
  success: boolean;
  message: string;
}

// 5. GET /chat/conversations/:conversationId/messages
export interface RawChatMessageItem {
  id: string;
  _id?: string;
  conversationId: string;
  senderId: string | { id?: string; _id?: string; name?: string; email?: string };
  clientMessageId?: string;
  content: string;
  messageType?: string;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  isDeleted?: boolean;
  receipt?: {
    deliveredAt?: string | null;
    readAt?: string | null;
  } | null;
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: RawChatMessageItem[];
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

// 5b. POST /chat/conversations/:conversationId/messages
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: RawChatMessageItem;
  };
}

// 6. GET /chat/messages/:messageId
export interface GetMessageByIdResponse {
  success: boolean;
  message: string;
  data: {
    message: RawChatMessageItem;
  };
}

// 7. PATCH /chat/messages/:messageId
export interface EditMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: {
      id: string;
      _id?: string;
      conversationId: string;
      content: string;
      editedAt?: string | null;
      updatedAt?: string;
      deletedAt?: string | null;
    };
  };
}

// 8. DELETE /chat/messages/:messageId
export interface DeleteMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: {
      id: string;
      _id?: string;
      conversationId: string;
      content: string;
      deletedAt?: string | null;
      isDeleted?: boolean;
    };
  };
}

// 9. POST /chat/conversations/:conversationId/read
export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data: {
    readAt: string;
    affectedCount: number;
  };
}

// 10. GET /chat/conversations/:conversationId/unread-count
export interface GetUnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    unreadCount: number;
  };
}

// 11. POST /chat/messages/:messageId/delivered
export interface MarkAsDeliveredResponse {
  success: boolean;
  message: string;
  data: {
    receipt: {
      id?: string;
      messageId: string;
      conversationId: string;
      recipientId: string;
      deliveredAt: string;
      readAt?: string | null;
    };
  };
}

// 12. GET /chat/contacts
export interface GetContactsResponse {
  success: boolean;
  message: string;
  data: {
    contacts: UserItem[];
    pagination?: PaginationMeta;
  };
}

// 13. GET /chat/search
export interface ChatSearchItem {
  id: string;
  conversationId: string;
  senderId: string | { id?: string; _id?: string; name?: string; email?: string };
  content: string;
  createdAt: string;
  editedAt?: string | null;
}

export interface ChatSearchResponse {
  success: boolean;
  message: string;
  data: {
    messages?: ChatSearchItem[];
    conversations?: ChatConversation[];
    pagination?: PaginationMeta;
  };
}
