import { io, Socket } from 'socket.io-client';
import { getAccessToken, isJwtExpired } from '../utils/tokenStorage';
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
  private connectionStatus: ConnectionStatus = 'disconnected';
  private hasAttemptedConnection = false;
  private isConnecting = false;

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
   * Intelligently resolves the backend Socket.IO host URL based directly on .env.
   * No hardcoded URLs allowed anywhere.
   */
  public resolveSocketUrl(): string {
    // 1. Explicit VITE_SOCKET_URL from .env
    const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;
    if (viteSocketUrl && typeof viteSocketUrl === 'string' && viteSocketUrl.trim()) {
      return viteSocketUrl.trim();
    }

    // 2. BACKEND_URL or VITE_BACKEND_URL from .env / centralized config
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL ||
      (import.meta.env as unknown as Record<string, string>).BACKEND_URL ||
      env.backendUrl;
    if (backendUrl && typeof backendUrl === 'string' && backendUrl.trim()) {
      return backendUrl.trim();
    }

    // 3. VITE_WS_URL or env.wsUrl from .env
    const rawWsUrl = import.meta.env.VITE_WS_URL || env.wsUrl;
    if (rawWsUrl && typeof rawWsUrl === 'string' && rawWsUrl.trim()) {
      const normalized = rawWsUrl
        .trim()
        .replace(/^ws:\/\//i, 'http://')
        .replace(/^wss:\/\//i, 'https://')
        .replace(/\/ws\/?$/i, '')
        .replace(/\/socket\.io\/?$/i, '');
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return normalized;
      }
    }

    // 4. Remote API Base URL origin fallback from .env
    if (env.remoteApiBaseUrl && env.remoteApiBaseUrl.startsWith('http')) {
      try {
        const parsed = new URL(env.remoteApiBaseUrl);
        return parsed.origin;
      } catch {
        // Ignore invalid URL formatting
      }
    }

    // 5. Fallback: window.location.origin
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    return '';
  }

  /**
   * Initializes the singleton Socket.IO connection.
   * Strictly calls ONCE to prevent redundant, repeating network calls.
   */
  public connect(force = false): Socket | null {
    if (!env.enableSocketPolling) {
      this.log('Socket polling disabled by VITE_ENABLE_SOCKET_POLLING.');
      return null;
    }

    // Single-call guard: if already connected, connecting, or already attempted (unless forced)
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      this.log('Socket connection already in progress, skipping duplicate call.');
      return this.socket;
    }

    if (this.hasAttemptedConnection && !force) {
      this.log('Socket connect was already called once. Skipping duplicate call.');
      return this.socket;
    }

    const token = getAccessToken();
    if (!token || isJwtExpired(token)) {
      this.disconnect();
      return null;
    }

    this.hasAttemptedConnection = true;
    this.isConnecting = true;

    const rawToken = token.replace(/^Bearer\s+/i, '');
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    if (this.socket) {
      this.socket.auth = {
        token: rawToken,
        Authorization: bearerToken,
      };
      this.notifyConnectionStatus('connecting');
      this.socket.connect();
      return this.socket;
    }

    const socketUrl = this.resolveSocketUrl();
    this.notifyConnectionStatus('connecting');
    this.log(`Initiating connection once to ${socketUrl || 'window origin'} on path /socket.io`);

    this.socket = io(socketUrl, {
      path: '/socket.io',
      auth: {
        token: rawToken,
        Authorization: bearerToken,
      },
      extraHeaders: {
        Authorization: bearerToken,
      },
      withCredentials: true,
      transports: ['polling'],
      reconnection: false, // Strict: never automatically loop or spam polling
      autoConnect: false,  // Controlled single-flight connect
      timeout: 10000,
    });

    this.setupListeners();
    this.socket.connect();
    return this.socket;
  }

  /**
   * Explicitly resets call guard and reconnects once on-demand.
   */
  public reconnect(): Socket | null {
    this.hasAttemptedConnection = false;
    this.disconnect();
    return this.connect(true);
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnecting = false;
      this.notifyConnectionStatus('connected');
      this.log(`Connection established! Socket ID: ${this.socket?.id}`);
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      this.notifyConnectionStatus('disconnected');
      this.log(`Socket disconnected. Reason: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      this.notifyConnectionStatus('disconnected');
      this.warn(`Connection error: ${err.message}`);

      // Stop immediately on error - do not retry in loops or spam polling
      if (this.socket) {
        this.socket.disconnect();
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
      this.warn('Socket not connected while attempting to send message.');
      callback?.({
        success: false,
        error: { code: 'SOCKET_DISCONNECTED', message: 'Socket not connected.' },
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
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.notifyConnectionStatus('disconnected');
  }
}

export const chatSocketService = new ChatSocketService();
export default chatSocketService;
