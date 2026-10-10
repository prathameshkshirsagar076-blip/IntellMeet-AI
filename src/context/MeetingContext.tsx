/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Meeting,
  MeetingStatus,
  Participant,
  MeetingSummary,
  AppNotification,
  ActivityItem,
  UserPreferences,
  TeamMember,
} from '../types/meeting';
import { toast as globalToast } from '../components/toast/toast';
import { applyThemeToDom, DEFAULT_THEME_PRESET_ID } from '../config/themePresets';

interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface MeetingContextType {
  meetings: Meeting[];
  summaries: MeetingSummary[];
  notifications: AppNotification[];
  activities: ActivityItem[];
  teamMembers: TeamMember[];
  preferences: UserPreferences;
  toast: ToastData | null;
  unreadNotificationCount: number;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  isNewMeetingModalOpen: boolean;
  openNewMeetingModal: () => void;
  closeNewMeetingModal: () => void;
  createMeeting: (data: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    participantsEmails?: string[];
    isInstant?: boolean;
    passcode?: string;
  }) => Meeting;
  updateMeeting: (id: string, data: Partial<Meeting>) => void;
  cancelMeeting: (id: string) => void;
  deleteMeeting: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  toggleActionItem: (summaryId: string, actionItemId: string) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  copyMeetingLink: (meeting: Meeting) => Promise<boolean>;
  getMeetingById: (id: string) => Meeting | undefined;
  getSummaryByMeetingId: (meetingId: string) => MeetingSummary | undefined;
}

const STORAGE_KEYS = {
  MEETINGS: 'intellmeet_meetings_v2',
  SUMMARIES: 'intellmeet_summaries_v2',
  NOTIFICATIONS: 'intellmeet_notifications_v2',
  ACTIVITIES: 'intellmeet_activities_v2',
  PREFERENCES: 'intellmeet_preferences_v2',
};

// Current mock user
const CURRENT_USER: Participant = {
  id: 'usr-current',
  name: 'Alex Morgan',
  email: 'alex.morgan@intellmeet.com',
  avatar: 'AM',
  role: 'host',
  isOnline: true,
};

