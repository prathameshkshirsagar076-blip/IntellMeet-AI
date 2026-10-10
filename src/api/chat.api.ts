import { apiClient } from './client';
import type {
  GetConversationsResponse,
  CreateConversationResponse,
  GetMessagesResponse,
  GetContactsResponse,
} from '../types/chat';

export const chatApi = {
  /**
   * Fetch conversations of the authenticated user
   */
  async getConversations(params: { page?: number; limit?: number } = {}): Promise<GetConversationsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/chat/conversations?${qs}` : '/chat/conversations';
    return apiClient.get<GetConversationsResponse>(endpoint);
  },

  /**
   * Create or fetch existing 1-on-1 direct conversation with a recipient user ID
   */
  async createConversation(recipientId: string): Promise<CreateConversationResponse> {
    return apiClient.post<CreateConversationResponse>('/chat/conversations', {
      recipientId,
    });
  },

  /**
   * Get messages for a given conversation
   */
  async getMessages(
    conversationId: string,
    params: { cursor?: string; limit?: number } = {}
  ): Promise<GetMessagesResponse> {
    const query = new URLSearchParams();
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs
      ? `/chat/conversations/${conversationId}/messages?${qs}`
      : `/chat/conversations/${conversationId}/messages`;
    return apiClient.get<GetMessagesResponse>(endpoint);
  },

  /**
   * Mark messages as read in a conversation
   */
  async markAsRead(conversationId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `/chat/conversations/${conversationId}/read`,
      {}
    );
  },

  /**
   * List contacts available for chat
   */
  async getContacts(params: { search?: string; page?: number; limit?: number } = {}): Promise<GetContactsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/chat/contacts?${qs}` : '/chat/contacts';
    return apiClient.get<GetContactsResponse>(endpoint);
  },
};

export default chatApi;
