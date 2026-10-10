import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import '../styles/liveMeeting.css';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface ReactionParticle {
  id: string;
  emoji: string;
  leftPercent: number;
}

export const LiveMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMeetingById, showToast } = useMeetings();

  // Retrieve meeting info if exists
  const meeting = meetingId ? getMeetingById(meetingId) : undefined;
  const userName = user?.name || 'IntellMeet User';
  const meetingTitle = meeting?.title || `${userName}'s Live Meeting`;
  const meetingCode = meeting?.meetingCode || '810 4560 0551';
  const passcode = 'azL6G7';

  // Audio / Video device states
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Default muted as in screenshot
  const [isVideoOn, setIsVideoOn] = useState(false); // Default video off with avatar photo as in screenshot
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Layout View mode: 'speaker' | 'gallery'
  const [viewMode, setViewMode] = useState<'speaker' | 'gallery'>('speaker');

  // Active Drawers / Overlays
  const [activeDrawer, setActiveDrawer] = useState<'participants' | 'chat' | 'ai' | null>(null);
  const [infoPopupOpen, setInfoPopupOpen] = useState(false);
  const [reactionsTrayOpen, setReactionsTrayOpen] = useState(false);
  const [audioMenuOpen, setAudioMenuOpen] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  const [hostToolsOpen, setHostToolsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // Host Tool Toggles
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowRename, setAllowRename] = useState(true);

  // Floating Reactions
  const [reactions, setReactions] = useState<ReactionParticle[]>([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'IntellMeet AI Assistant',
      text: 'Welcome to your meeting! Real-time transcription and AI meeting summary are active.',
      timestamp: '20:07',
      isSelf: false,
    },
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // AI Live Notes & Transcript State
  const [liveTranscript, setLiveTranscript] = useState<string[]>([
    'Meeting initiated by ' + userName,
    'Audio encryption verified: 256-bit AES End-to-End',
    'AI Companion initialized and ready to take notes...',
  ]);

  useEffect(() => {
    if (!isAudioMuted) {
      const interval = setInterval(() => {
        const phrases = [
          `${userName}: Discussing meeting objectives and deliverables`,
          `AI Companion: Extracted key milestone into summary notes`,
          `${userName}: Audio stream active and encrypted`,
        ];
        const nextPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setLiveTranscript((prev) => [...prev.slice(-5), nextPhrase]);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isAudioMuted, userName]);

  // Video Ref & Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [wbColor, setWbColor] = useState('#0f172a');
  const [wbTool, setWbTool] = useState<'pen' | 'eraser'>('pen');

  // Search input in workplace header
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reaction counter ref for unique deterministic particle keys
  const reactionCounterRef = useRef(0);

  // WebCam Toggle Handling
  useEffect(() => {
    let localStream: MediaStream | null = null;

    if (isVideoOn) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            localStream = stream;
            setMediaStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Camera access not granted or not available:', err);
            showToast('Camera simulation active (hardware not detected)', 'info');
          });
      }
    } else {
      setMediaStream((current) => {
        if (current) {
          current.getTracks().forEach((track) => track.stop());
        }
        return null;
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, showToast]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeDrawer === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeDrawer]);

  // Add floating reaction
  const triggerReaction = (emoji: string) => {
    reactionCounterRef.current += 1;
    const count = reactionCounterRef.current;
    const particleId = `reaction-${count}`;
    const leftPercent = 20 + ((count * 19) % 60);

    const newReaction: ReactionParticle = {
      id: particleId,
      emoji,
      leftPercent,
    };
    setReactions((prev) => [...prev, newReaction]);
    setReactionsTrayOpen(false);

    // Auto remove particle after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== particleId));
    }, 2500);
  };

  // Send Chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      text: chatInputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText('');
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      showToast('Screen sharing stopped', 'info');
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setIsScreenSharing(true);
          showToast('You are sharing your screen', 'success');
          displayStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        } else {
          setIsScreenSharing(true);
          showToast('Screen share simulation active', 'success');
        }
      } catch (err) {
        console.warn('Screen share canceled or not permitted:', err);
      }
    }
  };

  // Whiteboard drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = wbTool === 'eraser' ? 24 : 3;
    ctx.strokeStyle = wbTool === 'eraser' ? '#ffffff' : wbColor;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Copy meeting link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/meeting/${meetingCode.replace(/\s+/g, '')}`;
    navigator.clipboard.writeText(link);
    showToast('Meeting link copied to clipboard!', 'success');
  };

  // End / Leave meeting
  const handleConfirmEnd = () => {
    setEndModalOpen(false);
    showToast('Meeting ended successfully', 'info');
    navigate('/dashboard');
  };

  return (
    <div className="zm-live-meeting-viewport">
      {/* ===================================================================
          1. TOP NAVIGATION HEADER (IntellMeet Workplace Bar)
          =================================================================== */}
      <header className="zm-wp-header">
        <div className="zm-wp-header-left">
          {/* Brand Logo & Workplace Text */}
          <div className="zm-wp-brand" onClick={() => navigate('/dashboard')} title="IntellMeet Home">
            <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/intellmeet-icon.png"
                alt="IntellMeet"
                style={{ width: 24, height: 24, objectFit: 'contain' }}
              />
            </div>
            <div className="zm-wp-brand-name">
              <span className="zm-wp-brand-intell" style={{ color: '#2563eb', fontWeight: 900, fontSize: 20 }}>
                Intell
              </span>
              <span className="zm-wp-brand-meet" style={{ color: '#7c3aed', fontWeight: 900, fontSize: 20 }}>
                Meet
              </span>
              <span className="zm-wp-brand-tag" style={{ color: '#64748b', fontWeight: 600, fontSize: 13, marginLeft: 6 }}>
                Workplace
              </span>
            </div>
          </div>

          {/* Links & Menus */}
          <div className="zm-wp-nav-links">
            <button className="zm-wp-nav-btn" onClick={() => showToast('IntellMeet Workplace Ecosystem', 'info')}>
              Discover Products
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button className="zm-wp-nav-btn" onClick={() => showToast('Enterprise Plans: Active', 'info')}>
              Pricing
            </button>
          </div>

          {/* History Back/Forward Controls */}
          <div className="zm-wp-arrows">
            <button className="zm-wp-arrow-btn" onClick={() => window.history.back()} title="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="zm-wp-arrow-btn" onClick={() => window.history.forward()} title="Forward">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Search Bar with Ctrl+K */}
          <div className="zm-wp-search-bar" onClick={() => searchInputRef.current?.focus()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="zm-wp-kbd">Ctrl+K</span>
          </div>
        </div>

        <div className="zm-wp-header-right">
          <button className="zm-wp-nav-btn" onClick={() => navigate('/settings')}>
            Admin Center
          </button>
          <button className="zm-wp-nav-btn" onClick={() => showToast('Desktop Client version up to date', 'info')}>
            Download
          </button>
          <button
            className="zm-wp-upgrade-btn"
            onClick={() => showToast('You are on IntellMeet Pro Plan', 'success')}
          >
            Upgrade
          </button>

          {/* Notification Bell */}
          <button
            className="zm-wp-arrow-btn"
            onClick={() => showToast('No pending notifications', 'info')}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* User Profile Avatar */}
          <div
            className="zm-wp-avatar-btn"
            onClick={() => navigate('/settings')}
            title={userName}
          >
            <div className="zm-wp-avatar">
              <img
                src="/user-avatar.png"
                alt={userName}
                className="zm-wp-avatar-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="zm-wp-avatar-fallback">
                {userName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'IM'}
              </span>
            </div>
            <span className="zm-wp-status-dot" />
          </div>
        </div>
      </header>

      {/* ===================================================================
          2. MAIN BODY (Narrow Rail + Meeting Stage)
          =================================================================== */}
      <div className="zm-wp-body">
        {/* Left Narrow Workplace Icon Rail */}
        <aside className="zm-wp-rail">
          <div className="zm-wp-rail-top">
            <button className="zm-wp-rail-item" onClick={() => navigate('/dashboard')} title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </button>

            <button
              className={`zm-wp-rail-item ${activeDrawer === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
              title="Team Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Chat</span>
            </button>

            <button className="zm-wp-rail-item active" title="Active Meeting">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Meetings</span>
            </button>

            <button
              className="zm-wp-rail-item"
              onClick={() => setActiveDrawer(activeDrawer === 'participants' ? null : 'participants')}
              title="Contacts & People"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Contacts</span>
            </button>
          </div>

          <div className="zm-wp-rail-bottom">
            <button className="zm-wp-rail-item" onClick={() => navigate('/settings')} title="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* ===================================================================
            3. MEETING STAGE & CONTROLS
            =================================================================== */}
        <main className="zm-call-container">
          {/* Sub-Header inside meeting */}
          <div className="zm-call-topbar">
            <div className="zm-call-topbar-left">
              {/* Meeting Info Button (i) */}
              <button
                className="zm-call-info-btn"
                onClick={() => setInfoPopupOpen(!infoPopupOpen)}
                title="Meeting Information"
              >
                i
              </button>

              {/* Title */}
              <div className="zm-call-title">
                <span>{meetingTitle}</span>
              </div>
            </div>

            <div className="zm-call-topbar-right">
              {/* Green Verified Security Shield */}
              <button
                className="zm-call-top-btn zm-call-top-shield"
                onClick={() => setInfoPopupOpen(!infoPopupOpen)}
                title="Enhanced 256-bit encryption verified"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#10b981">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </button>

              {/* Whiteboard Pen */}
              <button
                className={`zm-call-top-btn ${whiteboardOpen ? 'active' : ''}`}
                onClick={() => setWhiteboardOpen(!whiteboardOpen)}
                title="Whiteboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </button>

              {/* Fullscreen Expand Button */}
              <button
                className="zm-call-top-btn"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                title="Toggle Fullscreen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>

              {/* View Switcher (Speaker vs Gallery) */}
              <button
                className="zm-call-top-btn"
                onClick={() => setViewMode(viewMode === 'speaker' ? 'gallery' : 'speaker')}
                title={viewMode === 'speaker' ? 'Switch to Gallery View' : 'Switch to Speaker View'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>

              {/* im tag */}
              <div className="zm-call-zm-badge" title="IntellMeet Meeting">
                im
              </div>
            </div>
          </div>

          {/* Meeting Info Popover Card */}
          {infoPopupOpen && (
            <div className="zm-meeting-info-card">
              <div className="zm-info-row">
                <span className="zm-info-label">Meeting Topic</span>
                <span className="zm-info-val">{meetingTitle}</span>
              </div>
              <div className="zm-info-row">
                <span className="zm-info-label">Meeting ID</span>
                <span className="zm-info-val" style={{ letterSpacing: '1px' }}>
                  {meetingCode}
                </span>
              </div>
              <div className="zm-info-row">
                <span className="zm-info-label">Host</span>
                <span className="zm-info-val">{userName}</span>
              </div>
              <div className="zm-info-row">
                <span className="zm-info-label">Passcode</span>
                <span className="zm-info-val">{passcode}</span>
              </div>
              <div className="zm-info-row">
                <span className="zm-info-label">Numeric Passcode</span>
                <span className="zm-info-val">284910</span>
              </div>
              <div className="zm-info-row">
                <span className="zm-info-label">Encryption</span>
                <span className="zm-info-val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  Enhanced 256-bit AES End-to-End
                </span>
              </div>
              <button className="zm-copy-link-btn" onClick={handleCopyLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Invite Link
              </button>
            </div>
          )}

          {/* Central Stage Body */}
          <div className="zm-stage-body">
            {/* Screen Share Alert Banner */}
            {isScreenSharing && (
              <div className="zm-screen-share-banner">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1s infinite' }} />
                  You are sharing your screen
                </span>
                <button className="zm-stop-share-btn" onClick={handleToggleScreenShare}>
                  Stop Share
                </button>
              </div>
            )}

            {/* Floating Reactions Stream */}
            <div className="zm-floating-reactions-layer">
              {reactions.map((r) => (
                <span
                  key={r.id}
                  className="zm-floating-emoji"
                  style={{ left: `${r.leftPercent}%`, bottom: '20px' }}
                >
                  {r.emoji}
                </span>
              ))}
            </div>

            {/* Hand Raised Floating Indicator */}
            {isHandRaised && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  background: 'rgba(245, 158, 11, 0.95)',
                  color: '#000',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 22,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                }}
              >
                <span>✋</span> Hand Raised
              </div>
            )}

            {/* Whiteboard Overlay */}
            {whiteboardOpen && (
              <div className="zm-whiteboard-overlay">
                <div className="zm-wb-toolbar">
                  <div className="zm-wb-tools">
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginRight: 10 }}>
                      IntellMeet Whiteboard
                    </span>
                    <button
                      className={`zm-wb-tool-btn ${wbTool === 'pen' ? 'active' : ''}`}
                      onClick={() => setWbTool('pen')}
                    >
                      ✏️ Pen
                    </button>
                    <button
                      className={`zm-wb-tool-btn ${wbTool === 'eraser' ? 'active' : ''}`}
                      onClick={() => setWbTool('eraser')}
                    >
                      🧹 Eraser
                    </button>
                    <input
                      type="color"
                      value={wbColor}
                      onChange={(e) => setWbColor(e.target.value)}
                      title="Pen Color"
                      style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <button className="zm-wb-tool-btn" onClick={clearWhiteboard}>
                      Clear Canvas
                    </button>
                  </div>
                  <button className="zm-wb-tool-btn" onClick={() => setWhiteboardOpen(false)}>
                    Close ✕
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={1400}
                  height={800}
                  className="zm-wb-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            )}

            {/* Stage View: Speaker vs Gallery */}
            <div className="zm-video-main-stage">
              {viewMode === 'speaker' ? (
                /* Speaker View — Zoom Centered Layout */
                <div className="zm-speaker-tile">
                  {isVideoOn ? (
                    <video ref={videoRef} autoPlay playsInline muted className="zm-live-video-element" />
                  ) : (
                    /* Zoom Centered User Photo / Avatar */
                    <div className="zm-center-avatar-box">
                      <img
                        src="/user-avatar.png"
                        alt={userName}
                        className="zm-center-avatar-img"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                    </div>
                  )}

                  {/* Speaker Tag Pill (Bottom Left of Video Tile) */}
                  <div className="zm-speaker-tag">
                    {isAudioMuted ? (
                      <span className="zm-speaker-mic-red" title="Muted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </span>
                    ) : (
                      <span className="zm-speaker-mic-green" title="Unmuted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </span>
                    )}
                    <span>{userName}</span>
                  </div>
                </div>
              ) : (
                /* Gallery View — 2x2 Grid Layout */
                <div className="zm-gallery-grid">
                  {/* Tile 1: You */}
                  <div className={`zm-gallery-tile ${!isAudioMuted ? 'speaking' : ''}`}>
                    {isVideoOn ? (
                      <video ref={videoRef} autoPlay playsInline muted className="zm-live-video-element" />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                        alt={userName}
                        style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div className="zm-speaker-tag">
                      <span className={isAudioMuted ? 'zm-speaker-mic-red' : 'zm-speaker-mic-green'}>
                        {isAudioMuted ? '🔇' : '🎙️'}
                      </span>
                      <span>{userName} (Me)</span>
                    </div>
                  </div>

                  {/* Tile 2: IntellMeet AI NoteTaker */}
                  <div className="zm-gallery-tile">
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 34,
                      }}
                    >
                      ✨
                    </div>
                    <div className="zm-speaker-tag">
                      <span className="zm-speaker-mic-green">🎙️</span>
                      <span>IntellMeet AI Assistant</span>
                    </div>
                  </div>

                  {/* Tile 3: Sarah Jenkins */}
                  <div className="zm-gallery-tile">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                      alt="Sarah Jenkins"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="zm-speaker-tag">
                      <span className="zm-speaker-mic-red">🔇</span>
                      <span>Sarah Jenkins (Product)</span>
                    </div>
                  </div>

                  {/* Tile 4: Michael Chen */}
                  <div className="zm-gallery-tile">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                      alt="Michael Chen"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="zm-speaker-tag">
                      <span className="zm-speaker-mic-red">🔇</span>
                      <span>Michael Chen (Tech Lead)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================================
                DRAWERS (Participants, Chat, AI Notes)
                =================================================================== */}
            {/* 1. Participants Drawer */}
            {activeDrawer === 'participants' && (
              <aside className="zm-side-drawer">
                <div className="zm-drawer-header">
                  <span className="zm-drawer-title">Participants (2)</span>
                  <button className="zm-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                    ✕
                  </button>
                </div>
                <div className="zm-drawer-body">
                  {/* You */}
                  <div className="zm-participant-row">
                    <div className="zm-participant-info">
                      <div className="zm-p-avatar">
                        {userName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="zm-p-name">
                          {userName}
                          <span className="zm-p-tag">(Host, me)</span>
                        </div>
                      </div>
                    </div>
                    <div className="zm-p-status">
                      <span>{isAudioMuted ? '🔇' : '🎙️'}</span>
                      <span>{isVideoOn ? '📹' : '🚫'}</span>
                    </div>
                  </div>

                  {/* AI Assistant */}
                  <div className="zm-participant-row">
                    <div className="zm-participant-info">
                      <div className="zm-p-avatar" style={{ background: '#7c3aed' }}>
                        AI
                      </div>
                      <div>
                        <div className="zm-p-name">
                          IntellMeet AI
                          <span className="zm-p-tag">(Companion)</span>
                        </div>
                      </div>
                    </div>
                    <div className="zm-p-status">
                      <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 600 }}>Active</span>
                    </div>
                  </div>
                </div>
                <div className="zm-drawer-footer">
                  <button className="zm-drawer-btn" onClick={handleCopyLink}>
                    Invite
                  </button>
                  <button
                    className="zm-drawer-btn"
                    onClick={() => {
                      setIsAudioMuted(true);
                      showToast('All participants muted', 'info');
                    }}
                  >
                    Mute All
                  </button>
                </div>
              </aside>
            )}

            {/* 2. Chat Drawer */}
            {activeDrawer === 'chat' && (
              <aside className="zm-side-drawer">
                <div className="zm-drawer-header">
                  <span className="zm-drawer-title">Meeting Chat</span>
                  <button className="zm-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                    ✕
                  </button>
                </div>
                <div className="zm-drawer-body">
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    To: <strong>Everyone ⌄</strong>
                  </div>
                  <div className="zm-chat-messages">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="zm-chat-msg">
                        <div className="zm-chat-msg-header">
                          <span className="zm-chat-sender">{msg.sender}</span>
                          <span className="zm-chat-time">{msg.timestamp}</span>
                        </div>
                        <div className="zm-chat-bubble">{msg.text}</div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                </div>
                <form className="zm-chat-input-bar" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="zm-chat-input"
                    placeholder="Type message here..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                  />
                  <button type="submit" className="zm-chat-send-btn">
                    Send
                  </button>
                </form>
              </aside>
            )}

            {/* 3. AI Companion Drawer */}
            {activeDrawer === 'ai' && (
              <aside className="zm-side-drawer">
                <div className="zm-drawer-header">
                  <span className="zm-drawer-title" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c084fc' }}>
                    ✨ AI Companion & Notes
                  </span>
                  <button className="zm-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                    ✕
                  </button>
                </div>
                <div className="zm-drawer-body">
                  <div style={{ background: 'rgba(168,85,247,0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(168,85,247,0.2)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e9d5ff', marginBottom: 4 }}>
                      Live AI Meeting Assistant
                    </div>
                    <div style={{ fontSize: 11.5, color: '#cbd5e1' }}>
                      Capturing transcript, action items, and generating intelligent executive minutes in real time.
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 10 }}>
                    Live Transcript Feed
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#f1f5f9' }}>
                    {liveTranscript.map((t, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                        • {t}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 14 }}>
                    Extracted Action Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Review IntellMeet Workplace interface components</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Verify 256-bit AES encryption & media stream</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span>Distribute meeting notes and AI summary</span>
                    </label>
                  </div>
                </div>
                <div className="zm-drawer-footer">
                  <button
                    className="zm-drawer-btn"
                    onClick={() => {
                      const notes = `IntellMeet Meeting Summary\nTopic: ${meetingTitle}\nHost: ${userName}\nDate: ${new Date().toLocaleDateString()}\n\nHighlights:\n- Real-time IntellMeet intelligence delivered\n- Live audio/video and whiteboard interactive controls operational.`;
                      navigator.clipboard.writeText(notes);
                      showToast('AI meeting summary copied!', 'success');
                    }}
                  >
                    Copy AI Summary
                  </button>
                </div>
              </aside>
            )}
          </div>

          {/* ===================================================================
              4. BOTTOM MEETING CONTROLS DOCK (Zoom Exact Layout)
              =================================================================== */}
          <footer className="zm-bottom-dock">
            {/* Dock Left: Mute/Unmute & Video */}
            <div className="zm-dock-left">
              {/* Unmute / Mute */}
              <div className="zm-dock-btn-group">
                <button
                  className="zm-dock-btn"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  title={isAudioMuted ? 'Unmute (Alt+A)' : 'Mute (Alt+A)'}
                >
                  <div className="zm-dock-btn-icon">
                    {isAudioMuted ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    )}
                  </div>
                  <span className="zm-dock-btn-label">{isAudioMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button
                  className="zm-dock-chevron-btn"
                  onClick={() => setAudioMenuOpen(!audioMenuOpen)}
                  title="Audio Settings"
                >
                  ^
                </button>

                {/* Audio Settings Menu */}
                {audioMenuOpen && (
                  <div className="zm-dock-menu">
                    <span className="zm-dock-menu-title">Select a Microphone</span>
                    <button className="zm-dock-menu-item active" onClick={() => setAudioMenuOpen(false)}>
                      ✓ Default - Built-in Microphone
                    </button>
                    <button className="zm-dock-menu-item" onClick={() => setAudioMenuOpen(false)}>
                      External USB Headset
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <span className="zm-dock-menu-title">Select a Speaker</span>
                    <button className="zm-dock-menu-item active" onClick={() => setAudioMenuOpen(false)}>
                      ✓ Default - Built-in Speakers
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setAudioMenuOpen(false);
                        showToast('Testing audio speaker tone...', 'info');
                      }}
                    >
                      Test Speaker & Microphone...
                    </button>
                  </div>
                )}
              </div>

              {/* Start Video / Stop Video */}
              <div className="zm-dock-btn-group">
                <button
                  className="zm-dock-btn"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  title={isVideoOn ? 'Stop Video (Alt+V)' : 'Start Video (Alt+V)'}
                >
                  <div className="zm-dock-btn-icon">
                    {isVideoOn ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1m5 0h5a2 2 0 0 1 2 2v3m0 4 5-3v6l-5-3" />
                      </svg>
                    )}
                  </div>
                  <span className="zm-dock-btn-label">{isVideoOn ? 'Stop Video' : 'Video'}</span>
                </button>
                <button
                  className="zm-dock-chevron-btn"
                  onClick={() => setVideoMenuOpen(!videoMenuOpen)}
                  title="Video Settings"
                >
                  ^
                </button>

                {/* Video Settings Menu */}
                {videoMenuOpen && (
                  <div className="zm-dock-menu">
                    <span className="zm-dock-menu-title">Select a Camera</span>
                    <button className="zm-dock-menu-item active" onClick={() => setVideoMenuOpen(false)}>
                      ✓ Integrated HD Webcam (720p)
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setVideoMenuOpen(false);
                        showToast('Virtual Background: Studio Blur applied', 'success');
                      }}
                    >
                      Choose Virtual Background...
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setVideoMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      Video Settings...
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dock Center: Participants, Chat, React, Share, Host Tools, AI Companion, More */}
            <div className="zm-dock-center">
              {/* Participants */}
              <div className="zm-dock-btn-group">
                <button
                  className={`zm-dock-btn ${activeDrawer === 'participants' ? 'active' : ''}`}
                  onClick={() => setActiveDrawer(activeDrawer === 'participants' ? null : 'participants')}
                >
                  <div className="zm-dock-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="zm-dock-badge">1</span>
                  </div>
                  <span className="zm-dock-btn-label">Participants</span>
                </button>
                <button className="zm-dock-chevron-btn" onClick={handleCopyLink} title="Invite link">
                  ^
                </button>
              </div>

              {/* Chat */}
              <button
                className={`zm-dock-btn ${activeDrawer === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
              >
                <div className="zm-dock-btn-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="zm-dock-btn-label">Chat</span>
              </button>

              {/* React */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`zm-dock-btn ${reactionsTrayOpen ? 'active' : ''}`}
                  onClick={() => setReactionsTrayOpen(!reactionsTrayOpen)}
                >
                  <div className="zm-dock-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <span className="zm-dock-btn-label">React</span>
                </button>

                {/* Reactions Popover Tray */}
                {reactionsTrayOpen && (
                  <div className="zm-reactions-tray">
                    {['👏', '👍', '❤️', '😂', '😮', '🎉'].map((emoji) => (
                      <button
                        key={emoji}
                        className="zm-reaction-emoji-btn"
                        onClick={() => triggerReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      className="zm-raise-hand-btn"
                      onClick={() => {
                        setIsHandRaised(!isHandRaised);
                        setReactionsTrayOpen(false);
                        showToast(isHandRaised ? 'Hand lowered' : 'Hand raised', 'info');
                      }}
                    >
                      ✋ {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                    </button>
                  </div>
                )}
              </div>

              {/* Share Screen (Zoom iconic Green Button) */}
              <div className="zm-dock-btn-group">
                <button
                  className="zm-dock-btn zm-dock-btn-share"
                  onClick={handleToggleScreenShare}
                >
                  <div className="zm-dock-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <polyline points="17 11 12 6 7 11" />
                      <line x1="12" y1="6" x2="12" y2="18" />
                      <rect x="4" y="2" width="16" height="20" rx="3" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  <span className="zm-dock-btn-label">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
                </button>
                <button
                  className="zm-dock-chevron-btn"
                  onClick={handleToggleScreenShare}
                  title="Screen Share Options"
                >
                  ^
                </button>
              </div>

              {/* Host Tools / Security */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`zm-dock-btn ${hostToolsOpen ? 'active' : ''}`}
                  onClick={() => setHostToolsOpen(!hostToolsOpen)}
                >
                  <div className="zm-dock-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="zm-dock-btn-label">Host tools</span>
                </button>

                {/* Host Tools Popover */}
                {hostToolsOpen && (
                  <div className="zm-dock-menu" style={{ width: 260 }}>
                    <span className="zm-dock-menu-title">Security & Host Controls</span>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setMeetingLocked(!meetingLocked);
                        showToast(meetingLocked ? 'Meeting unlocked' : 'Meeting locked', 'info');
                      }}
                    >
                      <span>Lock Meeting</span>
                      <span>{meetingLocked ? '✓' : ''}</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setWaitingRoomEnabled(!waitingRoomEnabled);
                        showToast(waitingRoomEnabled ? 'Waiting room disabled' : 'Waiting room enabled', 'info');
                      }}
                    >
                      <span>Enable Waiting Room</span>
                      <span>{waitingRoomEnabled ? '✓' : ''}</span>
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <span className="zm-dock-menu-title">Allow Participants to:</span>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => setAllowChat(!allowChat)}
                    >
                      <span>Chat</span>
                      <span>{allowChat ? '✓' : ''}</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => setAllowRename(!allowRename)}
                    >
                      <span>Rename Themselves</span>
                      <span>{allowRename ? '✓' : ''}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* More (...) */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`zm-dock-btn ${moreMenuOpen ? 'active' : ''}`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  title="More Options"
                >
                  <div className="zm-dock-btn-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="8" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="16" cy="12" r="1.2" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="zm-dock-btn-label">More</span>
                </button>

                {/* More Menu Dropdown */}
                {moreMenuOpen && (
                  <div className="zm-dock-menu">
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setActiveDrawer('ai');
                      }}
                    >
                      <span>✨ AI Companion & Notes</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setWhiteboardOpen(true);
                      }}
                    >
                      <span>Open Whiteboard</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        showToast('Cloud recording started', 'success');
                      }}
                    >
                      <span>Record to Cloud</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        if (!document.fullscreenElement) {
                          document.documentElement.requestFullscreen();
                        } else {
                          document.exitFullscreen();
                        }
                      }}
                    >
                      <span>Toggle Full Screen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dock Right: End Button (Zoom Iconic Red Circle ✕) */}
            <div className="zm-dock-right">
              <button
                className="zm-dock-btn zm-dock-end-btn"
                onClick={() => setEndModalOpen(true)}
                title="End Meeting"
              >
                <div className="zm-dock-end-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <span className="zm-dock-btn-label">End</span>
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* ===================================================================
          5. END MEETING CONFIRMATION MODAL
          =================================================================== */}
      {endModalOpen && (
        <div className="zm-dialog-backdrop" onClick={() => setEndModalOpen(false)}>
          <div className="zm-dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="zm-dialog-title">End Meeting</h3>
            <p className="zm-dialog-desc">
              Would you like to end the meeting for all participants or simply leave the session?
            </p>
            <div className="zm-dialog-actions">
              <button className="zm-dialog-btn-danger" onClick={handleConfirmEnd}>
                End Meeting for All
              </button>
              <button
                className="zm-dialog-btn-secondary"
                onClick={() => {
                  setEndModalOpen(false);
                  showToast('You left the meeting', 'info');
                  navigate('/dashboard');
                }}
              >
                Leave Meeting
              </button>
              <button className="zm-dialog-btn-cancel" onClick={() => setEndModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeetingRoomPage;
