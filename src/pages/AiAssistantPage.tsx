import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import { aiAssistantApi } from '../api/aiAssistant.api';
import { buildSystemPrompt } from '../services/intellmeetKnowledge';
import type { AiConversation, AiMessage, SuggestedPrompt, AiCitation } from '../types/aiAssistant';
import {
  SparkleIcon,
  SearchIcon,
  SendIcon,
  PlusIcon,
  CheckIcon,
  CalendarIcon,
  ChevronDownIcon,
  BrainIcon,
  ArrowRightIcon,
} from '../components/icons';
import UserAvatar from '../components/common/UserAvatar';
import '../styles/aiAssistant.css';

// Custom icons
const CopyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PanelToggleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const EditPencilIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const StopIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
  </svg>
);

const DownloadIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'p1',
    title: 'Summarize my latest meeting',
    prompt: 'Summarize my latest meeting with key discussion points, decisions made, and follow-ups.',
    category: 'meeting',
    badge: 'Meeting Intelligence',
  },
  {
    id: 'p2',
    title: 'Extract my pending action items',
    prompt: 'What action items and pending deliverables are assigned across my meetings?',
    category: 'tasks',
    badge: 'Task Tracker',
  },
  {
    id: 'p3',
    title: 'Help me prepare for my next meeting',
    prompt: 'Help me prepare an executive agenda and talking points for my next upcoming meeting.',
    category: 'agenda',
    badge: 'Agenda Planner',
  },
  {
    id: 'p4',
    title: 'Explain a topic or help me write something',
    prompt: 'Explain the core security architecture and encryption standards of IntellMeet AI.',
    category: 'general',
    badge: 'Product Knowledge',
  },
];

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { meetings, summaries, showToast } = useMeetings();

  const [conversations, setConversations] = useState<AiConversation[]>(() => {
    return aiAssistantApi.getLocalConversations();
  });
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const local = aiAssistantApi.getLocalConversations();
    return local[0]?.id || '';
  });
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const local = aiAssistantApi.getLocalConversations();
    if (local[0]?.id) {
      return aiAssistantApi.getLocalMessagesForConv(local[0].id);
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 900 : true
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingContextId, setSelectedMeetingContextId] = useState<string>('');
  const [meetingDropdownOpen, setMeetingDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Edit title state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Delete confirm modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Streaming & Abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const meetingDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load of Conversations (Hydrate from remote or fallback)
  useEffect(() => {
    let isMounted = true;
    const loadConvs = async () => {
      const convList = await aiAssistantApi.getConversations();
      if (!isMounted) return;

      if (convList.length > 0) {
        setConversations(convList);
        setActiveConversationId((prev) => prev || convList[0].id);
      }
    };
    loadConvs();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Messages when Active Conversation ID changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const loadMsgs = async () => {
      const msgs = await aiAssistantApi.getConversationMessages(activeConversationId);
      if (!isMounted) return;

      setMessages((prev) => {
        // Do not overwrite if currently streaming for this conversation
        const hasStreaming = prev.some((m) => m.status === 'streaming');
        if (hasStreaming) return prev;
        return msgs;
      });
    };
    loadMsgs();
    return () => {
      isMounted = false;
    };
  }, [activeConversationId]);

  // 3. Sync active conversation's attached meeting context
  useEffect(() => {
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    if (activeConv?.contextMeetingId) {
      setSelectedMeetingContextId(activeConv.contextMeetingId);
    } else {
      setSelectedMeetingContextId('');
    }
  }, [activeConversationId, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Create New Chat
  const handleNewChat = useCallback(async () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    const newConv = await aiAssistantApi.createConversation({
      title: 'New Conversation',
      contextMeetingId: selectedMeetingContextId || undefined,
    });
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([]);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [isStreaming, selectedMeetingContextId]);

  // Keyboard shortcut Ctrl+K / Cmd+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (meetingDropdownRef.current && !meetingDropdownRef.current.contains(e.target as Node)) {
        setMeetingDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  // Rename Conversation
  const handleStartRename = (conv: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (convId: string) => {
    if (editingTitle.trim()) {
      const updated = await aiAssistantApi.updateConversation(convId, { title: editingTitle.trim() });
      if (updated) {
        setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
      }
    }
    setEditingConvId(null);
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string) => {
    await aiAssistantApi.deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));

    if (activeConversationId === convId) {
      const remaining = conversations.filter((c) => c.id !== convId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
    setDeleteConfirmId(null);
    showToast('Conversation deleted', 'info');
  };

  // Send Message Logic
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const rawDomValue = textareaRef.current?.value || '';
      const prompt = (
        textToSend !== undefined ? textToSend : (inputText.trim() ? inputText : rawDomValue)
      ).trim();
      if (!prompt || isStreaming) return;

      let convId = activeConversationId;
      if (!convId) {
        const newConv = await aiAssistantApi.createConversation({ title: prompt.slice(0, 30) });
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
        setActiveConversationId(newConv.id);
        convId = newConv.id;
      }

      // 1. Add user message
      const userMsg: AiMessage = {
        id: `msg_u_${Date.now()}`,
        conversationId: convId,
        role: 'user',
        content: prompt,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      // 2. Prepare assistant placeholder message
      const assistantMsgId = `msg_a_${Date.now()}`;
      const assistantMsg: AiMessage = {
        id: assistantMsgId,
        conversationId: convId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }
      setIsStreaming(true);

      // Save user message
      aiAssistantApi.saveMessage(convId, userMsg);

      // Automatically auto-name conversation if still "New Conversation"
      const currentConv = conversations.find((c) => c.id === convId);
      if (currentConv && currentConv.title === 'New Conversation') {
        const autoTitle = prompt.length > 34 ? `${prompt.slice(0, 32)}...` : prompt;
        aiAssistantApi.updateConversation(convId, { title: autoTitle });
        setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title: autoTitle } : c)));
      }

      // Build grounded system prompt
      const { prompt: systemPrompt, citations } = buildSystemPrompt(
        {
          meetings,
          summaries,
          userName: user?.name,
          userRole: user?.role,
          activeMeetingId: selectedMeetingContextId || undefined,
        },
        prompt
      );

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Stream response
      await aiAssistantApi.streamResponse({
        conversationId: convId,
        userMessage: prompt,
        systemPrompt,
        citations,
        signal: controller.signal,
        onChunk: (chunk: string) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m))
          );
        },
        onComplete: (fullContent: string, resolvedCitations?: AiCitation[]) => {
          setIsStreaming(false);
          const finalMsg: AiMessage = {
            id: assistantMsgId,
            conversationId: convId,
            role: 'assistant',
            content: fullContent,
            status: 'completed',
            createdAt: new Date().toISOString(),
            citations: resolvedCitations,
          };
          setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? finalMsg : m)));
          aiAssistantApi.saveMessage(convId, finalMsg);
        },
        onError: (errMsg: string) => {
          setIsStreaming(false);
          const errorMsg: AiMessage = {
            id: assistantMsgId,
            conversationId: convId,
            role: 'assistant',
            content: `⚠️ ${errMsg}`,
            status: 'error',
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? errorMsg : m)));
          aiAssistantApi.saveMessage(convId, errorMsg);
        },
      });
    },
    [
      inputText,
      isStreaming,
      activeConversationId,
      conversations,
      meetings,
      summaries,
      user,
      selectedMeetingContextId,
    ]
  );

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.status === 'streaming'
            ? {
                ...m,
                content: m.content ? `${m.content}\n\n⚠️ Generation stopped.` : '⚠️ Generation stopped.',
                status: 'error',
              }
            : m
        )
      );
      showToast('Generation stopped', 'info');
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (messages.length < 2 || isStreaming) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setMessages((prev) => prev.filter((_, idx) => idx !== prev.length - 1));
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Copy Message to Clipboard
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Response copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'warning');
    }
  };

  // Export Chat
  const handleExportMarkdown = () => {
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    let md = `# ${currentConv?.title || 'IntellMeet AI Conversation'}\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m) => {
      md += `### ${m.role === 'user' ? '👤 ' + (user?.name || 'User') : '🤖 IntellMeet AI'} (${new Date(m.createdAt).toLocaleTimeString()})\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(currentConv?.title || 'conversation').toLowerCase().replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);
    showToast('Chat exported as Markdown', 'success');
  };

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;

    const groups: { [key: string]: AiConversation[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filtered.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups.Today.push(conv);
      } else if (convTime >= yesterday) {
        groups.Yesterday.push(conv);
      } else if (convTime >= weekAgo) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

  // Selected meeting context details
  const activeMeetingContext = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingContextId);
  }, [meetings, selectedMeetingContextId]);

  return (
    <div className="im-ai-workspace">
      {/* 1. Left Conversation History Panel */}
      <aside className={`im-ai-history-panel ${isHistoryOpen ? '' : 'collapsed'}`}>
        <div className="im-ai-history-header">
          <div className="im-ai-history-header-row">
            <button className="im-ai-new-chat-btn" onClick={handleNewChat} title="Start new conversation (Ctrl+K)">
              <span className="im-ai-new-chat-btn-left">
                <PlusIcon size={16} />
                <span>New Chat</span>
              </span>
              <kbd className="im-ai-kbd-shortcut">Ctrl K</kbd>
            </button>
            <button
              type="button"
              className="im-ai-history-mobile-close"
              onClick={() => setIsHistoryOpen(false)}
              aria-label="Close conversation list"
            >
              ✕
            </button>
          </div>

          <div className="im-ai-search-box">
            <span className="im-ai-search-icon">
              <SearchIcon size={13} />
            </span>
            <input
              type="text"
              className="im-ai-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversation history"
            />
            {searchQuery && (
              <button className="im-ai-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Groups */}
        <div className="im-ai-history-list">
          {Object.entries(groupedConversations).map(([groupTitle, convs]) => {
            if (convs.length === 0) return null;
            return (
              <div key={groupTitle} className="im-ai-history-group">
                <div className="im-ai-group-title">{groupTitle}</div>
                {convs.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className={`im-ai-conv-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (!isEditing) {
                          setActiveConversationId(conv.id);
                          if (window.innerWidth <= 900) {
                            setIsHistoryOpen(false);
                          }
                        }
                      }}
                      title={conv.title}
                    >
                      <div className="im-ai-conv-main">
                        <span className="im-ai-conv-icon">
                          <BrainIcon size={14} />
                        </span>

                        {isEditing ? (
                          <input
                            type="text"
                            className="im-ai-rename-input"
                            value={editingTitle}
                            autoFocus
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveRename(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id);
                              if (e.key === 'Escape') setEditingConvId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="im-ai-conv-title">{conv.title}</span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="im-ai-conv-actions">
                          <button
                            className="im-ai-action-icon-btn"
                            onClick={(e) => handleStartRename(conv, e)}
                            title="Rename chat"
                          >
                            <EditPencilIcon size={12} />
                          </button>
                          <button
                            className="im-ai-action-icon-btn danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(conv.id);
                            }}
                            title="Delete chat"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="im-ai-history-footer">
          <span>IntellMeet AI Assistant</span>
          <span className="im-badge im-badge-upcoming">Grounded</span>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isHistoryOpen && (
        <div
          className="im-ai-backdrop"
          onClick={() => setIsHistoryOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 2. Main Conversation Workspace */}
      <main className="im-ai-chat-main">
        {/* Workspace Top Navigation Bar */}
        <div className="im-ai-workspace-topbar">
          <div className="im-ai-topbar-left">
            <button
              className="im-ai-toggle-history-btn"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title={isHistoryOpen ? 'Collapse chat history' : 'Open chat history'}
            >
              <PanelToggleIcon size={16} />
            </button>

            <div className="im-ai-model-badge">
              <span className="im-ai-model-indicator-dot" />
              <span>IntellMeet-4.0</span>
            </div>

            {/* Linked Meeting Context Pill */}
            {activeMeetingContext && (
              <div className="im-ai-context-chip" title={`Linked to meeting: ${activeMeetingContext.title}`}>
                <span>📅 {activeMeetingContext.title}</span>
                <button
                  className="im-ai-context-chip-remove"
                  onClick={() => setSelectedMeetingContextId('')}
                  title="Remove meeting context"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="im-ai-topbar-right">
            {/* Attach Meeting Context Dropdown */}
            <div style={{ position: 'relative' }} ref={meetingDropdownRef}>
              <button
                className="im-btn im-btn-secondary im-btn-sm"
                onClick={() => setMeetingDropdownOpen(!meetingDropdownOpen)}
                title="Attach specific meeting context for grounded answers"
              >
                <CalendarIcon size={14} />
                <span>Attach Meeting</span>
                <ChevronDownIcon size={13} />
              </button>

              {meetingDropdownOpen && (
                <div
                  className="im-dropdown-menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 6,
                    width: 280,
                    zIndex: 50,
                  }}
                >
                  <div className="im-dropdown-header" style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--im-text-muted)' }}>
                    ATTACH RECENT MEETING
                  </div>
                  {meetings.length === 0 ? (
                    <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--im-text-muted)' }}>
                      No meetings found in account
                    </div>
                  ) : (
                    meetings.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        className="im-dropdown-item"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '8px 12px',
                          width: '100%',
                          textAlign: 'left',
                          background: selectedMeetingContextId === m.id ? 'var(--im-primary-light)' : 'transparent',
                        }}
                        onClick={() => {
                          setSelectedMeetingContextId(m.id);
                          setMeetingDropdownOpen(false);
                          showToast(`Linked meeting: "${m.title}"`, 'success');
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{m.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>
                          {m.date} • {m.status.toUpperCase()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div style={{ position: 'relative' }} ref={exportDropdownRef}>
              <button
                className="im-btn im-btn-secondary im-btn-sm"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={messages.length === 0}
                title="Export conversation"
              >
                <DownloadIcon size={14} />
                <span>Export</span>
              </button>

              {exportDropdownOpen && (
                <div
                  className="im-dropdown-menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 6,
                    width: 180,
                    zIndex: 50,
                  }}
                >
                  <button className="im-dropdown-item" onClick={handleExportMarkdown}>
                    📄 Export as Markdown (.md)
                  </button>
                  <button
                    className="im-dropdown-item"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(messages, null, 2));
                      setExportDropdownOpen(false);
                      showToast('Copied JSON to clipboard', 'info');
                    }}
                  >
                    📦 Copy JSON payload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Messages Stream Scrollable Canvas */}
        <div className="im-ai-messages-scroll">
          <div className="im-ai-messages-container">
            {messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="im-ai-empty-state">
                <div className="im-ai-empty-icon-wrap">
                  <div className="im-ai-empty-icon-pulse" />
                  <SparkleIcon size={32} />
                </div>
                <h2 className="im-ai-empty-title">What can I help you with today?</h2>
                <p className="im-ai-empty-subtitle">
                  Your intelligent enterprise meeting assistant for automated summaries, action item tracking, agenda
                  preparation, and verified IntellMeet guidance.
                </p>

                <div className="im-ai-suggested-grid">
                  {SUGGESTED_PROMPTS.map((item) => (
                    <div
                      key={item.id}
                      className="im-ai-suggested-card"
                      onClick={() => handleSendMessage(item.prompt)}
                    >
                      <span className="im-ai-suggested-badge">{item.badge}</span>
                      <span className="im-ai-suggested-prompt">{item.title}</span>
                      <span className="im-ai-suggested-arrow">
                        <ArrowRightIcon size={14} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Conversation Messages */
              messages.map((message) => {
                const isUser = message.role === 'user';

                return (
                  <div key={message.id} className={`im-ai-message-row ${isUser ? 'user' : 'assistant'}`}>
                    {!isUser && (
                      <div className="im-ai-avatar assistant">
                        <SparkleIcon size={17} />
                      </div>
                    )}

                    <div className="im-ai-message-content-wrap">
                      <div className="im-ai-message-bubble">
                        {isUser ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                        ) : (
                          <div className="im-ai-markdown">
                            <RenderMarkdown content={message.content} />
                            {message.status === 'streaming' && <span className="im-ai-streaming-cursor" />}
                          </div>
                        )}
                      </div>

                      {/* Assistant Citations & Actions */}
                      {!isUser && (
                        <>
                          {message.citations && message.citations.length > 0 && (
                            <div className="im-ai-citations-row">
                              {message.citations.map((c, idx) => (
                                <span key={idx} className="im-ai-citation-pill" title={c.snippet || c.title}>
                                  📎 {c.title}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="im-ai-message-footer">
                            <div className="im-ai-message-actions">
                              <button
                                className="im-ai-btn-text-action"
                                onClick={() => handleCopyMessage(message.content)}
                                title="Copy response text"
                              >
                                <CopyIcon size={12} />
                                <span>Copy</span>
                              </button>

                              {!isStreaming && (
                                <button
                                  className="im-ai-btn-text-action"
                                  onClick={handleRegenerate}
                                  title="Regenerate this response"
                                >
                                  <span>↻ Regenerate</span>
                                </button>
                              )}
                            </div>

                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {isUser && (
                      <UserAvatar
                        avatar={user?.avatar}
                        name={user?.name}
                        className="im-ai-avatar user"
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 4. Anchored Bottom Message Composer */}
        <div className="im-ai-composer-wrapper">
          <div className="im-ai-composer-box">
            {/* Attached Meeting Context Bar */}
            {activeMeetingContext && (
              <div className="im-ai-composer-context-bar">
                <span className="im-ai-context-chip">
                  <span>Linked context: <strong>{activeMeetingContext.title}</strong></span>
                  <button
                    className="im-ai-context-chip-remove"
                    onClick={() => setSelectedMeetingContextId('')}
                    title="Remove context"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}

            <div className="im-ai-composer-input-row">
              <textarea
                ref={textareaRef}
                className="im-ai-composer-textarea"
                placeholder={
                  activeMeetingContext
                    ? `Ask anything about "${activeMeetingContext.title}"...`
                    : 'Ask about your meetings, notes, actions, or IntellMeet...'
                }
                rows={1}
                value={inputText}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="im-ai-composer-controls">
                {isStreaming ? (
                  <button className="im-ai-stop-btn" onClick={handleStopGenerating} title="Stop response generation">
                    <StopIcon size={12} />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    className="im-ai-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    title="Send message (Enter)"
                  >
                    <SendIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="im-ai-composer-footer-hints">
            <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line • Powered by IntellMeet Enterprise AI</span>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true">
          <div className="im-modal" style={{ maxWidth: 420 }}>
            <div className="im-modal-header">
              <h2 className="im-modal-title">Delete Conversation</h2>
              <button className="im-modal-close" onClick={() => setDeleteConfirmId(null)}>
                ✕
              </button>
            </div>
            <div className="im-modal-body">
              <p style={{ margin: 0, color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to delete this conversation? All messages within it will be permanently removed.
              </p>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn im-btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="im-btn im-btn-danger"
                onClick={() => handleDeleteConversation(deleteConfirmId)}
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Lightweight, robust markdown parser with code block highlighting and table support.
 */
const RenderMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Split on code fences (```lang ... ```)
  const segments = useMemo(() => {
    const parts: { type: 'code' | 'text'; lang?: string; code?: string; text?: string }[] = [];
    const codeFenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeFenceRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'code', code: match[2].trimEnd() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts;
  }, [content]);

  return (
    <div>
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          const codeId = `code_${idx}`;
          const isCopied = copiedCodeId === codeId;
          return (
            <div key={idx} className="im-ai-code-block">
              <div className="im-ai-code-header">
                <span>{seg.lang || 'text'}</span>
                <button
                  type="button"
                  className="im-ai-code-copy-btn"
                  onClick={() => handleCopyCode(seg.code || '', codeId)}
                >
                  {isCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                  <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="im-ai-code-content">
                <code>{seg.code}</code>
              </pre>
            </div>
          );
        }

        return <RenderFormattedText key={idx} text={seg.text || ''} />;
      })}
    </div>
  );
};

/**
 * Text renderer supporting Headings, Blockquotes, Tables, and Lists.
 */
const RenderFormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (key: string) => {
    if (tableBuffer.length < 2) {
      tableBuffer.forEach((line, i) => elements.push(<p key={`${key}_${i}`}>{formatInline(line)}</p>));
      tableBuffer = [];
      return;
    }

    const headerLine = tableBuffer[0];
    const dataLines = tableBuffer.slice(2); // Skip markdown separator | --- |

    const headers = headerLine
      .split('|')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    elements.push(
      <table key={key}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{formatInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataLines.map((row, rIdx) => {
            const cells = row
              .split('|')
              .map((c) => c.trim())
              .filter((c) => c.length > 0);
            return (
              <tr key={rIdx}>
                {cells.map((cell, cIdx) => (
                  <td key={cIdx}>{formatInline(cell)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
    tableBuffer = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    } else if (tableBuffer.length > 0) {
      flushTable(`table_${i}`);
    }

    if (!trimmed) {
      elements.push(<div key={`empty_${i}`} style={{ height: 6 }} />);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i}>{formatInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i}>{formatInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={i}>{formatInline(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith('> ')) {
      elements.push(<blockquote key={i}>{formatInline(trimmed.slice(2))}</blockquote>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <ul key={i} style={{ margin: '4px 0 4px 18px' }}>
          <li>{formatInline(trimmed.slice(2))}</li>
        </ul>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <ol key={i} style={{ margin: '4px 0 4px 18px' }}>
          <li>{formatInline(trimmed.replace(/^\d+\.\s/, ''))}</li>
        </ol>
      );
    } else {
      elements.push(<p key={i}>{formatInline(trimmed)}</p>);
    }
  });

  if (tableBuffer.length > 0) {
    flushTable('table_end');
  }

  return <>{elements}</>;
};

function formatInline(str: string): React.ReactNode {
  // Bold **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIdx = 0;
  let match;

  while ((match = boldRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.slice(lastIdx, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < str.length) {
    parts.push(str.slice(lastIdx));
  }

  return parts;
}

export default AiAssistantPage;
