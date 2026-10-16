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
  ChevronLeftIcon,
  ChevronRightIcon,
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
  const { meetings, cancelMeeting, deleteMeeting, copyMeetingLink, acceptInvitation, declineInvitation } = useMeetings();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'invitations' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  // Sync with URL query params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'upcoming' || filterParam === 'invitations' || filterParam === 'completed' || filterParam === 'cancelled') {
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

  const handleTabChange = (tab: 'all' | 'upcoming' | 'invitations' | 'completed' | 'cancelled') => {
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
      if (activeTab === 'invitations') {
        const isInvited = meeting.myRole === 'attendee' || (meeting.myInvitationStatus && meeting.myInvitationStatus !== 'none');
        if (!isInvited) return false;
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
    }).sort((a, b) => {
      // 1. Live meetings always on top
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;

      // 2. Latest created on top
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (createdA && createdB && createdA !== createdB && !isNaN(createdA) && !isNaN(createdB)) {
        return createdB - createdA;
      }

      // 3. Fallback: latest scheduled on top
      const schedA = new Date(a.scheduledStartAt || `${a.date}T${a.startTime}`).getTime();
      const schedB = new Date(b.scheduledStartAt || `${b.date}T${b.startTime}`).getTime();
      if (!isNaN(schedA) && !isNaN(schedB)) {
        return schedB - schedA;
      }

      return 0;
    });
  }, [meetings, activeTab, searchQuery]);

  // Professional Pagination State (default 5 items per page for instant responsiveness)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Auto-reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, itemsPerPage]);

  const totalMeetings = filteredMeetings.length;
  const totalPages = Math.max(1, Math.ceil(totalMeetings / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Clamp current page if meetings deleted or changed
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalMeetings);

  const paginatedMeetings = useMemo(() => {
    return filteredMeetings.slice(startIndex, endIndex);
  }, [filteredMeetings, startIndex, endIndex]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [safeCurrentPage, totalPages]);

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

      {/* High-Level Meetings Summary Cards (Compact Horizontal Row) */}
      <div className="im-meetings-stat-grid">
        <div
          className={`im-meetings-stat-card ${activeTab === 'all' && !searchQuery ? 'active' : ''}`}
          onClick={() => {
            setSearchQuery('');
            handleTabChange('all');
          }}
          title="Filter: All Meetings"
        >
          <div className="im-meetings-stat-card-left">
            <div className="im-meetings-stat-card-icon im-stat-icon-indigo">
              <VideoIcon size={18} />
            </div>
            <div className="im-meetings-stat-card-info">
              <span className="im-meetings-stat-card-value">{meetings.length}</span>
              <span className="im-meetings-stat-card-label">All Meetings</span>
            </div>
          </div>
          <span className="im-stat-trend">Total</span>
        </div>

        <div
          className={`im-meetings-stat-card ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => {
            setSearchQuery('');
            handleTabChange('upcoming');
          }}
          title="Filter: Upcoming Sessions"
        >
          <div className="im-meetings-stat-card-left">
            <div className="im-meetings-stat-card-icon im-stat-icon-amber">
              <ClockIcon size={18} />
            </div>
            <div className="im-meetings-stat-card-info">
              <span className="im-meetings-stat-card-value">
                {meetings.filter((m) => m.status === 'upcoming' || m.status === 'live').length}
              </span>
              <span className="im-meetings-stat-card-label">Upcoming Sessions</span>
            </div>
          </div>
          <span className="im-stat-trend">Ready</span>
        </div>

        <div
          className={`im-meetings-stat-card ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => {
            setSearchQuery('');
            handleTabChange('completed');
          }}
          title="Filter: Completed Calls"
        >
          <div className="im-meetings-stat-card-left">
            <div className="im-meetings-stat-card-icon im-stat-icon-green">
              <CheckCircleIcon size={18} />
            </div>
            <div className="im-meetings-stat-card-info">
              <span className="im-meetings-stat-card-value">
                {meetings.filter((m) => m.status === 'completed').length}
              </span>
              <span className="im-meetings-stat-card-label">Completed Calls</span>
            </div>
          </div>
          <span className="im-stat-trend">Finished</span>
        </div>

        <div
          className={`im-meetings-stat-card ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => {
            setSearchQuery('');
            handleTabChange('invitations');
          }}
          title="Filter: Pending Invitations & Invites"
        >
          <div className="im-meetings-stat-card-left">
            <div className="im-meetings-stat-card-icon im-stat-icon-purple">
              <UsersIcon size={18} />
            </div>
            <div className="im-meetings-stat-card-info">
              <span className="im-meetings-stat-card-value">
                {meetings.filter((m) => m.myInvitationStatus === 'pending').length}
              </span>
              <span className="im-meetings-stat-card-label">Pending RSVPs</span>
            </div>
          </div>
          <span className="im-stat-trend">Invites</span>
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
            className={`im-tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
            onClick={() => handleTabChange('invitations')}
            role="tab"
            aria-selected={activeTab === 'invitations'}
          >
            Invitations ({meetings.filter((m) => m.myRole === 'attendee' || (m.myInvitationStatus && m.myInvitationStatus !== 'none')).length})
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
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
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
              {paginatedMeetings.map((meeting: Meeting) => (
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
                        <ClockIcon size={13} />
                        {meeting.startTime} ({meeting.timezone || 'UTC'})
                      </span>
                      <span className="im-meeting-meta-item">
                        <UsersIcon size={13} />
                        Hosted by {meeting.organizer.name}
                      </span>
                      {meeting.myRole === 'host' ? (
                        <span
                          className="im-badge"
                          style={{
                            background: 'var(--im-primary-light, #eef2ff)',
                            color: 'var(--im-primary, #4f46e5)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          Host
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
                          style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}
                        >
                          RSVP: {meeting.myInvitationStatus || 'Pending'}
                        </span>
                      )}
                      <span className="im-meeting-meta-item">
                        Code: <strong>{meeting.meetingCode}</strong>
                      </span>

                      <div className="im-avatar-stack" title={`${meeting.participants.length} attendees`}>
                        {meeting.participants.slice(0, 4).map((p, idx) => (
                          <span key={idx} className="im-avatar-pill">
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
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="im-meeting-actions">
                    {meeting.myInvitationStatus === 'pending' && meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          className="im-btn im-btn-primary im-btn-sm"
                          style={{ background: '#16a34a', borderColor: '#16a34a', padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => acceptInvitation(meeting.id)}
                          title="Accept meeting invitation"
                        >
                          Accept
                        </button>
                        <button
                          className="im-btn im-btn-secondary im-btn-sm"
                          style={{ color: 'var(--im-danger, #ef4444)', padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => declineInvitation(meeting.id)}
                          title="Decline meeting invitation"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                      <button
                        className="im-btn im-btn-primary im-btn-sm"
                        onClick={() => navigate(`/meetings/join?code=${meeting.meetingCode || meeting.id}`)}
                      >
                        {meeting.status === 'live' ? 'Join Live' : 'Join'}
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

                    {meeting.status === 'upcoming' && meeting.myRole === 'host' && (
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

        {/* Card Footer with Professional Pagination */}
        {filteredMeetings.length > 0 && (
          <div className="im-card-footer im-meetings-pagination">
            <div className="im-pagination-left">
              <span className="im-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{totalMeetings}</strong> {totalMeetings === 1 ? 'meeting' : 'meetings'}
              </span>

              <div className="im-pagination-limit">
                <label htmlFor="meetings-per-page">Rows per page:</label>
                <select
                  id="meetings-per-page"
                  className="im-pagination-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Meetings per page"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="im-pagination-controls">
              <div className="im-pagination-nav">
                <button
                  type="button"
                  className="im-pagination-nav-btn"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon size={14} />
                  <span>Previous</span>
                </button>

                <div className="im-pagination-pages">
                  {pageNumbers.map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="im-pagination-ellipsis" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        className={`im-pagination-page-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(Number(pageNum))}
                        aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="im-pagination-nav-btn"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
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