// Deterministic mock initial data
const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-101',
    title: 'Executive Architecture & WebRTC Latency Sync',
    description: 'Quarterly review of APAC server edge distribution and sub-20ms audio latency benchmarks.',
    date: '2026-10-10',
    startTime: '14:30',
    durationMinutes: 45,
    status: 'upcoming',
    organizer: CURRENT_USER,
    participants: [
      CURRENT_USER,
      { id: 'usr-002', name: 'Elena Rostova', email: 'elena.rostova@intellmeet.com', avatar: 'ER', role: 'co-host' },
      { id: 'usr-003', name: 'Marcus Chen', email: 'marcus.chen@intellmeet.com', avatar: 'MC', role: 'attendee' },
      { id: 'usr-004', name: 'Dr. Sarah Vance', email: 'sarah.vance@neurotech.io', avatar: 'SV', role: 'attendee' },
    ],
    meetingCode: 'itm-782-941',
    meetingLink: 'https://intellmeet.ai/m/itm-782-941',
    createdAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'mtg-102',
    title: 'AI Companion 2.0 Feature Roadmap & UX Review',
    description: 'Product walkthrough of real-time meeting transcription, key decisions tagging, and action items extraction.',
    date: '2026-10-10',
    startTime: '16:00',
    durationMinutes: 60,
    status: 'upcoming',
    organizer: { id: 'usr-002', name: 'Elena Rostova', email: 'elena.rostova@intellmeet.com', avatar: 'ER', role: 'host' },
    participants: [
      CURRENT_USER,
      { id: 'usr-002', name: 'Elena Rostova', email: 'elena.rostova@intellmeet.com', avatar: 'ER', role: 'host' },
      { id: 'usr-005', name: 'Liam Davies', email: 'liam.davies@intellmeet.com', avatar: 'LD', role: 'attendee' },
      { id: 'usr-006', name: 'Sophia Wu', email: 'sophia.wu@intellmeet.com', avatar: 'SW', role: 'attendee' },
    ],
    meetingCode: 'itm-415-329',
    meetingLink: 'https://intellmeet.ai/m/itm-415-329',
    createdAt: '2026-10-08T14:20:00Z',
  },
  {
    id: 'mtg-103',
    title: 'Client Demo: Global Enterprise Security & Compliance',
    description: 'SOC2 Type II compliance walkthrough and end-to-end KMS encryption demo with Fortune 500 prospects.',
    date: '2026-10-11',
    startTime: '11:00',
    durationMinutes: 45,
    status: 'upcoming',
    organizer: CURRENT_USER,
    participants: [
      CURRENT_USER,
      { id: 'usr-007', name: 'Nathan Brooks', email: 'nathan@apexholdings.corp', avatar: 'NB', role: 'attendee' },
      { id: 'usr-008', name: 'Amara Patel', email: 'amara.patel@intellmeet.com', avatar: 'AP', role: 'attendee' },
    ],
    meetingCode: 'itm-892-104',
    meetingLink: 'https://intellmeet.ai/m/itm-892-104',
    createdAt: '2026-10-09T18:00:00Z',
  },
  {
    id: 'mtg-104',
    title: 'Sprint 28 Retro & Cross-Functional Alignment',
    description: 'Review velocity metrics, bug triage from v1.4 release, and sprint 29 priority backlog items.',
    date: '2026-10-09',
    startTime: '15:00',
    durationMinutes: 50,
    status: 'completed',
    organizer: CURRENT_USER,
    participants: [
      CURRENT_USER,
      { id: 'usr-002', name: 'Elena Rostova', email: 'elena.rostova@intellmeet.com', avatar: 'ER', role: 'attendee' },
      { id: 'usr-003', name: 'Marcus Chen', email: 'marcus.chen@intellmeet.com', avatar: 'MC', role: 'attendee' },
      { id: 'usr-005', name: 'Liam Davies', email: 'liam.davies@intellmeet.com', avatar: 'LD', role: 'attendee' },
    ],
    meetingCode: 'itm-302-618',
    meetingLink: 'https://intellmeet.ai/m/itm-302-618',
    summaryId: 'sum-201',
    createdAt: '2026-10-08T09:00:00Z',
  },
  {
    id: 'mtg-105',
    title: 'Design System Token Unification & Dark Mode Spec',
    description: 'Review contrast ratios, standard CSS variable tokens, and mobile navigation responsive breakpoints.',
    date: '2026-10-08',
    startTime: '10:30',
    durationMinutes: 40,
    status: 'completed',
    organizer: { id: 'usr-006', name: 'Sophia Wu', email: 'sophia.wu@intellmeet.com', avatar: 'SW', role: 'host' },
    participants: [
      CURRENT_USER,
      { id: 'usr-006', name: 'Sophia Wu', email: 'sophia.wu@intellmeet.com', avatar: 'SW', role: 'host' },
      { id: 'usr-003', name: 'Marcus Chen', email: 'marcus.chen@intellmeet.com', avatar: 'MC', role: 'attendee' },
    ],
    meetingCode: 'itm-549-712',
    meetingLink: 'https://intellmeet.ai/m/itm-549-712',
    summaryId: 'sum-202',
    createdAt: '2026-10-07T11:00:00Z',
  },
  {
    id: 'mtg-106',
    title: 'Weekly Leadership Standup & Pipeline Review',
    description: 'Discussion of enterprise ARR growth, Q4 hiring goals, and infrastructure budget allocations.',
    date: '2026-10-07',
    startTime: '09:00',
    durationMinutes: 30,
    status: 'completed',
    organizer: CURRENT_USER,
    participants: [
      CURRENT_USER,
      { id: 'usr-002', name: 'Elena Rostova', email: 'elena.rostova@intellmeet.com', avatar: 'ER', role: 'attendee' },
      { id: 'usr-008', name: 'Amara Patel', email: 'amara.patel@intellmeet.com', avatar: 'AP', role: 'attendee' },
    ],
    meetingCode: 'itm-193-482',
    meetingLink: 'https://intellmeet.ai/m/itm-193-482',
    summaryId: 'sum-203',
    createdAt: '2026-10-06T15:00:00Z',
  },
];

