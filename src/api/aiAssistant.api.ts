import { apiClient, ApiError } from './client';
import type {
  AiConversation,
  AiMessage,
  AiCitation,
  AiMeetingNoteData
} from '../types/aiAssistant';
import type { MeetingSummary, ActionItem } from '../types/meeting';

const STORAGE_KEY_CONVERSATIONS = 'intellmeet_ai_conversations_v1';
const STORAGE_KEY_MESSAGES = 'intellmeet_ai_messages_v1';

// In-browser cache for fast rendering and offline resilience
function getLocalConversations(): AiConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConversations(convs: AiConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
  } catch (err) {
    console.error('Failed to save AI conversations locally:', err);
  }
}

function getLocalMessages(): Record<string, AiMessage[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalMessages(msgs: Record<string, AiMessage[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch (err) {
    console.error('Failed to save AI messages locally:', err);
  }
}

export const aiAssistantApi = {
  getLocalConversations,
  getLocalMessages,
  getLocalMessagesForConv(conversationId: string): AiMessage[] {
    const all = getLocalMessages();
    return all[conversationId] || [];
  },

  /**
   * 1. GET /api/v1/ai/conversations
   * Retrieves user conversations from real backend
   */
  async getConversations(): Promise<AiConversation[]> {
    const local = getLocalConversations();
    try {
      const res = await apiClient.get<{ success: boolean; data: AiConversation[] }>(
        '/ai/conversations'
      );
      if (res && res.success && Array.isArray(res.data)) {
        saveLocalConversations(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('[aiAssistantApi] Could not fetch remote conversations, using cache:', err);
    }
    return local;
  },

  /**
   * 2. POST /api/v1/ai/conversations
   * Creates a new conversation in database
   */
  async createConversation(options: {
    title?: string;
    model?: string;
    contextMeetingId?: string;
    contextMeetingTitle?: string;
  } = {}): Promise<AiConversation> {
    try {
      const res = await apiClient.post<{ success: boolean; data: AiConversation }>(
        '/ai/conversations',
        options
      );
      if (res && res.success && res.data) {
        const created = res.data;
        const current = getLocalConversations();
        const merged = [created, ...current.filter((c) => c.id !== created.id)];
        saveLocalConversations(merged);
        return created;
      }
    } catch (err) {
      console.warn('[aiAssistantApi] Failed to create conversation on backend:', err);
    }

    // Local fallback if offline
    const fallbackConv: AiConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: 'usr_local',
      title: options.title || 'New Conversation',
      model: options.model || 'gpt-4o-mini',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      contextMeetingId: options.contextMeetingId,
      contextMeetingTitle: options.contextMeetingTitle,
      messageCount: 0,
      lastMessagePreview: '',
    };
    const current = getLocalConversations();
    saveLocalConversations([fallbackConv, ...current]);
    return fallbackConv;
  },

  /**
   * 3. GET /api/v1/ai/conversations/:id/messages
   */
  async getConversationMessages(conversationId: string): Promise<AiMessage[]> {
    const allMsgs = getLocalMessages();
    try {
      const res = await apiClient.get<{ success: boolean; data: AiMessage[] }>(
        `/ai/conversations/${conversationId}/messages`
      );
      if (res && res.success && Array.isArray(res.data)) {
        allMsgs[conversationId] = res.data;
        saveLocalMessages(allMsgs);
        return res.data;
      }
    } catch {
      // Return local cache
    }
    return allMsgs[conversationId] || [];
  },

  /**
   * 4. PATCH /api/v1/ai/conversations/:id
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<Pick<AiConversation, 'title' | 'isPinned' | 'contextMeetingId' | 'contextMeetingTitle'>>
  ): Promise<AiConversation | null> {
    const all = getLocalConversations();
    const idx = all.findIndex((c) => c.id === conversationId);
    let updatedConv: AiConversation | null = null;

    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedConv = all[idx];
      saveLocalConversations(all);
    }

    try {
      const res = await apiClient.patch<{ success: boolean; data: AiConversation }>(
        `/ai/conversations/${conversationId}`,
        updates
      );
      if (res && res.success && res.data) {
        updatedConv = res.data;
        const current = getLocalConversations();
        saveLocalConversations(current.map((c) => (c.id === conversationId ? res.data : c)));
      }
    } catch {
      // Handled via local cache
    }

    return updatedConv;
  },

  /**
   * 5. DELETE /api/v1/ai/conversations/:id
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const all = getLocalConversations().filter((c) => c.id !== conversationId);
    saveLocalConversations(all);

    const allMsgs = getLocalMessages();
    delete allMsgs[conversationId];
    saveLocalMessages(allMsgs);

    try {
      await apiClient.delete(`/ai/conversations/${conversationId}`);
    } catch {
      // Handled
    }

    return true;
  },

  /**
   * 6. Save or append a message locally
   */
  saveMessage(conversationId: string, message: AiMessage): void {
    const allMsgs = getLocalMessages();
    const convMsgs = allMsgs[conversationId] || [];
    const existingIdx = convMsgs.findIndex((m) => m.id === message.id);

    if (existingIdx !== -1) {
      convMsgs[existingIdx] = message;
    } else {
      convMsgs.push(message);
    }

    allMsgs[conversationId] = convMsgs;
    saveLocalMessages(allMsgs);

    const allConvs = getLocalConversations();
    const convIdx = allConvs.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      const updated = {
        ...allConvs[convIdx],
        messageCount: convMsgs.length,
        lastMessagePreview: message.content.slice(0, 80),
        updatedAt: new Date().toISOString(),
      };
      const reordered = [updated, ...allConvs.filter((c) => c.id !== conversationId)];
      saveLocalConversations(reordered);
    }
  },

  /**
   * 7. Real AI Chat Completion via backend POST /api/v1/ai/chat
   * Transmits response progressively to onChunk callback for natural typing UX.
   */
  async streamResponse(params: {
    conversationId: string;
    userMessage: string;
    systemPrompt?: string;
    contextMeetingId?: string;
    model?: string;
    provider?: 'gemini' | 'openai';
    citations?: AiCitation[];
    signal?: AbortSignal;
    onChunk: (chunkText: string) => void;
    onComplete: (fullText: string, citations?: AiCitation[]) => void;
    onError: (errorMsg: string) => void;
  }): Promise<void> {
    const {
      conversationId,
      userMessage,
      systemPrompt,
      contextMeetingId,
      model,
      provider,
      citations: defaultCitations,
      signal,
      onChunk,
      onComplete,
      onError,
    } = params;

    try {
      if (signal?.aborted) {
        onError('Generation stopped by user.');
        return;
      }

      // Real backend API call to AI co-pilot
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          answer: string;
          citations?: AiCitation[];
          userMessage: AiMessage;
          assistantMessage: AiMessage;
        };
      }>(
        '/ai/chat',
        {
          message: userMessage,
          conversationId: conversationId.startsWith('conv_') ? undefined : conversationId,
          contextMeetingId: contextMeetingId || undefined,
          systemPrompt,
          model,
          provider,
        },
        { signal }
      );

      if (!res?.data?.answer) {
        throw new Error(res?.message || 'Empty response received from AI service.');
      }

      const realAnswer = res.data.answer;
      const resolvedCitations = res.data.citations && res.data.citations.length > 0
        ? res.data.citations
        : defaultCitations;

      // Render the real answer with a smooth token typing cadence
      const chunks = splitIntoNaturalChunks(realAnswer);
      let accumulated = '';

      for (let i = 0; i < chunks.length; i++) {
        if (signal?.aborted) {
          onError('Generation stopped by user.');
          return;
        }

        const chunk = chunks[i];
        accumulated += chunk;
        onChunk(chunk);

        // Variable delay based on punctuation and line breaks
        const delay = chunk.includes('\n') ? 22 : chunk.length > 4 ? 14 : 8;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      onComplete(accumulated, resolvedCitations);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError' || signal?.aborted) {
        onError('Generation stopped by user.');
        return;
      }

      if (err instanceof ApiError) {
        if (err.status === 501 || err.code === 'OPENAI_NOT_CONFIGURED') {
          onError('OpenAI API key is not configured. Please set OPENAI_API_KEY in backend .env or select Google Gemini.');
          return;
        }
        if (err.status === 501 || err.code === 'GEMINI_NOT_CONFIGURED') {
          onError('Google Gemini API key is not configured. Please set GEMINI_API_KEY in backend .env or select OpenAI.');
          return;
        }
        if (err.status === 429 || err.code === 'GEMINI_RATE_LIMIT' || err.code === 'OPENAI_RATE_LIMIT') {
          onError('AI rate limit or API quota exceeded. Please wait a moment before trying again.');
          return;
        }
        if (err.status === 502 || err.code === 'GEMINI_AUTH_FAILED' || err.code === 'OPENAI_AUTH_FAILED') {
          onError('AI provider authentication failed. Please verify your backend API credentials.');
          return;
        }
        if (err.status === 504 || err.code === 'GEMINI_TIMEOUT' || err.code === 'OPENAI_TIMEOUT') {
          onError('AI request timed out. Please check your connection and retry.');
          return;
        }
        onError(err.message || 'AI request failed.');
        return;
      }

      onError((err as Error)?.message || 'Failed to generate response. Please try again.');
    }
  },

  /**
   * 8. AI Meeting Summaries API
   */
  async getMeetingSummary(meetingId: string): Promise<MeetingSummary | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: MeetingSummary }>(
        `/ai/meetings/${meetingId}/summary`
      );
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      if ((err as ApiError)?.status !== 404) {
        console.warn(`[aiAssistantApi] Could not fetch summary for meeting ${meetingId}:`, err);
      }
    }
    return null;
  },

  async generateMeetingSummary(
    meetingId: string,
    options: { forceRegenerate?: boolean; model?: string; provider?: 'gemini' | 'openai' } | boolean = false
  ): Promise<MeetingSummary> {
    const payload = typeof options === 'boolean'
      ? { forceRegenerate: options }
      : { forceRegenerate: Boolean(options.forceRegenerate), model: options.model, provider: options.provider };

    const res = await apiClient.post<{ success: boolean; message?: string; data: MeetingSummary }>(
      `/ai/meetings/${meetingId}/summary`,
      payload
    );
    if (!res || !res.data) {
      throw new Error(res?.message || 'Failed to generate meeting summary');
    }
    return res.data;
  },

  /**
   * 9. AI Meeting Notes API
   */
  async getMeetingNotes(meetingId: string): Promise<AiMeetingNoteData | null> {
    try {
      const res = await apiClient.get<{ success: boolean; message?: string; data: AiMeetingNoteData }>(
        `/ai/meetings/${meetingId}/notes`
      );
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      if ((err as ApiError)?.status !== 404) {
        console.warn(`[aiAssistantApi] Could not fetch notes for meeting ${meetingId}:`, err);
      }
    }
    return null;
  },

  async generateMeetingNotes(
    meetingId: string,
    options: { forceRegenerate?: boolean; model?: string; provider?: 'gemini' | 'openai' } | boolean = false
  ): Promise<AiMeetingNoteData> {
    const payload = typeof options === 'boolean'
      ? { forceRegenerate: options }
      : { forceRegenerate: Boolean(options.forceRegenerate), model: options.model, provider: options.provider };

    const res = await apiClient.post<{ success: boolean; message?: string; data: AiMeetingNoteData }>(
      `/ai/meetings/${meetingId}/notes`,
      payload
    );
    if (!res || !res.data) {
      throw new Error(res?.message || 'Failed to generate meeting notes');
    }
    return res.data;
  },

  async saveMeetingNotes(meetingId: string, updates: Partial<AiMeetingNoteData>): Promise<AiMeetingNoteData> {
    const res = await apiClient.put<{ success: boolean; message?: string; data: AiMeetingNoteData }>(
      `/ai/meetings/${meetingId}/notes`,
      updates
    );
    if (!res || !res.data) {
      throw new Error(res?.message || 'Failed to save meeting notes');
    }
    return res.data;
  },

  /**
   * 10. AI Action Items API
   */
  async getMeetingActionItems(meetingId: string): Promise<ActionItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; message?: string; data: ActionItem[] }>(
        `/ai/meetings/${meetingId}/action-items`
      );
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn(`[aiAssistantApi] Could not fetch action items for meeting ${meetingId}:`, err);
    }
    return [];
  },

  async generateMeetingActionItems(
    meetingId: string,
    options: { forceRegenerate?: boolean; model?: string; provider?: 'gemini' | 'openai' } | boolean = false
  ): Promise<ActionItem[]> {
    const payload = typeof options === 'boolean'
      ? { forceRegenerate: options }
      : { forceRegenerate: Boolean(options.forceRegenerate), model: options.model, provider: options.provider };

    const res = await apiClient.post<{ success: boolean; message?: string; data: ActionItem[] }>(
      `/ai/meetings/${meetingId}/action-items`,
      payload
    );
    if (!res || !res.data) {
      throw new Error(res?.message || 'Failed to extract action items');
    }
    return res.data;
  },

  async toggleActionItem(meetingId: string, itemId: string, completed?: boolean): Promise<ActionItem> {
    const res = await apiClient.patch<{ success: boolean; message?: string; data: ActionItem }>(
      `/ai/meetings/${meetingId}/action-items/${itemId}`,
      { completed }
    );
    if (!res || !res.data) {
      throw new Error(res?.message || 'Failed to update action item status');
    }
    return res.data;
  },

  async deleteActionItem(meetingId: string, itemId: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(
      `/ai/meetings/${meetingId}/action-items/${itemId}`
    );
    return Boolean(res?.success);
  },
};

function splitIntoNaturalChunks(text: string): string[] {
  const regex = /\S+|\s+/g;
  const matches = text.match(regex);
  return matches || [text];
}
