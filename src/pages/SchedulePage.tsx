import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import type { Meeting } from '../types/meeting';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  VideoIcon,
  UsersIcon,
  CheckCircleIcon,
  SparkleIcon,
} from '../components/icons';
import { formatLocalDate, getTodayLocalDateString } from '../utils/dateUtils';
import '../styles/schedule.css';

// Custom icons
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

const DownloadIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, copyMeetingLink, acceptInvitation, declineInvitation } = useMeetings();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const todayStr = useMemo(() => getTodayLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [previewMeeting, setPreviewMeeting] = useState<Meeting | null>(null);
  const [viewDayModalDate, setViewDayModalDate] = useState<string | null>(null);

  // Month and Year formatters
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
      setSelectedDate(formatLocalDate(prev));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSelectedDate(formatLocalDate(next));
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(todayStr);
  };

  // Build calendar matrix for current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sun
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
    }[] = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const dateStr = formatLocalDate(d);
      days.push({
        date: d,
        dateStr,
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const dateStr = formatLocalDate(d);
      days.push({
        date: d,
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }

    // Next month filler days to complete rows (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const dateStr = formatLocalDate(d);
      days.push({
        date: d,
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Index meetings by date
  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    meetings.forEach((m) => {
      const list = map.get(m.date) || [];
      list.push(m);
      map.set(m.date, list);
    });
    return map;
  }, [meetings]);

  // Meetings on selected date
  const selectedDateMeetings = useMemo(() => {
    const list = meetingsByDate.get(selectedDate) || [];
    return list.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [meetingsByDate, selectedDate]);

  // Summary Metrics
  const todayMeetings = useMemo(() => {
    return (meetingsByDate.get(todayStr) || []).filter((m) => m.status !== 'cancelled');
  }, [meetingsByDate, todayStr]);

  const upcomingMeetingsCount = useMemo(() => {
    return meetings.filter((m) => m.status === 'upcoming' || m.status === 'live').length;
  }, [meetings]);

  const totalScheduledMinutesToday = useMemo(() => {
    return todayMeetings.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
  }, [todayMeetings]);

  const nextUpcomingMeeting = useMemo(() => {
    const upcoming = meetings
      .filter((m) => (m.status === 'upcoming' || m.status === 'live') && m.date >= todayStr)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return upcoming[0] || null;
  }, [meetings, todayStr]);

  // Generate .ICS file download
  const handleExportICS = () => {
    if (meetings.length === 0) {
      alert('No meetings to export.');
      return;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IntellMeet AI//Meeting Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    meetings.forEach((m) => {
      const cleanDate = m.date.replace(/-/g, '');
      const [h, min] = m.startTime.split(':');
      const startDateTime = `${cleanDate}T${h}${min}00`;

      // End time calc
      const startMinTotal = parseInt(h, 10) * 60 + parseInt(min, 10) + m.durationMinutes;
      const endH = String(Math.floor(startMinTotal / 60)).padStart(2, '0');
      const endM = String(startMinTotal % 60).padStart(2, '0');
      const endDateTime = `${cleanDate}T${endH}${endM}00`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${m.id}@intellmeet.ai`,
        `DTSTAMP:${cleanDate}T000000Z`,
        `DTSTART:${startDateTime}`,
        `DTEND:${endDateTime}`,
        `SUMMARY:${m.title}`,
        `DESCRIPTION:Join IntellMeet: ${m.meetingLink}\\nMeeting Code: ${m.meetingCode}`,
        `URL:${m.meetingLink}`,
        `STATUS:${m.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'intellmeet-my-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Week view dates calculation
  const weekDates = useMemo(() => {
    const curr = new Date(currentDate);
    const firstDay = curr.getDate() - curr.getDay();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.getFullYear(), curr.getMonth(), firstDay + i);
      const dateStr = formatLocalDate(nextDay);
      week.push({
        date: nextDay,
        dateStr,
        dayName: WEEKDAYS[i],
        dayNum: nextDay.getDate(),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }
    return week;
  }, [currentDate, todayStr]);

  return (
    <div className="im-schedule-container">
      {/* Page Header */}
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">My Schedule & Calendar</h1>
          <p className="im-page-subtitle">
            Interactive calendar timetable, session planning, and smart focus time management.
          </p>
        </div>

        <div className="im-page-actions">
          <button className="im-btn im-btn-secondary" onClick={handleExportICS} title="Export calendar to iCal format">
            <DownloadIcon size={15} />
            Export .ICS
          </button>
          <Link to="/meetings" className="im-btn im-btn-secondary">
            <VideoIcon size={15} />
            All Meetings
          </Link>
          <button
            className="im-btn im-btn-primary"
            onClick={() => {
              const targetDate = selectedDate < todayStr ? todayStr : selectedDate;
              navigate(`/meetings/new?date=${targetDate}&from=schedule`);
            }}
          >
            <PlusIcon size={16} />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Top Workload & Insights Cards */}
      <div className="im-schedule-insights-grid">
        <div className="im-schedule-stat-card">
          <div className="im-schedule-stat-icon primary">
            <CalendarIcon size={22} />
          </div>
          <div className="im-schedule-stat-info">
            <div className="im-schedule-stat-value">{todayMeetings.length} Calls</div>
            <div className="im-schedule-stat-label">Scheduled Today</div>
          </div>
        </div>

        <div className="im-schedule-stat-card">
          <div className="im-schedule-stat-icon amber">
            <ClockIcon size={22} />
          </div>
          <div className="im-schedule-stat-info">
            <div className="im-schedule-stat-value">
              {totalScheduledMinutesToday > 0 ? `${totalScheduledMinutesToday} mins` : 'Free Today'}
            </div>
            <div className="im-schedule-stat-label">Talk Time Today</div>
          </div>
        </div>

        <div className="im-schedule-stat-card">
          <div className="im-schedule-stat-icon purple">
            <SparkleIcon size={22} />
          </div>
          <div className="im-schedule-stat-info">
            <div className="im-schedule-stat-value">{upcomingMeetingsCount} Sessions</div>
            <div className="im-schedule-stat-label">Total Upcoming</div>
          </div>
        </div>

        <div className="im-schedule-stat-card">
          <div className="im-schedule-stat-icon success">
            <CheckCircleIcon size={22} />
          </div>
          <div className="im-schedule-stat-info">
            <div className="im-schedule-stat-value">
              {nextUpcomingMeeting ? `${nextUpcomingMeeting.startTime}` : 'None'}
            </div>
            <div className="im-schedule-stat-label">
              {nextUpcomingMeeting ? `Next: ${nextUpcomingMeeting.title.slice(0, 16)}...` : 'Next Meeting'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls & View Tabs */}
      <div className="im-cal-toolbar">
        <div className="im-cal-nav-group">
          <div className="im-cal-month-title">
            {monthName} {currentYear}
          </div>
          <button className="im-cal-nav-btn" onClick={handlePrev} title="Previous">
            <ChevronLeftIcon size={16} />
          </button>
          <button className="im-cal-today-btn" onClick={handleToday}>
            Today
          </button>
          <button className="im-cal-nav-btn" onClick={handleNext} title="Next">
            <ChevronRightIcon size={16} />
          </button>
        </div>

        {/* View mode switcher */}
        <div className="im-cal-view-tabs" role="tablist">
          <button
            className={`im-cal-view-tab ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={`im-cal-view-tab ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`im-cal-view-tab ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button
            className={`im-cal-view-tab ${viewMode === 'agenda' ? 'active' : ''}`}
            onClick={() => setViewMode('agenda')}
          >
            Agenda
          </button>
        </div>

        {/* Legend */}
        <div className="im-cal-status-legend">
          <span><span className="im-cal-legend-dot upcoming" />Upcoming</span>
          <span><span className="im-cal-legend-dot live" />Live</span>
          <span><span className="im-cal-legend-dot completed" />Completed</span>
          <span><span className="im-cal-legend-dot cancelled" />Cancelled</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="im-schedule-main-layout">
        {/* Left Column: Calendar View based on selected mode */}
        <div className="im-schedule-left-col">
          {viewMode === 'month' && (
            <div className="im-cal-month-card">
              <div className="im-cal-weekdays-header">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="im-cal-weekday-name">
                    {day}
                  </div>
                ))}
              </div>

              <div className="im-cal-days-grid">
                {calendarDays.map((dayObj, idx) => {
                  const dayMeetings = meetingsByDate.get(dayObj.dateStr) || [];
                  const isSelected = dayObj.dateStr === selectedDate;

                  return (
                    <div
                      key={idx}
                      className={`im-cal-day-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${
                        dayObj.isToday ? 'today' : ''
                      } ${dayObj.isPast ? 'is-past' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(dayObj.dateStr)}
                      onDoubleClick={() => {
                        if (!dayObj.isPast) {
                          navigate(`/meetings/new?date=${dayObj.dateStr}&from=schedule`);
                        }
                      }}
                      title={
                        dayObj.isPast
                          ? `${dayObj.dateStr} (Past date — scheduling disabled)`
                          : `Select ${dayObj.dateStr} (Double-click to schedule)`
                      }
                    >
                      <div className="im-cal-day-header">
                        <span className="im-cal-day-number">{dayObj.dayNum}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {dayMeetings.length > 0 && (
                            <span className="im-cal-day-count-badge">{dayMeetings.length}</span>
                          )}
                          {!dayObj.isPast && (
                            <button
                              type="button"
                              className="im-cal-day-add-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/meetings/new?date=${dayObj.dateStr}&from=schedule`);
                              }}
                              title={`Schedule meeting on ${dayObj.dateStr}`}
                              aria-label={`Schedule meeting on ${dayObj.dateStr}`}
                            >
                              <PlusIcon size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="im-cal-day-events">
                        {dayMeetings.slice(0, 2).map((m) => (
                          <div
                            key={m.id}
                            className={`im-cal-event-pill ${m.status}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMeeting(m);
                            }}
                            title={`${m.startTime} - ${m.title} (${m.status})`}
                          >
                            <span className="im-cal-event-time">{m.startTime}</span>
                            <span className="im-cal-event-title">{m.title}</span>
                          </div>
                        ))}

                        {dayMeetings.length > 2 && (
                          <button
                            type="button"
                            className="im-cal-more-events-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(dayObj.dateStr);
                              setViewDayModalDate(dayObj.dateStr);
                            }}
                            title={`View all ${dayMeetings.length} meetings on ${dayObj.dateStr}`}
                          >
                            +{dayMeetings.length - 2} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="im-cal-week-view">
              <div className="im-cal-week-grid">
                {/* Header Row */}
                <div className="im-cal-week-header-cell" style={{ background: 'var(--im-bg-subtle)' }}>
                  Time
                </div>
                {weekDates.map((wd) => (
                  <div
                    key={wd.dateStr}
                    className={`im-cal-week-header-cell ${wd.isToday ? 'is-today' : ''}`}
                    onClick={() => setSelectedDate(wd.dateStr)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>{wd.dayName}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{wd.dayNum}</div>
                  </div>
                ))}

                {/* Hour Rows */}
                {HOURS.map((hour) => {
                  const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
                  return (
                    <React.Fragment key={hour}>
                      <div className="im-cal-week-hour-label">{hourLabel}</div>
                      {weekDates.map((wd) => {
                        const dayMeetings = (meetingsByDate.get(wd.dateStr) || []).filter((m) => {
                          const [mH] = m.startTime.split(':');
                          return parseInt(mH, 10) === hour;
                        });

                        return (
                          <div
                            key={`${wd.dateStr}-${hour}`}
                            className={`im-cal-week-slot ${wd.isPast ? 'is-past' : ''}`}
                            onClick={() => {
                              setSelectedDate(wd.dateStr);
                              if (dayMeetings.length === 0 && !wd.isPast) {
                                navigate(`/meetings/new?date=${wd.dateStr}&time=${hourLabel}&from=schedule`);
                              }
                            }}
                            title={
                              wd.isPast
                                ? `${wd.dateStr} (Past date — scheduling disabled)`
                                : dayMeetings.length === 0
                                ? `Click to schedule at ${hourLabel} on ${wd.dateStr}`
                                : undefined
                            }
                          >
                            {dayMeetings.map((m) => (
                              <div
                                key={m.id}
                                className={`im-cal-week-event-card ${m.status}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewMeeting(m);
                                }}
                              >
                                <strong>{m.startTime}</strong> {m.title}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="im-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Timeline for {selectedDate}</h3>
                <span className="im-badge im-badge-upcoming">
                  {selectedDateMeetings.length} meetings scheduled
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {HOURS.map((hour) => {
                  const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
                  const slotMeetings = selectedDateMeetings.filter((m) => {
                    const [mH] = m.startTime.split(':');
                    return parseInt(mH, 10) === hour;
                  });

                  return (
                    <div
                      key={hour}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 1fr',
                        gap: 14,
                        alignItems: 'flex-start',
                        paddingBottom: 12,
                        borderBottom: '1px solid var(--im-border-subtle)',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--im-text-muted)', fontSize: '0.85rem' }}>
                        {hourLabel}
                      </div>

                      <div>
                        {slotMeetings.length === 0 ? (
                          selectedDate < todayStr ? (
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: 6,
                                background: 'var(--im-bg-subtle, #f8fafc)',
                                color: 'var(--im-text-muted, #94a3b8)',
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                border: '1px solid var(--im-border, #e2e8f0)',
                                cursor: 'not-allowed',
                              }}
                              title="Past dates cannot be scheduled"
                            >
                              <span>Past time slot • Scheduling disabled</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: 6,
                                background: 'var(--im-bg-subtle)',
                                color: 'var(--im-text-muted)',
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                border: '1px dashed var(--im-border, #e2e8f0)',
                              }}
                              onClick={() => navigate(`/meetings/new?date=${selectedDate}&time=${hourLabel}&from=schedule`)}
                              title={`Click to schedule meeting at ${hourLabel} on ${selectedDate}`}
                            >
                              <PlusIcon size={12} />
                              Free time slot • Click to schedule at {hourLabel}
                            </div>
                          )
                        ) : (
                          slotMeetings.map((m) => (
                            <div
                              key={m.id}
                              className="im-schedule-day-card"
                              style={{ marginBottom: 6 }}
                              onClick={() => setPreviewMeeting(m)}
                            >
                              <div className="im-schedule-card-top">
                                <span className="im-schedule-card-title">{m.title}</span>
                                <span className={`im-badge im-badge-${m.status}`}>{m.status}</span>
                              </div>
                              <div className="im-schedule-card-meta">
                                <div className="im-schedule-meta-row">
                                  <ClockIcon size={13} />
                                  <span>{m.startTime} • {m.durationMinutes} mins</span>
                                </div>
                                <div className="im-schedule-meta-row">
                                  <UsersIcon size={13} />
                                  <span>Hosted by {m.organizer.name} ({m.participants.length} attendees)</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'agenda' && (
            <div className="im-cal-agenda-view">
              {meetings.length === 0 ? (
                <div className="im-card" style={{ padding: '30px', textAlign: 'center' }}>
                  <CalendarIcon size={32} />
                  <h3>No Scheduled Meetings</h3>
                  <p>Your calendar is completely clear. Schedule a meeting to get started.</p>
                </div>
              ) : (
                Array.from(meetingsByDate.entries())
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, dateMList]) => (
                    <div key={date} className="im-cal-agenda-group">
                      <div className="im-cal-agenda-date-badge">
                        <CalendarIcon size={16} />
                        <span>
                          {new Date(date + 'T00:00:00').toLocaleDateString('default', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {date === todayStr && <span className="im-badge im-badge-live">Today</span>}
                      </div>

                      <div className="im-cal-agenda-list">
                        {dateMList.map((m) => (
                          <div key={m.id} className="im-cal-agenda-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ textAlign: 'center', minWidth: 50 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.startTime}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                                  {m.durationMinutes}m
                                </div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{m.title}</div>
                                <div style={{ fontSize: '0.775rem', color: 'var(--im-text-muted)' }}>
                                  Code: {m.meetingCode} • Host: {m.organizer.name}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className={`im-badge im-badge-${m.status}`}>{m.status}</span>
                              {m.status !== 'cancelled' && (
                                <button
                                  className="im-btn im-btn-primary im-btn-sm"
                                  onClick={() => navigate(`/meetings/join?code=${m.meetingCode || m.id}`)}
                                >
                                  Join
                                </button>
                              )}
                              <button
                                className="im-btn im-btn-secondary im-btn-sm"
                                onClick={() => copyMeetingLink(m)}
                                title="Copy link"
                              >
                                <CopyIcon size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Day Detail Breakdown */}
        <aside className="im-schedule-detail-panel">
          <div className="im-schedule-detail-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h3 className="im-schedule-detail-date-title">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <p className="im-schedule-detail-date-subtitle">
                {selectedDate === todayStr ? 'Today • Daily Schedule' : 'Selected Date Schedule'}
              </p>
            </div>
            {selectedDate < todayStr ? (
              <span
                className="im-cal-past-badge"
                title="Past date — meetings cannot be scheduled"
              >
                Past Date
              </span>
            ) : (
              <button
                className="im-btn im-btn-primary im-btn-sm"
                onClick={() => navigate(`/meetings/new?date=${selectedDate}&from=schedule`)}
                title={`Schedule meeting on ${selectedDate}`}
              >
                <PlusIcon size={14} />
                Schedule
              </button>
            )}
          </div>

          {/* Smart Focus Time Box */}
          <div className="im-schedule-focus-box">
            <SparkleIcon size={18} />
            <div>
              <strong>Smart Schedule AI</strong>:
              {selectedDateMeetings.length === 0
                ? ' 100% of this day is open for deep, uninterrupted focus work.'
                : ` ${selectedDateMeetings.length} calls scheduled. Ensure 15m buffer breaks between sessions.`}
            </div>
          </div>

          {/* List of meetings for selected day */}
          <div className="im-schedule-day-list">
            {selectedDateMeetings.length === 0 ? (
              <div className="im-schedule-empty-state">
                <div className="im-schedule-empty-icon">
                  <CalendarIcon size={22} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No meetings on this date</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--im-text-muted)' }}>
                  {selectedDate < todayStr
                    ? 'This date has passed. Meetings cannot be scheduled for past dates.'
                    : 'Your calendar is free and clear for deep work.'}
                </div>
                {selectedDate >= todayStr && (
                  <button
                    className="im-btn im-btn-primary im-btn-sm"
                    style={{ marginTop: 6 }}
                    onClick={() => navigate(`/meetings/new?date=${selectedDate}&from=schedule`)}
                  >
                    <PlusIcon size={14} />
                    Schedule on this day
                  </button>
                )}
              </div>
            ) : (
              selectedDateMeetings.map((m) => (
                <div key={m.id} className="im-schedule-day-card">
                  <div className="im-schedule-card-top">
                    <Link to={`/meetings/${m.id}`} className="im-schedule-card-title">
                      {m.title}
                    </Link>
                    <span className={`im-badge im-badge-${m.status}`}>{m.status}</span>
                  </div>

                  <div className="im-schedule-card-meta">
                    <div className="im-schedule-meta-row">
                      <ClockIcon size={13} />
                      <span>{m.startTime} ({m.durationMinutes} mins)</span>
                    </div>
                    <div className="im-schedule-meta-row">
                      <UsersIcon size={13} />
                      <span>{m.organizer.name} • {m.participants.length} attendees</span>
                    </div>
                  </div>

                  <div className="im-schedule-card-actions">
                    {m.status !== 'cancelled' && (
                      <button
                        className="im-btn im-btn-primary im-btn-sm"
                        onClick={() => navigate(`/meetings/join?code=${m.meetingCode || m.id}`)}
                      >
                        Join Room
                      </button>
                    )}
                    <Link to={`/meetings/${m.id}`} className="im-btn im-btn-secondary im-btn-sm">
                      Details
                    </Link>
                    <button
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => copyMeetingLink(m)}
                      title="Copy link"
                    >
                      <CopyIcon size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Quick Meeting Preview Modal */}
      {previewMeeting && (
        <div
          className="im-cal-preview-modal-backdrop"
          onClick={() => setPreviewMeeting(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="im-cal-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="im-cal-preview-header">
              <div>
                <span className={`im-badge im-badge-${previewMeeting.status}`} style={{ marginBottom: 6 }}>
                  {previewMeeting.status.toUpperCase()}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{previewMeeting.title}</h3>
              </div>
              <button
                className="im-modal-close"
                onClick={() => setPreviewMeeting(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="im-cal-preview-body">
              <div className="im-cal-preview-field">
                <CalendarIcon size={16} />
                <span>
                  <strong>Date:</strong> {previewMeeting.date}
                </span>
              </div>

              <div className="im-cal-preview-field">
                <ClockIcon size={16} />
                <span>
                  <strong>Time:</strong> {previewMeeting.startTime} ({previewMeeting.durationMinutes} minutes) • {previewMeeting.timezone || 'UTC'}
                </span>
              </div>

              <div className="im-cal-preview-field">
                <UsersIcon size={16} />
                <span>
                  <strong>Organizer:</strong> {previewMeeting.organizer.name} ({previewMeeting.organizer.email})
                </span>
              </div>

              <div className="im-cal-preview-field">
                <UsersIcon size={16} />
                <span>
                  <strong>Your RSVP:</strong>{' '}
                  <span
                    className={`im-badge ${
                      previewMeeting.myRole === 'host'
                        ? 'im-badge-upcoming'
                        : previewMeeting.myInvitationStatus === 'accepted'
                        ? 'im-badge-completed'
                        : previewMeeting.myInvitationStatus === 'declined'
                        ? 'im-badge-cancelled'
                        : 'im-badge-live'
                    }`}
                    style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}
                  >
                    {previewMeeting.myRole === 'host' ? 'Host' : previewMeeting.myInvitationStatus || 'Pending'}
                  </span>
                </span>
              </div>

              <div className="im-cal-preview-code-box">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Room Code</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}>
                    {previewMeeting.meetingCode}
                  </div>
                </div>
                <button
                  className="im-btn im-btn-secondary im-btn-sm"
                  onClick={() => copyMeetingLink(previewMeeting)}
                >
                  <CopyIcon size={13} /> Copy Link
                </button>
              </div>

              {previewMeeting.description && (
                <div style={{ fontSize: '0.825rem', color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                  <strong>Description:</strong> {previewMeeting.description}
                </div>
              )}
            </div>

            <div className="im-cal-preview-footer">
              {previewMeeting.myInvitationStatus === 'pending' && previewMeeting.status !== 'cancelled' && (
                <div style={{ display: 'inline-flex', gap: 6, marginRight: 'auto' }}>
                  <button
                    className="im-btn im-btn-primary im-btn-sm"
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={async () => {
                      await acceptInvitation(previewMeeting.id);
                      setPreviewMeeting({ ...previewMeeting, myInvitationStatus: 'accepted' });
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="im-btn im-btn-secondary im-btn-sm"
                    style={{ color: 'var(--im-danger, #ef4444)' }}
                    onClick={async () => {
                      await declineInvitation(previewMeeting.id);
                      setPreviewMeeting({ ...previewMeeting, myInvitationStatus: 'declined' });
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
              <Link
                to={`/meetings/${previewMeeting.id}`}
                className="im-btn im-btn-secondary"
                onClick={() => setPreviewMeeting(null)}
              >
                Full Details
              </Link>
              {previewMeeting.status !== 'cancelled' && (
                <button
                  className="im-btn im-btn-primary"
                  onClick={() => {
                    navigate(`/meetings/join?code=${previewMeeting.meetingCode || previewMeeting.id}`);
                    setPreviewMeeting(null);
                  }}
                >
                  <VideoIcon size={15} /> Join Meeting
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Meetings Overview Modal (Opened when clicking +more on calendar box) */}
      {viewDayModalDate && (
        <div className="im-cal-preview-backdrop" onClick={() => setViewDayModalDate(null)}>
          <div
            className="im-cal-preview-modal"
            style={{ maxWidth: 520, width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="im-cal-preview-header">
              <div>
                <h3 className="im-cal-preview-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                  {new Date(viewDayModalDate + 'T00:00:00').toLocaleDateString('default', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                  {(meetingsByDate.get(viewDayModalDate) || []).length} Scheduled Sessions
                </span>
              </div>
              <button
                type="button"
                className="im-btn im-btn-ghost im-btn-sm"
                onClick={() => setViewDayModalDate(null)}
                title="Close"
                style={{ width: 30, height: 30, padding: 0, fontSize: '1rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div className="im-cal-preview-body" style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(meetingsByDate.get(viewDayModalDate) || []).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--im-border)',
                    background: 'var(--im-bg-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--im-text-primary)' }}>
                      {m.title}
                    </span>
                    <span className={`im-badge im-badge-${m.status}`}>{m.status}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.775rem', color: 'var(--im-text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ClockIcon size={12} /> {m.startTime} ({m.durationMinutes}m)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UsersIcon size={12} /> {m.organizer.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {m.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="im-btn im-btn-primary im-btn-sm"
                        onClick={() => {
                          setViewDayModalDate(null);
                          navigate(`/meetings/join?code=${m.meetingCode || m.id}`);
                        }}
                      >
                        <VideoIcon size={13} /> Join Room
                      </button>
                    )}
                    <Link
                      to={`/meetings/${m.id}`}
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => setViewDayModalDate(null)}
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      className="im-btn im-btn-secondary im-btn-sm"
                      onClick={() => copyMeetingLink(m)}
                      title="Copy meeting link"
                    >
                      <CopyIcon size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="im-cal-preview-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {viewDayModalDate >= todayStr ? (
                <button
                  type="button"
                  className="im-btn im-btn-primary im-btn-sm"
                  onClick={() => {
                    const d = viewDayModalDate;
                    setViewDayModalDate(null);
                    navigate(`/meetings/new?date=${d}&from=schedule`);
                  }}
                >
                  <PlusIcon size={14} /> Schedule Another
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Past Date</span>
              )}
              <button
                type="button"
                className="im-btn im-btn-secondary im-btn-sm"
                onClick={() => setViewDayModalDate(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
