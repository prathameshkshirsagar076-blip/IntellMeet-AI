export type MeetingStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'host' | 'co-host' | 'attendee';
  isOnline?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  status: MeetingStatus;
  organizer: Participant;
  participants: Participant[];
  meetingCode: string;
  passcode?: string;
  timezone?: string;
  myInvitationStatus?: 'invited' | 'pending' | 'accepted' | 'declined' | 'tentative' | 'none';
  myRole?: 'host' | 'co-host' | 'attendee';
  participantCount?: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  meetingLink: string;
  summaryId?: string;
  isInstant?: boolean;
  actionItems?: ActionItem[];
  createdAt: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  completed: boolean;
  dueDate?: string;
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  durationMinutes: number;
  overview: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  decisions: string[];
  sentiment?: 'Productive' | 'Action-Oriented' | 'Strategic' | 'Collaborative';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'meeting' | 'ai' | 'team' | 'system';
  actionUrl?: string;
}

export interface ActivityItem {
  id: string;
  type: 'completed' | 'scheduled' | 'summary' | 'copied' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  iconType: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePresetId =
  | 'signature'
  | 'ocean'
  | 'emerald'
  | 'midnight'
  | 'arctic'
  | 'royal'
  | 'sunset'
  | 'graphite';

export type AccentColor =
  | 'preset'
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'cyan'
  | 'custom';

export interface UserPreferences {
  theme: ThemeMode;
  themePreset?: ThemePresetId;
  accentColor?: AccentColor;
  customAccentHex?: string;
  highContrast?: boolean;
  reducedMotion?: boolean;
  microphoneDevice: string;
  cameraDevice: string;
  speakerDevice: string;
  autoMuteOnJoin: boolean;
  autoTurnOffCameraOnJoin: boolean;
  emailReminders: boolean;
  desktopNotifications: boolean;
  aiSummaryAutoGenerate: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  isOnline: boolean;
  lastActive?: string;
}

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  timezone?: string;
  participantEmails?: string[];
  participantUserIds?: string[];
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  isInstant?: boolean;
  passcode?: string;
  settings?: {
    allowChat?: boolean;
    allowScreenShare?: boolean;
    waitingRoom?: boolean;
    isMutedOnEntry?: boolean;
    isVideoOffOnEntry?: boolean;
  };
}

export interface ParticipantInvitationInfo {
  id: string;
  participantId: string;
  userId?: string | null;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'invited' | 'pending' | 'accepted' | 'declined' | 'tentative' | 'joined' | 'left';
  invitationSentAt?: string;
  invitationDeliveryStatus?: 'not_sent' | 'sent' | 'delivered' | 'failed';
  invitationError?: string | null;
  respondedAt?: string;
}

export interface MeetingInvitationItem {
  id: string;
  invitationId: string;
  status: 'invited' | 'pending' | 'accepted' | 'declined' | 'tentative';
  role: string;
  respondedAt?: string;
  invitationSentAt?: string;
  meeting: Meeting;
}

export interface MeetingIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface JoinMeetingResponse {
  meeting: {
    id: string;
    meetingCode: string;
    title: string;
    status: MeetingStatus;
    settings?: {
      allowChat?: boolean;
      allowScreenShare?: boolean;
      waitingRoom?: boolean;
      isMutedOnEntry?: boolean;
      isVideoOffOnEntry?: boolean;
    };
    organizer?: Participant;
  };
  participant: {
    userId: string;
    role: string;
    status: string;
    joinedAt: string;
  };
  iceServers: MeetingIceServer[];
}

export interface MeetingMessageItem {
  id: string;
  meetingId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  clientMessageId?: string;
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface RemotePeer {
  socketId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  stream?: MediaStream;
  isAudioMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
}

