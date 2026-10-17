import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import { aiAssistantApi } from '../api/aiAssistant.api';
import type { AiMeetingNoteData } from '../types/aiAssistant';
import type { MeetingSummary, ActionItem, Meeting } from '../types/meeting';
import {
  SparkleIcon,
  SearchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/icons';

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

const RefreshIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className }) => (
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
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const AiNotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const meetingIdParam = searchParams.get('id') || searchParams.get('meetingId');
  const { meetings, showToast } = useMeetings();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(() => {
    return meetingIdParam || meetings[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'actions'>('summary');

  // Backend state for selected meeting
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [notes, setNotes] = useState<AiMeetingNoteData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable notes state
  const [editableNotesMarkdown, setEditableNotesMarkdown] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Auto-select first meeting if none selected
  useEffect(() => {
    if (!selectedMeetingId && meetings.length > 0) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  // Sync with URL query parameter
  useEffect(() => {
    if (meetingIdParam && meetings.some((m) => m.id === meetingIdParam)) {
      setSelectedMeetingId(meetingIdParam);
    }
  }, [meetingIdParam, meetings]);

  // Load meeting AI data from real backend when selectedMeetingId changes
  const loadMeetingAiData = useCallback(async (meetingId: string) => {
    if (!meetingId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [summaryRes, notesRes, actionsRes] = await Promise.allSettled([
        aiAssistantApi.getMeetingSummary(meetingId),
        aiAssistantApi.getMeetingNotes(meetingId),
        aiAssistantApi.getMeetingActionItems(meetingId),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value);
      } else {
        setSummary(null);
      }

      if (notesRes.status === 'fulfilled' && notesRes.value) {
        setNotes(notesRes.value);
        setEditableNotesMarkdown(notesRes.value.contentMarkdown || '');
      } else {
        setNotes(null);
        setEditableNotesMarkdown('');
      }

      if (actionsRes.status === 'fulfilled' && Array.isArray(actionsRes.value)) {
        setActionItems(actionsRes.value);
      } else {
        setActionItems([]);
      }
    } catch (err: unknown) {
      console.warn('[AiNotesPage] Failed to fetch AI records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMeetingId) {
      loadMeetingAiData(selectedMeetingId);
    }
  }, [selectedMeetingId, loadMeetingAiData]);

  // Selected meeting object
  const selectedMeeting: Meeting | undefined = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  }, [meetings, selectedMeetingId]);

  // Filtered meetings list for sidebar search
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const q = searchQuery.toLowerCase();
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.meetingCode.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }, [meetings, searchQuery]);

  // Generate / Regenerate AI Summary, Notes, and Action Items
  const handleGenerateIntelligence = async (forceRegenerate = false) => {
    if (!selectedMeetingId) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Generate Summary
      const summaryResult = await aiAssistantApi.generateMeetingSummary(selectedMeetingId, forceRegenerate);
      setSummary(summaryResult);

      // 2. Generate Structured Notes
      try {
        const notesResult = await aiAssistantApi.generateMeetingNotes(selectedMeetingId, forceRegenerate);
        setNotes(notesResult);
        setEditableNotesMarkdown(notesResult.contentMarkdown || '');
      } catch (notesErr) {
        console.warn('[AiNotesPage] Notes generation warning:', notesErr);
      }

      // 3. Generate Action Items
      try {
        const actionsResult = await aiAssistantApi.generateMeetingActionItems(selectedMeetingId, forceRegenerate);
        setActionItems(actionsResult);
      } catch (actErr) {
        console.warn('[AiNotesPage] Action items warning:', actErr);
      }

      showToast('AI Intelligence generated successfully from meeting transcripts!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI intelligence';
      setErrorMessage(msg);
      showToast(msg, 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Action Item completion on real backend
  const handleToggleActionItem = async (itemId: string, currentCompleted: boolean) => {
    if (!selectedMeetingId) return;

    // Optimistic UI update
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !currentCompleted } : item
      )
    );

    try {
      const updated = await aiAssistantApi.toggleActionItem(selectedMeetingId, itemId, !currentCompleted);
      setActionItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated : item))
      );
      showToast(`Task marked as ${!currentCompleted ? 'completed' : 'pending'}`, 'info');
    } catch (err: unknown) {
      // Revert optimistic update
      setActionItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, completed: currentCompleted } : item
        )
      );
      const msg = err instanceof Error ? err.message : 'Failed to update action item';
      showToast(msg, 'error');
    }
  };

  // Save / Confirm Notes
  const handleSaveNotes = async (confirm = false) => {
    if (!selectedMeetingId) return;
    setIsSavingNotes(true);

    try {
      const saved = await aiAssistantApi.saveMeetingNotes(selectedMeetingId, {
        contentMarkdown: editableNotesMarkdown,
        isConfirmedByUser: confirm ? true : notes?.isConfirmedByUser,
      });
      setNotes(saved);
      showToast(confirm ? 'Meeting notes confirmed and finalized!' : 'Draft notes saved successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save notes';
      showToast(msg, 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = async () => {
    if (!summary) return;
    const textToCopy = `### ${summary.meetingTitle} (${summary.date})\n\n**Overview:**\n${summary.overview}\n\n**Key Discussion Points:**\n${summary.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n**Decisions Made:**\n${summary.decisions.map((d) => `- ${d}`).join('\n')}\n\n**Action Items:**\n${actionItems.map((a) => `- [${a.completed ? 'x' : ' '}] ${a.task} (@${a.assignee}) Due: ${a.dueDate || 'N/A'}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('AI meeting summary copied to clipboard as Markdown!', 'success');
    } catch {
      showToast('Failed to copy to clipboard', 'warning');
    }
  };

  return (
    <div>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">AI Notes & Executive Summaries</h1>
          <p className="im-page-subtitle">
            Autonomous post-meeting transcripts, decisions log, structured notes, and extractable action item trackers.
          </p>
        </div>

        <div className="im-page-actions" style={{ display: 'flex', gap: 8 }}>
          <button
            className="im-btn im-btn-secondary"
            onClick={() => handleGenerateIntelligence(true)}
            disabled={!selectedMeeting || isGenerating}
            title="Re-run AI synthesis using the latest meeting transcript"
          >
            <RefreshIcon size={14} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate AI'}</span>
          </button>

          <button
            className="im-btn im-btn-secondary"
            onClick={handleCopySummary}
            disabled={!summary}
            title="Copy summary as Markdown"
          >
            <CopyIcon size={15} />
            <span>Copy Markdown</span>
          </button>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="im-notes-layout">
        {/* Left Column: Meeting Selector & Search */}
        <div className="im-notes-sidebar">
          <div style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--im-text-muted)',
                display: 'flex',
              }}
            >
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              className="im-input"
              style={{ paddingLeft: 32, height: 36, fontSize: '0.8125rem' }}
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search meetings"
            />
          </div>

          <div className="im-notes-list-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredMeetings.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--im-text-muted)',
                  fontSize: '0.8125rem',
                }}
              >
                No meetings found.
              </div>
            ) : (
              filteredMeetings.map((m) => (
                <div
                  key={m.id}
                  className={`im-note-card-item ${selectedMeeting?.id === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedMeetingId(m.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>
                      {m.date}
                    </span>
                    <span className="im-badge im-badge-upcoming" style={{ fontSize: '0.65rem' }}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {m.title}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Code: {m.meetingCode}</span>
                    <span>•</span>
                    <span>{m.durationMinutes}m</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Full Detail View */}
        <div>
          {selectedMeeting ? (
            <div className="im-card">
              {/* Meeting Header */}
              <div className="im-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="im-badge im-badge-ai">
                      <SparkleIcon size={12} />
                      AI Companion 2.0
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                      {selectedMeeting.date} • {selectedMeeting.durationMinutes} minutes • Host: {selectedMeeting.organizer.name}
                    </span>
                  </div>
                  <h2 className="im-card-title" style={{ fontSize: '1.25rem' }}>
                    {selectedMeeting.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to={`/meeting/${selectedMeeting.meetingCode}`}
                    className="im-btn im-btn-primary im-btn-sm"
                  >
                    Join Room
                  </Link>
                  <Link
                    to={`/meetings/${selectedMeeting.id}`}
                    className="im-btn im-btn-secondary im-btn-sm"
                  >
                    Details
                    <ArrowRightIcon size={13} />
                  </Link>
                </div>
              </div>

              {/* Sub-navigation Tabs: Executive Summary / Structured Notes / Action Items */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--im-border)', padding: '0 20px', gap: 16 }}>
                <button
                  type="button"
                  className={`im-tab-item ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                  style={{
                    padding: '12px 4px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: activeTab === 'summary' ? 'var(--im-primary)' : 'var(--im-text-secondary)',
                    borderBottom: activeTab === 'summary' ? '2px solid var(--im-primary)' : '2px solid transparent',
                  }}
                >
                  📋 Executive Summary
                </button>
                <button
                  type="button"
                  className={`im-tab-item ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                  style={{
                    padding: '12px 4px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: activeTab === 'notes' ? 'var(--im-primary)' : 'var(--im-text-secondary)',
                    borderBottom: activeTab === 'notes' ? '2px solid var(--im-primary)' : '2px solid transparent',
                  }}
                >
                  📝 Structured Notes {notes && (notes.isConfirmedByUser ? '✅' : '✏️')}
                </button>
                <button
                  type="button"
                  className={`im-tab-item ${activeTab === 'actions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('actions')}
                  style={{
                    padding: '12px 4px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: activeTab === 'actions' ? 'var(--im-primary)' : 'var(--im-text-secondary)',
                    borderBottom: activeTab === 'actions' ? '2px solid var(--im-primary)' : '2px solid transparent',
                  }}
                >
                  ✅ Action Items ({actionItems.length})
                </button>
              </div>

              <div className="im-card-body">
                {/* Error Banner if Transcript or Configuration Issue */}
                {errorMessage && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--im-radius-md)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--im-danger, #ef4444)',
                      color: 'var(--im-danger, #ef4444)',
                      fontSize: '0.85rem',
                      marginBottom: 16,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Notice:</strong> {errorMessage}
                  </div>
                )}

                {isLoading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--im-text-muted)' }}>
                    Loading AI meeting records...
                  </div>
                ) : !summary && !notes && actionItems.length === 0 ? (
                  /* Empty state when no AI data has been generated yet */
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 12, color: 'var(--im-primary)' }}>
                      <SparkleIcon size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: 8 }}>
                      No AI Summary or Notes Generated Yet
                    </h3>
                    <p style={{ color: 'var(--im-text-muted)', fontSize: '0.875rem', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
                      IntellMeet AI analyzes recorded meeting chat discussions and transcripts to generate executive summaries, key decisions, structured notes, and extractable tasks.
                    </p>
                    <button
                      className="im-btn im-btn-primary"
                      onClick={() => handleGenerateIntelligence(false)}
                      disabled={isGenerating}
                    >
                      <SparkleIcon size={16} />
                      <span>{isGenerating ? 'Synthesizing with OpenAI...' : 'Generate AI Summary & Notes'}</span>
                    </button>
                  </div>
                ) : activeTab === 'summary' ? (
                  /* Tab 1: Executive Summary */
                  summary ? (
                    <div>
                      {/* Executive Summary */}
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 8 }}>
                          Executive Overview
                        </h3>
                        <p style={{ lineHeight: 1.6, color: 'var(--im-text-secondary)', margin: 0, fontSize: '0.9375rem' }}>
                          {summary.overview}
                        </p>
                      </div>

                      {/* Key Discussion Points */}
                      {summary.keyPoints && summary.keyPoints.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 10 }}>
                            Key Discussion Points
                          </h3>
                          <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--im-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {summary.keyPoints.map((point, idx) => (
                              <li key={idx} style={{ marginBottom: 6 }}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Decisions Log */}
                      {summary.decisions && summary.decisions.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 10 }}>
                            Decisions Made ({summary.decisions.length})
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {summary.decisions.map((dec, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 'var(--im-radius-md)',
                                  backgroundColor: 'var(--im-success-light)',
                                  color: 'var(--im-success-text)',
                                  fontSize: '0.8125rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                }}
                              >
                                <CheckCircleIcon size={16} />
                                <span>{dec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Takeaways */}
                      {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 8 }}>
                            Key Takeaways
                          </h3>
                          <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--im-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {summary.keyTakeaways.map((takeaway, idx) => (
                              <li key={idx} style={{ marginBottom: 6 }}>
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Outstanding Issues & Follow-up Recommendations */}
                      {summary.followUpRecommendations && summary.followUpRecommendations.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 8 }}>
                            Follow-Up Recommendations
                          </h3>
                          <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--im-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {summary.followUpRecommendations.map((rec, idx) => (
                              <li key={idx} style={{ marginBottom: 6 }}>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--im-text-muted)' }}>
                      No summary available yet. Click &quot;Regenerate AI&quot; above to generate one.
                    </div>
                  )
                ) : activeTab === 'notes' ? (
                  /* Tab 2: Structured Meeting Notes (Editable / Reviewable) */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`im-badge ${notes?.isConfirmedByUser ? 'im-badge-success' : 'im-badge-upcoming'}`}>
                          {notes?.isConfirmedByUser ? 'Confirmed & Finalized' : 'Draft Notes'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                          You can review and edit these notes before finalizing.
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="im-btn im-btn-secondary im-btn-sm"
                          onClick={() => handleSaveNotes(false)}
                          disabled={isSavingNotes}
                        >
                          Save Draft
                        </button>
                        <button
                          type="button"
                          className="im-btn im-btn-primary im-btn-sm"
                          onClick={() => handleSaveNotes(true)}
                          disabled={isSavingNotes}
                        >
                          Confirm & Finalize
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="im-input"
                      style={{
                        width: '100%',
                        minHeight: 320,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        padding: 16,
                        borderRadius: 'var(--im-radius-md)',
                      }}
                      value={editableNotesMarkdown}
                      onChange={(e) => setEditableNotesMarkdown(e.target.value)}
                      placeholder="# Meeting Notes..."
                    />
                  </div>
                ) : (
                  /* Tab 3: Interactive Action Items */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', margin: 0 }}>
                        Extracted Action Items ({actionItems.length})
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                        Click checkbox to mark done
                      </span>
                    </div>

                    {actionItems.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--im-text-muted)', fontSize: '0.85rem' }}>
                        No action items extracted for this meeting yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {actionItems.map((item) => (
                          <label
                            key={item.id}
                            className="im-action-item-check"
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              padding: '10px 14px',
                              borderRadius: 'var(--im-radius-md)',
                              border: '1px solid var(--im-border)',
                              background: item.completed ? 'var(--im-bg-secondary)' : 'var(--im-card-bg)',
                            }}
                          >
                            <input
                              type="checkbox"
                              className="im-checkbox"
                              style={{ marginTop: 3 }}
                              checked={item.completed}
                              onChange={() => handleToggleActionItem(item.id, item.completed)}
                            />
                            <div style={{ flex: 1 }}>
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  color: item.completed ? 'var(--im-text-muted)' : 'var(--im-text-primary)',
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                  fontWeight: 600,
                                }}
                              >
                                {item.task}
                              </span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 4, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span>Assigned to: <strong>{item.assignee}</strong></span>
                                {item.dueDate && <span>• Due {item.dueDate}</span>}
                                {item.priority && (
                                  <span
                                    className={`im-badge ${item.priority === 'high' ? 'im-badge-danger' : item.priority === 'low' ? 'im-badge-secondary' : 'im-badge-upcoming'}`}
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    {item.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="im-card-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                  Generated automatically by IntellMeet AI Companion • All transcripts stored securely
                </span>
                <button className="im-btn im-btn-secondary im-btn-sm" onClick={handleCopySummary} disabled={!summary}>
                  <CopyIcon size={13} />
                  Copy Markdown
                </button>
              </div>
            </div>
          ) : (
            <div className="im-card">
              <div className="im-empty-state">
                <div className="im-empty-state-icon">
                  <SparkleIcon size={26} />
                </div>
                <h2 className="im-empty-state-title">No meeting selected</h2>
                <p className="im-empty-state-desc">
                  Select a meeting from the left pane to view its AI insights, notes, and action items.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiNotesPage;
