import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
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

export const AiNotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const summaryIdParam = searchParams.get('id');
  const { summaries, toggleActionItem, showToast } = useMeetings();

  const [selectedSummaryId, setSelectedSummaryId] = useState<string>(
    summaryIdParam || (summaries[0]?.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (summaryIdParam && summaries.some((s) => s.id === summaryIdParam)) {
      setSelectedSummaryId(summaryIdParam);
    }
  }, [summaryIdParam, summaries]);

  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return summaries;
    const q = searchQuery.toLowerCase();
    return summaries.filter(
      (s) =>
        s.meetingTitle.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q) ||
        s.keyPoints.some((kp) => kp.toLowerCase().includes(q)) ||
        s.actionItems.some((ai) => ai.task.toLowerCase().includes(q))
    );
  }, [summaries, searchQuery]);

  // Active selected summary
  const currentSummary = useMemo(() => {
    return (
      filteredSummaries.find((s) => s.id === selectedSummaryId) ||
      filteredSummaries[0] ||
      summaries[0]
    );
  }, [filteredSummaries, selectedSummaryId, summaries]);

  const handleCopySummary = async () => {
    if (!currentSummary) return;
    const textToCopy = `### ${currentSummary.meetingTitle} (${currentSummary.date})\n\n**Overview:**\n${currentSummary.overview}\n\n**Key Discussion Points:**\n${currentSummary.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n**Decisions Made:**\n${currentSummary.decisions.map((d) => `- ${d}`).join('\n')}\n\n**Action Items:**\n${currentSummary.actionItems.map((a) => `- [${a.completed ? 'x' : ' '}] ${a.task} (@${a.assignee}) Due: ${a.dueDate || 'N/A'}`).join('\n')}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
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
            Autonomous post-meeting transcripts, decisions log, and extractable action item trackers.
          </p>
        </div>

        <div className="im-page-actions">
          <button className="im-btn im-btn-secondary" onClick={handleCopySummary} disabled={!currentSummary}>
            <CopyIcon size={15} />
            Copy Summary Markdown
          </button>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="im-notes-layout">
        {/* Left Column: Summary Selector & Search */}
        <div className="im-notes-sidebar">
          <div style={{ position: 'relative', width: '100%', marginBottom: 6 }}>
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
              placeholder="Search summaries & tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search summaries"
            />
          </div>

          <div className="im-notes-list-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredSummaries.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--im-text-muted)',
                  fontSize: '0.8125rem',
                }}
              >
                No summaries found.
              </div>
            ) : (
              filteredSummaries.map((s) => (
                <div
                  key={s.id}
                  className={`im-note-card-item ${currentSummary?.id === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedSummaryId(s.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>
                      {s.date}
                    </span>
                    <span className="im-badge im-badge-ai" style={{ fontSize: '0.65rem' }}>
                      {s.sentiment || 'AI Summary'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {s.meetingTitle}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{s.actionItems.length} tasks</span>
                    <span>•</span>
                    <span>{s.decisions.length} decisions</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Full Detail View */}
        <div>
          {currentSummary ? (
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="im-badge im-badge-ai">
                      <SparkleIcon size={12} />
                      AI Companion 2.0
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                      {currentSummary.date} • {currentSummary.durationMinutes} minutes
                    </span>
                  </div>
                  <h2 className="im-card-title" style={{ fontSize: '1.25rem' }}>
                    {currentSummary.meetingTitle}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to={`/meetings/${currentSummary.meetingId}`}
                    className="im-btn im-btn-secondary im-btn-sm"
                  >
                    Meeting Details
                    <ArrowRightIcon size={13} />
                  </Link>
                </div>
              </div>

              <div className="im-card-body">
                {/* Executive Summary */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 8 }}>
                    Executive Overview
                  </h3>
                  <p style={{ lineHeight: 1.6, color: 'var(--im-text-secondary)', margin: 0, fontSize: '0.9375rem' }}>
                    {currentSummary.overview}
                  </p>
                </div>

                {/* Key Discussion Points */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 10 }}>
                    Key Discussion Points
                  </h3>
                  <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--im-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {currentSummary.keyPoints.map((point, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decisions Log */}
                {currentSummary.decisions.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', marginBottom: 10 }}>
                      Decisions Made ({currentSummary.decisions.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {currentSummary.decisions.map((dec, idx) => (
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

                {/* Interactive Action Items */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--im-text-muted)', margin: 0 }}>
                      Action Items ({currentSummary.actionItems.length})
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                      Click checkbox to mark done
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {currentSummary.actionItems.map((item) => (
                      <label key={item.id} className="im-action-item-check" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          className="im-checkbox"
                          checked={item.completed}
                          onChange={() => toggleActionItem(currentSummary.id, item.id)}
                        />
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              color: item.completed ? 'var(--im-text-muted)' : 'var(--im-text-primary)',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              fontWeight: 500,
                            }}
                          >
                            {item.task}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                            Assigned to: <strong>{item.assignee}</strong>
                            {item.dueDate && ` • Due ${item.dueDate}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="im-card-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                  Generated automatically by IntellMeet AI Companion • All transcripts stored securely
                </span>
                <button className="im-btn im-btn-secondary im-btn-sm" onClick={handleCopySummary}>
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
                <h2 className="im-empty-state-title">No AI summary selected</h2>
                <p className="im-empty-state-desc">
                  Select a meeting summary from the left pane to view key insights and action items.
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
