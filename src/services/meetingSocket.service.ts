import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/tokenStorage';
import { env } from '../config/env';
import type { RemotePeer, MeetingMessageItem, MeetingIceServer } from '../types/meeting';

export type RemotePeersChangeHandler = (peers: RemotePeer[]) => void;
export type ChatMessageHandler = (message: MeetingMessageItem) => void;
export type ChatMessageEditHandler = (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => void;
export type ChatMessageDeleteHandler = (data: { id: string; isDeleted: boolean; deletedAt: string }) => void;
export type TypingHandler = (data: { userId: string; name: string; isTyping: boolean }) => void;
export type MediaUpdateHandler = (data: { userId: string; socketId: string; isAudioMuted: boolean; isVideoOn: boolean; isScreenSharing: boolean; isHandRaised?: boolean }) => void;
export type MeetingEndedHandler = () => void;
export type ParticipantActionHandler = (userId: string) => void;

interface PeerRecord {
  socketId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  isAudioMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  iceQueue: RTCIceCandidateInit[];
}

interface ParticipantPayload {
  socketId: string;
  userId: string;
  name?: string;
  email?: string;
  role?: string;
  isAudioMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
}

class MeetingSocketService {
  private socket: Socket | null = null;
  private currentMeetingId: string | null = null;
  private isHost = false;

  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private cameraTrack: MediaStreamTrack | null = null;

  private isAudioMuted = true;
  private isVideoOn = false;
  private isScreenSharing = false;

  private iceServers: RTCConfiguration['iceServers'] = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
  ];

  private peers: Map<string, PeerRecord> = new Map();

  // Listeners
  private peersChangeListeners: Set<RemotePeersChangeHandler> = new Set();
  private chatMessageListeners: Set<ChatMessageHandler> = new Set();
  private chatEditListeners: Set<ChatMessageEditHandler> = new Set();
  private chatDeleteListeners: Set<ChatMessageDeleteHandler> = new Set();
  private typingListeners: Set<TypingHandler> = new Set();
  private mediaUpdateListeners: Set<MediaUpdateHandler> = new Set();
  private meetingEndedListeners: Set<MeetingEndedHandler> = new Set();
  private removedListeners: Set<ParticipantActionHandler> = new Set();
  private mutedListeners: Set<ParticipantActionHandler> = new Set();

  public resolveSocketUrl(): string {
    const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;
    if (viteSocketUrl && typeof viteSocketUrl === 'string' && viteSocketUrl.trim()) {
      return viteSocketUrl.trim();
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || env.backendUrl;
    if (backendUrl && typeof backendUrl === 'string' && backendUrl.trim()) {
      return backendUrl.trim();
    }
    const rawWsUrl = import.meta.env.VITE_WS_URL || env.wsUrl;
    if (rawWsUrl && typeof rawWsUrl === 'string' && rawWsUrl.trim()) {
      const normalized = rawWsUrl
        .trim()
        .replace(/^ws:\/\//i, 'http://')
        .replace(/^wss:\/\//i, 'https://')
        .replace(/\/ws\/?$/i, '')
        .replace(/\/socket\.io\/?$/i, '');
      if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return normalized;
      }
    }
    if (env.remoteApiBaseUrl && env.remoteApiBaseUrl.startsWith('http')) {
      try {
        const parsed = new URL(env.remoteApiBaseUrl);
        return parsed.origin;
      } catch {
        // Ignore
      }
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return '';
  }

  public getSocket(): Socket | null {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = getAccessToken();
    if (!token) return null;

    const socketUrl = this.resolveSocketUrl();
    this.socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['polling'],
      autoConnect: true,
      auth: { token: `Bearer ${token}` },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnection: false,
    });

    this.bindSocketEvents();
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private bindSocketEvents() {
    if (!this.socket) return;

    // Participant joined
    this.socket.on('meeting:participant:joined', (data: { participant: ParticipantPayload }) => {
      const p = data.participant;
      if (!p || p.socketId === this.socket?.id) return;
      this.initiatePeerConnection(p);
    });

    // Participant left
    this.socket.on('meeting:participant:left', (data: { socketId: string; userId: string }) => {
      this.removePeer(data.socketId);
    });

    // WebRTC Signaling: Offer
    this.socket.on('meeting:signal:offer', async (data: { senderSocketId: string; senderUserId: string; offer: RTCSessionDescriptionInit }) => {
      await this.handleReceiveOffer(data.senderSocketId, data.senderUserId, data.offer);
    });

    // WebRTC Signaling: Answer
    this.socket.on('meeting:signal:answer', async (data: { senderSocketId: string; answer: RTCSessionDescriptionInit }) => {
      await this.handleReceiveAnswer(data.senderSocketId, data.answer);
    });

    // WebRTC Signaling: ICE Candidate
    this.socket.on('meeting:signal:ice-candidate', async (data: { senderSocketId: string; candidate: RTCIceCandidateInit }) => {
      await this.handleReceiveCandidate(data.senderSocketId, data.candidate);
    });

    // Media state update from remote peer
    this.socket.on('meeting:media:update', (data: { userId: string; socketId: string; isAudioMuted: boolean; isVideoOn: boolean; isScreenSharing: boolean; isHandRaised?: boolean }) => {
      const peer = this.peers.get(data.socketId);
      if (peer) {
        peer.isAudioMuted = data.isAudioMuted;
        peer.isVideoOn = data.isVideoOn;
        peer.isScreenSharing = data.isScreenSharing;
        peer.isHandRaised = data.isHandRaised;
        this.notifyPeersChanged();
      }
      this.mediaUpdateListeners.forEach((fn) => fn(data));
    });

    // In-meeting Chat messages
    this.socket.on('meeting:chat:new', (data: { message: MeetingMessageItem }) => {
      this.chatMessageListeners.forEach((fn) => fn(data.message));
    });

    this.socket.on('meeting:chat:edited', (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => {
      this.chatEditListeners.forEach((fn) => fn(data));
    });

    this.socket.on('meeting:chat:deleted', (data: { id: string; isDeleted: boolean; deletedAt: string }) => {
      this.chatDeleteListeners.forEach((fn) => fn(data));
    });

    this.socket.on('meeting:chat:typing', (data: { userId: string; name: string; isTyping: boolean }) => {
      this.typingListeners.forEach((fn) => fn(data));
    });

    // Moderation & End
    this.socket.on('meeting:ended', () => {
      this.meetingEndedListeners.forEach((fn) => fn());
    });

    this.socket.on('meeting:participant:removed', (data: { userId: string }) => {
      this.removedListeners.forEach((fn) => fn(data.userId));
    });

    this.socket.on('meeting:participant:muted', (data: { userId: string }) => {
      this.mutedListeners.forEach((fn) => fn(data.userId));
    });
  }

  /**
   * Set configuration and local streams
   */
  public setIceServers(servers: MeetingIceServer[]) {
    if (Array.isArray(servers) && servers.length > 0) {
      this.iceServers = servers;
    }
  }

  public setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        this.cameraTrack = videoTracks[0];
      }
    }

    // Add local tracks to existing peer connections if any
    if (stream) {
      this.peers.forEach((peer) => {
        stream.getTracks().forEach((track) => {
          const senders = peer.peerConnection.getSenders();
          const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
          if (!alreadyAdded) {
            peer.peerConnection.addTrack(track, stream);
          }
        });
      });
    }
  }

  /**
   * Join live meeting
   */
  public async joinMeeting(
    meetingId: string,
    passcode?: string
  ): Promise<{ success: boolean; isHost?: boolean; peers?: ParticipantPayload[]; error?: string }> {
    const socket = this.getSocket();
    if (!socket) {
      return { success: false, error: 'Socket connection failed' };
    }

    this.currentMeetingId = meetingId;

    return new Promise((resolve) => {
      socket.emit('meeting:join', { meetingId, passcode }, (res: { success?: boolean; isHost?: boolean; peers?: ParticipantPayload[]; error?: string }) => {
        if (res && res.success) {
          this.isHost = Boolean(res.isHost);
          // If there are existing peers in the room, initiate WebRTC to each
          if (Array.isArray(res.peers)) {
            res.peers.forEach((peer: ParticipantPayload) => {
              this.initiatePeerConnection(peer);
            });
          }
          resolve({ success: true, isHost: this.isHost, peers: res.peers });
        } else {
          resolve({ success: false, error: res?.error || 'Failed to join meeting room' });
        }
      });
    });
  }

  /**
   * WebRTC Peer connection initiator (Caller)
   */
  private async initiatePeerConnection(peerInfo: ParticipantPayload) {
    if (this.peers.has(peerInfo.socketId)) return;

    try {
      const pc = new RTCPeerConnection({ iceServers: this.iceServers });
      const remoteStream = new MediaStream();

      const peerRecord: PeerRecord = {
        socketId: peerInfo.socketId,
        userId: peerInfo.userId,
        name: peerInfo.name || 'Participant',
        email: peerInfo.email || '',
        role: peerInfo.role || 'attendee',
        peerConnection: pc,
        remoteStream,
        isAudioMuted: peerInfo.isAudioMuted ?? true,
        isVideoOn: peerInfo.isVideoOn ?? false,
        isScreenSharing: peerInfo.isScreenSharing ?? false,
        isHandRaised: peerInfo.isHandRaised ?? false,
        iceQueue: []
      };

      this.peers.set(peerInfo.socketId, peerRecord);

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && this.socket && this.currentMeetingId) {
          this.socket.emit('meeting:signal:ice-candidate', {
            meetingId: this.currentMeetingId,
            targetSocketId: peerInfo.socketId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      // Handle remote incoming tracks
      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
            remoteStream.addTrack(track);
          }
        });
        this.notifyPeersChanged();
      };

      // Add local media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      // Create & send SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (this.socket && this.currentMeetingId) {
        this.socket.emit('meeting:signal:offer', {
          meetingId: this.currentMeetingId,
          targetSocketId: peerInfo.socketId,
          offer
        });
      }

      this.notifyPeersChanged();
    } catch (err) {
      console.warn('[WebRTC] Failed to initiate peer connection:', err);
    }
  }

  /**
   * WebRTC Receiver: Handle incoming SDP offer (Callee)
   */
  private async handleReceiveOffer(
    senderSocketId: string,
    senderUserId: string,
    offer: RTCSessionDescriptionInit
  ) {
    try {
      let peerRecord = this.peers.get(senderSocketId);

      if (!peerRecord) {
        const pc = new RTCPeerConnection({ iceServers: this.iceServers });
        const remoteStream = new MediaStream();

        peerRecord = {
          socketId: senderSocketId,
          userId: senderUserId,
          name: 'Participant',
          email: '',
          role: 'attendee',
          peerConnection: pc,
          remoteStream,
          iceQueue: []
        };

        this.peers.set(senderSocketId, peerRecord);

        pc.onicecandidate = (event) => {
          if (event.candidate && this.socket && this.currentMeetingId) {
            this.socket.emit('meeting:signal:ice-candidate', {
              meetingId: this.currentMeetingId,
              targetSocketId: senderSocketId,
              candidate: event.candidate.toJSON()
            });
          }
        };

        pc.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((track) => {
            if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
              remoteStream.addTrack(track);
            }
          });
          this.notifyPeersChanged();
        };

        // Add local media tracks
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            pc.addTrack(track, this.localStream!);
          });
        }
      }

      const pc = peerRecord.peerConnection;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush queued candidates
      while (peerRecord.iceQueue.length > 0) {
        const cand = peerRecord.iceQueue.shift();
        if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

      // Create & send SDP Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (this.socket && this.currentMeetingId) {
        this.socket.emit('meeting:signal:answer', {
          meetingId: this.currentMeetingId,
          targetSocketId: senderSocketId,
          answer
        });
      }

      this.notifyPeersChanged();
    } catch (err) {
      console.warn('[WebRTC] Failed to handle incoming offer:', err);
    }
  }

  /**
   * Handle incoming SDP answer
   */
  private async handleReceiveAnswer(
    senderSocketId: string,
    answer: RTCSessionDescriptionInit
  ) {
    const peer = this.peers.get(senderSocketId);
    if (!peer) return;

    try {
      await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

      // Flush queued candidates
      while (peer.iceQueue.length > 0) {
        const cand = peer.iceQueue.shift();
        if (cand) await peer.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      }
    } catch (err) {
      console.warn('[WebRTC] Failed to handle incoming answer:', err);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleReceiveCandidate(
    senderSocketId: string,
    candidate: RTCIceCandidateInit
  ) {
    const peer = this.peers.get(senderSocketId);
    if (!peer) return;

    try {
      if (peer.peerConnection.remoteDescription) {
        await peer.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        peer.iceQueue.push(candidate);
      }
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate:', err);
    }
  }

  /**
   * Remove peer on leave or disconnect
   */
  private removePeer(socketId: string) {
    const peer = this.peers.get(socketId);
    if (peer) {
      peer.peerConnection.close();
      peer.remoteStream.getTracks().forEach((t) => t.stop());
      this.peers.delete(socketId);
      this.notifyPeersChanged();
    }
  }

  private notifyPeersChanged() {
    const peerList: RemotePeer[] = Array.from(this.peers.values()).map((p) => ({
      socketId: p.socketId,
      userId: p.userId,
      name: p.name,
      email: p.email,
      role: p.role,
      stream: p.remoteStream,
      isAudioMuted: p.isAudioMuted,
      isVideoOn: p.isVideoOn,
      isScreenSharing: p.isScreenSharing,
      isHandRaised: p.isHandRaised
    }));
    this.peersChangeListeners.forEach((fn) => fn(peerList));
  }

  /**
   * Media Controls
   */
  public toggleAudio(muted: boolean) {
    this.isAudioMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    }
    this.emitMediaState();
  }

  public toggleVideo(videoOn: boolean) {
    this.isVideoOn = videoOn;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = videoOn;
      });
    }
    this.emitMediaState();
  }

  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) return null;

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.screenStream = screenStream;
      this.isScreenSharing = true;

      const screenVideoTrack = screenStream.getVideoTracks()[0];

      // Replace video track for all connected peers
      this.peers.forEach((peer) => {
        const sender = peer.peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
        }
      });

      // Handle screen share ended by browser UI
      screenVideoTrack.onended = () => {
        this.stopScreenShare();
      };

      this.emitMediaState();
      return screenStream;
    } catch (err) {
      console.warn('[WebRTC] Screen share failed or canceled:', err);
      return null;
    }
  }

  public stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;

    // Restore camera video track on all senders
    if (this.cameraTrack) {
      this.peers.forEach((peer) => {
        const sender = peer.peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(this.cameraTrack!);
        }
      });
    }

    this.emitMediaState();
  }

  private emitMediaState() {
    if (this.socket && this.currentMeetingId) {
      this.socket.emit('meeting:media:state', {
        meetingId: this.currentMeetingId,
        isAudioMuted: this.isAudioMuted,
        isVideoOn: this.isVideoOn,
        isScreenSharing: this.isScreenSharing
      });
    }
  }

  /**
   * Live Meeting Chat
   */
  public async sendChatMessage(content: string, clientMessageId?: string): Promise<Record<string, unknown> | null> {
    const socket = this.getSocket();
    if (!socket || !this.currentMeetingId) return null;

    return new Promise((resolve) => {
      socket.emit(
        'meeting:chat:send',
        {
          meetingId: this.currentMeetingId,
          content,
          clientMessageId: clientMessageId || `cm-${Date.now()}`
        },
        (res: Record<string, unknown>) => {
          resolve(res);
        }
      );
    });
  }

  public sendTyping(isTyping: boolean) {
    if (this.socket && this.currentMeetingId) {
      this.socket.emit('meeting:chat:typing', {
        meetingId: this.currentMeetingId,
        isTyping
      });
    }
  }

  public endMeeting() {
    if (this.socket && this.currentMeetingId && this.isHost) {
      this.socket.emit('meeting:end', { meetingId: this.currentMeetingId });
    }
  }

  public removeParticipant(targetUserId: string) {
    if (this.socket && this.currentMeetingId && this.isHost) {
      this.socket.emit('meeting:participant:remove', {
        meetingId: this.currentMeetingId,
        targetUserId
      });
    }
  }

  /**
   * Clean Leave
   */
  public leaveMeeting() {
    if (this.socket && this.currentMeetingId) {
      this.socket.emit('meeting:leave', { meetingId: this.currentMeetingId });
    }

    // Close all peer connections
    this.peers.forEach((peer) => {
      peer.peerConnection.close();
      peer.remoteStream.getTracks().forEach((t) => t.stop());
    });
    this.peers.clear();

    // Stop local streams
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    this.currentMeetingId = null;
    this.notifyPeersChanged();
    this.disconnect();
  }

  /**
   * Listener subscriptions
   */
  public onPeersChange(handler: RemotePeersChangeHandler): () => void {
    this.peersChangeListeners.add(handler);
    return () => this.peersChangeListeners.delete(handler);
  }

  public onChatMessage(handler: ChatMessageHandler): () => void {
    this.chatMessageListeners.add(handler);
    return () => this.chatMessageListeners.delete(handler);
  }

  public onChatMessageEdit(handler: ChatMessageEditHandler): () => void {
    this.chatEditListeners.add(handler);
    return () => this.chatEditListeners.delete(handler);
  }

  public onChatMessageDelete(handler: ChatMessageDeleteHandler): () => void {
    this.chatDeleteListeners.add(handler);
    return () => this.chatDeleteListeners.delete(handler);
  }

  public onTyping(handler: TypingHandler): () => void {
    this.typingListeners.add(handler);
    return () => this.typingListeners.delete(handler);
  }

  public onMediaUpdate(handler: MediaUpdateHandler): () => void {
    this.mediaUpdateListeners.add(handler);
    return () => this.mediaUpdateListeners.delete(handler);
  }

  public onMeetingEnded(handler: MeetingEndedHandler): () => void {
    this.meetingEndedListeners.add(handler);
    return () => this.meetingEndedListeners.delete(handler);
  }

  public onParticipantRemoved(handler: ParticipantActionHandler): () => void {
    this.removedListeners.add(handler);
    return () => this.removedListeners.delete(handler);
  }

  public onParticipantMuted(handler: ParticipantActionHandler): () => void {
    this.mutedListeners.add(handler);
    return () => this.mutedListeners.delete(handler);
  }
}

export const meetingSocketService = new MeetingSocketService();
export default meetingSocketService;
