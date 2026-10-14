import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import { usersApi } from '../api/users.api';
import type { UserItem } from '../types/user';
import {
  CalendarIcon,
  UsersIcon,
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
} from '../components/icons';
import { getTodayLocalDateString } from '../utils/dateUtils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteeItem {
  email: string;
  name?: string;
  userId?: string;
  isRegistered?: boolean;
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, +05:30)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, -05:00/-04:00)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT, -06:00/-05:00)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT, -07:00/-06:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, -08:00/-07:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, +00:00/+01:00)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, +01:00/+02:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST, +01:00/+02:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, +04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, +08:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, +09:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT, +10:00/+11:00)' },
];

export const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMeetingId = searchParams.get('edit');
  const dateParam = searchParams.get('date');
  const timeParam = searchParams.get('time');
  const fromParam = searchParams.get('from');
  const { meetings, createMeeting, updateMeeting, showToast } = useMeetings();

  const editingMeeting = useMemo(
    () => (editMeetingId ? meetings.find((m) => m.id === editMeetingId) : undefined),
    [editMeetingId, meetings]
  );

  const todayStr = useMemo(() => getTodayLocalDateString(), []);
  const detectedTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const timezoneOptions = useMemo(() => {
    const list = [...COMMON_TIMEZONES];
    if (!list.some((tz) => tz.value === detectedTz)) {
      list.unshift({ value: detectedTz, label: `${detectedTz} (Local System Time)` });
    }
    return list;
  }, [detectedTz]);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return dateParam < todayStr ? todayStr : dateParam;
    }
    return todayStr;
  });
  const [startTime, setStartTime] = useState(() => {
    if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
      return timeParam;
    }
    // Default to next nearest hour + 1
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const hh = String(d.getHours()).padStart(2, '0');
    return `${hh}:00`;
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [timezone, setTimezone] = useState(detectedTz);
  const [description, setDescription] = useState('');

  // Participants & search
  const [participantInput, setParticipantInput] = useState('');
  const [invitees, setInvitees] = useState<InviteeItem[]>([]);
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    startTime?: string;
    participant?: string;
  }>({});

  // Prefill when editing
  useEffect(() => {
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      setDate(editingMeeting.date);
      setStartTime(editingMeeting.startTime);
      setDurationMinutes(editingMeeting.durationMinutes);
      setTimezone(editingMeeting.timezone || detectedTz);
      setDescription(editingMeeting.description || '');
      setInvitees(
        editingMeeting.participants.map((p) => ({
          email: p.email,
          name: p.name,
          userId: p.id,
          isRegistered: Boolean(p.id && p.id !== 'usr'),
        }))
      );
    } else {
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        setDate(dateParam < todayStr ? todayStr : dateParam);
      }
      if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
        setStartTime(timeParam);
      }
    }
  }, [editingMeeting, dateParam, timeParam, todayStr, detectedTz]);

  // Debounced search for registered users
  useEffect(() => {
    const query = participantInput.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await usersApi.getUsers({ k: query, limit: 6 });
        if (res?.data?.users) {
          setSearchResults(res.data.users);
          setShowDropdown(true);
        }
      } catch {
        // Search error ignored silently
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [participantInput]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddRegisteredUser = (user: UserItem) => {
    const email = user.email.toLowerCase();
    if (invitees.some((i) => i.email === email)) {
      setErrors((prev) => ({ ...prev, participant: `${user.name} is already added.` }));
      setShowDropdown(false);
      return;
    }

    setInvitees((prev) => [
      ...prev,
      {
        email,
        name: user.name,
        userId: user.id,
        isRegistered: true,
      },
    ]);
    setParticipantInput('');
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, participant: undefined }));
  };

  const handleAddEmailDirect = () => {
    const trimmed = participantInput.trim().toLowerCase();
    if (!trimmed) return;

    if (!EMAIL_REGEX.test(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        participant: 'Please enter a valid email address (e.g. colleague@company.com)',
      }));
      return;
    }

    if (invitees.some((i) => i.email === trimmed)) {
      setErrors((prev) => ({ ...prev, participant: 'This invitee email is already added.' }));
      return;
    }

    setInvitees((prev) => [
      ...prev,
      {
        email: trimmed,
        name: trimmed.split('@')[0],
        isRegistered: false,
      },
    ]);
    setParticipantInput('');
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, participant: undefined }));
  };

  const handleRemoveInvitee = (emailToRemove: string) => {
    setInvitees((prev) => prev.filter((i) => i.email !== emailToRemove));
  };

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: { title?: string; date?: string; startTime?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Meeting title is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    } else if (!editingMeeting && date < todayStr) {
      newErrors.date = 'Cannot schedule meetings in the past. Please select today or a future date.';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    } else if (date === todayStr && !editingMeeting) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const [hStr, mStr] = startTime.split(':');
      const meetingHour = parseInt(hStr, 10);
      const meetingMinute = parseInt(mStr, 10);
      // Grace period of 1 minute
      if (meetingHour < currentHours || (meetingHour === currentHours && meetingMinute < currentMinutes - 1)) {
        newErrors.startTime = 'Start time has already passed for today. Please select a future time.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const participantEmails = invitees.map((i) => i.email);
      const participantUserIds = invitees.filter((i) => i.userId).map((i) => i.userId as string);

      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, {
          title: title.trim(),
          date,
          startTime,
          durationMinutes,
          timezone,
          description: description.trim(),
        });
        navigate(`/meetings/${editingMeeting.id}`);
      } else {
        const newMtg = await createMeeting({
          title: title.trim(),
          date,
          startTime,
          durationMinutes,
          timezone,
          description: description.trim(),
          participantsEmails: participantEmails,
          participantUserIds,
        });
        showToast(`Meeting "${newMtg.title}" scheduled successfully! Invitations sent.`, 'success');
        if (fromParam === 'schedule') {
          navigate('/schedule');
        } else {
          navigate(`/meetings/${newMtg.id}`);
        }
      }
    } catch {
      // Error is handled with toast in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          to={fromParam === 'schedule' ? '/schedule' : '/meetings'}
          className="im-btn im-btn-ghost im-btn-sm"
          style={{ paddingLeft: 0, gap: 6, color: 'var(--im-text-muted)' }}
        >
          <ArrowLeftIcon size={14} />
          {fromParam === 'schedule' ? 'Back to Schedule' : 'Back to Meetings'}
        </Link>
      </div>

      <div className="im-card">
        <div className="im-card-header">
          <h1 className="im-card-title">
            <CalendarIcon size={20} />
            {editingMeeting ? 'Edit Scheduled Meeting' : 'Schedule a New Meeting'}
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
            HTML email invitations & .ics calendar sync enabled
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="im-card-body">
            {/* Pre-selected date notice from Calendar */}
            {dateParam && !editingMeeting && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: dateParam < todayStr ? '#fef3c7' : 'var(--im-primary-light, #eef2ff)',
                  color: dateParam < todayStr ? '#92400e' : 'var(--im-primary, #4f46e5)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: 16,
                  border: `1px solid ${dateParam < todayStr ? '#fcd34d' : 'rgba(79, 70, 229, 0.2)'}`,
                }}
              >
                <CalendarIcon size={16} />
                <span>
                  {dateParam < todayStr
                    ? `Past date (${dateParam}) cannot be scheduled. Automatically adjusted to today: `
                    : 'Date locked from Calendar: '}
                  <strong>
                    {new Date(date + 'T00:00:00').toLocaleDateString('default', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                </span>
              </div>
            )}

            {/* Title */}
            <div className="im-form-group">
              <label htmlFor="meeting-title" className="im-form-label">
                Meeting Title <span style={{ color: 'var(--im-danger)' }}>*</span>
              </label>
              <input
                id="meeting-title"
                type="text"
                className={`im-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Q4 Product Architecture Sync"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
              />
              {errors.title && <div className="im-input-error-msg">{errors.title}</div>}
            </div>

            {/* Date, Start Time, and Timezone Grid */}
            <div className="im-form-row">
              <div className="im-form-group">
                <label htmlFor="meeting-date" className="im-form-label">
                  Date <span style={{ color: 'var(--im-danger)' }}>*</span>
                </label>
                <input
                  id="meeting-date"
                  type="date"
                  className={`im-input ${errors.date ? 'error' : ''}`}
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                />
                {errors.date && <div className="im-input-error-msg">{errors.date}</div>}
              </div>

              <div className="im-form-group">
                <label htmlFor="meeting-time" className="im-form-label">
                  Start Time <span style={{ color: 'var(--im-danger)' }}>*</span>
                </label>
                <input
                  id="meeting-time"
                  type="time"
                  className={`im-input ${errors.startTime ? 'error' : ''}`}
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: undefined }));
                  }}
                />
                {errors.startTime && <div className="im-input-error-msg">{errors.startTime}</div>}
              </div>
            </div>

            {/* Timezone Selector */}
            <div className="im-form-group">
              <label htmlFor="meeting-timezone" className="im-form-label">
                Meeting Timezone <span style={{ color: 'var(--im-danger)' }}>*</span>
              </label>
              <select
                id="meeting-timezone"
                className="im-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {timezoneOptions.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 4, display: 'block' }}>
                All participants will view times in their configured timezone with daylight saving adjustments.
              </span>
            </div>

            {/* Duration selector */}
            <div className="im-form-group">
              <label className="im-form-label">
                Duration: <strong style={{ color: 'var(--im-primary)' }}>{durationMinutes} minutes</strong>
              </label>
              <div className="im-duration-pills">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`im-duration-pill ${durationMinutes === mins ? 'active' : ''}`}
                    onClick={() => setDurationMinutes(mins)}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Agenda */}
            <div className="im-form-group">
              <label htmlFor="meeting-description" className="im-form-label">
                Agenda / Description <span className="im-form-label-optional">(Optional)</span>
              </label>
              <textarea
                id="meeting-description"
                rows={3}
                className="im-textarea"
                placeholder="Add meeting agenda, discussion topics, or preparatory reading links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Participants Picker */}
            <div className="im-form-group" ref={dropdownRef} style={{ position: 'relative' }}>
              <label htmlFor="participant-email" className="im-form-label">
                Invite Participants <span className="im-form-label-optional">{isSearchingUsers ? '(Searching team...)' : '(Registered Users & External Emails)'}</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="participant-email"
                  type="text"
                  className={`im-input ${errors.participant ? 'error' : ''}`}
                  placeholder="Search user name or enter colleague@company.com"
                  value={participantInput}
                  onChange={(e) => {
                    setParticipantInput(e.target.value);
                    if (errors.participant) setErrors((prev) => ({ ...prev, participant: undefined }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmailDirect();
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                />
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  onClick={handleAddEmailDirect}
                >
                  <PlusIcon size={15} />
                  Add
                </button>
              </div>

              {/* User search dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    backgroundColor: 'var(--im-bg-surface, #ffffff)',
                    border: '1px solid var(--im-border, #e2e8f0)',
                    borderRadius: 8,
                    marginTop: 4,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  <div style={{ padding: '6px 12px', fontSize: '0.7rem', color: 'var(--im-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Team Members
                  </div>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleAddRegisteredUser(user)}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--im-border-subtle, #f1f5f9)',
                        backgroundColor: 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--im-bg-subtle, #f8fafc)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'var(--im-primary-light, #eef2ff)',
                            color: 'var(--im-primary, #4f46e5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <span className="im-badge im-badge-upcoming" style={{ fontSize: '0.65rem' }}>
                        Member
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {errors.participant && <div className="im-input-error-msg">{errors.participant}</div>}

              {/* Added invitees tags */}
              {invitees.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {invitees.map((item) => (
                    <span
                      key={item.email}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: item.isRegistered ? 'var(--im-primary-light, #eef2ff)' : 'var(--im-bg-subtle, #f8fafc)',
                        border: `1px solid ${item.isRegistered ? 'rgba(79, 70, 229, 0.3)' : 'var(--im-border)'}`,
                        borderRadius: 'var(--im-radius-full)',
                        padding: '4px 12px',
                        fontSize: '0.8125rem',
                        color: item.isRegistered ? 'var(--im-primary, #4f46e5)' : 'var(--im-text-primary)',
                      }}
                    >
                      <UsersIcon size={12} />
                      <span style={{ fontWeight: 600 }}>{item.name || item.email}</span>
                      {item.isRegistered && (
                        <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({item.email})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveInvitee(item.email)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--im-text-muted)',
                          padding: 0,
                          fontSize: '1rem',
                          lineHeight: 1,
                        }}
                        aria-label={`Remove ${item.email}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                background: 'var(--im-primary-light)',
                borderRadius: 'var(--im-radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: '0.8125rem',
                color: 'var(--im-primary-text)',
              }}
            >
              <CheckCircleIcon size={18} />
              <span>
                Invitees will automatically receive an invitation email containing a 1-click meeting join link and an attached iCalendar (.ics) event.
              </span>
            </div>
          </div>

          <div className="im-card-footer">
            <button
              type="button"
              className="im-btn im-btn-secondary"
              onClick={() => navigate('/meetings')}
            >
              Cancel
            </button>
            <button type="submit" className="im-btn im-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingMeeting ? 'Save Changes' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
