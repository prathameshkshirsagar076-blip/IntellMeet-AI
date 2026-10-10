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
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isMine?: boolean;
}

export interface GetConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: ChatConversation[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

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
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data: {
    messages: Array<{
      id: string;
      _id?: string;
      conversationId: string;
      senderId: string | { _id: string; name: string };
      content: string;
      createdAt: string;
    }>;
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

export interface GetContactsResponse {
  success: boolean;
  message: string;
  data: {
    contacts: UserItem[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
