export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'idle' | 'streaming' | 'completed' | 'error';

export interface AiCitation {
  title: string;
  sourceType: 'meeting' | 'summary' | 'actionItem' | 'documentation';
  referenceId?: string;
  snippet?: string;
  url?: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status?: MessageStatus;
  createdAt: string;
  model?: string;
  citations?: AiCitation[];
  contextMeetingId?: string;
  contextMeetingTitle?: string;
  tokensUsed?: number;
  error?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  contextMeetingId?: string;
  contextMeetingTitle?: string;
  messageCount: number;
  lastMessagePreview?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  contextMeetingId?: string;
  stream?: boolean;
}

export interface SuggestedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'meeting' | 'tasks' | 'agenda' | 'general';
  badge: string;
}

export interface AiModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'anthropic' | 'local';
  badge: string;
  description: string;
}

export interface TopicNote {
  topic: string;
  notes: string;
  speakers?: string[];
}

export interface AiMeetingNoteData {
  id?: string;
  _id?: string;
  meetingId: string;
  userId?: string;
  title: string;
  date: string;
  durationMinutes?: number;
  agenda: string[];
  topics: TopicNote[];
  decisions: string[];
  nextSteps: string[];
  contentMarkdown: string;
  isDraft: boolean;
  isConfirmedByUser: boolean;
  lastEditedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

