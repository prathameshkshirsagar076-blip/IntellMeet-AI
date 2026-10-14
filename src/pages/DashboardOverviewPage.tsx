import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import type { Meeting } from '../types/meeting';
import {
  VideoIcon,
  CalendarIcon,
  SparkleIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  UsersIcon,
  ArrowRightIcon,
} from '../components/icons';

// Custom SVG Icons
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

const EditIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const DashboardOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    meetings,
    summaries,
    activities,
    openNewMeetingModal,
    cancelMeeting,
    copyMeetingLink,
  } = useMeetings();

  const [confirmCancelMeetingId, setConfirmCancelMeetingId] = useState<string | null>(null);

  // Time-appropriate greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute metrics
  const meetingsTodayCount = useMemo(() => {
    return meetings.filter((m) => m.date === todayStr && m.status !== 'cancelled').length;
  }, [meetings, todayStr]);

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter((m) => m.status === 'upcoming' || m.status === 'live')
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [meetings]);

  const completedMeetingsCount = useMemo(() => {
    return meetings.filter((m) => m.status === 'completed').length;
  }, [meetings]);

  const aiNotesCount = summaries.length;

  const handleConfirmCancel = () => {
    if (confirmCancelMeetingId) {
      cancelMeeting(confirmCancelMeetingId);
      setConfirmCancelMeetingId(null);
    }
  };

  const handleStartInstant = () => {
    openNewMeetingModal();
  };

  return (
    <div>
      {/* 1. Welcome Section */}
      <section className="im-welcome-hero" aria-label="Welcome banner">
        <div className="im-welcome-content">
          <div className="im-welcome-tag">
            <SparkleIcon size={14} />
            <span>AI Meeting Co-Pilot Active</span>
          </div>
          <h1 className="im-welcome-title">
            {greeting}, {user?.name || 'there'}!
          </h1>
          <p className="im-welcome-subtitle">
            You have {meetingsTodayCount} scheduled {meetingsTodayCount === 1 ? 'meeting' : 'meetings'} today.
            Your AI summaries and action items are synchronized.
          </p>

          <div className="im-welcome-actions">
            <button className="im-btn im-btn-hero-white" onClick={handleStartInstant}>
              <PlusIcon size={16} />
              New Meeting
            </button>
            <button className="im-btn im-btn-hero-ghost" onClick={() => navigate('/meetings/join')}>
              <VideoIcon size={16} />
              Join Meeting
            </button>
            <button className="im-btn im-btn-hero-ghost" onClick={() => navigate('/meetings/new')}>
              <CalendarIcon size={16} />
              Schedule Meeting
            </button>
          </div>
        </div>
      </section>

      {/* 2. Overview Summary Cards */}
      <section className="im-stat-grid" aria-label="Overview statistics">
        <Link to="/meetings?filter=today" className="im-stat-card clickable">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-indigo">
              <CalendarIcon size={20} />
            </div>
            <span className="im-stat-trend">Today</span>
          </div>
          <div className="im-stat-value">{meetingsTodayCount}</div>
          <div className="im-stat-label">Meetings Today</div>
        </Link>

        <Link to="/schedule" className="im-stat-card clickable">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-amber">
              <ClockIcon size={20} />
            </div>
            <span className="im-stat-trend">Scheduled</span>
          </div>
          <div className="im-stat-value">{upcomingMeetings.length}</div>
          <div className="im-stat-label">Upcoming Meetings</div>
        </Link>

        <Link to="/history" className="im-stat-card clickable">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-green">
              <CheckCircleIcon size={20} />
            </div>
            <span className="im-stat-trend">Archived</span>
          </div>
          <div className="im-stat-value">{completedMeetingsCount}</div>
          <div className="im-stat-label">Meetings Completed</div>
        </Link>

        <Link to="/ai-notes" className="im-stat-card clickable">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-purple">
              <SparkleIcon size={20} />
            </div>
            <span className="im-stat-trend">AI Ready</span>
          </div>
          <div className="im-stat-value">{aiNotesCount}</div>
          <div className="im-stat-label">AI Notes Generated</div>
        </Link>
      </section>

      {/* 3. Main Dashboard Two-Column Grid */}
      <div className="im-dashboard-layout">
        {/* Left Column: Upcoming Meetings */}
        <div className="im-dashboard-main-col">
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">
                <ClockIcon size={18} />
                Upcoming Meetings
              </h2>
              <Link to="/meetings" className="im-btn im-btn-ghost im-btn-sm">
                View All ({upcomingMeetings.length})
                <ArrowRightIcon size={14} />
              </Link>
            </div>

            <div className="im-card-body">
              {upcomingMeetings.length === 0 ? (
                <div className="im-empty-state">
                  <div className="im-empty-state-icon">
                    <CalendarIcon size={24} />
                  </div>
                  <h3 className="im-empty-state-title">No upcoming meetings</h3>
                  <p className="im-empty-state-desc">
                    Your calendar is clear for today. Schedule a meeting or start an instant session.
                  </p>
                  <button className="im-btn im-btn-primary" onClick={() => navigate('/meetings/new')}>
                    Schedule Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="im-meeting-list">
                  {upcomingMeetings.map((meeting: Meeting) => (
                    <div key={meeting.id} className="im-meeting-item">
                      <div className="im-meeting-item-time">
                        <span className="im-meeting-time-start">{meeting.startTime}</span>
                        <span className="im-meeting-time-duration">{meeting.durationMinutes}m</span>
                      </div>

                      <div className="im-meeting-item-details">
                        <div className="im-meeting-title-row">
                          <Link to={`/meetings/${meeting.id}`} className="im-meeting-title">
                            {meeting.title}
                          </Link>
                          <span
                            className={`im-badge ${
                              meeting.status === 'live' ? 'im-badge-live' : 'im-badge-upcoming'
                            }`}
                          >
                            {meeting.status === 'live' ? 'Live Now' : 'Upcoming'}
                          </span>
                        </div>

                        <div className="im-meeting-meta">
                          <span className="im-meeting-meta-item">
                            <CalendarIcon size={13} />
                            {meeting.date}
                          </span>
                          <span className="im-meeting-meta-item">
                            <UsersIcon size={13} />
                            {meeting.organizer.name}
                          </span>

                          <div className="im-avatar-stack" title={`${meeting.participants.length} participants`}>
                            {meeting.participants.slice(0, 3).map((p, idx) => (
                              <span key={idx} className="im-avatar-pill">
                                {p.avatar || p.name.slice(0, 2).toUpperCase()}
                              </span>
                            ))}
                            {meeting.participants.length > 3 && (
                              <span className="im-avatar-pill">
                                +{meeting.participants.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="im-meeting-actions">
                        <button
                          className="im-btn im-btn-primary im-btn-sm"
                          onClick={() => navigate(`/meetings/join?code=${meeting.meetingCode || meeting.id}`)}
                          title="Join live meeting"
                        >
                          Join
                        </button>
                        <button
                          className="im-btn im-btn-secondary im-btn-sm"
                          onClick={() => copyMeetingLink(meeting)}
                          title="Copy meeting link"
                        >
                          <CopyIcon size={14} />
                        </button>
                        <button
                          className="im-btn im-btn-secondary im-btn-sm"
                          onClick={() => navigate(`/meetings/new?edit=${meeting.id}`)}
                          title="Edit meeting"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          className="im-btn im-btn-ghost im-btn-sm"
                          onClick={() => setConfirmCancelMeetingId(meeting.id)}
                          title="Cancel meeting"
                          style={{ color: 'var(--im-danger)' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="im-card-footer">
              <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                Encrypted with AES-256 GCM • Real-time AI Companion
              </span>
              <button
                className="im-btn im-btn-secondary im-btn-sm"
                onClick={() => navigate('/meetings/new')}
              >
                <PlusIcon size={14} />
                Schedule More
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Activity */}
        <div className="im-dashboard-side-col">
          {/* Quick Actions Card */}
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">Quick Actions</h2>
            </div>
            <div className="im-card-body">
              <div className="im-quick-actions-grid">
                <button
                  className="im-quick-action-tile"
                  onClick={handleStartInstant}
                  style={{ textAlign: 'left', width: '100%' }}
                >
                  <div className="im-quick-action-icon" style={{ backgroundColor: 'var(--im-primary-light)', color: 'var(--im-primary)' }}>
                    <PlusIcon size={18} />
                  </div>
                  <div>
                    <h3 className="im-quick-action-title">Start Instant</h3>
                    <p className="im-quick-action-desc">Launch room 408</p>
                  </div>
                </button>

                <Link to="/meetings/join" className="im-quick-action-tile">
                  <div className="im-quick-action-icon" style={{ backgroundColor: 'var(--im-warning-light)', color: 'var(--im-warning)' }}>
                    <VideoIcon size={18} />
                  </div>
                  <div>
                    <h3 className="im-quick-action-title">Join Meeting</h3>
                    <p className="im-quick-action-desc">Via Code or Link</p>
                  </div>
                </Link>

                <Link to="/meetings/new" className="im-quick-action-tile">
                  <div className="im-quick-action-icon" style={{ backgroundColor: 'var(--im-success-light)', color: 'var(--im-success)' }}>
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <h3 className="im-quick-action-title">Schedule</h3>
                    <p className="im-quick-action-desc">Set date & time</p>
                  </div>
                </Link>

                <Link to="/ai-notes" className="im-quick-action-tile">
                  <div className="im-quick-action-icon" style={{ backgroundColor: 'var(--im-ai-light)', color: 'var(--im-ai-purple)' }}>
                    <SparkleIcon size={18} />
                  </div>
                  <div>
                    <h3 className="im-quick-action-title">AI Notes</h3>
                    <p className="im-quick-action-desc">Summaries & tasks</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">Recent Activity</h2>
              <Link to="/history" className="im-btn im-btn-ghost im-btn-sm">
                History
              </Link>
            </div>
            <div className="im-card-body">
              <div className="im-activity-feed">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="im-activity-row">
                    <div className={`im-activity-icon ${act.iconType}`}>
                      {act.iconType === 'sparkle' ? (
                        <SparkleIcon size={14} />
                      ) : act.iconType === 'calendar' ? (
                        <CalendarIcon size={14} />
                      ) : act.iconType === 'copy' ? (
                        <CopyIcon size={14} />
                      ) : (
                        <CheckCircleIcon size={14} />
                      )}
                    </div>
                    <div className="im-activity-content">
                      <div className="im-activity-title">{act.title}</div>
                      <div className="im-activity-desc">{act.description}</div>
                      <div className="im-activity-time">{act.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Cancel Meeting */}
      {confirmCancelMeetingId && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
          <div className="im-modal">
            <div className="im-modal-header">
              <h2 id="cancel-modal-title" className="im-modal-title">Cancel Scheduled Meeting?</h2>
              <button
                className="im-modal-close"
                onClick={() => setConfirmCancelMeetingId(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="im-modal-body">
              <p style={{ margin: 0, color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to cancel this meeting? Its status will be changed to cancelled, and attendees will be informed. This action cannot be undone.
              </p>
            </div>
            <div className="im-modal-footer">
              <button
                className="im-btn im-btn-secondary"
                onClick={() => setConfirmCancelMeetingId(null)}
              >
                Keep Meeting
              </button>
              <button
                className="im-btn im-btn-danger"
                onClick={handleConfirmCancel}
              >
                Cancel Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverviewPage;
