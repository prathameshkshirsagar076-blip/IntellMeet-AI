import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMeetings, mapBackendMeeting } from '../context/MeetingContext';
import { meetingApi } from '../api/meeting.api';
import type { Meeting, Participant, ParticipantInvitationInfo } from '../types/meeting';
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
  const {
    getMeetingById,
    getSummaryByMeetingId,
    copyMeetingLink,
    cancelMeeting,
    acceptInvitation,
    declineInvitation,
    resendInvitation,
  } = useMeetings();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [remoteMeeting, setRemoteMeeting] = useState<Meeting | null>(null);
  const [invitations, setInvitations] = useState<ParticipantInvitationInfo[]>([]);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvitations = useCallback(() => {
    if (!meetingId) return;
    meetingApi
      .getMeetingInvitations(meetingId)
      .then((res) => {
        if (res?.data?.invitations) {
          setInvitations(res.data.invitations);
        }
      })
      .catch((err) => {
        console.warn('Failed to load meeting invitations:', err);
      });
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) {
      setIsLoading(false);
      return;
    }

    const local = getMeetingById(meetingId);
    if (local) {
      setRemoteMeeting(local);
      setIsLoading(false);
      loadInvitations();
      return;
    }

    setIsLoading(true);
    meetingApi
      .getMeetingById(meetingId)
      .then((res) => {
        if (res?.data) {
          setRemoteMeeting(mapBackendMeeting(res.data));
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
        loadInvitations();
      });
  }, [meetingId, getMeetingById, loadInvitations]);

  const meeting = getMeetingById(meetingId || '') || remoteMeeting;
  const summary =
    meeting?.summaryId || meetingId
      ? getSummaryByMeetingId(meetingId || '') ||
        (meeting?.summaryId ? getSummaryByMeetingId(meeting.summaryId) : undefined)
      : undefined;

  if (isLoading) {
    return (
      <div className="im-card" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
        <div className="im-card-body" style={{ padding: '48px 24px' }}>
          <p style={{ color: 'var(--im-text-muted)' }}>Loading meeting details...</p>
        </div>
      </div>
    );
  }

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

  const handleCancelMeeting = async () => {
    await cancelMeeting(meeting.id);
    setCancelDialogOpen(false);
  };

  const handleAcceptRsvp = async () => {
    await acceptInvitation(meeting.id);
    if (remoteMeeting) {
      setRemoteMeeting({ ...remoteMeeting, myInvitationStatus: 'accepted' });
    }
    loadInvitations();
  };

  const handleDeclineRsvp = async () => {
    await declineInvitation(meeting.id);
    if (remoteMeeting) {
      setRemoteMeeting({ ...remoteMeeting, myInvitationStatus: 'declined' });
    }
    loadInvitations();
  };

  const handleResend = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      await resendInvitation(meeting.id, invitationId);
      loadInvitations();
    } finally {
      setResendingId(null);
    }
  };

  const isHost = meeting.myRole === 'host';

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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
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

                {isHost ? (
                  <span
                    className="im-badge"
                    style={{
                      background: 'var(--im-primary-light, #eef2ff)',
                      color: 'var(--im-primary, #4f46e5)',
                      fontSize: '0.72rem',
                    }}
                  >
                    You are Host
                  </span>
                ) : (
                  <span
                    className={`im-badge ${
                      meeting.myInvitationStatus === 'accepted'
                        ? 'im-badge-completed'
                        : meeting.myInvitationStatus === 'declined'
                        ? 'im-badge-cancelled'
                        : 'im-badge-upcoming'
                    }`}
                    style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}
                  >
                    Your RSVP: {meeting.myInvitationStatus || 'Pending'}
                  </span>
                )}

                <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                  ID: {meeting.meetingCode}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.625rem)',
                  fontWeight: 800,
                  margin: '0 0 10px 0',
                  color: 'var(--im-text-primary)',
                  wordBreak: 'break-word',
                }}
              >
                {meeting.title}
              </h1>

              <p style={{ margin: 0, color: 'var(--im-text-secondary)', maxWidth: 650, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {meeting.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* RSVP Action Buttons for Invitees */}
              {meeting.myInvitationStatus === 'pending' && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="im-btn im-btn-primary"
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={handleAcceptRsvp}
                  >
                    Accept RSVP
                  </button>
                  <button
                    className="im-btn im-btn-secondary"
                    style={{ color: 'var(--im-danger, #ef4444)' }}
                    onClick={handleDeclineRsvp}
                  >
                    Decline
                  </button>
                </div>
              )}

              {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                <button
                  className="im-btn im-btn-primary"
                  onClick={() => navigate(`/meetings/join?code=${meeting.meetingCode || meeting.id}`)}
                >
                  <VideoIcon size={16} />
                  {meeting.status === 'live' ? 'Join Live Now' : 'Join Meeting'}
                </button>
              )}

              <button
                className="im-btn im-btn-secondary"
                onClick={() => copyMeetingLink(meeting)}
                title="Copy meeting link"
              >
                <CopyIcon size={15} />
                Copy Link
              </button>

              {meeting.status === 'upcoming' && isHost && (
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
                <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                  Configured Timezone: <strong>{meeting.timezone || 'UTC'}</strong>
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

        {/* Right: Participants & Invitations Roster */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">
              <UsersIcon size={18} />
              Participants & Invitees ({invitations.length || meeting.participants.length})
            </h2>
          </div>
          <div className="im-card-body" style={{ maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {invitations.length > 0
                ? invitations.map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--im-radius-md)',
                        backgroundColor: 'var(--im-bg-subtle)',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div className="im-avatar-pill" style={{ marginLeft: 0, width: 32, height: 32, flexShrink: 0, overflow: 'hidden' }}>
                          {inv.avatar && (inv.avatar.startsWith('http') || inv.avatar.startsWith('data:')) ? (
                            <img
                              src={inv.avatar}
                              alt={inv.name}
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            inv.avatar || (inv.name ? inv.name.slice(0, 2).toUpperCase() : 'U')
                          )}
                        </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {inv.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {inv.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* RSVP Status badge */}
                        <span
                          className={`im-badge ${
                            inv.status === 'accepted' || inv.status === 'joined'
                              ? 'im-badge-completed'
                              : inv.status === 'declined'
                              ? 'im-badge-cancelled'
                              : 'im-badge-upcoming'
                          }`}
                          style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}
                        >
                          {inv.status}
                        </span>

                        {/* Host Resend button */}
                        {isHost && inv.role !== 'host' && (
                          <button
                            type="button"
                            className="im-btn im-btn-secondary im-btn-sm"
                            disabled={resendingId === inv.id}
                            onClick={() => handleResend(inv.id)}
                            style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                            title="Resend invitation email with .ics file"
                          >
                            {resendingId === inv.id ? 'Sending...' : 'Resend'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                : meeting.participants.map((p: Participant, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--im-radius-md)',
                        backgroundColor: 'var(--im-bg-subtle)',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <div className="im-avatar-pill" style={{ marginLeft: 0, width: 30, height: 30, flexShrink: 0, overflow: 'hidden' }}>
                          {p.avatar && (p.avatar.startsWith('http') || p.avatar.startsWith('data:')) ? (
                            <img
                              src={p.avatar}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            p.avatar || p.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--im-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.email}</div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: p.role === 'host' ? 'var(--im-primary)' : 'var(--im-text-muted)',
                          textTransform: 'capitalize',
                          flexShrink: 0,
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
                <li key={i} style={{ marginBottom: 4 }}>
                  {pt}
                </li>
              ))}
            </ul>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>
              Action Items ({summary.actionItems.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {summary.actionItems.map((act) => (
                <div key={act.id} className="im-action-item-check">
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      flex: 1,
                      textDecoration: act.completed ? 'line-through' : 'none',
                    }}
                  >
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
              <h2 id="dialog-cancel-title" className="im-modal-title">
                Cancel Meeting?
              </h2>
              <button className="im-modal-close" onClick={() => setCancelDialogOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="im-modal-body">
              <p style={{ margin: 0, color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to cancel "{meeting.title}"? Attendees will be notified by email with an updated cancellation notice.
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
