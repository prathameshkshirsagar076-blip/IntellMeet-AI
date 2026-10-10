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
  meetingLink: string;
  summaryId?: string;
  isInstant?: boolean;
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

export interface UserPreferences {
  theme: 'light' | 'dark';
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
