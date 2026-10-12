import { apiClient } from './client';
import type {
  Meeting,
  CreateMeetingPayload,
  JoinMeetingResponse,
  MeetingMessageItem,
  MeetingIceServer
} from '../types/meeting';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ListMeetingsResponse {
  meetings: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const meetingApi = {
  /**
   * 1. POST /meetings
   */
  async createMeeting(payload: CreateMeetingPayload): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post<ApiResponse<Record<string, unknown>>>('/meetings', payload);
  },

  /**
   * 2. GET /meetings
   */
  async getMeetings(params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    date?: string;
  } = {}): Promise<ApiResponse<ListMeetingsResponse>> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.date) query.set('date', params.date);

    const qs = query.toString();
    const endpoint = qs ? `/meetings?${qs}` : '/meetings';
    return apiClient.get<ApiResponse<ListMeetingsResponse>>(endpoint);
  },

  /**
   * 3. GET /meetings/history
   */
  async getMeetingHistory(params: { page?: number; limit?: number; search?: string } = {}): Promise<ApiResponse<ListMeetingsResponse>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);

    const qs = query.toString();
    const endpoint = qs ? `/meetings/history?${qs}` : '/meetings/history';
    return apiClient.get<ApiResponse<ListMeetingsResponse>>(endpoint);
  },

  /**
   * 4. GET /meetings/:meetingId
   */
  async getMeetingById(meetingId: string, options?: RequestInit): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get<ApiResponse<Record<string, unknown>>>(`/meetings/${meetingId}`, options);
  },

  /**
   * 5. PATCH /meetings/:meetingId
   */
  async updateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.patch<ApiResponse<Record<string, unknown>>>(`/meetings/${meetingId}`, updates);
  },

  /**
   * 6. POST /meetings/:meetingId/cancel
   */
  async cancelMeeting(meetingId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post<ApiResponse<Record<string, unknown>>>(`/meetings/${meetingId}/cancel`);
  },

  /**
   * 7. DELETE /meetings/:meetingId
   */
  async deleteMeeting(meetingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/meetings/${meetingId}`);
  },

  /**
   * 8. POST /meetings/:meetingId/join
   */
  async joinMeeting(meetingId: string, passcode?: string): Promise<ApiResponse<JoinMeetingResponse>> {
    return apiClient.post<ApiResponse<JoinMeetingResponse>>(`/meetings/${meetingId}/join`, { passcode });
  },

  /**
   * 9. POST /meetings/:meetingId/leave
   */
  async leaveMeeting(meetingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(`/meetings/${meetingId}/leave`);
  },

  /**
   * 10. POST /meetings/:meetingId/end
   */
  async endMeeting(meetingId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.post<ApiResponse<Record<string, unknown>>>(`/meetings/${meetingId}/end`);
  },

  /**
   * 11. GET /meetings/:meetingId/join-info
   */
  async getJoinInfo(meetingId: string, options?: RequestInit): Promise<ApiResponse<{
    meetingId: string;
    meetingCode: string;
    title: string;
    iceServers: Array<MeetingIceServer>;
  }>> {
    return apiClient.get<ApiResponse<{
      meetingId: string;
      meetingCode: string;
      title: string;
      iceServers: Array<MeetingIceServer>;
    }>>(`/meetings/${meetingId}/join-info`, options);
  },

  /**
   * 12. GET /meetings/:meetingId/participants
   */
  async getParticipants(meetingId: string, options?: RequestInit): Promise<ApiResponse<{ participants: Array<Record<string, unknown>> }>> {
    return apiClient.get<ApiResponse<{ participants: Array<Record<string, unknown>> }>>(`/meetings/${meetingId}/participants`, options);
  },

  /**
   * 13. In-meeting chat: GET /meetings/:meetingId/messages
   */
  async getMessages(
    meetingId: string,
    params: { limit?: number; before?: string } = {},
    options?: RequestInit
  ): Promise<ApiResponse<{ messages: MeetingMessageItem[] }>> {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.before) query.set('before', params.before);

    const qs = query.toString();
    const endpoint = qs ? `/meetings/${meetingId}/messages?${qs}` : `/meetings/${meetingId}/messages`;
    return apiClient.get<ApiResponse<{ messages: MeetingMessageItem[] }>>(endpoint, options);
  },

  /**
   * 14. In-meeting chat: POST /meetings/:meetingId/messages
   */
  async sendMessage(meetingId: string, content: string, clientMessageId?: string): Promise<ApiResponse<MeetingMessageItem>> {
    return apiClient.post<ApiResponse<MeetingMessageItem>>(`/meetings/${meetingId}/messages`, {
      content,
      clientMessageId: clientMessageId || `cm-${Date.now()}`,
      messageType: 'text',
    });
  },

  /**
   * 15. In-meeting chat: PATCH /meetings/:meetingId/messages/:messageId
   */
  async editMessage(meetingId: string, messageId: string, content: string): Promise<ApiResponse<MeetingMessageItem>> {
    return apiClient.patch<ApiResponse<MeetingMessageItem>>(`/meetings/${meetingId}/messages/${messageId}`, { content });
  },

  /**
   * 16. In-meeting chat: DELETE /meetings/:meetingId/messages/:messageId
   */
  async deleteMessage(meetingId: string, messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/meetings/${meetingId}/messages/${messageId}`);
  },

  /**
   * 17. In-meeting chat: GET /meetings/:meetingId/messages/search?q=...
   */
  async searchMessages(meetingId: string, q: string): Promise<ApiResponse<{ messages: MeetingMessageItem[] }>> {
    return apiClient.get<ApiResponse<{ messages: MeetingMessageItem[] }>>(`/meetings/${meetingId}/messages/search?q=${encodeURIComponent(q)}`);
  },

  /**
   * 18. POST /meetings/:meetingId/invite
   */
  async getInvite(meetingId: string): Promise<ApiResponse<{
    meetingId: string;
    meetingCode: string;
    passcode?: string;
    inviteUrl: string;
  }>> {
    return apiClient.post<ApiResponse<{
      meetingId: string;
      meetingCode: string;
      passcode?: string;
      inviteUrl: string;
    }>>(`/meetings/${meetingId}/invite`);
  },

  /**
   * 19. GET /meetings/:meetingId/recordings
   */
  async getRecordings(meetingId: string): Promise<ApiResponse<{ recordings: Array<Record<string, unknown>>; status: string }>> {
    return apiClient.get<ApiResponse<{ recordings: Array<Record<string, unknown>>; status: string }>>(`/meetings/${meetingId}/recordings`);
  },

  /**
   * 20. GET /meetings/:meetingId/status
   */
  async getStatus(meetingId: string): Promise<ApiResponse<{
    id: string;
    meetingCode: string;
    status: string;
    actualStartedAt?: string;
    actualEndedAt?: string;
  }>> {
    return apiClient.get<ApiResponse<{
      id: string;
      meetingCode: string;
      status: string;
      actualStartedAt?: string;
      actualEndedAt?: string;
    }>>(`/meetings/${meetingId}/status`);
  },

  /**
   * 21. POST /meetings/:meetingId/participants/:userId/remove
   */
  async removeParticipant(meetingId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(`/meetings/${meetingId}/participants/${userId}/remove`);
  },

  /**
   * 22. POST /meetings/:meetingId/participants/:userId/mute
   */
  async muteParticipant(meetingId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(`/meetings/${meetingId}/participants/${userId}/mute`);
  }
};

export default meetingApi;
