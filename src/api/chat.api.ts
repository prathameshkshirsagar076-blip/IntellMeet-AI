import { apiClient } from './client';
import type {
  GetConversationsResponse,
  CreateConversationResponse,
  GetConversationByIdResponse,
  DeleteConversationResponse,
  GetMessagesResponse,
  SendMessageResponse,
  GetMessageByIdResponse,
  EditMessageResponse,
  DeleteMessageResponse,
  MarkAsReadResponse,
  GetUnreadCountResponse,
  MarkAsDeliveredResponse,
  GetContactsResponse,
  ChatSearchResponse,
} from '../types/chat';

export const chatApi = {
  /**
   * 1. POST /chat/conversations
   * Create or retrieve existing direct conversation with recipientId
   */
  async createConversation(recipientId: string, options?: RequestInit): Promise<CreateConversationResponse> {
    return apiClient.post<CreateConversationResponse>('/chat/conversations', {
      recipientId,
    }, options);
  },

  /**
   * 2. GET /chat/conversations
   * List conversations of authenticated user with unread count and preview
   */
  async getConversations(params: { page?: number; limit?: number } = {}, options?: RequestInit): Promise<GetConversationsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/chat/conversations?${qs}` : '/chat/conversations';
    return apiClient.get<GetConversationsResponse>(endpoint, options);
  },

  /**
   * 3. GET /chat/conversations/:conversationId
   * Retrieve conversation details by ID
   */
  async getConversationById(conversationId: string, options?: RequestInit): Promise<GetConversationByIdResponse> {
    return apiClient.get<GetConversationByIdResponse>(`/chat/conversations/${conversationId}`, options);
  },

  /**
   * 4. DELETE /chat/conversations/:conversationId
   * Hide/archive conversation for authenticated user
   */
  async deleteConversation(conversationId: string, options?: RequestInit): Promise<DeleteConversationResponse> {
    return apiClient.delete<DeleteConversationResponse>(`/chat/conversations/${conversationId}`, options);
  },

  /**
   * 5. GET /chat/conversations/:conversationId/messages
   * Get messages for a given conversation with cursor pagination
   */
  async getMessages(
    conversationId: string,
    params: { cursor?: string; limit?: number; direction?: 'before' | 'after' } = {},
    options?: RequestInit
  ): Promise<GetMessagesResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.direction) query.set('direction', params.direction);

    const qs = query.toString();
    const endpoint = qs
      ? `/chat/conversations/${conversationId}/messages?${qs}`
      : `/chat/conversations/${conversationId}/messages`;
    return apiClient.get<GetMessagesResponse>(endpoint, options);
  },

  /**
   * 5b. POST /chat/conversations/:conversationId/messages
   * Send a message via REST fallback
   */
  async sendMessage(
    conversationId: string,
    payload: { content: string; clientMessageId?: string; messageType?: string },
    options?: RequestInit
  ): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>(
      `/chat/conversations/${conversationId}/messages`,
      payload,
      options
    );
  },

  /**
   * 6. GET /chat/messages/:messageId
   * Retrieve single message details
   */
  async getMessageById(messageId: string, options?: RequestInit): Promise<GetMessageByIdResponse> {
    return apiClient.get<GetMessageByIdResponse>(`/chat/messages/${messageId}`, options);
  },

  /**
   * 7. PATCH /chat/messages/:messageId
   * Edit an existing message
   */
  async editMessage(messageId: string, content: string, options?: RequestInit): Promise<EditMessageResponse> {
    return apiClient.patch<EditMessageResponse>(`/chat/messages/${messageId}`, {
      content,
    }, options);
  },

  /**
   * 8. DELETE /chat/messages/:messageId
   * Delete an existing message
   */
  async deleteMessage(messageId: string, options?: RequestInit): Promise<DeleteMessageResponse> {
    return apiClient.delete<DeleteMessageResponse>(`/chat/messages/${messageId}`, options);
  },

  /**
   * 9. POST /chat/conversations/:conversationId/read
   * Mark messages as read in a conversation
   */
  async markAsRead(conversationId: string, upToMessageId?: string, options?: RequestInit): Promise<MarkAsReadResponse> {
    return apiClient.post<MarkAsReadResponse>(
      `/chat/conversations/${conversationId}/read`,
      upToMessageId ? { upToMessageId } : {},
      options
    );
  },

  /**
   * 10. GET /chat/conversations/:conversationId/unread-count
   * Get unread message count in a conversation
   */
  async getUnreadCount(conversationId: string, options?: RequestInit): Promise<GetUnreadCountResponse> {
    return apiClient.get<GetUnreadCountResponse>(`/chat/conversations/${conversationId}/unread-count`, options);
  },

  /**
   * 11. POST /chat/messages/:messageId/delivered
   * Mark message as delivered
   */
  async markAsDelivered(messageId: string, options?: RequestInit): Promise<MarkAsDeliveredResponse> {
    return apiClient.post<MarkAsDeliveredResponse>(`/chat/messages/${messageId}/delivered`, {}, options);
  },

  /**
   * 12. GET /chat/contacts
   * List contacts available for chat
   */
  async getContacts(params: { search?: string; page?: number; limit?: number } = {}, options?: RequestInit): Promise<GetContactsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/chat/contacts?${qs}` : '/chat/contacts';
    return apiClient.get<GetContactsResponse>(endpoint, options);
  },

  /**
   * 13. GET /chat/search
   * Search messages and conversations by query string
   */
  async search(params: { q: string; page?: number; limit?: number }, options?: RequestInit): Promise<ChatSearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return apiClient.get<ChatSearchResponse>(`/chat/search?${query.toString()}`, options);
  },
};

export default chatApi;
