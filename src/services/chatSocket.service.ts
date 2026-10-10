import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/tokenStorage';
import { apiClient } from '../api/client';
import { env } from '../config/env';

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
    id?: string;
    _id?: string;
    conversationId: string;
    senderId: string | { _id: string; id?: string; name: string };
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
    senderId: string | { _id?: string; id?: string; name?: string };
    content: string;
    createdAt: string;
    clientMessageId?: string;
    receipt?: {
      deliveredAt?: string | null;
      readAt?: string | null;
    } | null;
  };
  conversationId?: string;
}) => void;

export type MessageEditedHandler = (data: {
  message?: {
    id?: string;
    _id?: string;
    conversationId?: string;
    content?: string;
    editedAt?: string;
  };
  messageId: string;
  conversationId: string;
  content: string;
  editedAt?: string;
}) => void;

export type MessageDeletedHandler = (data: {
  messageId: string;
  conversationId: string;
  deletedAt?: string;
}) => void;

export type MessageReadHandler = (data: {
  conversationId: string;
  recipientId: string;
  readAt: string;
  affectedCount?: number;
}) => void;

export type MessageDeliveredHandler = (data: {
  messageId: string;
  conversationId: string;
  recipientId: string;
  deliveredAt: string;
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

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type ConnectionStatusHandler = (status: ConnectionStatus) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private messageNewListeners: Set<MessageNewHandler> = new Set();
  private messageEditedListeners: Set<MessageEditedHandler> = new Set();
  private messageDeletedListeners: Set<MessageDeletedHandler> = new Set();
  private messageReadListeners: Set<MessageReadHandler> = new Set();
  private messageDeliveredListeners: Set<MessageDeliveredHandler> = new Set();
  private conversationUpdateListeners: Set<ConversationUpdateHandler> = new Set();
  private typingUpdateListeners: Set<TypingUpdateHandler> = new Set();
  private presenceUpdateListeners: Set<PresenceUpdateHandler> = new Set();
  private connectionStatusListeners: Set<ConnectionStatusHandler> = new Set();

  private activeConversationId: string | null = null;
  private isRefreshingToken = false;
  private connectionStatus: ConnectionStatus = 'disconnected';

  private log(message: string, ...args: unknown[]) {
    if (env.isDev) {
      console.log(`[Socket.IO Client] ${message}`, ...args);
    }
  }

  private warn(message: string, ...args: unknown[]) {
    if (env.isDev) {
      console.warn(`[Socket.IO Client] ${message}`, ...args);
    }
  }

  private notifyConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.connectionStatusListeners.forEach((fn) => fn(status));
  }

  /**
   * Intelligently resolves the backend Socket.IO host URL based on environment.
   */
  public resolveSocketUrl(): string {
    // 1. Explicit VITE_SOCKET_URL
    const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;
    if (viteSocketUrl) {
      return viteSocketUrl;
    }

    // 2. VITE_WS_URL or env.wsUrl
    const rawWsUrl = import.meta.env.VITE_WS_URL || env.wsUrl;
    if (rawWsUrl && typeof rawWsUrl === 'string') {
      const normalized = rawWsUrl
        .replace(/^ws:\/\//i, 'http://')
        .replace(/^wss:\/\//i, 'https://')
        .replace(/\/ws\/?$/i, '')
        .replace(/\/socket\.io\/?$/i, '');
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return normalized;
      }
    }

    // 3. Fallback: window.location.origin (proxied through Vite dev server or reverse proxy)
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    return 'http://localhost:5000';
  }

  /**
   * Initializes or returns the existing singleton Socket.IO connection.
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
      this.notifyConnectionStatus('connecting');
      this.socket.connect();
      return this.socket;
    }

    const socketUrl = this.resolveSocketUrl();
    this.notifyConnectionStatus('connecting');
    this.log(`Initiating connection to ${socketUrl} on path /socket.io`);

    this.socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['polling', 'websocket'], // Reliable polling handshake first, then automatic websocket upgrade
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    this.setupListeners();
    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.notifyConnectionStatus('connected');
      this.log(`Connection established! Socket ID: ${this.socket?.id}`);
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.notifyConnectionStatus('disconnected');
      this.log(`Socket disconnected. Reason: ${reason}`);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      this.notifyConnectionStatus('connecting');
      this.log(`Reconnection attempt #${attempt}`);
      const freshToken = getAccessToken();
      if (freshToken && this.socket) {
        this.socket.auth = { token: freshToken };
      }
    });

    this.socket.on('reconnect', (attempt) => {
      this.notifyConnectionStatus('connected');
      this.log(`Reconnected successfully after ${attempt} attempts!`);
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('connect_error', async (err) => {
      this.notifyConnectionStatus('disconnected');
      this.warn(`Connection error: ${err.message}`);

      // Handle token expiration/auth error during socket handshake
      const isAuthError =
        err.message.includes('token') ||
        err.message.includes('Authentication') ||
        err.message.includes('expired') ||
        err.message.includes('Unauthorized');

      if (isAuthError && !this.isRefreshingToken) {
        this.isRefreshingToken = true;
        try {
          this.log('Access token expired/invalid on socket handshake. Attempting token refresh...');
          const newToken = await apiClient.refreshToken();
          if (newToken && this.socket) {
            this.log('Token refreshed successfully. Reconnecting socket with fresh credential...');
            this.socket.auth = { token: newToken };
            this.socket.connect();
          }
        } catch {
          this.warn('Failed to refresh token for Socket.IO connection');
        } finally {
          this.isRefreshingToken = false;
        }
      }
    });

    // Event: message:new
    this.socket.on('message:new', (data) => {
      this.log('Received message:new', data?.message?.id || data?.message?._id);
      this.messageNewListeners.forEach((fn) => fn(data));
    });

    // Event: message:edited
    this.socket.on('message:edited', (data) => {
      this.log('Received message:edited', data?.messageId || data?.message?.id);
      const normalized = {
        messageId: data.messageId || data.message?.id || '',
        conversationId: data.conversationId || data.message?.conversationId || '',
        content: data.content || data.message?.content || '',
        editedAt: data.editedAt || data.message?.editedAt || new Date().toISOString(),
      };
      this.messageEditedListeners.forEach((fn) => fn(normalized));
    });

    // Event: message:deleted
    this.socket.on('message:deleted', (data) => {
      this.log('Received message:deleted', data?.messageId);
      this.messageDeletedListeners.forEach((fn) => fn(data));
    });

    // Event: message:read
    this.socket.on('message:read', (data) => {
      this.log('Received message:read', data?.conversationId);
      this.messageReadListeners.forEach((fn) => fn(data));
    });

    // Event: message:delivered
    this.socket.on('message:delivered', (data) => {
      this.log('Received message:delivered', data?.messageId);
      this.messageDeliveredListeners.forEach((fn) => fn(data));
    });

    // Event: conversation:update
    this.socket.on('conversation:update', (data) => {
      this.conversationUpdateListeners.forEach((fn) => fn(data));
    });

    // Event: conversation:error
    this.socket.on('conversation:error', (data) => {
      this.warn('Received conversation:error', data?.message);
    });

    // Event: typing:update
    this.socket.on('typing:update', (data) => {
      this.typingUpdateListeners.forEach((fn) => fn(data));
    });

    // Event: presence:update
    this.socket.on('presence:update', (data) => {
      this.presenceUpdateListeners.forEach((fn) => fn(data));
    });
  }

  public joinConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    if (this.socket && this.socket.connected) {
      this.log(`Joining conversation room: conversation:${conversationId}`);
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  public leaveConversation(conversationId: string) {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    if (this.socket && this.socket.connected) {
      this.log(`Leaving conversation room: conversation:${conversationId}`);
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  public sendMessage(
    payload: SocketMessagePayload,
    callback?: (ack: SocketMessageAck) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.log(`Sending message via Socket.IO: clientMessageId = ${payload.clientMessageId}`);
      this.socket.emit('message:send', payload, callback);
    } else {
      this.warn('Socket not connected while attempting to send message. Invoking fallback.');
      callback?.({
        success: false,
        error: { code: 'SOCKET_DISCONNECTED', message: 'Socket disconnected. Connecting...' },
      });
      // Try reconnecting in background
      this.connect();
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

  public markAsRead(conversationId: string, upToMessageId?: string, callback?: (res: unknown) => void) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:read', { conversationId, upToMessageId }, callback);
    }
  }

  public markAsDelivered(messageId: string, callback?: (res: unknown) => void) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:delivered', { messageId }, callback);
    }
  }

  public getPresence(
    userId: string,
    callback?: (data: { userId: string; status: 'online' | 'offline'; lastSeen?: string }) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('presence:get', { userId }, callback);
    }
  }

  public onMessageNew(fn: MessageNewHandler): () => void {
    this.messageNewListeners.add(fn);
    return () => this.messageNewListeners.delete(fn);
  }

  public onMessageEdited(fn: MessageEditedHandler): () => void {
    this.messageEditedListeners.add(fn);
    return () => this.messageEditedListeners.delete(fn);
  }

  public onMessageDeleted(fn: MessageDeletedHandler): () => void {
    this.messageDeletedListeners.add(fn);
    return () => this.messageDeletedListeners.delete(fn);
  }

  public onMessageRead(fn: MessageReadHandler): () => void {
    this.messageReadListeners.add(fn);
    return () => this.messageReadListeners.delete(fn);
  }

  public onMessageDelivered(fn: MessageDeliveredHandler): () => void {
    this.messageDeliveredListeners.add(fn);
    return () => this.messageDeliveredListeners.delete(fn);
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

  public onConnectionChange(fn: ConnectionStatusHandler): () => void {
    this.connectionStatusListeners.add(fn);
    fn(this.connectionStatus);
    return () => this.connectionStatusListeners.delete(fn);
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public disconnect() {
    if (this.socket) {
      this.log('Disconnecting socket.');
      this.socket.disconnect();
      this.socket = null;
      this.notifyConnectionStatus('disconnected');
    }
  }
}

export const chatSocketService = new ChatSocketService();
export default chatSocketService;