const INITIAL_SUMMARIES: MeetingSummary[] = [
  {
    id: 'sum-201',
    meetingId: 'mtg-104',
    meetingTitle: 'Sprint 28 Retro & Cross-Functional Alignment',
    date: '2026-10-09',
    durationMinutes: 50,
    sentiment: 'Productive',
    overview:
      'The engineering and product team reviewed Sprint 28 delivery metrics. Core WebRTC streaming achieved 99.98% uptime with zero packet-loss regressions across mobile endpoints. The team approved moving ahead with the AI meeting notes export pipeline.',
    keyPoints: [
      'Sprint 28 completed 42 story points with an 8% increase in velocity compared to Sprint 27.',
      'Edge audio latency was tested across 12 worldwide datacenters and stayed under 18ms.',
      'Design tokens have been decoupled from external CSS frameworks for maximum stability.',
    ],
    actionItems: [
      { id: 'act-1', task: 'Finalize automated WebSocket reconnect unit tests', assignee: 'Marcus Chen', completed: true, dueDate: 'Oct 11' },
      { id: 'act-2', task: 'Prepare enterprise SOC2 compliance evidence report', assignee: 'Elena Rostova', completed: false, dueDate: 'Oct 14' },
      { id: 'act-3', task: 'Publish updated CSS token documentation for design team', assignee: 'Alex Morgan', completed: false, dueDate: 'Oct 12' },
    ],
    decisions: [
      'Approved: Transitioning all meeting transcripts to markdown and rich HTML export.',
      'Approved: Defaulting all scheduled meeting lobbies to camera-preview mode.',
    ],
  },
  {
    id: 'sum-202',
    meetingId: 'mtg-105',
    meetingTitle: 'Design System Token Unification & Dark Mode Spec',
    date: '2026-10-08',
    durationMinutes: 40,
    sentiment: 'Action-Oriented',
    overview:
      'Sophia presented the unified CSS variable palette for the IntellMeet SaaS dashboard. The focus was on strict WCAG AAA contrast for dark navy backgrounds and crisp typography without external UI dependencies.',
    keyPoints: [
      'Zero external styling dependencies policy reaffirmed: pure native CSS tokens.',
      'High contrast color ratios: dark navy #0a0f24 paired with subtle #4f46e5 accent and slate #64748b neutrals.',
      'Mobile drawer layout verified for all screens under 1024px width.',
    ],
    actionItems: [
      { id: 'act-4', task: 'Review color tokens in high-contrast display environments', assignee: 'Sophia Wu', completed: true, dueDate: 'Oct 09' },
      { id: 'act-5', task: 'Implement persistent theme toggle in user preferences', assignee: 'Alex Morgan', completed: true, dueDate: 'Oct 10' },
    ],
    decisions: [
      'Standardized card border radius to 12px for modern SaaS aesthetics.',
      'Adopted responsive CSS clamp tokens for typography scales.',
    ],
  },
  {
    id: 'sum-203',
    meetingId: 'mtg-106',
    meetingTitle: 'Weekly Leadership Standup & Pipeline Review',
    date: '2026-10-07',
    durationMinutes: 30,
    sentiment: 'Strategic',
    overview:
      'Executive sync covering Q4 Enterprise expansion. Sales confirmed three new trials in the fintech and healthcare sectors requiring on-premises security attestation.',
    keyPoints: [
      'Enterprise pipeline expanded 24% month-over-month.',
      'Zero churn recorded in the enterprise Tier-1 cohort over the past 90 days.',
      'Customer satisfaction score reached 4.9/5 on AI Companion summaries.',
    ],
    actionItems: [
      { id: 'act-6', task: 'Coordinate pilot kickoff with Apex Holdings security lead', assignee: 'Amara Patel', completed: false, dueDate: 'Oct 15' },
      { id: 'act-7', task: 'Draft Q4 quarterly board slides on AI meeting metrics', assignee: 'Elena Rostova', completed: false, dueDate: 'Oct 16' },
    ],
    decisions: [
      'Authorized expansion of APAC cloud relay servers for Sydney and Singapore.',
    ],
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'AI Summary Ready',
    message: 'AI Summary for "Sprint 28 Retro" is available with 3 action items.',
    timestamp: '10 mins ago',
    read: false,
    type: 'ai',
    actionUrl: '/ai-notes',
  },
  {
    id: 'notif-2',
    title: 'Upcoming Meeting in 30m',
    message: '"Executive Architecture & WebRTC Latency Sync" starts at 14:30.',
    timestamp: '25 mins ago',
    read: false,
    type: 'meeting',
    actionUrl: '/meetings/mtg-101',
  },
  {
    id: 'notif-3',
    title: 'Team Invitation Accepted',
    message: 'Dr. Sarah Vance accepted your invitation to IntellMeet Enterprise.',
    timestamp: '2 hours ago',
    read: true,
    type: 'team',
    actionUrl: '/team',
  },
  {
    id: 'notif-4',
    title: 'System Security Health Check',
    message: 'All end-to-end 256-bit AES meeting encryption keys verified active.',
    timestamp: '5 hours ago',
    read: true,
    type: 'system',
    actionUrl: '/settings',
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-log-1',
    type: 'summary',
    title: 'AI Summary Generated',
    description: 'Sprint 28 Retro generated 3 action items and 2 key decisions.',
    timestamp: 'Today, 11:20 AM',
    iconType: 'sparkle',
  },
  {
    id: 'act-log-2',
    type: 'scheduled',
    title: 'New Meeting Scheduled',
    description: 'Alex Morgan scheduled "Client Demo: Security & Compliance".',
    timestamp: 'Today, 09:45 AM',
    iconType: 'calendar',
  },
  {
    id: 'act-log-3',
    type: 'completed',
    title: 'Meeting Concluded',
    description: '"Design System Token Unification" finished with 3 attendees.',
    timestamp: 'Yesterday, 11:15 AM',
    iconType: 'check',
  },
  {
    id: 'act-log-4',
    type: 'copied',
    title: 'Meeting Link Copied',
    description: 'Meeting invitation link copied for itm-782-941.',
    timestamp: 'Yesterday, 04:30 PM',
    iconType: 'copy',
  },
];

