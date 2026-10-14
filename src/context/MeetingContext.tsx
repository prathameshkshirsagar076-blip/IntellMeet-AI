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
import { getStoredUser } from '../utils/tokenStorage';
import { getTodayLocalDateString } from '../utils/dateUtils';
import { meetingApi } from '../api/meeting.api';

export function getCurrentParticipant(): Participant {
  const stored = getStoredUser();
  if (stored) {
    const initials = (stored.name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
    return {
      id: stored.id,
      name: stored.name || 'User',
      email: stored.email || '',
      avatar: stored.avatar || initials,
      role: 'host',
      isOnline: true,
    };
  }
  return {
    id: '',
    name: 'User',
    email: '',
    avatar: 'U',
    role: 'host',
    isOnline: true,
  };
}

interface BackendOrganizer {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface BackendParticipant {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'host' | 'co-host' | 'attendee';
  status?: string;
}

export interface BackendMeetingRecord {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  durationMinutes?: number;
  status?: MeetingStatus;
  meetingCode?: string;
  passcode?: string;
  timezone?: string;
  myInvitationStatus?: 'invited' | 'pending' | 'accepted' | 'declined' | 'tentative' | 'none';
  myRole?: 'host' | 'co-host' | 'attendee';
  participantCount?: number;
  isInstant?: boolean;
  createdAt?: string;
  organizerId?: BackendOrganizer | string;
  participants?: BackendParticipant[];
  [key: string]: unknown;
}

export function mapBackendMeeting(b: BackendMeetingRecord | Record<string, unknown>): Meeting {
  const record = b as BackendMeetingRecord;
  const fallback = getCurrentParticipant();
  const org = typeof record.organizerId === 'object' && record.organizerId !== null ? record.organizerId : undefined;
  const orgId = org ? (org._id || org.id || 'usr-host') : (typeof record.organizerId === 'string' ? record.organizerId : fallback.id);

  const organizer: Participant = {
    id: orgId,
    name: org?.name || fallback.name || 'Host',
    email: org?.email || fallback.email || '',
    avatar: org?.avatar || fallback.avatar || (org?.name ? org.name.slice(0, 2).toUpperCase() : 'H'),
    role: 'host',
    isOnline: true,
  };

  const participants: Participant[] = Array.isArray(record.participants)
    ? record.participants.map((p: BackendParticipant) => ({
      id: p.id || p._id || p.userId || 'usr',
      name: p.name || 'Participant',
      email: p.email || '',
      avatar: p.avatar || (p.name ? p.name.slice(0, 2).toUpperCase() : 'P'),
      role: p.role || 'attendee',
      isOnline: p.status === 'joined',
    }))
    : [organizer];

  let dateStr = '';
  if (typeof record.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.date.slice(0, 10))) {
    dateStr = record.date.slice(0, 10);
  }

  let timeStr = '';
  if (typeof record.startTime === 'string' && record.startTime) {
    timeStr = record.startTime;
  }

  if (!dateStr || !timeStr) {
    if (record.scheduledStartAt) {
      const dateObj = new Date(record.scheduledStartAt);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        if (!dateStr) dateStr = `${year}-${month}-${day}`;
        if (!timeStr) {
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          timeStr = `${hours}:${minutes}`;
        }
      }
    }
  }

  if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
  if (!timeStr) timeStr = '14:00';
  const meetingId = record._id || record.id || '';
  const code = record.meetingCode || meetingId;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return {
    id: meetingId,
    title: record.title || 'Untitled Meeting',
    description: record.description || '',
    date: dateStr,
    startTime: timeStr,
    durationMinutes: record.durationMinutes || 45,
    status: record.status || 'upcoming',
    organizer,
    participants,
    meetingCode: code,
    passcode: record.passcode || '',
    timezone: (typeof record.timezone === 'string' && record.timezone) ? record.timezone : 'UTC',
    myInvitationStatus: (typeof record.myInvitationStatus === 'string' ? record.myInvitationStatus : undefined) || (orgId === fallback.id ? 'accepted' : 'pending'),
    myRole: (typeof record.myRole === 'string' ? record.myRole : undefined) || (orgId === fallback.id ? 'host' : 'attendee'),
    participantCount: typeof record.participantCount === 'number' ? record.participantCount : participants.length,
    scheduledStartAt: typeof record.scheduledStartAt === 'string' ? record.scheduledStartAt : undefined,
    scheduledEndAt: typeof record.scheduledEndAt === 'string' ? record.scheduledEndAt : undefined,
    meetingLink: `${origin}/meeting/${code}`,
    isInstant: Boolean(record.isInstant),
    createdAt: record.createdAt || new Date().toISOString(),
  };
}

export function sortMeetingsLatestFirst(list: Meeting[]): Meeting[] {
  return [...list].sort((a, b) => {
    // 1. Live meetings always on top
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;

    // 2. Latest created on top
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (createdA && createdB && createdA !== createdB && !isNaN(createdA) && !isNaN(createdB)) {
      return createdB - createdA;
    }

    // 3. Fallback: scheduled start time latest first
    const schedA = new Date(a.scheduledStartAt || `${a.date}T${a.startTime}`).getTime();
    const schedB = new Date(b.scheduledStartAt || `${b.date}T${b.startTime}`).getTime();
    if (!isNaN(schedA) && !isNaN(schedB)) {
      return schedB - schedA;
    }
    return 0;
  });
}

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
    timezone?: string;
    participantsEmails?: string[];
    participantUserIds?: string[];
    isInstant?: boolean;
    passcode?: string;
  }) => Promise<Meeting>;
  fetchMeetings: () => Promise<void>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<void>;
  cancelMeeting: (id: string) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  acceptInvitation: (meetingId: string) => Promise<void>;
  declineInvitation: (meetingId: string) => Promise<void>;
  resendInvitation: (meetingId: string, invitationId: string) => Promise<{ success: boolean; deliveryStatus: string }>;
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

