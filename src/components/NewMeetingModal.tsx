import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import {
  VideoIcon,
  CheckIcon,
  ShieldCheckIcon,
  CalendarIcon,
  SparkleIcon,
} from './icons';
import { getTodayLocalDateString } from '../utils/dateUtils';
import '../styles/newMeetingModal.css';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Local helper SVG icons
const CopySvgIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const MailSvgIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MicSvgIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CamSvgIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createMeeting, updateMeeting, showToast } = useMeetings();

  const userName = user?.name || 'Workspace Host';

  // Real backend credentials
  const [meetingCode, setMeetingCode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [title, setTitle] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Audio/Video & Security toggles (Zoom Green Room)
  const [muteAudioOnJoin, setMuteAudioOnJoin] = useState(true);
  const [turnOffVideoOnJoin, setTurnOffVideoOnJoin] = useState(false);
  const [enableAiTranscription, setEnableAiTranscription] = useState(true);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);

  // Invitees state
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [invitees, setInvitees] = useState<string[]>([]);

  // Copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvitation, setCopiedInvitation] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Pre-create instant meeting directly on backend when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const defaultTitle = `${userName}'s Instant Meeting`;
      setTitle(defaultTitle);
      setInvitees([]);
      setInviteEmailInput('');
      setCopiedLink(false);
      setCopiedInvitation(false);
      setCopiedId(false);
      setCopiedPasscode(false);
      setIsInitializing(true);

      const todayStr = getTodayLocalDateString();
      const nowTime = new Date().toTimeString().slice(0, 5);

      createMeeting({
        title: defaultTitle,
        date: todayStr,
        startTime: nowTime,
        durationMinutes: 45,
        isInstant: true,
      })
        .then((m) => {
          if (!isMounted) return;
          setMeetingId(m.id);
          setMeetingCode(m.meetingCode);
          setPasscode(m.passcode || '');
        })
        .catch(() => {
          // Handled with toast in MeetingContext
        })
        .finally(() => {
          if (isMounted) {
            setIsInitializing(false);
          }
        });
    } else {
      setMeetingId('');
      setMeetingCode('');
      setPasscode('');
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, userName, createMeeting]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Meeting Link URL
  const meetingUrl = useMemo(() => {
    const identifier = meetingId || meetingCode;
    if (!identifier) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/meeting/${identifier}`;
  }, [meetingCode, meetingId]);

  // Copy meeting link handler
  const handleCopyLink = () => {
    if (!meetingUrl || isInitializing) return;
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    showToast('Meeting link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy full Zoom-style invitation
  const handleCopyInvitation = () => {
    if (!meetingUrl || isInitializing) return;
    const today = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const invitationText = `${userName} is inviting you to an IntellMeet video meeting.\n\nTopic: ${title}\nTime: ${today} (Instant Session)\n\nJoin IntellMeet Meeting:\n${meetingUrl}\n\nMeeting ID: ${meetingCode}\nPasscode: ${passcode}\nSecurity: 256-bit AES End-to-End Encrypted`;

    navigator.clipboard.writeText(invitationText);
    setCopiedInvitation(true);
    showToast('Full meeting invitation copied to clipboard!', 'success');
    setTimeout(() => setCopiedInvitation(false), 2000);
  };

  const handleCopyMeetingId = () => {
    if (!meetingCode || isInitializing) return;
    navigator.clipboard.writeText(meetingCode);
    setCopiedId(true);
    showToast(`Meeting ID ${meetingCode} copied!`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPasscode = () => {
    if (!passcode || isInitializing) return;
    navigator.clipboard.writeText(passcode);
    setCopiedPasscode(true);
    showToast('Passcode copied!', 'info');
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  // Add invitee
  const handleAddInvitee = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteEmailInput.trim().toLowerCase();
    if (!trimmed) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    if (invitees.includes(trimmed)) {
      showToast('This email is already added', 'info');
      return;
    }

    setInvitees((prev) => [...prev, trimmed]);
    setInviteEmailInput('');
  };

  const handleRemoveInvitee = (email: string) => {
    setInvitees((prev) => prev.filter((i) => i !== email));
  };

  // Start Meeting Now
  const handleStartMeetingNow = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      let activeMeetingId = meetingId;
      let activeMeetingCode = meetingCode;

      if (!activeMeetingId) {
        const todayStr = getTodayLocalDateString();
        const nowTime = new Date().toTimeString().slice(0, 5);
        const newMeeting = await createMeeting({
          title: title.trim() || `${userName}'s Instant Meeting`,
          date: todayStr,
          startTime: nowTime,
          durationMinutes: 45,
          participantsEmails: invitees,
          isInstant: true,
          passcode: passcode || undefined,
        });
        activeMeetingId = newMeeting.id;
        activeMeetingCode = newMeeting.meetingCode;
      } else if (title.trim() && title.trim() !== `${userName}'s Instant Meeting`) {
        await updateMeeting(activeMeetingId, { title: title.trim() }).catch(() => {});
      }

      onClose();
      showToast(`🚀 Live room prepared! Room ID: ${activeMeetingCode || activeMeetingId}`, 'success');
      navigate(`/meetings/join?code=${activeMeetingCode || activeMeetingId}`);
    } catch {
      // Error is handled with toast in context
    } finally {
      setIsStarting(false);
    }
  };

  const handleScheduleForLater = () => {
    onClose();
    navigate('/meetings/new');
  };

  if (!isOpen) return null;

  return (
    <div
      className="im-new-meeting-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="im-nmm-title"
    >
      <div className="im-new-meeting-modal">
        {/* 1. Modal Header */}
        <div className="im-nmm-header">
          <div className="im-nmm-header-left">
            <div className="im-nmm-camera-badge" aria-hidden="true">
              <VideoIcon size={20} />
            </div>
            <div>
              <h2 id="im-nmm-title" className="im-nmm-title">
                Start a New Meeting
              </h2>
              <p className="im-nmm-subtitle">
                Instant meeting generated • Ready to share and launch
              </p>
            </div>
          </div>

          <button
            type="button"
            className="im-nmm-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="im-nmm-body">
          {/* Topic / Title Field */}
          <div className="im-nmm-topic-group">
            <label htmlFor="im-nmm-topic-input" className="im-nmm-label">
              <span>Meeting Topic</span>
              <span style={{ fontWeight: 500, textTransform: 'none', color: '#0e71eb' }}>
                Instant Workspace
              </span>
            </label>
            <input
              id="im-nmm-topic-input"
              ref={titleInputRef}
              type="text"
              className="im-nmm-topic-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Sync or Architecture Review"
            />
          </div>

          {/* Meeting Link Card (Zoom Style Highlighted Box) */}
          <div className="im-nmm-link-card">
            <div className="im-nmm-link-card-header">
              <span className="im-nmm-label" style={{ margin: 0 }}>
                Direct Meeting Invite Link
              </span>
              <span className="im-nmm-badge-ready">
                <span className="im-nmm-badge-dot" />
                {isInitializing ? 'Connecting...' : 'Ready to Share'}
              </span>
            </div>

            <div className="im-nmm-link-row">
              <div className="im-nmm-link-box" title={meetingUrl || ''}>
                {isInitializing ? 'Generating secure invite link...' : (meetingUrl || 'Generating link...')}
              </div>
              <button
                type="button"
                className={`im-nmm-copy-btn ${copiedLink ? 'copied' : ''}`}
                onClick={handleCopyLink}
                id="im-nmm-copy-link-btn"
                disabled={isInitializing || !meetingUrl}
              >
                {copiedLink ? <CheckIcon size={14} /> : <CopySvgIcon size={14} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="im-nmm-quick-actions">
              <button
                type="button"
                className="im-nmm-sub-action-btn"
                onClick={handleCopyInvitation}
                id="im-nmm-copy-invitation-btn"
                disabled={isInitializing || !meetingUrl}
              >
                {copiedInvitation ? <CheckIcon size={12} /> : <CopySvgIcon size={12} />}
                <span>{copiedInvitation ? 'Invitation Copied!' : 'Copy Full Invitation'}</span>
              </button>
              <button
                type="button"
                className="im-nmm-sub-action-btn"
                onClick={handleScheduleForLater}
              >
                <CalendarIcon size={12} />
                <span>Schedule for Later</span>
              </button>
            </div>
          </div>

          {/* Credentials Grid (Meeting ID & Passcode) */}
          <div className="im-nmm-cred-grid">
            <div className="im-nmm-cred-box">
              <div className="im-nmm-cred-label">Meeting ID</div>
              <div className="im-nmm-cred-val-row">
                <span className="im-nmm-cred-val">{isInitializing ? 'Connecting...' : (meetingCode || '—')}</span>
                <button
                  type="button"
                  className="im-nmm-icon-btn"
                  onClick={handleCopyMeetingId}
                  title="Copy Meeting ID"
                  aria-label="Copy Meeting ID"
                  disabled={isInitializing || !meetingCode}
                >
                  {copiedId ? <CheckIcon size={13} style={{ color: '#059669' }} /> : <CopySvgIcon size={13} />}
                </button>
              </div>
            </div>

            <div className="im-nmm-cred-box">
              <div className="im-nmm-cred-label">Passcode</div>
              <div className="im-nmm-cred-val-row">
                <span className="im-nmm-cred-val">{isInitializing ? 'Connecting...' : (passcode || '—')}</span>
                <button
                  type="button"
                  className="im-nmm-icon-btn"
                  onClick={handleCopyPasscode}
                  title="Copy Passcode"
                  aria-label="Copy Passcode"
                  disabled={isInitializing || !passcode}
                >
                  {copiedPasscode ? <CheckIcon size={13} style={{ color: '#059669' }} /> : <CopySvgIcon size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Invite Participants Section */}
          <div className="im-nmm-invite-section">
            <div className="im-nmm-label">
              <span>Invite Participants by Work Email</span>
              <span>{invitees.length} added</span>
            </div>
            <form onSubmit={handleAddInvitee} className="im-nmm-invite-input-row">
              <input
                type="email"
                className="im-nmm-invite-input"
                placeholder="colleague@company.com"
                value={inviteEmailInput}
                onChange={(e) => setInviteEmailInput(e.target.value)}
              />
              <button type="submit" className="im-nmm-invite-add-btn">
                + Add Invitee
              </button>
            </form>

            {invitees.length > 0 && (
              <div className="im-nmm-chips-wrap">
                {invitees.map((email) => (
                  <span key={email} className="im-nmm-chip">
                    <MailSvgIcon size={11} />
                    <span>{email}</span>
                    <button
                      type="button"
                      className="im-nmm-chip-remove"
                      onClick={() => handleRemoveInvitee(email)}
                      aria-label={`Remove ${email}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Green Room & Meeting Options */}
          <div className="im-nmm-toggles-card">
            <div className="im-nmm-label" style={{ marginBottom: 2 }}>
              Lobby &amp; Device Preferences
            </div>

            <label className="im-nmm-toggle-row">
              <div className="im-nmm-toggle-info">
                <MicSvgIcon size={15} />
                <span>Start with audio muted</span>
              </div>
              <span className="im-nmm-switch">
                <input
                  type="checkbox"
                  checked={muteAudioOnJoin}
                  onChange={(e) => setMuteAudioOnJoin(e.target.checked)}
                />
                <span className="im-nmm-slider" />
              </span>
            </label>

            <label className="im-nmm-toggle-row">
              <div className="im-nmm-toggle-info">
                <CamSvgIcon size={15} />
                <span>Turn off video when joining</span>
              </div>
              <span className="im-nmm-switch">
                <input
                  type="checkbox"
                  checked={turnOffVideoOnJoin}
                  onChange={(e) => setTurnOffVideoOnJoin(e.target.checked)}
                />
                <span className="im-nmm-slider" />
              </span>
            </label>

            <label className="im-nmm-toggle-row">
              <div className="im-nmm-toggle-info">
                <SparkleIcon size={15} style={{ color: '#7c3aed' }} />
                <span>Auto-start AI live transcript &amp; smart summary</span>
              </div>
              <span className="im-nmm-switch">
                <input
                  type="checkbox"
                  checked={enableAiTranscription}
                  onChange={(e) => setEnableAiTranscription(e.target.checked)}
                />
                <span className="im-nmm-slider" />
              </span>
            </label>

            <label className="im-nmm-toggle-row">
              <div className="im-nmm-toggle-info">
                <ShieldCheckIcon size={15} style={{ color: '#059669' }} />
                <span>Enable Waiting Room for guest attendees</span>
              </div>
              <span className="im-nmm-switch">
                <input
                  type="checkbox"
                  checked={enableWaitingRoom}
                  onChange={(e) => setEnableWaitingRoom(e.target.checked)}
                />
                <span className="im-nmm-slider" />
              </span>
            </label>
          </div>
        </div>

        {/* 3. Modal Footer */}
        <div className="im-nmm-footer">
          <div className="im-nmm-footer-left">
            <ShieldCheckIcon size={15} />
            <span>256-bit AES E2E Encryption</span>
          </div>

          <div className="im-nmm-footer-right">
            <button
              type="button"
              className="im-nmm-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="im-nmm-start-btn"
              onClick={handleStartMeetingNow}
              id="im-nmm-start-meeting-now-btn"
              disabled={isStarting}
            >
              <VideoIcon size={18} />
              <span>{isStarting ? 'Launching...' : 'Start Meeting Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMeetingModal;
