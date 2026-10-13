import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import { meetingApi } from '../api/meeting.api';
import { getStoredUser } from '../utils/tokenStorage';
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
  const codeParam = searchParams.get('code') || searchParams.get('id') || '';
  const { user } = useAuth();
  const { meetings, preferences, showToast } = useMeetings();

  // Code input state
  const [meetingInput, setMeetingInput] = useState(codeParam);
  const [inputError, setInputError] = useState<string | null>(null);

  // User display name from account or fallback
  const storedUser = useMemo(() => getStoredUser(), []);
  const initialName = user?.name || storedUser?.name || (user?.email ? user.email.split('@')[0] : 'Guest User');
  const [displayName, setDisplayName] = useState(initialName);

  // Sync displayName when user object loads
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

  // Media Hardware State
  const [isMicOn, setIsMicOn] = useState(!preferences.autoMuteOnJoin);
  const [isCameraOn, setIsCameraOn] = useState(!preferences.autoTurnOffCameraOnJoin);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Hardware device lists
  const [availableMics, setAvailableMics] = useState<{ id: string; label: string }[]>([]);
  const [availableCams, setAvailableCams] = useState<{ id: string; label: string }[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedCamId, setSelectedCamId] = useState<string>('');

  const [isConnecting, setIsConnecting] = useState(false);

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Find meeting if code is provided
  const targetMeeting = useMemo(() => {
    if (!meetingInput.trim()) return null;
    const clean = cleanMeetingCode(meetingInput).toLowerCase();
    return (
      meetings.find(
        (m) => m.meetingCode.toLowerCase() === clean || m.id.toLowerCase() === clean
      ) || null
    );
  }, [meetingInput, meetings]);

  // Enumerate hardware devices
  const enumerateHardware = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          id: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
        }));
      const cams = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          id: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));

      if (mics.length > 0) {
        setAvailableMics(mics);
        if (!selectedMicId) setSelectedMicId(mics[0].id);
      }
      if (cams.length > 0) {
        setAvailableCams(cams);
        if (!selectedCamId) setSelectedCamId(cams[0].id);
      }
    } catch (err) {
      console.warn('[Lobby] Hardware enumerate error:', err);
    }
  }, [selectedMicId, selectedCamId]);

  // Start & manage camera / mic hardware stream
  const initMediaStream = useCallback(async () => {
    setCameraError(null);

    // If both camera and mic are turned off, stop existing stream
    if (!isCameraOn && !isMicOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('WebRTC is not supported in this browser environment.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: isCameraOn
          ? selectedCamId
            ? { deviceId: { exact: selectedCamId } }
            : true
          : false,
        audio: isMicOn
          ? selectedMicId
            ? { deviceId: { exact: selectedMicId } }
            : true
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Clean up previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = stream;

      // Bind to video element
      if (videoRef.current) {
        if (isCameraOn) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.srcObject = null;
        }
      }

      // Populate hardware labels once permission is granted
      enumerateHardware();
    } catch (err: unknown) {
      console.warn('[Lobby] MediaStream access error:', err);
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('Camera / Microphone permission denied. Please allow access in browser settings.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setCameraError('No webcam or microphone detected on this computer.');
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setCameraError('Webcam or microphone is currently in use by another application.');
      } else {
        setCameraError('Unable to open camera hardware. You can still proceed to join.');
      }
    }
  }, [isCameraOn, isMicOn, selectedCamId, selectedMicId, enumerateHardware]);

  // Initialize and reconfigure media whenever camera/mic/device changes
  useEffect(() => {
    initMediaStream();
  }, [initMediaStream]);

  // Clean up all hardware tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Media toggle handlers
  const handleToggleCamera = () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    if (!nextState && streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleToggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = cleanMeetingCode(meetingInput);

    if (!targetCode) {
      setInputError('Please enter a valid Meeting ID or link');
      return;
    }

    setInputError(null);
    setIsConnecting(true);

    // Stop local lobby tracks before handing over to Live Meeting room
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const queryParams = `?lobby=1&video=${isCameraOn}&audio=${isMicOn}&name=${encodeURIComponent(displayName.trim() || 'Participant')}`;

    try {
      const res = await meetingApi.getMeetingById(targetCode);
      const meetingData = res?.data;
      const destinationId = meetingData?.id || meetingData?._id || targetCode;
      showToast(`Connected to meeting: "${meetingData?.title || targetCode}"`, 'success');
      navigate(`/meeting/${destinationId}${queryParams}`);
    } catch {
      const matched = meetings.find(
        (m) =>
          m.meetingCode.toLowerCase() === targetCode.toLowerCase() ||
          m.id.toLowerCase() === targetCode.toLowerCase()
      );
      if (matched) {
        showToast(`Connected to room: "${matched.title}"`, 'success');
        navigate(`/meeting/${matched.id}${queryParams}`);
      } else {
        showToast(`Joined session "${targetCode}" in Live Room`, 'info');
        navigate(`/meeting/${targetCode}${queryParams}`);
      }
    } finally {
      setIsConnecting(false);
    }
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
            {/* Live Camera Feed */}
            {isCameraOn && !cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="im-video-preview-element"
                aria-label="Webcam Preview"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div className="im-video-placeholder-avatar">
                  {(displayName || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ marginTop: 14, color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem' }}>
                  {displayName}
                </div>
                <div style={{ marginTop: 4, color: '#94a3b8', fontSize: '0.825rem' }}>
                  {cameraError ? cameraError : 'Camera is turned off'}
                </div>
              </div>
            )}

            {/* Audio Status Pill */}
            <div className={`im-audio-meter-sim ${!isMicOn ? 'muted' : ''}`}>
              <span className={`im-audio-pulse-dot ${!isMicOn ? 'muted' : ''}`} />
              <span>{isMicOn ? 'Microphone Active' : 'Microphone Muted'}</span>
            </div>

            {/* User Name Badge on Live Feed */}
            {isCameraOn && !cameraError && (
              <div className="im-video-user-pill">
                <span>{displayName}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                  (Preview)
                </span>
              </div>
            )}

            {/* Floating media toggle overlay */}
            <div className="im-video-controls-overlay">
              <button
                type="button"
                className={`im-media-toggle-btn ${!isMicOn ? 'off' : ''}`}
                onClick={handleToggleMic}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
              </button>

              <button
                type="button"
                className={`im-media-toggle-btn ${!isCameraOn ? 'off' : ''}`}
                onClick={handleToggleCamera}
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
              <strong>Hardware Ready:</strong> Real-time WebRTC audio and video verified. You can toggle audio or video anytime during the session.
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
              {/* Meeting Info Card if known meeting */}
              {targetMeeting && (
                <div className="im-lobby-meeting-card">
                  <div className="im-lobby-meeting-tag">Ready to Join</div>
                  <h3 className="im-lobby-meeting-title">{targetMeeting.title}</h3>
                  <div className="im-lobby-meeting-meta">
                    <span>Host: <strong>{targetMeeting.organizer.name}</strong></span>
                    <span>•</span>
                    <span>{targetMeeting.date} ({targetMeeting.startTime})</span>
                    <span>•</span>
                    <span className={`im-badge im-badge-${targetMeeting.status}`}>
                      {targetMeeting.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Meeting Code */}
              <div className="im-form-group">
                <label htmlFor="join-code" className="im-form-label">
                  Meeting ID or Invite Link <span style={{ color: 'var(--im-danger)' }}>*</span>
                </label>
                <input
                  id="join-code"
                  type="text"
                  className={`im-input ${inputError ? 'error' : ''}`}
                  placeholder="e.g. Meeting ID or invite link"
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
                  Your Display Name <span style={{ color: 'var(--im-danger)' }}>*</span>
                </label>
                <input
                  id="join-name"
                  type="text"
                  className="im-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  required
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
                  value={selectedMicId}
                  onChange={(e) => setSelectedMicId(e.target.value)}
                >
                  {availableMics.length > 0 ? (
                    availableMics.map((mic) => (
                      <option key={mic.id} value={mic.id}>
                        {mic.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="default-mic">System Default Microphone</option>
                      <option value="built-in-mic">Built-in Studio Microphone</option>
                    </>
                  )}
                </select>
              </div>

              <div className="im-form-group">
                <label htmlFor="select-cam" className="im-form-label">
                  Camera Source
                </label>
                <select
                  id="select-cam"
                  className="im-select"
                  value={selectedCamId}
                  onChange={(e) => setSelectedCamId(e.target.value)}
                >
                  {availableCams.length > 0 ? (
                    availableCams.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="default-cam">Integrated HD Camera (1080p)</option>
                      <option value="external-cam">External USB HD Webcam</option>
                    </>
                  )}
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
                  <span>Connecting to Live Room...</span>
                ) : (
                  <>
                    <VideoIcon size={18} />
                    {targetMeeting ? `Join "${targetMeeting.title.slice(0, 20)}"` : 'Join Meeting'}
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