const INITIAL_MEETINGS: Meeting[] = [];
const INITIAL_SUMMARIES: MeetingSummary[] = [];
const INITIAL_NOTIFICATIONS: AppNotification[] = [];
const INITIAL_ACTIVITIES: ActivityItem[] = [];
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
      if (stored) return sortMeetingsLatestFirst(JSON.parse(stored));
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

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await meetingApi.getMeetings();
      if (res && res.data && Array.isArray(res.data.meetings)) {
        const mapped = res.data.meetings.map(mapBackendMeeting);
        setMeetings(sortMeetingsLatestFirst(mapped));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[MeetingContext] Backend fetch error:', msg);
    }
  }, []);

  // Fetch meetings from real backend on mount
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

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
    async (data: {
      title: string;
      description?: string;
      date: string;
      startTime: string;
      durationMinutes: number;
      timezone?: string;
      participantsEmails?: string[];
      participantUserIds?: string[];
      isInstant?: boolean;
      passcode?: string;
    }): Promise<Meeting> => {
      try {
        const todayStr = getTodayLocalDateString();
        if (!data.isInstant && data.date < todayStr) {
          throw new Error('Cannot schedule meetings in the past. Please choose today or a future date.');
        }

        const resolvedTimezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        const res = await meetingApi.createMeeting({
          title: data.title.trim(),
          description: data.description?.trim(),
          date: data.date,
          startTime: data.startTime,
          durationMinutes: data.durationMinutes,
          timezone: resolvedTimezone,
          participantEmails: data.participantsEmails,
          participantUserIds: data.participantUserIds,
          isInstant: data.isInstant,
          passcode: data.passcode,
        });

        if (!res?.data) {
          throw new Error(res?.message || 'Failed to create meeting');
        }

        const realMeeting = mapBackendMeeting({
          ...res.data,
          date: (typeof res.data.date === 'string' && res.data.date) || data.date,
          startTime: (typeof res.data.startTime === 'string' && res.data.startTime) || data.startTime,
        });
        setMeetings((prev) => sortMeetingsLatestFirst([realMeeting, ...prev.filter((m) => m.id !== realMeeting.id)]));

        logActivity(
          'scheduled',
          data.isInstant ? 'Instant Meeting Launched' : 'New Meeting Scheduled',
          `"${realMeeting.title}" with code ${realMeeting.meetingCode}`
        );

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: data.isInstant ? 'Live Meeting Started' : 'Meeting Scheduled',
          message: `"${realMeeting.title}" scheduled for ${realMeeting.date} at ${realMeeting.startTime}.`,
          timestamp: 'Just now',
          read: false,
          type: 'meeting',
          actionUrl: `/meetings/${realMeeting.id}`,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        return realMeeting;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create meeting';
        showToast(msg, 'error');
        throw err;
      }
    },
    [logActivity, showToast]
  );

  const updateMeeting = useCallback(
    async (id: string, updates: Partial<Meeting>) => {
      try {
        const todayStr = getTodayLocalDateString();
        if (updates.date && updates.date < todayStr) {
          throw new Error('Cannot move meetings to a past date. Please choose today or a future date.');
        }

        await meetingApi.updateMeeting(id, updates);
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
        );
        showToast('Meeting updated successfully', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update meeting';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const cancelMeeting = useCallback(
    async (id: string) => {
      try {
        await meetingApi.cancelMeeting(id);
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
          logActivity('cancelled', 'Meeting Cancelled', `"${(targetMeeting as Meeting).title}" was cancelled.`);
          showToast(`Meeting "${(targetMeeting as Meeting).title}" has been cancelled`, 'info');
        } else {
          showToast('Meeting cancelled successfully', 'info');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel meeting';
        showToast(msg, 'error');
        throw err;
      }
    },
    [logActivity, showToast]
  );

  const deleteMeeting = useCallback(
    async (id: string) => {
      try {
        await meetingApi.deleteMeeting(id);
        setMeetings((prev) => prev.filter((m) => m.id !== id));
        showToast('Meeting removed from schedule', 'info');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete meeting';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const acceptInvitation = useCallback(
    async (meetingId: string) => {
      try {
        await meetingApi.acceptInvitation(meetingId);
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingId ? { ...m, myInvitationStatus: 'accepted' } : m))
        );
        showToast('Meeting invitation accepted', 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to accept invitation';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const declineInvitation = useCallback(
    async (meetingId: string) => {
      try {
        await meetingApi.declineInvitation(meetingId);
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingId ? { ...m, myInvitationStatus: 'declined' } : m))
        );
        showToast('Meeting invitation declined', 'info');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to decline invitation';
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const resendInvitation = useCallback(
    async (meetingId: string, invitationId: string): Promise<{ success: boolean; deliveryStatus: string }> => {
      try {
        const res = await meetingApi.resendInvitation(meetingId, invitationId);
        showToast('Invitation email resent successfully', 'success');
        return res.data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to resend invitation';
        showToast(msg, 'error');
        throw err;
      }
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
      fetchMeetings,
      updateMeeting,
      cancelMeeting,
      deleteMeeting,
      acceptInvitation,
      declineInvitation,
      resendInvitation,
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
      fetchMeetings,
      updateMeeting,
      cancelMeeting,
      deleteMeeting,
      acceptInvitation,
      declineInvitation,
      resendInvitation,
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