const INITIAL_TEAM: TeamMember[] = [];

const INITIAL_PREFERENCES: UserPreferences = {
  theme: 'light',
  themePreset: DEFAULT_THEME_PRESET_ID,
  accentColor: 'preset',
  customAccentHex: '#4f46e5',
  highContrast: false,
  reducedMotion: false,
  microphoneDevice: 'Default - MacBook Pro Microphone (Built-in)',
  cameraDevice: 'Default - FaceTime HD Camera (1080p)',
  speakerDevice: 'Default - Internal Speakers (Stereo)',
  autoMuteOnJoin: false,
  autoTurnOffCameraOnJoin: false,
  emailReminders: true,
  desktopNotifications: true,
  aiSummaryAutoGenerate: true,
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use initial mock data
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_MEETINGS;
  });

  const [summaries, setSummaries] = useState<MeetingSummary[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_SUMMARIES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_ACTIVITIES;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_PREFERENCES,
          ...parsed,
          themePreset: parsed.themePreset || DEFAULT_THEME_PRESET_ID,
          accentColor: parsed.accentColor || 'preset',
          customAccentHex: parsed.customAccentHex || '#4f46e5',
        };
      }
    } catch {
      // ignore
    }
    return INITIAL_PREFERENCES;
  });

  const [toast, setToast] = useState<ToastData | null>(null);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const openNewMeetingModal = useCallback(() => setIsNewMeetingModalOpen(true), []);
  const closeNewMeetingModal = useCallback(() => setIsNewMeetingModalOpen(false), []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch {
      // ignore
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries));
    } catch {
      // ignore
    }
  }, [summaries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch {
      // ignore
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
      applyThemeToDom(preferences);

      if (preferences.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyThemeToDom(preferences);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    } catch {
      // ignore
    }
  }, [preferences]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    globalToast[type](message);
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  }, []);

  const logActivity = useCallback((type: ActivityItem['type'], title: string, description: string) => {
    const newItem: ActivityItem = {
      id: `act-log-${Date.now()}`,
      type,
      title,
      description,
      timestamp: 'Just now',
      iconType: type === 'summary' ? 'sparkle' : type === 'scheduled' ? 'calendar' : type === 'copied' ? 'copy' : 'check',
    };
    setActivities((prev) => [newItem, ...prev.slice(0, 19)]);
  }, []);

  const createMeeting = useCallback(
    (data: {
      title: string;
      description?: string;
      date: string;
      startTime: string;
      durationMinutes: number;
      participantsEmails?: string[];
      isInstant?: boolean;
      passcode?: string;
    }): Meeting => {
      const codePart1 = Math.floor(100 + Math.random() * 900);
      const codePart2 = Math.floor(100 + Math.random() * 900);
      const meetingCode = `itm-${codePart1}-${codePart2}`;
      const passcode = data.passcode || Math.random().toString(36).substring(2, 8).toUpperCase();

      const parsedParticipants: Participant[] = [CURRENT_USER];
      if (data.participantsEmails && data.participantsEmails.length > 0) {
        data.participantsEmails.forEach((email, idx) => {
          const trimmed = email.trim();
          if (trimmed && trimmed.toLowerCase() !== CURRENT_USER.email.toLowerCase()) {
            const namePart = trimmed.split('@')[0].replace(/[._-]/g, ' ');
            const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const initials = formattedName.slice(0, 2).toUpperCase();
            parsedParticipants.push({
              id: `usr-guest-${idx + 1}-${Date.now()}`,
              name: formattedName,
              email: trimmed,
              avatar: initials,
              role: 'attendee',
            });
          }
        });
      }

      const newMeeting: Meeting = {
        id: `mtg-${Date.now()}`,
        title: data.title.trim(),
        description: data.description?.trim() || 'IntellMeet high-definition video collaboration session.',
        date: data.date,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        status: data.isInstant ? 'live' : 'upcoming',
        organizer: CURRENT_USER,
        participants: parsedParticipants,
        meetingCode,
        passcode,
        meetingLink: `https://intellmeet.ai/m/${meetingCode}`,
        isInstant: data.isInstant,
        createdAt: new Date().toISOString(),
      };

      setMeetings((prev) => [newMeeting, ...prev]);

      logActivity(
        'scheduled',
        data.isInstant ? 'Instant Meeting Launched' : 'New Meeting Scheduled',
        `"${newMeeting.title}" with code ${newMeeting.meetingCode}`
      );

      // Add notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: data.isInstant ? 'Live Meeting Started' : 'Meeting Scheduled',
        message: `"${newMeeting.title}" scheduled for ${newMeeting.date} at ${newMeeting.startTime}.`,
        timestamp: 'Just now',
        read: false,
        type: 'meeting',
        actionUrl: `/meetings/${newMeeting.id}`,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return newMeeting;
    },
    [logActivity]
  );

  const updateMeeting = useCallback(
    (id: string, updates: Partial<Meeting>) => {
      setMeetings((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const updated = { ...m, ...updates };
            return updated;
          }
          return m;
        })
      );
      showToast('Meeting updated successfully', 'success');
    },
    [showToast]
  );

  const cancelMeeting = useCallback(
    (id: string) => {
      let targetMeeting: Meeting | undefined;
      setMeetings((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            targetMeeting = m;
            return { ...m, status: 'cancelled' as MeetingStatus };
          }
          return m;
        })
      );

      if (targetMeeting) {
        logActivity('cancelled', 'Meeting Cancelled', `"${targetMeeting.title}" was cancelled.`);
        showToast(`Meeting "${targetMeeting.title}" has been cancelled`, 'info');
      }
    },
    [logActivity, showToast]
  );

  const deleteMeeting = useCallback(
    (id: string) => {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      showToast('Meeting removed from schedule', 'info');
    },
    [showToast]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  }, [showToast]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    showToast('Notification center cleared', 'info');
  }, [showToast]);

  const toggleActionItem = useCallback((summaryId: string, actionItemId: string) => {
    setSummaries((prev) =>
      prev.map((s) => {
        if (s.id === summaryId) {
          const updatedItems = s.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, completed: !ai.completed } : ai
          );
          return { ...s, actionItems: updatedItems };
        }
        return s;
      })
    );
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
    showToast('Settings saved successfully', 'success');
  }, [showToast]);

  const copyMeetingLink = useCallback(
    async (meeting: Meeting): Promise<boolean> => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(meeting.meetingLink);
        } else {
          // Fallback
          const textarea = document.createElement('textarea');
          textarea.value = meeting.meetingLink;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast(`Copied meeting link for "${meeting.title}" to clipboard!`, 'success');
        logActivity('copied', 'Meeting Link Copied', `Link for ${meeting.meetingCode} copied.`);
        return true;
      } catch {
        showToast('Unable to copy meeting link automatically', 'warning');
        return false;
      }
    },
    [showToast, logActivity]
  );

  const getMeetingById = useCallback(
    (id: string) => meetings.find((m) => m.id === id),
    [meetings]
  );

  const getSummaryByMeetingId = useCallback(
    (meetingId: string) => summaries.find((s) => s.meetingId === meetingId),
    [summaries]
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      meetings,
      summaries,
      notifications,
      activities,
      teamMembers: INITIAL_TEAM,
      preferences,
      toast,
      unreadNotificationCount,
      showToast,
      isNewMeetingModalOpen,
      openNewMeetingModal,
      closeNewMeetingModal,
      createMeeting,
      updateMeeting,
      cancelMeeting,
      deleteMeeting,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      toggleActionItem,
      updatePreferences,
      copyMeetingLink,
      getMeetingById,
      getSummaryByMeetingId,
    }),
    [
      meetings,
      summaries,
      notifications,
      activities,
      preferences,
      toast,
      unreadNotificationCount,
      showToast,
      isNewMeetingModalOpen,
      openNewMeetingModal,
      closeNewMeetingModal,
      createMeeting,
      updateMeeting,
      cancelMeeting,
      deleteMeeting,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      toggleActionItem,
      updatePreferences,
      copyMeetingLink,
      getMeetingById,
      getSummaryByMeetingId,
    ]
  );

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
};

export const useMeetings = (): MeetingContextType => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
};

export default MeetingContext;
