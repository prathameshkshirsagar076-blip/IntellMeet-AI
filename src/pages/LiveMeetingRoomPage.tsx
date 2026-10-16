import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings, mapBackendMeeting } from '../context/MeetingContext';
import { meetingApi } from '../api/meeting.api';
import { meetingSocketService } from '../services/meetingSocket.service';
import { toast as globalToast } from '../components/toast/toast';
import { getStoredUser } from '../utils/tokenStorage';
import { UserAvatar } from '../components/common/UserAvatar';
import { BrandIcon } from '../components/icons';
import type { RemotePeer, Meeting, MeetingMessageItem, ActionItem } from '../types/meeting';
import '../styles/liveMeeting.css';

interface ChatMessage {
  id: string;
  clientMessageId?: string;
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

const RemoteVideoTile: React.FC<{ peer: RemotePeer; peerAvatar?: string }> = ({ peer, peerAvatar }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = (peer.isVideoOn || peer.isScreenSharing) && Boolean(peer.stream);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream, hasVideo, peer.isVideoOn, peer.isScreenSharing]);

  return (
    <div className={`zm-gallery-tile ${!peer.isAudioMuted ? 'speaking' : ''}`}>
      {hasVideo ? (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && peer.stream) {
              el.srcObject = peer.stream;
            }
          }}
          autoPlay
          playsInline
          className="zm-live-video-element"
        />
      ) : (
        <UserAvatar
          avatar={peer.avatar || peerAvatar}
          name={peer.name}
          size={84}
          className="zm-gallery-avatar"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.15)',
          }}
        />
      )}
      <div className="zm-speaker-tag">
        <span className={peer.isAudioMuted ? 'zm-speaker-mic-red' : 'zm-speaker-mic-green'}>
          {peer.isAudioMuted ? '🔇' : '🎙️'}
        </span>
        <span>
          {peer.name} {peer.role === 'host' ? '(Host)' : ''} {peer.isScreenSharing ? '🖥️ (Screen)' : ''}
        </span>
      </div>
    </div>
  );
};

