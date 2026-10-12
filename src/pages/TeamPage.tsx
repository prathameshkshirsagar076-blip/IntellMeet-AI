import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import { usersApi } from '../api/users.api';
import type { UserItem, PaginationMetadata } from '../types/user';
import { toast } from '../components/toast/toast';
import {
  VideoIcon,
  SearchIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatIcon,
} from '../components/icons';


/**
 * Generate 2-letter uppercase initials from full name.
 */
function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format ISO date string into localized short month and year.
 */
function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { createMeeting } = useMeetings();

  // Search & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Users data & request state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  // Refs for tracking active abort controller and toast deduplication
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastErrorToastRef = useRef<string | null>(null);

  // Debounce typing by 350ms and reset to page 1 on new search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedQuery(trimmed);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users with search keyword, page number, and limit
  const fetchUsers = useCallback(async (k: string, page: number, pageLimit: number) => {
    // Cancel in-flight request if newer request supersedes it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.getUsers({
        k: k || undefined,
        page,
        limit: pageLimit,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const userList = response?.data?.users || [];
      const paginationData = response?.data?.pagination || {
        page,
        limit: pageLimit,
        total: userList.length,
        totalPages: Math.ceil(userList.length / pageLimit) || 1,
      };

      setUsers(userList);
      setPagination(paginationData);
      setError(null);
      lastErrorToastRef.current = null;
    } catch (err: unknown) {
      if (controller.signal.aborted) return;

      const errorObj = err as Error;
      if (errorObj.name === 'AbortError') return;

      const message = errorObj.message || 'Unable to load team members. Please check your connection and try again.';
      setError(message);

      // Avoid showing duplicate error notifications for the same failed request
      if (lastErrorToastRef.current !== message) {
        lastErrorToastRef.current = message;
        toast.error(message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Trigger fetch when debounced query, page, or limit changes
  useEffect(() => {
    fetchUsers(debouncedQuery, currentPage, limit);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, currentPage, limit, fetchUsers]);

  const handleQuickMeetWith = async (user: UserItem) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const meeting = await createMeeting({
        title: `1:1 Sync with ${user.name}`,
        date: todayStr,
        startTime: new Date().toTimeString().slice(0, 5),
        durationMinutes: 30,
        participantsEmails: [user.email],
        isInstant: true,
      });
      toast.success(`Instant 1:1 meeting started with ${user.name}!`);
      navigate(`/meeting/${meeting.id}`);
    } catch {
      // Toast handled by context
    }
  };

  const handleScheduleWith = (user: UserItem) => {
    navigate('/meetings/new');
    toast.info(`Prefilled scheduling for ${user.name}`);
  };

  const handleChatWith = (user: UserItem) => {
    navigate('/chat', { state: { recipient: user } });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    toast.success(`Invitation sent to ${inviteEmail} (Simulated Demo Action)`);
    setInviteEmail('');
    setInviteName('');
    setInviteModalOpen(false);
  };

  return (
    <div className="im-team-page">
      {/* Page Header */}
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Team Directory & People</h1>
          <p className="im-page-subtitle">
            Collaborate with colleagues and initiate instant 1:1 syncs.
          </p>
        </div>

        <div className="im-page-actions">
          <button
            type="button"
            className="im-btn im-btn-primary"
            onClick={() => setInviteModalOpen(true)}
          >
            <PlusIcon size={16} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="im-filter-bar">
        <div style={{ position: 'relative', maxWidth: 360, width: '100%' }}>
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
            style={{ paddingLeft: 34, paddingRight: searchQuery ? 32 : 12, height: 38 }}
            placeholder="Search team members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search team by name"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--im-text-muted)',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                borderRadius: '50%',
              }}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {pagination && !isLoading && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-secondary)' }}>
            {pagination.total === 1 ? '1 member' : `${pagination.total} members`}
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="im-team-grid" aria-busy="true" aria-label="Loading team members">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="im-card" style={{ marginBottom: 0 }}>
              <div className="im-card-body" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div
                    className="im-skeleton"
                    style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="im-skeleton" style={{ height: 16, width: '55%', borderRadius: 4 }} />
                      <div className="im-skeleton" style={{ height: 14, width: 44, borderRadius: 10 }} />
                    </div>
                    <div className="im-skeleton" style={{ height: 12, width: '42%', borderRadius: 4 }} />
                    <div className="im-skeleton" style={{ height: 10, width: '32%', borderRadius: 4 }} />
                  </div>
                </div>
                <div className="im-skeleton" style={{ height: 12, width: '70%', marginBottom: 16, borderRadius: 4 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="im-skeleton" style={{ flex: 1, height: 32, borderRadius: 'var(--im-radius-md)' }} />
                  <div className="im-skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--im-radius-md)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="im-card">
          <div className="im-card-body">
            <div className="im-empty-state">
              <div className="im-empty-state-icon" style={{ color: 'var(--im-danger)' }}>
                ⚠
              </div>
              <h2 className="im-empty-state-title">Unable to Load Team Members</h2>
              <p className="im-empty-state-desc">{error}</p>
              <button
                type="button"
                className="im-btn im-btn-primary"
                onClick={() => fetchUsers(debouncedQuery, currentPage, limit)}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="im-card">
          <div className="im-card-body">
            <div className="im-empty-state">
              <div className="im-empty-state-icon">
                <SearchIcon size={24} />
              </div>
              <h2 className="im-empty-state-title">
                {debouncedQuery ? 'No matching team members found' : 'No team members found'}
              </h2>
              <p className="im-empty-state-desc">
                {debouncedQuery
                  ? `No team members match "${debouncedQuery}". Check the spelling or clear your search.`
                  : 'There are no active users in this directory yet.'}
              </p>
              {debouncedQuery ? (
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  className="im-btn im-btn-primary"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <PlusIcon size={16} />
                  Invite Member
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Team Cards Grid */
        <div className="im-team-grid">
          {users.map((user) => {
            const initials = getInitials(user.name);
            const joinedDate = formatJoinedDate(user.createdAt);
            const isAdmin = user.role?.toLowerCase() === 'admin';

            return (
              <div key={user.id} className="im-card" style={{ marginBottom: 0 }}>
                <div className="im-card-body" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <div
                        className="im-avatar-pill"
                        style={{
                          width: 46,
                          height: 46,
                          fontSize: '0.9375rem',
                          marginLeft: 0,
                          background: isAdmin
                            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(37, 99, 235, 0.18))'
                            : 'linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(16, 185, 129, 0.18))',
                          color: 'var(--im-text-primary)',
                          border: '2px solid var(--im-border)',
                        }}
                      >
                        {initials}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h2
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--im-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={user.name}
                        >
                          {user.name}
                        </h2>
                        <span
                          className={`im-role-badge ${isAdmin ? 'im-role-badge-admin' : 'im-role-badge-user'}`}
                        >
                          {user.role || 'user'}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: user.isActive ? 'var(--im-text-secondary)' : 'var(--im-text-muted)',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span
                          className={`im-status-dot ${user.isActive ? 'active' : 'inactive'}`}
                        />
                        <span>{user.isActive ? 'Active Member' : 'Inactive'}</span>
                        {user.isEmailVerified && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--im-primary)',
                              marginLeft: 2,
                              fontWeight: 500,
                            }}
                            title="Email verified"
                          >
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {joinedDate && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--im-text-muted)',
                            marginTop: 2,
                          }}
                        >
                          Joined {joinedDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--im-text-muted)',
                      marginBottom: 16,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={user.email}
                  >
                    {user.email}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="im-btn im-btn-primary im-btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleQuickMeetWith(user)}
                    >
                      <VideoIcon size={14} />
                      Quick Meet
                    </button>
                    <button
                      type="button"
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => handleChatWith(user)}
                      title={`Chat with ${user.name}`}
                    >
                      <ChatIcon size={14} />
                      Chat
                    </button>
                    <button
                      type="button"
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => handleScheduleWith(user)}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls - Right Bottom Side */}
      {users.length > 0 && pagination && (
        <div className="im-pagination">
          <div className="im-pagination-controls">
            {/* Page Limit Selector */}
            <select
              id="team-page-limit"
              className="im-pagination-select"
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                setCurrentPage(1);
              }}
              disabled={isLoading}
              aria-label="Users per page limit"
              title="Users per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            {/* Current Page Indicator */}
            <span className="im-pagination-page-indicator">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>

            {/* Previous and Next Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="im-btn im-btn-secondary im-btn-sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeftIcon size={14} />
                Previous
              </button>

              <button
                type="button"
                className="im-btn im-btn-secondary im-btn-sm"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                aria-label="Next page"
              >
                Next
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <div className="im-modal">
            <div className="im-modal-header">
              <h2 id="invite-title" className="im-modal-title">Invite New Team Member</h2>
              <button
                type="button"
                className="im-modal-close"
                onClick={() => setInviteModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite}>
              <div className="im-modal-body">
                <div className="im-form-group">
                  <label htmlFor="invite-name-input" className="im-form-label">Full Name</label>
                  <input
                    id="invite-name-input"
                    type="text"
                    className="im-input"
                    placeholder="e.g. Jordan Lee"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="im-form-group">
                  <label htmlFor="invite-email-input" className="im-form-label">
                    Work Email <span style={{ color: 'var(--im-danger)' }}>*</span>
                  </label>
                  <input
                    id="invite-email-input"
                    type="email"
                    required
                    className="im-input"
                    placeholder="jordan.lee@intellmeet.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--im-bg-subtle)',
                    borderRadius: 'var(--im-radius-md)',
                    padding: 12,
                    fontSize: '0.8125rem',
                    color: 'var(--im-text-muted)',
                  }}
                >
                  New members will gain access to workspace meeting recordings, AI summaries, and shared channels.
                </div>
              </div>

              <div className="im-modal-footer">
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="im-btn im-btn-primary">
                  Send Workspace Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
