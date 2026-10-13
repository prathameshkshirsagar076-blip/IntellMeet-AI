import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import type { Meeting } from '../types/meeting';
import {
  VideoIcon,
  CalendarIcon,
  SearchIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
} from '../components/icons';

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

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { meetings, cancelMeeting, deleteMeeting, copyMeetingLink } = useMeetings();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  // Sync with URL query params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'upcoming' || filterParam === 'completed' || filterParam === 'cancelled') {
      setActiveTab(filterParam);
    } else if (filterParam === 'today') {
      setActiveTab('all');
      setSearchQuery(new Date().toISOString().split('T')[0]);
    }

    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', tab);
    }
    setSearchParams(newParams);
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // Tab filter
      if (activeTab === 'upcoming' && meeting.status !== 'upcoming' && meeting.status !== 'live') {
        return false;
      }
      if (activeTab === 'completed' && meeting.status !== 'completed') {
        return false;
      }
      if (activeTab === 'cancelled' && meeting.status !== 'cancelled') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = meeting.title.toLowerCase().includes(query);
        const matchesCode = meeting.meetingCode.toLowerCase().includes(query);
        const matchesDate = meeting.date.includes(query);
        const matchesOrganizer = meeting.organizer.name.toLowerCase().includes(query);
        return matchesTitle || matchesCode || matchesDate || matchesOrganizer;
      }

      return true;
    });
  }, [meetings, activeTab, searchQuery]);

  return (
    <div>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Meetings Management</h1>
          <p className="im-page-subtitle">
            Manage your scheduled video calls, view participant rosters, and access room credentials.
          </p>
        </div>

        <div className="im-page-actions">
          <Link to="/schedule" className="im-btn im-btn-secondary" title="Switch to Interactive Calendar View">
            <CalendarIcon size={16} />
            Calendar View
          </Link>
          <button className="im-btn im-btn-secondary" onClick={() => navigate('/meetings/join')}>
            <VideoIcon size={16} />
            Join with Code
          </button>
          <button className="im-btn im-btn-primary" onClick={() => navigate('/meetings/new')}>
            <PlusIcon size={16} />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* High-Level Meetings Summary Cards */}
      <div className="im-stats-grid" style={{ marginBottom: 20 }}>
        <div className="im-stat-card">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-indigo">
              <VideoIcon size={18} />
            </div>
            <span className="im-stat-trend">Total</span>
          </div>
          <div className="im-stat-value">{meetings.length}</div>
          <div className="im-stat-label">All Meetings</div>
        </div>

        <div className="im-stat-card">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-amber">
              <ClockIcon size={18} />
            </div>
            <span className="im-stat-trend">Ready</span>
          </div>
          <div className="im-stat-value">
            {meetings.filter((m) => m.status === 'upcoming' || m.status === 'live').length}
          </div>
          <div className="im-stat-label">Upcoming Sessions</div>
        </div>

        <div className="im-stat-card">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-green">
              <CheckCircleIcon size={18} />
            </div>
            <span className="im-stat-trend">Finished</span>
          </div>
          <div className="im-stat-value">
            {meetings.filter((m) => m.status === 'completed').length}
          </div>
          <div className="im-stat-label">Completed Calls</div>
        </div>

        <div className="im-stat-card">
          <div className="im-stat-header">
            <div className="im-stat-icon-wrap im-stat-icon-purple">
              <CalendarIcon size={18} />
            </div>
            <span className="im-stat-trend">Timetable</span>
          </div>
          <div className="im-stat-value">
            {meetings.reduce((acc, m) => acc + (m.durationMinutes || 0), 0)}m
          </div>
          <div className="im-stat-label">Total Duration</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="im-filter-bar">
        <div className="im-tabs-group" role="tablist">
          <button
            className={`im-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
            role="tab"
            aria-selected={activeTab === 'all'}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            className={`im-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleTabChange('upcoming')}
            role="tab"
            aria-selected={activeTab === 'upcoming'}
          >
            Upcoming ({meetings.filter((m) => m.status === 'upcoming' || m.status === 'live').length})
          </button>
          <button
            className={`im-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
            role="tab"
            aria-selected={activeTab === 'completed'}
          >
            Completed ({meetings.filter((m) => m.status === 'completed').length})
          </button>
          <button
            className={`im-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabChange('cancelled')}
            role="tab"
            aria-selected={activeTab === 'cancelled'}
          >
            Cancelled ({meetings.filter((m) => m.status === 'cancelled').length})
          </button>
        </div>

        <div className="im-filter-controls">
          <div style={{ position: 'relative', width: 260 }}>
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
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              className="im-input"
              style={{ paddingLeft: 32, height: 36, fontSize: '0.8125rem' }}
              placeholder="Filter by title, code, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter meetings"
            />
          </div>
          {searchQuery && (
            <button
              className="im-btn im-btn-ghost im-btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="im-card">
        <div className="im-card-body">
          {filteredMeetings.length === 0 ? (
            <div className="im-empty-state">
              <div className="im-empty-state-icon">
                <CalendarIcon size={26} />
              </div>
              <h2 className="im-empty-state-title">No meetings found</h2>
              <p className="im-empty-state-desc">
                {searchQuery
                  ? `No meetings match "${searchQuery}". Try modifying your search criteria.`
                  : 'You have no meetings matching this filter view.'}
              </p>
              <button
                className="im-btn im-btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  navigate('/meetings/new');
                }}
              >
                Schedule New Meeting
              </button>
            </div>
          ) : (
            <div className="im-meeting-list">
              {filteredMeetings.map((meeting: Meeting) => (
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
                    </div>

                    <div className="im-meeting-meta">
                      <span className="im-meeting-meta-item">
                        <CalendarIcon size={13} />
                        {meeting.date}
                      </span>
                      <span className="im-meeting-meta-item">
                        <UsersIcon size={13} />
                        Hosted by {meeting.organizer.name}
                      </span>
                      <span className="im-meeting-meta-item">
                        <ClockIcon size={13} />
                        Code: <strong>{meeting.meetingCode}</strong>
                      </span>

                      <div className="im-avatar-stack" title={`${meeting.participants.length} attendees`}>
                        {meeting.participants.slice(0, 4).map((p, idx) => (
                          <span key={idx} className="im-avatar-pill">
                            {p.avatar || p.name.slice(0, 2).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="im-meeting-actions">
                    {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                      <button
                        className="im-btn im-btn-primary im-btn-sm"
                        onClick={() => navigate(`/meetings/join?code=${meeting.meetingCode || meeting.id}`)}
                      >
                        Join
                      </button>
                    )}

                    <Link
                      to={`/meetings/${meeting.id}`}
                      className="im-btn im-btn-secondary im-btn-sm"
                    >
                      Details
                    </Link>

                    <button
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => copyMeetingLink(meeting)}
                      title="Copy meeting link"
                    >
                      <CopyIcon size={14} />
                    </button>

                    {meeting.status === 'upcoming' && (
                      <>
                        <button
                          className="im-btn im-btn-secondary im-btn-sm"
                          onClick={() => navigate(`/meetings/new?edit=${meeting.id}`)}
                          title="Edit meeting"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          className="im-btn im-btn-ghost im-btn-sm"
                          onClick={() => setCancelModalId(meeting.id)}
                          title="Cancel meeting"
                          style={{ color: 'var(--im-danger)' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </>
                    )}

                    {meeting.status === 'cancelled' && (
                      <button
                        className="im-btn im-btn-ghost im-btn-sm"
                        onClick={() => deleteMeeting(meeting.id)}
                        title="Delete from list"
                        style={{ color: 'var(--im-text-muted)' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-heading">
          <div className="im-modal">
            <div className="im-modal-header">
              <h2 id="cancel-modal-heading" className="im-modal-title">Cancel Meeting</h2>
              <button className="im-modal-close" onClick={() => setCancelModalId(null)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="im-modal-body">
              <p style={{ margin: 0, color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to cancel this meeting? Participants will be notified that the room has been closed.
              </p>
            </div>
            <div className="im-modal-footer">
              <button className="im-btn im-btn-secondary" onClick={() => setCancelModalId(null)}>
                Keep Meeting
              </button>
              <button
                className="im-btn im-btn-danger"
                onClick={() => {
                  cancelMeeting(cancelModalId);
                  setCancelModalId(null);
                }}
              >
                Yes, Cancel Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
