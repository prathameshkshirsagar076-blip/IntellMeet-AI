import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import {
  CalendarIcon,
  UsersIcon,
  VideoIcon,
  SparkleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
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

export const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { getMeetingById, getSummaryByMeetingId, copyMeetingLink, cancelMeeting } = useMeetings();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const meeting = meetingId ? getMeetingById(meetingId) : undefined;
  const summary = meeting?.summaryId || meetingId ? getSummaryByMeetingId(meetingId || '') || (meeting?.summaryId ? getSummaryByMeetingId(meeting.id) : undefined) : undefined;

  if (!meeting) {
    return (
      <div className="im-card" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
        <div className="im-card-body" style={{ padding: '48px 24px' }}>
          <div className="im-empty-state-icon" style={{ margin: '0 auto 16px' }}>
            <CalendarIcon size={28} />
          </div>
          <h1 className="im-empty-state-title">Meeting Not Found</h1>
          <p className="im-empty-state-desc">
            The meeting reference "{meetingId}" does not exist in your schedule or may have been removed.
          </p>
          <button className="im-btn im-btn-primary" onClick={() => navigate('/meetings')}>
            Return to All Meetings
          </button>
        </div>
      </div>
    );
  }

  const handleCancelMeeting = () => {
    cancelMeeting(meeting.id);
    setCancelDialogOpen(false);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/meetings"
          className="im-btn im-btn-ghost im-btn-sm"
          style={{ paddingLeft: 0, gap: 6, color: 'var(--im-text-muted)' }}
        >
          <ArrowLeftIcon size={14} />
          Back to Meetings
        </Link>
      </div>

      {/* Header Banner */}
      <div className="im-card" style={{ marginBottom: 24 }}>
        <div className="im-card-body" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  className={`im-badge ${
                    meeting.status === 'live'
                      ? 'im-badge-live'
                      : meeting.status === 'upcoming'
                      ? 'im-badge-upcoming'
                      : meeting.status === 'completed'
                      ? 'im-badge-completed'
                      : 'im-badge-cancelled'
                  }`}
                >
                  {meeting.status}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                  ID: {meeting.meetingCode}
                </span>
              </div>

              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--im-text-primary)' }}>
                {meeting.title}
              </h1>

              <p style={{ margin: 0, color: 'var(--im-text-secondary)', maxWidth: 650, lineHeight: 1.5 }}>
                {meeting.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                <button
                  className="im-btn im-btn-primary"
                  onClick={() => navigate(`/meeting/${meeting.id}`)}
                >
                  <VideoIcon size={16} />
                  Join Meeting Now
                </button>
              )}

              <button
                className="im-btn im-btn-secondary"
                onClick={() => copyMeetingLink(meeting)}
              >
                <CopyIcon size={15} />
                Copy Link
              </button>

              {meeting.status === 'upcoming' && (
                <>
                  <button
                    className="im-btn im-btn-secondary"
                    onClick={() => navigate(`/meetings/new?edit=${meeting.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="im-btn im-btn-ghost"
                    onClick={() => setCancelDialogOpen(true)}
                    style={{ color: 'var(--im-danger)' }}
                  >
                    Cancel Meeting
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Specs */}
      <div className="im-detail-grid">
        {/* Left: Meeting Specifications & Schedule */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">Schedule & Connection</h2>
          </div>
          <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="im-stat-icon-wrap im-stat-icon-indigo">
                <CalendarIcon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Date & Time</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                  {meeting.date} at {meeting.startTime} ({meeting.durationMinutes} minutes)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="im-stat-icon-wrap im-stat-icon-amber">
                <VideoIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Meeting Web Link</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--im-primary)', wordBreak: 'break-all' }}>
                  {meeting.meetingLink}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="im-stat-icon-wrap im-stat-icon-green">
                <ShieldCheckIcon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Security Protocol</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  256-bit AES E2E Encrypted • Real-time AI Audio Noise Cancellation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Participants */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">
              <UsersIcon size={18} />
              Participants ({meeting.participants.length})
            </h2>
          </div>
          <div className="im-card-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {meeting.participants.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--im-radius-md)',
                    backgroundColor: 'var(--im-bg-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="im-avatar-pill" style={{ marginLeft: 0, width: 30, height: 30 }}>
                      {p.avatar || p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>{p.email}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: p.role === 'host' ? 'var(--im-primary)' : 'var(--im-text-muted)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {p.role || 'Attendee'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Preview if available */}
      {summary && (
        <div className="im-card" style={{ marginTop: 24 }}>
          <div className="im-card-header">
            <h2 className="im-card-title">
              <SparkleIcon size={18} style={{ color: 'var(--im-ai-purple)' }} />
              AI Companion Executive Summary
            </h2>
            <Link to={`/ai-notes?id=${summary.id}`} className="im-btn im-btn-secondary im-btn-sm">
              Open Full AI Workspace
            </Link>
          </div>
          <div className="im-card-body">
            <p style={{ lineHeight: 1.6, color: 'var(--im-text-secondary)', marginBottom: 16 }}>
              {summary.overview}
            </p>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>Key Discussion Points</h3>
            <ul style={{ paddingLeft: 20, margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
              {summary.keyPoints.map((pt, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{pt}</li>
              ))}
            </ul>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
              Action Items ({summary.actionItems.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {summary.actionItems.map((act) => (
                <div key={act.id} className="im-action-item-check">
                  <span style={{ fontSize: '0.8125rem', flex: 1, textDecoration: act.completed ? 'line-through' : 'none' }}>
                    {act.task} <em>({act.assignee})</em>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>Due {act.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelDialogOpen && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-cancel-title">
          <div className="im-modal">
            <div className="im-modal-header">
              <h2 id="dialog-cancel-title" className="im-modal-title">Cancel Meeting?</h2>
              <button className="im-modal-close" onClick={() => setCancelDialogOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="im-modal-body">
              <p style={{ margin: 0, color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to cancel "{meeting.title}"? Attendees will be notified that the room has been closed.
              </p>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn im-btn-secondary" onClick={() => setCancelDialogOpen(false)}>
                Back
              </button>
              <button className="im-btn im-btn-danger" onClick={handleCancelMeeting}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailPage;
