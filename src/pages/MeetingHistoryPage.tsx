import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import type { Meeting } from '../types/meeting';
import {
  CalendarIcon,
  UsersIcon,
  SearchIcon,
  SparkleIcon,
  CheckCircleIcon,
} from '../components/icons';

const CopyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const MeetingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, summaries, copyMeetingLink } = useMeetings();

  const [searchQuery, setSearchQuery] = useState('');

  const completedMeetings = useMemo(() => {
    return meetings
      .filter((m) => m.status === 'completed')
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.date.includes(q) ||
          m.organizer.name.toLowerCase().includes(q) ||
          m.meetingCode.toLowerCase().includes(q)
        );
      });
  }, [meetings, searchQuery]);

  return (
    <div>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Meeting History & Archive</h1>
          <p className="im-page-subtitle">
            Review past recordings, transcripts, attendee engagement stats, and generated AI summaries.
          </p>
        </div>

        <div className="im-page-actions">
          <Link to="/ai-notes" className="im-btn im-btn-secondary">
            <SparkleIcon size={16} />
            View AI Summaries ({summaries.length})
          </Link>
          <button className="im-btn im-btn-primary" onClick={() => navigate('/meetings/new')}>
            Schedule New Meeting
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="im-filter-bar">
        <div style={{ position: 'relative', maxWidth: 360, width: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--im-text-muted)',
              display: 'flex',
            }}
          >
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            className="im-input"
            style={{ paddingLeft: 34, height: 38 }}
            placeholder="Search archive by title, date, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search meeting history"
          />
        </div>
      </div>

      {/* History List Card */}
      <div className="im-card">
        <div className="im-card-body">
          {completedMeetings.length === 0 ? (
            <div className="im-empty-state">
              <div className="im-empty-state-icon">
                <CheckCircleIcon size={26} />
              </div>
              <h2 className="im-empty-state-title">No completed meetings found</h2>
              <p className="im-empty-state-desc">
                {searchQuery
                  ? `No historical meetings match "${searchQuery}".`
                  : 'You have not completed any meetings yet. Scheduled meetings will appear here once concluded.'}
              </p>
              <button className="im-btn im-btn-primary" onClick={() => navigate('/meetings')}>
                View Scheduled Meetings
              </button>
            </div>
          ) : (
            <div className="im-meeting-list">
              {completedMeetings.map((meeting: Meeting) => {
                const summary = summaries.find(
                  (s) => s.meetingId === meeting.id || s.id === meeting.summaryId
                );

                return (
                  <div key={meeting.id} className="im-meeting-item">
                    <div className="im-meeting-item-time">
                      <span className="im-meeting-time-start">{meeting.startTime}</span>
                      <span className="im-meeting-time-duration">{meeting.durationMinutes}m</span>
                    </div>

                    <div className="im-meeting-item-details">
                      <div className="im-meeting-title-row">
                        <Link to={`/meetings/${meeting.id}`} className="im-meeting-title">
                          {meeting.title}
                        </Link>
                        <span className="im-badge im-badge-completed">Completed</span>
                        {summary && (
                          <span className="im-badge im-badge-ai">
                            <SparkleIcon size={11} />
                            AI Summary Ready
                          </span>
                        )}
                      </div>

                      <div className="im-meeting-meta">
                        <span className="im-meeting-meta-item">
                          <CalendarIcon size={13} />
                          {meeting.date}
                        </span>
                        <span className="im-meeting-meta-item">
                          <UsersIcon size={13} />
                          Organized by {meeting.organizer.name}
                        </span>
                        <span className="im-meeting-meta-item">
                          Code: <strong>{meeting.meetingCode}</strong>
                        </span>

                        <div className="im-avatar-stack" title={`${meeting.participants.length} attendees`}>
                          {meeting.participants.slice(0, 4).map((p, idx) => (
                            <span key={idx} className="im-avatar-pill">
                              {p.avatar || p.name.slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="im-meeting-actions">
                      {summary && (
                        <Link
                          to={`/ai-notes?id=${summary.id}`}
                          className="im-btn im-btn-secondary im-btn-sm"
                          style={{ color: 'var(--im-ai-purple)', borderColor: 'var(--im-ai-purple)' }}
                        >
                          <SparkleIcon size={13} />
                          AI Notes
                        </Link>
                      )}

                      <Link
                        to={`/meetings/${meeting.id}`}
                        className="im-btn im-btn-secondary im-btn-sm"
                      >
                        Details
                      </Link>

                      <button
                        className="im-btn im-btn-ghost im-btn-sm"
                        onClick={() => copyMeetingLink(meeting)}
                        title="Copy meeting link"
                      >
                        <CopyIcon size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHistoryPage;
