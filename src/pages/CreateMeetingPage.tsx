import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import {
  CalendarIcon,
  UsersIcon,
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
} from '../components/icons';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMeetingId = searchParams.get('edit');
  const { meetings, createMeeting, updateMeeting, showToast } = useMeetings();

  const editingMeeting = useMemo(
    () => (editMeetingId ? meetings.find((m) => m.id === editMeetingId) : undefined),
    [editMeetingId, meetings]
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [description, setDescription] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

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
      setDescription(editingMeeting.description || '');
      setParticipants(editingMeeting.participants.map((p) => p.email).filter(Boolean));
    }
  }, [editingMeeting]);

  const handleAddParticipant = () => {
    const trimmed = participantInput.trim().toLowerCase();
    if (!trimmed) return;

    if (!EMAIL_REGEX.test(trimmed)) {
      setErrors((prev) => ({ ...prev, participant: 'Please enter a valid email address (e.g. name@company.com)' }));
      return;
    }

    if (participants.includes(trimmed)) {
      setErrors((prev) => ({ ...prev, participant: 'This participant email is already added' }));
      return;
    }

    setParticipants((prev) => [...prev, trimmed]);
    setParticipantInput('');
    setErrors((prev) => ({ ...prev, participant: undefined }));
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    setParticipants((prev) => prev.filter((e) => e !== emailToRemove));
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
    } else if (date < todayStr) {
      newErrors.date = 'Meeting date cannot be in the past';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, {
          title: title.trim(),
          date,
          startTime,
          durationMinutes,
          description: description.trim(),
        });
        navigate(`/meetings/${editingMeeting.id}`);
      } else {
        const newMtg = await createMeeting({
          title: title.trim(),
          date,
          startTime,
          durationMinutes,
          description: description.trim(),
          participantsEmails: participants,
        });
        showToast(`Meeting "${newMtg.title}" scheduled successfully!`, 'success');
        navigate(`/meetings/${newMtg.id}`);
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
          to="/meetings"
          className="im-btn im-btn-ghost im-btn-sm"
          style={{ paddingLeft: 0, gap: 6, color: 'var(--im-text-muted)' }}
        >
          <ArrowLeftIcon size={14} />
          Back to Meetings
        </Link>
      </div>

      <div className="im-card">
        <div className="im-card-header">
          <h1 className="im-card-title">
            <CalendarIcon size={20} />
            {editingMeeting ? 'Edit Scheduled Meeting' : 'Schedule a New Meeting'}
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
            All invitations encrypted with TLS 1.3
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="im-card-body">
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

            {/* Date and Start Time Grid */}
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

            {/* Duration selector */}
            <div className="im-form-group">
              <label className="im-form-label">
                Duration: <strong style={{ color: 'var(--im-primary)' }}>{durationMinutes} minutes</strong>
              </label>
              <div className="im-duration-pills">
                {[15, 30, 45, 60, 90].map((mins) => (
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

            {/* Description */}
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

            {/* Participants */}
            <div className="im-form-group">
              <label htmlFor="participant-email" className="im-form-label">
                Invite Participants <span className="im-form-label-optional">(Demo Mock Invitations)</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="participant-email"
                  type="email"
                  className={`im-input ${errors.participant ? 'error' : ''}`}
                  placeholder="colleague@company.com"
                  value={participantInput}
                  onChange={(e) => {
                    setParticipantInput(e.target.value);
                    if (errors.participant) setErrors((prev) => ({ ...prev, participant: undefined }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                />
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  onClick={handleAddParticipant}
                >
                  <PlusIcon size={15} />
                  Add
                </button>
              </div>
              {errors.participant && <div className="im-input-error-msg">{errors.participant}</div>}

              {/* Added participants tags */}
              {participants.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {participants.map((email) => (
                    <span
                      key={email}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--im-bg-subtle)',
                        border: '1px solid var(--im-border)',
                        borderRadius: 'var(--im-radius-full)',
                        padding: '4px 10px',
                        fontSize: '0.8125rem',
                        color: 'var(--im-text-primary)',
                      }}
                    >
                      <UsersIcon size={12} />
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(email)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--im-text-muted)',
                          padding: 0,
                          fontSize: '1rem',
                          lineHeight: 1,
                        }}
                        aria-label={`Remove ${email}`}
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
                IntellMeet AI Companion will automatically join this room at the scheduled time to generate live notes.
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
