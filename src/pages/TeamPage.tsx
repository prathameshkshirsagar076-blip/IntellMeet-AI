import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import type { TeamMember } from '../types/meeting';
import {
  VideoIcon,
  SearchIcon,
  PlusIcon,
} from '../components/icons';

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamMembers, createMeeting, showToast } = useMeetings();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers;
    const q = searchQuery.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [teamMembers, searchQuery]);

  const handleQuickMeetWith = (member: TeamMember) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const meeting = createMeeting({
      title: `1:1 Sync with ${member.name}`,
      date: todayStr,
      startTime: new Date().toTimeString().slice(0, 5),
      durationMinutes: 30,
      participantsEmails: [member.email],
      isInstant: true,
    });
    showToast(`Instant 1:1 meeting started with ${member.name}!`, 'success');
    navigate(`/meetings/${meeting.id}`);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    showToast(`Invitation sent to ${inviteEmail} (Simulated Demo Action)`, 'success');
    setInviteEmail('');
    setInviteName('');
    setInviteModalOpen(false);
  };

  return (
    <div>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Team Directory & People</h1>
          <p className="im-page-subtitle">
            Collaborate with colleagues, see who is online, and initiate instant 1:1 syncs.
          </p>
        </div>

        <div className="im-page-actions">
          <button className="im-btn im-btn-primary" onClick={() => setInviteModalOpen(true)}>
            <PlusIcon size={16} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Search Bar */}
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
            style={{ paddingLeft: 34, height: 38 }}
            placeholder="Search team by name, role, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search team"
          />
        </div>
      </div>

      {/* Team Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filteredMembers.map((member) => (
          <div key={member.id} className="im-card" style={{ marginBottom: 0 }}>
            <div className="im-card-body" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div className="im-avatar-pill" style={{ width: 46, height: 46, fontSize: '0.9375rem', marginLeft: 0 }}>
                    {member.avatar}
                  </div>
                  {member.isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'var(--im-success)',
                        border: '2px solid var(--im-bg-surface)',
                      }}
                      title="Online"
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--im-text-primary)' }}>
                      {member.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 'var(--im-radius-full)',
                        backgroundColor: 'var(--im-bg-subtle)',
                        color: 'var(--im-text-muted)',
                      }}
                    >
                      {member.department}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-secondary)', marginTop: 2 }}>
                    {member.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    {member.isOnline ? '🟢 Available now' : `⚪ ${member.lastActive || 'Away'}`}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginBottom: 16 }}>
                {member.email}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="im-btn im-btn-primary im-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleQuickMeetWith(member)}
                >
                  <VideoIcon size={14} />
                  Quick Meet
                </button>
                <button
                  className="im-btn im-btn-secondary im-btn-sm"
                  onClick={() => {
                    navigate(`/meetings/new`);
                    showToast(`Prefilled scheduling for ${member.name}`, 'info');
                  }}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="im-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <div className="im-modal">
            <div className="im-modal-header">
              <h2 id="invite-title" className="im-modal-title">Invite New Team Member</h2>
              <button className="im-modal-close" onClick={() => setInviteModalOpen(false)} aria-label="Close dialog">
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
                  <label htmlFor="invite-email-input" className="im-form-label">Work Email <span style={{ color: 'var(--im-danger)' }}>*</span></label>
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
                <button type="button" className="im-btn im-btn-secondary" onClick={() => setInviteModalOpen(false)}>
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
