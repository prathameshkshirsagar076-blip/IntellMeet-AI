import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import {
  VideoIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from '../components/icons';

// Custom icons
const MicIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
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
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
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
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const VideoOffIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
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
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m5 0h5a2 2 0 0 1 2 2v3m0 4 5-3v6l-5-3" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const JoinMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const { user } = useAuth();
  const { meetings, preferences, showToast } = useMeetings();

  // Code input state
  const [meetingInput, setMeetingInput] = useState(codeParam);
  const [inputError, setInputError] = useState<string | null>(null);

  // Lobby device toggles
  const [isMicOn, setIsMicOn] = useState(!preferences.autoMuteOnJoin);
  const [isCameraOn, setIsCameraOn] = useState(!preferences.autoTurnOffCameraOnJoin);
  const [displayName, setDisplayName] = useState(user?.name || 'Guest User');
  const [selectedMic, setSelectedMic] = useState(preferences.microphoneDevice);
  const [selectedCam, setSelectedCam] = useState(preferences.cameraDevice);

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (codeParam) {
      setMeetingInput(codeParam);
    }
  }, [codeParam]);

  const cleanMeetingCode = (input: string) => {
    let clean = input.trim();
    if (clean.includes('/m/')) {
      clean = clean.split('/m/')[1];
    } else if (clean.includes('https://') || clean.includes('http://')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1];
    }
    return clean;
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = cleanMeetingCode(meetingInput);

    if (!targetCode) {
      setInputError('Please enter a valid Meeting ID or link');
      return;
    }

    setInputError(null);
    setIsConnecting(true);

    // Check if matching meeting exists
    const matchedMeeting = meetings.find(
      (m) =>
        m.meetingCode.toLowerCase() === targetCode.toLowerCase() ||
        m.id.toLowerCase() === targetCode.toLowerCase()
    );

    setTimeout(() => {
      setIsConnecting(false);
      if (matchedMeeting) {
        showToast(`Connected to room: "${matchedMeeting.title}"`, 'success');
        navigate(`/meetings/${matchedMeeting.id}`);
      } else {
        // Allow joining with any code in demo mode
        showToast(`Joined session "${targetCode}" in Demo Mode`, 'success');
        navigate(`/meetings/mtg-101`);
      }
    }, 800);
  };

  return (
    <div className="im-lobby-container">
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

      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Join Meeting Lobby</h1>
          <p className="im-page-subtitle">
            Configure your audio and video equipment before stepping into the room.
          </p>
        </div>
      </div>

      <div className="im-lobby-grid">
        {/* Left: Video Preview & Camera / Mic Controls */}
        <div>
          <div className="im-video-preview-box">
            {isCameraOn ? (
              <div className="im-video-live-feed">
                <div className="im-audio-meter-sim">
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>{isMicOn ? 'Microphone Active' : 'Muted'}</span>
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    HD 1080p WebRTC Preview
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div className="im-video-placeholder-avatar">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ marginTop: 12, color: '#94a3b8', fontSize: '0.875rem' }}>
                  Camera is turned off
                </div>
              </div>
            )}

            {/* Floating media toggle overlay */}
            <div className="im-video-controls-overlay">
              <button
                type="button"
                className={`im-media-toggle-btn ${!isMicOn ? 'off' : ''}`}
                onClick={() => setIsMicOn((prev) => !prev)}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
              </button>

              <button
                type="button"
                className={`im-media-toggle-btn ${!isCameraOn ? 'off' : ''}`}
                onClick={() => setIsCameraOn((prev) => !prev)}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? <VideoIcon size={20} /> : <VideoOffIcon size={20} />}
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '12px 16px',
              backgroundColor: 'var(--im-bg-surface)',
              border: '1px solid var(--im-border)',
              borderRadius: 'var(--im-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.8125rem',
              color: 'var(--im-text-muted)',
            }}
          >
            <ShieldCheckIcon size={18} style={{ color: 'var(--im-success)' }} />
            <span>
              <strong>Simulated Demo Environment:</strong> No actual webcam or microphone hardware is accessed or recorded.
            </span>
          </div>
        </div>

        {/* Right: Join Credentials & Device Selection Form */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">Meeting Credentials</h2>
          </div>

          <form onSubmit={handleJoin}>
            <div className="im-card-body">
              {/* Meeting Code */}
              <div className="im-form-group">
                <label htmlFor="join-code" className="im-form-label">
                  Meeting ID or Invite Link <span style={{ color: 'var(--im-danger)' }}>*</span>
                </label>
                <input
                  id="join-code"
                  type="text"
                  className={`im-input ${inputError ? 'error' : ''}`}
                  placeholder="e.g. itm-782-941 or https://intellmeet.ai/m/..."
                  value={meetingInput}
                  onChange={(e) => {
                    setMeetingInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                />
                {inputError && <div className="im-input-error-msg">{inputError}</div>}
              </div>

              {/* Display Name */}
              <div className="im-form-group">
                <label htmlFor="join-name" className="im-form-label">
                  Your Display Name
                </label>
                <input
                  id="join-name"
                  type="text"
                  className="im-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {/* Audio & Video Device Selectors */}
              <div className="im-form-group">
                <label htmlFor="select-mic" className="im-form-label">
                  Microphone Source
                </label>
                <select
                  id="select-mic"
                  className="im-select"
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                >
                  <option value="Built-in Microphone (MacBook Pro)">Built-in Microphone (Studio Quality)</option>
                  <option value="USB Headset (Noise Cancelling)">USB Headset (Noise Cancelling)</option>
                  <option value="AirPods Pro (Spatial Audio)">AirPods Pro (Spatial Audio)</option>
                </select>
              </div>

              <div className="im-form-group">
                <label htmlFor="select-cam" className="im-form-label">
                  Camera Source
                </label>
                <select
                  id="select-cam"
                  className="im-select"
                  value={selectedCam}
                  onChange={(e) => setSelectedCam(e.target.value)}
                >
                  <option value="FaceTime HD Camera (1080p)">FaceTime HD Camera (1080p)</option>
                  <option value="External Ultra-HD 4K Webcam">External Ultra-HD 4K Webcam</option>
                  <option value="Virtual Background Renderer">Virtual Background Renderer</option>
                </select>
              </div>
            </div>

            <div className="im-card-footer" style={{ flexDirection: 'column', gap: 10 }}>
              <button
                type="submit"
                className="im-btn im-btn-primary"
                style={{ width: '100%', height: 42 }}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <span>Connecting to WebRTC Relay...</span>
                ) : (
                  <>
                    <VideoIcon size={18} />
                    Join Demo Meeting
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                By joining, you agree to meeting guidelines and AI auto-transcription policies.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinMeetingPage;
