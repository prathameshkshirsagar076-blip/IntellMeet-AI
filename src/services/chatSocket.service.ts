import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/tokenStorage';

export interface SocketMessagePayload {
  conversationId: string;
  clientMessageId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface SocketMessageAck {
  success: boolean;
  clientMessageId?: string;
  message?: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export type MessageNewHandler = (data: {
  message: {
    id?: string;
    _id?: string;
    conversationId: string;
    senderId: string | { _id: string; name: string };
    content: string;
    createdAt: string;
    clientMessageId?: string;
  };
}) => void;

export type ConversationUpdateHandler = (data: {
  conversationId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}) => void;

export type TypingUpdateHandler = (data: {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}) => void;

export type PresenceUpdateHandler = (data: {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private messageNewListeners: Set<MessageNewHandler> = new Set();
  private conversationUpdateListeners: Set<ConversationUpdateHandler> = new Set();
  private typingUpdateListeners: Set<TypingUpdateHandler> = new Set();
  private presenceUpdateListeners: Set<PresenceUpdateHandler> = new Set();
  private activeConversationId: string | null = null;

  /**
   * Initializes or returns the existing Socket.IO connection.
   */
  public connect(): Socket | null {
    const token = getAccessToken();
    if (!token) {
      this.disconnect();
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.auth = { token };
      this.socket.connect();
      return this.socket;
    }

    // Connect through proxy (/socket.io) or current origin
    const socketUrl = window.location.origin;

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    this.setupListeners();
    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('message:new', (data) => {
      this.messageNewListeners.forEach((fn) => fn(data));
    });

    this.socket.on('conversation:update', (data) => {
      this.conversationUpdateListeners.forEach((fn) => fn(data));
    });

    this.socket.on('typing:update', (data) => {
      this.typingUpdateListeners.forEach((fn) => fn(data));
    });

    this.socket.on('presence:update', (data) => {
      this.presenceUpdateListeners.forEach((fn) => fn(data));
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket.IO connection notice:', err.message);
    });
  }

  public joinConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  public leaveConversation(conversationId: string) {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  public sendMessage(
    payload: SocketMessagePayload,
    callback?: (ack: SocketMessageAck) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:send', payload, callback);
    } else {
      callback?.({
        success: false,
        error: { code: 'SOCKET_DISCONNECTED', message: 'Socket disconnected' },
      });
    }
  }

  public startTyping(conversationId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  public stopTyping(conversationId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  public markAsRead(conversationId: string, upToMessageId?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:read', { conversationId, upToMessageId });
    }
  }

  public onMessageNew(fn: MessageNewHandler): () => void {
    this.messageNewListeners.add(fn);
    return () => this.messageNewListeners.delete(fn);
  }

  public onConversationUpdate(fn: ConversationUpdateHandler): () => void {
    this.conversationUpdateListeners.add(fn);
    return () => this.conversationUpdateListeners.delete(fn);
  }

  public onTypingUpdate(fn: TypingUpdateHandler): () => void {
    this.typingUpdateListeners.add(fn);
    return () => this.typingUpdateListeners.delete(fn);
  }

  public onPresenceUpdate(fn: PresenceUpdateHandler): () => void {
    this.presenceUpdateListeners.add(fn);
    return () => this.presenceUpdateListeners.delete(fn);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatSocketService = new ChatSocketService();
export default chatSocketService;