export const LiveMeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { getMeetingById, showToast } = useMeetings();

  // Lobby parameters
  const cameFromLobby = searchParams.get('lobby') === '1' || searchParams.get('lobby') === 'true';
  const initialVideo = searchParams.get('video') === 'true';
  const initialAudioMuted = searchParams.get('audio') === 'false';
  const initialDisplayName = searchParams.get('name') || user?.name || 'IntellMeet User';

  // Enforce lobby requirement: redirect to lobby if accessing directly without having passed through lobby
  useEffect(() => {
    if (!cameFromLobby && meetingId) {
      navigate(`/meetings/join?code=${meetingId}`, { replace: true });
    }
  }, [cameFromLobby, meetingId, navigate]);

  // Meeting states
  const [realMeeting, setRealMeeting] = useState<Meeting | null>(
    meetingId ? getMeetingById(meetingId) || null : null
  );
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);

  const storedUser = React.useMemo(() => getStoredUser(), []);
  const userName = initialDisplayName || user?.name || storedUser?.name || 'IntellMeet User';
  const userAvatar = user?.avatar || storedUser?.avatar;
  const meetingTitle = realMeeting?.title || (meetingId ? `Meeting: ${meetingId}` : `${userName}'s Live Meeting`);
  const meetingCode = realMeeting?.meetingCode || meetingId || '';
  const lobbyPasscode = searchParams.get('passcode') || '';
  const passcode = lobbyPasscode || realMeeting?.passcode || '';
  const isHost = Boolean(
    realMeeting &&
      (realMeeting.organizer?.id === user?.id ||
        (realMeeting as unknown as { organizerId?: { _id?: string; id?: string } | string }).organizerId === user?.id ||
        (typeof (realMeeting as unknown as { organizerId?: { _id?: string; id?: string } }).organizerId === 'object' &&
          ((realMeeting as unknown as { organizerId?: { _id?: string; id?: string } }).organizerId?.id === user?.id ||
           (realMeeting as unknown as { organizerId?: { _id?: string; id?: string } }).organizerId?._id === user?.id)))
  );

  // Audio / Video device states initialized from Lobby selection
  const [isAudioMuted, setIsAudioMuted] = useState(initialAudioMuted);
  const [isVideoOn, setIsVideoOn] = useState(initialVideo);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Layout View mode: 'speaker' | 'gallery'
  const [viewMode, setViewMode] = useState<'speaker' | 'gallery'>('speaker');

  // Active Drawers / Overlays
  const [activeDrawer, setActiveDrawer] = useState<'participants' | 'chat' | 'ai' | null>(null);

  // Active Popover Menus (Mutually Exclusive: only ONE menu can be open at a time to prevent overlapping)
  type ActiveMenu = 'info' | 'audio' | 'video' | 'react' | 'host' | 'more' | null;
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);

  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const closeMenus = () => {
    setActiveMenu(null);
  };

  const infoPopupOpen = activeMenu === 'info';
  const reactionsTrayOpen = activeMenu === 'react';
  const audioMenuOpen = activeMenu === 'audio';
  const videoMenuOpen = activeMenu === 'video';
  const hostToolsOpen = activeMenu === 'host';
  const moreMenuOpen = activeMenu === 'more';
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const isFetchingMessagesRef = useRef(false);
  const lastFetchedMeetingIdRef = useRef<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // AI Live Notes & Transcript State
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);

  // Video Ref & Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [wbColor, setWbColor] = useState('#0f172a');
  const [wbTool, setWbTool] = useState<'pen' | 'eraser'>('pen');

  // Live meeting elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reaction counter ref for unique deterministic particle keys
  const reactionCounterRef = useRef(0);

  // 1. Dedicated, deduplicated message history fetcher
  useEffect(() => {
    if (!cameFromLobby || !meetingId) {
      if (!meetingId) setChatMessages([]);
      return;
    }

    // Prevent duplicate simultaneous requests for same meeting
    if (isFetchingMessagesRef.current && lastFetchedMeetingIdRef.current === meetingId) {
      return;
    }

    const controller = new AbortController();
    isFetchingMessagesRef.current = true;
    lastFetchedMeetingIdRef.current = meetingId;
    setIsLoadingMessages(true);
    setMessagesError(null);

    meetingApi
      .getMessages(meetingId, {}, { signal: controller.signal })
      .then((res) => {
        const msgs = (res?.data?.messages || []) as MeetingMessageItem[];
        const loaded: ChatMessage[] = msgs.map((m: MeetingMessageItem) => ({
          id: m.id,
          sender: m.sender?.name || (m.senderId === user?.id ? user?.name || 'You' : 'Participant'),
          text: m.content,
          timestamp: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          isSelf: m.senderId === user?.id || m.sender?.id === user?.id,
        }));
        setChatMessages(loaded);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setMessagesError(err?.message || 'Failed to load messages');
      })
      .finally(() => {
        isFetchingMessagesRef.current = false;
        setIsLoadingMessages(false);
      });

    return () => {
      controller.abort();
      isFetchingMessagesRef.current = false;
    };
  }, [cameFromLobby, meetingId, user?.id, user?.name]);

  // 2. Real WebRTC & Backend Meeting Room Lifecycle
  useEffect(() => {
    if (!cameFromLobby || !meetingId) return;

    let isMounted = true;
    const controller = new AbortController();
    const effectivePasscode = searchParams.get('passcode') || passcode;

    // Fetch meeting details from backend
    meetingApi
      .getMeetingById(meetingId, { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          setRealMeeting(mapBackendMeeting(res.data));
        }
      })
      .catch(() => {});

    // Fetch ICE servers (STUN/TURN)
    meetingApi
      .getJoinInfo(meetingId, { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.iceServers) {
          meetingSocketService.setIceServers(res.data.iceServers);
        }
      })
      .catch(() => {});

    // Register Join via REST and connect Socket.IO
    meetingApi
      .joinMeeting(meetingId, effectivePasscode)
      .then((joinRes) => {
        if (!isMounted) return;
        if (joinRes?.data?.iceServers) {
          meetingSocketService.setIceServers(joinRes.data.iceServers);
        }
        if (joinRes?.data?.meeting) {
          setRealMeeting(mapBackendMeeting(joinRes.data.meeting as unknown as Record<string, unknown>));
        }
        return meetingSocketService.joinMeeting(meetingId, effectivePasscode);
      })
      .then((socketRes) => {
        if (!isMounted) return;
        if (socketRes?.success) {
          globalToast.success('Connected to live meeting session');
        } else if (socketRes && !socketRes.success && socketRes.error) {
          console.warn('[LiveMeeting] Socket join warning:', socketRes.error);
        }
      })
      .catch((err: unknown) => {
        console.warn('[LiveMeeting] Join error:', err);
        const error = err as { code?: string; status?: number; message?: string };
        if (error?.code === 'INVALID_PASSCODE' || error?.status === 403) {
          globalToast.error('Meeting requires a valid passcode. Redirecting to lobby...');
          navigate(`/meetings/join?code=${meetingId}`, { replace: true });
        } else if (error?.code === 'MEETING_ENDED' || error?.code === 'MEETING_CANCELLED') {
          globalToast.error(error.message || 'Meeting has ended or been cancelled');
          navigate('/meetings', { replace: true });
        }
      });

    // Listen for WebRTC remote peers updates
    const unsubPeers = meetingSocketService.onPeersChange((peers) => {
      if (isMounted) {
        setRemotePeers(peers);
      }
    });

    // Listen for incoming live chat messages (appends directly without refetching history)
    const unsubChat = meetingSocketService.onChatMessage((msg) => {
      if (!isMounted) return;
      setLiveTranscript((prev) => [
        ...prev.slice(-19),
        `${msg.sender?.name || 'Participant'}: ${msg.content}`,
      ]);
      setChatMessages((prev) => {
        const clientMsgId = msg.clientMessageId;
        const exists = prev.some(
          (m) =>
            m.id === msg.id ||
            Boolean(clientMsgId && (m.clientMessageId === clientMsgId || m.id === clientMsgId))
        );
        if (exists) {
          return prev.map((m) => {
            if (m.id === clientMsgId || (clientMsgId && m.clientMessageId === clientMsgId)) {
              return {
                ...m,
                id: msg.id,
                clientMessageId: clientMsgId,
                timestamp: msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : m.timestamp,
              };
            }
            return m;
          });
        }
        return [
          ...prev,
          {
            id: msg.id,
            clientMessageId: msg.clientMessageId,
            sender: msg.sender?.name || 'Participant',
            text: msg.content,
            timestamp: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: msg.senderId === user?.id || msg.sender?.id === user?.id,
          },
        ];
      });
    });

    // Listen for meeting ended by host
    const unsubEnded = meetingSocketService.onMeetingEnded(() => {
      globalToast.info('The host ended this meeting');
      navigate('/meetings');
    });

    // Listen for participant removed / muted
    const unsubRemoved = meetingSocketService.onParticipantRemoved((targetUserId) => {
      if (targetUserId === user?.id) {
        globalToast.warning('You were removed from the meeting by the host');
        navigate('/meetings');
      }
    });

    const unsubMuted = meetingSocketService.onParticipantMuted((targetUserId) => {
      if (targetUserId === user?.id) {
        setIsAudioMuted(true);
        meetingSocketService.toggleAudio(true);
        globalToast.info('You were muted by the host');
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
      unsubPeers();
      unsubChat();
      unsubEnded();
      unsubRemoved();
      unsubMuted();
      meetingSocketService.leaveMeeting();
      meetingSocketService.disconnect();
      if (meetingId) {
        meetingApi.leaveMeeting(meetingId).catch(() => {});
      }
    };
  }, [cameFromLobby, meetingId, passcode, searchParams, user?.id, navigate]);

  // Initialize stream from lobby settings if camera or mic enabled
  useEffect(() => {
    if (cameFromLobby && (initialVideo || !initialAudioMuted)) {
      let isMounted = true;
      navigator.mediaDevices
        ?.getUserMedia({
          video: initialVideo,
          audio: !initialAudioMuted,
        })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          setMediaStream(stream);
          meetingSocketService.setLocalStream(stream);
          if (videoRef.current && initialVideo) {
            videoRef.current.srcObject = stream;
          }
          if (initialVideo) meetingSocketService.toggleVideo(true);
          if (initialAudioMuted) meetingSocketService.toggleAudio(true);
        })
        .catch((err) => {
          console.warn('[LiveMeeting] Error initializing media from lobby:', err);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [cameFromLobby, meetingId, initialVideo, initialAudioMuted]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Ensure video element always binds media stream or screen share across views and re-renders
  useEffect(() => {
    if (videoRef.current) {
      if (isScreenSharing && meetingSocketService.getScreenStream()) {
        videoRef.current.srcObject = meetingSocketService.getScreenStream();
      } else if (mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
    }
  }, [mediaStream, isVideoOn, isScreenSharing, viewMode, remotePeers.length]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (activeDrawer === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeDrawer]);

  // Floating reactions
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
    closeMenus();

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== particleId));
    }, 2500);
  };

  // Toggle Microphone Audio
  const handleToggleAudio = async () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);

    if (!nextMuted && (!mediaStream || mediaStream.getAudioTracks().length === 0)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoOn,
        });
        setMediaStream(stream);
        meetingSocketService.setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Microphone permission denied:', err);
        showToast('Microphone not detected or permission denied', 'warning');
      }
    }

    meetingSocketService.toggleAudio(nextMuted);
  };

  // Toggle Camera Video
  const handleToggleVideo = async () => {
    const nextVideo = !isVideoOn;
    setIsVideoOn(nextVideo);

    if (nextVideo) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: !isAudioMuted,
        });
        setMediaStream(stream);
        meetingSocketService.setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        meetingSocketService.toggleVideo(true);
      } catch (err) {
        console.warn('Camera access denied:', err);
        showToast('Camera not detected or permission denied', 'warning');
      }
    } else {
      meetingSocketService.toggleVideo(false);
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Toggle Screen Sharing
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      meetingSocketService.stopScreenShare();
      setIsScreenSharing(false);
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      showToast('Screen sharing stopped', 'info');
    } else {
      const stream = await meetingSocketService.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        showToast('You are sharing your screen', 'success');
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          meetingSocketService.stopScreenShare();
          if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
          }
        };
      } else {
        showToast('Screen sharing cancelled or unavailable', 'info');
      }
    }
  };

  // Send Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInputText.trim();
    if (!text || !meetingId) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      clientMessageId: tempId,
      sender: userName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText('');

    try {
      if (meetingSocketService.isConnected()) {
        const ack = await meetingSocketService.sendChatMessage(text, tempId);
        if (ack && typeof ack === 'object') {
          const ackMsg = (ack as { message?: { id?: string; _id?: string } }).message;
          const realId = ackMsg?.id || ackMsg?._id;
          if (realId) {
            setChatMessages((prev) =>
              prev.map((m) =>
                m.id === tempId || m.clientMessageId === tempId ? { ...m, id: realId } : m
              )
            );
          }
        }
      } else {
        const res = await meetingApi.sendMessage(meetingId, text, tempId);
        if (res?.data?.id) {
          const realId = res.data.id;
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === tempId || m.clientMessageId === tempId ? { ...m, id: realId } : m
            )
          );
        }
      }
    } catch (err: unknown) {
      // If socket failed, attempt REST fallback once
      try {
        const res = await meetingApi.sendMessage(meetingId, text, tempId);
        if (res?.data?.id) {
          const realId = res.data.id;
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === tempId || m.clientMessageId === tempId ? { ...m, id: realId } : m
            )
          );
        }
      } catch (fallbackErr: unknown) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : (err instanceof Error ? err.message : 'Failed to send message');
        globalToast.error(msg);
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


  if (!cameFromLobby && meetingId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="im-spinner" style={{ margin: '0 auto 16px', width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p>Redirecting to meeting lobby...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zm-live-meeting-viewport">
      {/* Click outside to dismiss any active popover menu */}
      {activeMenu !== null && (
        <div
          className="zm-menu-backdrop"
          onClick={closeMenus}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 48,
            background: 'transparent',
            cursor: 'default',
          }}
        />
      )}
      {/* ===================================================================
          FULL-SCREEN MEETING STAGE & CONTROLS
          =================================================================== */}
      <main className="zm-call-container">
        {/* Sleek In-Meeting Topbar */}
        <div className="zm-call-topbar">
          <div className="zm-call-topbar-left">
            {/* Brand Logo & Name */}
            <div
              className="zm-call-brand-container"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginRight: 4,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <BrandIcon size={22} />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                <span style={{ color: '#38bdf8' }}>Intell</span>
                <span style={{ color: '#a855f7' }}>Meet</span>
              </span>
            </div>

            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

            {/* Meeting Info Button (i) */}
            <button
              className="zm-call-info-btn"
              onClick={() => toggleMenu('info')}
              title="Meeting Information"
            >
              i
            </button>

            {/* Title */}
            <div className="zm-call-title">
              <span>{meetingTitle}</span>
            </div>

            {/* Live Elapsed Duration Indicator */}
            <div
              className="zm-call-duration-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.3px',
                marginLeft: 2,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              title="Live Meeting Duration"
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 6px #ef4444',
                  flexShrink: 0,
                }}
              />
              <span style={{ whiteSpace: 'nowrap' }}>{formatElapsed(elapsedSeconds)}</span>
            </div>
          </div>

            <div className="zm-call-topbar-right">
              {/* Green Verified Security Shield */}
              <button
                className="zm-call-top-btn zm-call-top-shield"
                onClick={() => toggleMenu('info')}
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
                  {(() => {
                    const activeScreenPeer = remotePeers.find((p) => p.isScreenSharing);
                    const activePeer = activeScreenPeer || remotePeers[0];

                    if (remotePeers.length > 0 && activePeer) {
                      const showVideo = (activePeer.isVideoOn || activePeer.isScreenSharing) && Boolean(activePeer.stream);
                      return showVideo ? (
                        <video
                          ref={(el) => {
                            if (el && activePeer.stream) el.srcObject = activePeer.stream;
                          }}
                          autoPlay
                          playsInline
                          className="zm-live-video-element"
                        />
                      ) : (
                        <div className="zm-center-avatar-box">
                          <UserAvatar
                            avatar={
                              activePeer.avatar ||
                              realMeeting?.participants?.find(
                                (p) => p.id === activePeer.userId || p.email === activePeer.email
                              )?.avatar
                            }
                            name={activePeer.name}
                            size={128}
                            className="zm-center-user-avatar"
                            style={{
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                              border: '3px solid rgba(255,255,255,0.15)',
                            }}
                          />
                        </div>
                      );
                    }

                    if (isVideoOn || isScreenSharing) {
                      return (
                        <video
                          ref={(el) => {
                            videoRef.current = el;
                            if (el) {
                              if (isScreenSharing && meetingSocketService.getScreenStream()) {
                                el.srcObject = meetingSocketService.getScreenStream();
                              } else if (mediaStream) {
                                el.srcObject = mediaStream;
                              }
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          className="zm-live-video-element"
                        />
                      );
                    }

                    return (
                      /* Centered User Avatar when Video is Off */
                      <div className="zm-center-avatar-box">
                        <UserAvatar
                          avatar={userAvatar}
                          name={userName}
                          size={128}
                          className="zm-center-user-avatar"
                          style={{
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            border: '3px solid rgba(255,255,255,0.15)',
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* Speaker Tag Pill */}
                  <div className="zm-speaker-tag">
                    {(() => {
                      const activeScreenPeer = remotePeers.find((p) => p.isScreenSharing);
                      const activePeer = activeScreenPeer || remotePeers[0];
                      if (remotePeers.length > 0 && activePeer) {
                        return (
                          <>
                            <span className={activePeer.isAudioMuted ? 'zm-speaker-mic-red' : 'zm-speaker-mic-green'}>
                              {activePeer.isAudioMuted ? '🔇' : '🎙️'}
                            </span>
                            <span>{activePeer.name} {activePeer.isScreenSharing ? '🖥️ (Screen)' : ''}</span>
                          </>
                        );
                      }
                      return (
                        <>
                          <span className={isAudioMuted ? 'zm-speaker-mic-red' : 'zm-speaker-mic-green'}>
                            {isAudioMuted ? '🔇' : '🎙️'}
                          </span>
                          <span>{userName} (Me) {isScreenSharing ? '🖥️ (Screen)' : ''}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Floating PiP thumbnail for local camera when remote peer is on stage */}
                  {remotePeers.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        width: 140,
                        height: 90,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.25)',
                        background: '#0f172a',
                        zIndex: 10,
                      }}
                    >
                      {isVideoOn || isScreenSharing ? (
                        <video
                          ref={(el) => {
                            videoRef.current = el;
                            if (el) {
                              if (isScreenSharing && meetingSocketService.getScreenStream()) {
                                el.srcObject = meetingSocketService.getScreenStream();
                              } else if (mediaStream) {
                                el.srcObject = mediaStream;
                              }
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            background: '#0f172a',
                          }}
                        >
                          <UserAvatar
                            avatar={userAvatar}
                            name={userName}
                            size={42}
                            style={{ border: '2px solid rgba(255,255,255,0.2)' }}
                          />
                          <span
                            style={{
                              color: '#cbd5e1',
                              fontSize: 11,
                              fontWeight: 500,
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {userName} (You)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Gallery View — Dynamic WebRTC Mesh Grid */
                <div className="zm-gallery-grid">
                  {/* Tile 1: You */}
                  <div className={`zm-gallery-tile ${!isAudioMuted ? 'speaking' : ''}`}>
                    {isVideoOn || isScreenSharing ? (
                      <video
                        ref={(el) => {
                          videoRef.current = el;
                          if (el) {
                            if (isScreenSharing && meetingSocketService.getScreenStream()) {
                              el.srcObject = meetingSocketService.getScreenStream();
                            } else if (mediaStream) {
                              el.srcObject = mediaStream;
                            }
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="zm-live-video-element"
                      />
                    ) : (
                      <UserAvatar
                        avatar={userAvatar}
                        name={userName}
                        size={84}
                        className="zm-gallery-avatar"
                        style={{
                          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                          border: '2px solid rgba(255,255,255,0.15)',
                        }}
                      />
                    )}
                    <div className="zm-speaker-tag">
                      <span className={isAudioMuted ? 'zm-speaker-mic-red' : 'zm-speaker-mic-green'}>
                        {isAudioMuted ? '🔇' : '🎙️'}
                      </span>
                      <span>{userName} (Me)</span>
                    </div>
                  </div>

                  {/* Connected Remote Peers */}
                  {remotePeers.map((peer) => {
                    const peerAvatar =
                      peer.avatar ||
                      realMeeting?.participants?.find(
                        (p) => p.id === peer.userId || p.email === peer.email
                      )?.avatar;
                    return <RemoteVideoTile key={peer.socketId} peer={peer} peerAvatar={peerAvatar} />;
                  })}

                  {/* Invite peer card if alone in meeting */}
                  {remotePeers.length === 0 && (
                    <div
                      className="zm-gallery-tile"
                      style={{
                        border: '2px dashed rgba(255,255,255,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                      <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        Waiting for peers to join
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
                        Share link to test 2-client WebRTC video & audio
                      </div>
                      <button
                        className="im-btn im-btn-primary im-btn-sm"
                        onClick={handleCopyLink}
                        style={{ fontSize: 12, padding: '6px 14px' }}
                      >
                        Copy Meeting Link
                      </button>
                    </div>
                  )}
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
                  <span className="zm-drawer-title">Participants ({1 + remotePeers.length})</span>
                  <button className="zm-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                    ✕
                  </button>
                </div>
                <div className="zm-drawer-body">
                  {/* You */}
                  <div className="zm-participant-row">
                    <div className="zm-participant-info">
                      <UserAvatar
                        avatar={userAvatar}
                        name={userName}
                        size={32}
                        className="zm-p-avatar"
                      />
                      <div>
                        <div className="zm-p-name">
                          {userName}
                          <span className="zm-p-tag">({isHost ? 'Host, me' : 'Me'})</span>
                        </div>
                      </div>
                    </div>
                    <div className="zm-p-status">
                      <span>{isAudioMuted ? '🔇' : '🎙️'}</span>
                      <span>{isVideoOn ? '📹' : '🚫'}</span>
                    </div>
                  </div>

                  {/* Connected Remote Peers */}
                  {remotePeers.map((peer) => {
                    const peerAvatar =
                      peer.avatar ||
                      realMeeting?.participants?.find(
                        (p) => p.id === peer.userId || p.email === peer.email
                      )?.avatar;
                    return (
                      <div key={peer.socketId} className="zm-participant-row">
                        <div className="zm-participant-info">
                          <UserAvatar
                            avatar={peer.avatar || peerAvatar}
                            name={peer.name}
                            size={32}
                            className="zm-p-avatar"
                          />
                          <div>
                            <div className="zm-p-name">
                              {peer.name}
                              <span className="zm-p-tag">({peer.role || 'Attendee'})</span>
                            </div>
                          </div>
                        </div>
                      <div className="zm-p-status" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{peer.isAudioMuted ? '🔇' : '🎙️'}</span>
                        <span>{peer.isVideoOn ? '📹' : '🚫'}</span>
                        {isHost && (
                          <>
                            <button
                              onClick={() => {
                                if (meetingId) meetingApi.muteParticipant(meetingId, peer.userId);
                                showToast(`Muted ${peer.name}`, 'info');
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11 }}
                              title="Mute participant"
                            >
                              Mute
                            </button>
                            <button
                              onClick={() => {
                                if (meetingId) {
                                  meetingSocketService.removeParticipant(peer.userId);
                                  meetingApi.removeParticipant(meetingId, peer.userId);
                                }
                                showToast(`Removed ${peer.name}`, 'info');
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 11 }}
                              title="Remove participant"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
                <div className="zm-drawer-footer">
                  <button className="zm-drawer-btn" onClick={handleCopyLink}>
                    Invite
                  </button>
                  {isHost && (
                    <button
                      className="zm-drawer-btn"
                      onClick={() => {
                        remotePeers.forEach((p) => {
                          if (meetingId) meetingApi.muteParticipant(meetingId, p.userId);
                        });
                        showToast('Muted all participants', 'info');
                      }}
                    >
                      Mute All
                    </button>
                  )}
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
                    {isLoadingMessages ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        Loading message history...
                      </div>
                    ) : messagesError ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#f87171', fontSize: 13 }}>
                        {messagesError}
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No messages yet. Send a message to start the conversation.
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="zm-chat-msg">
                          <div className="zm-chat-msg-header">
                            <UserAvatar
                              avatar={msg.isSelf ? userAvatar : undefined}
                              name={msg.sender}
                              size={20}
                            />
                            <span className="zm-chat-sender">{msg.sender}</span>
                            <span className="zm-chat-time">{msg.timestamp}</span>
                          </div>
                          <div className="zm-chat-bubble">{msg.text}</div>
                        </div>
                      ))
                    )}
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
                    {liveTranscript.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>
                        No transcript recorded yet. Speak with unmuted microphone to capture audio.
                      </div>
                    ) : (
                      liveTranscript.map((t, i) => (
                        <div key={i} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                          • {t}
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 14 }}>
                    Extracted Action Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    {realMeeting?.actionItems && realMeeting.actionItems.length > 0 ? (
                      realMeeting.actionItems.map((item: ActionItem, idx: number) => (
                        <label key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked={Boolean(item.completed)} />
                          <span>{item.task}</span>
                        </label>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        No action items extracted yet.
                      </div>
                    )}
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
                  onClick={handleToggleAudio}
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
                  onClick={() => toggleMenu('audio')}
                  title="Audio Settings"
                >
                  ^
                </button>

                {/* Audio Settings Menu */}
                {audioMenuOpen && (
                  <div className="zm-dock-menu" style={{ left: 0 }}>
                    <span className="zm-dock-menu-title">Select a Microphone</span>
                    <button className="zm-dock-menu-item active" onClick={closeMenus}>
                      ✓ Default - Built-in Microphone
                    </button>
                    <button className="zm-dock-menu-item" onClick={closeMenus}>
                      External USB Headset
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <span className="zm-dock-menu-title">Select a Speaker</span>
                    <button className="zm-dock-menu-item active" onClick={closeMenus}>
                      ✓ Default - Built-in Speakers
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
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
                  onClick={handleToggleVideo}
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
                  onClick={() => toggleMenu('video')}
                  title="Video Settings"
                >
                  ^
                </button>

                {/* Video Settings Menu */}
                {videoMenuOpen && (
                  <div className="zm-dock-menu" style={{ left: 0 }}>
                    <span className="zm-dock-menu-title">Select a Camera</span>
                    <button className="zm-dock-menu-item active" onClick={closeMenus}>
                      ✓ Integrated HD Webcam (720p)
                    </button>
                    <div className="zm-dock-menu-divider" />
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
                        showToast('Virtual Background: Studio Blur applied', 'success');
                      }}
                    >
                      Choose Virtual Background...
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
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
                  onClick={() => {
                    closeMenus();
                    setActiveDrawer(activeDrawer === 'participants' ? null : 'participants');
                  }}
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
                <button
                  className="zm-dock-chevron-btn"
                  onClick={() => {
                    closeMenus();
                    handleCopyLink();
                  }}
                  title="Invite link"
                >
                  ^
                </button>
              </div>

              {/* Chat */}
              <button
                className={`zm-dock-btn ${activeDrawer === 'chat' ? 'active' : ''}`}
                onClick={() => {
                  closeMenus();
                  setActiveDrawer(activeDrawer === 'chat' ? null : 'chat');
                }}
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
                  onClick={() => toggleMenu('react')}
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
                  <div className="zm-reactions-tray" style={{ left: '50%', transform: 'translateX(-50%)' }}>
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
                        closeMenus();
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
                  onClick={() => {
                    closeMenus();
                    handleToggleScreenShare();
                  }}
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
                  onClick={() => {
                    closeMenus();
                    handleToggleScreenShare();
                  }}
                  title="Screen Share Options"
                >
                  ^
                </button>
              </div>

              {/* Host Tools / Security */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`zm-dock-btn ${hostToolsOpen ? 'active' : ''}`}
                  onClick={() => toggleMenu('host')}
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
                  <div className="zm-dock-menu" style={{ width: 250, left: '50%', transform: 'translateX(-50%)' }}>
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
                  onClick={() => toggleMenu('more')}
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
                  <div className="zm-dock-menu" style={{ width: 220, right: 0 }}>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
                        setActiveDrawer('ai');
                      }}
                    >
                      <span>✨ AI Companion & Notes</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
                        setWhiteboardOpen(true);
                      }}
                    >
                      <span>Open Whiteboard</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
                        showToast('Cloud recording started', 'success');
                      }}
                    >
                      <span>Record to Cloud</span>
                    </button>
                    <button
                      className="zm-dock-menu-item"
                      onClick={() => {
                        closeMenus();
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
              {isHost && (
                <button
                  className="zm-dialog-btn-danger"
                  onClick={async () => {
                    setEndModalOpen(false);
                    meetingSocketService.endMeeting();
                    if (meetingId) await meetingApi.endMeeting(meetingId).catch(() => {});
                    showToast('Meeting ended for all participants', 'info');
                    navigate('/meetings');
                  }}
                >
                  End Meeting for All
                </button>
              )}
              <button
                className="zm-dialog-btn-secondary"
                onClick={async () => {
                  setEndModalOpen(false);
                  meetingSocketService.leaveMeeting();
                  if (meetingId) await meetingApi.leaveMeeting(meetingId).catch(() => {});
                  showToast('You left the meeting', 'info');
                  navigate('/meetings');
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
