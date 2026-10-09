import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from '../components/icons';
import {
  LayoutDashboardIcon,
  VideoIcon,
  FileTextIcon,
  CheckSquareIcon,
  FolderIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  LogOutIcon,
  PlusIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  UsersIcon,
  SparkleIcon,
  BrainIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '../components/icons';
import './DashboardPage.css';

type DashboardTab = 'overview' | 'meetings' | 'summaries' | 'actions' | 'workspaces' | 'settings';

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  duration: string;
  participants: string[];
  host: string;
  isLive?: boolean;
}

interface MeetingSummaryItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  brief: string;
  decisionsCount: number;
  tags: string[];
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Interactive Action Items state
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: 'a1',
      title: 'Finalize regional compliance sign-offs for APAC cluster',
      assignee: 'Sarah Chen',
      dueDate: 'Oct 12, 2026',
      priority: 'High',
      completed: false,
    },
    {
      id: 'a2',
      title: 'Deploy latency benchmark report to engineering channel',
      assignee: 'Dr. Marcus Vance',
      dueDate: 'Oct 14, 2026',
      priority: 'Medium',
      completed: false,
    },
    {
      id: 'a3',
      title: 'Review Zero-Knowledge audio processing whitepaper',
      assignee: user?.name || 'Elena Rostova',
      dueDate: 'Oct 15, 2026',
      priority: 'High',
      completed: true,
    },
    {
      id: 'a4',
      title: 'Schedule Q4 customer advisory board retrospective',
      assignee: 'David Kim',
      dueDate: 'Oct 18, 2026',
      priority: 'Low',
      completed: false,
    },
  ]);

  const upcomingMeetings: UpcomingMeeting[] = [
    {
      id: 'm1',
      title: 'Global Product Strategy & AI Roadmap Sync',
      time: '03:00 PM',
      duration: '45 mins',
      participants: ['ER', 'MV', 'SC', 'DK'],
      host: 'Elena Rostova',
      isLive: true,
    },
    {
      id: 'm2',
      title: 'APAC Cloud Infrastructure Migration Review',
      time: '04:30 PM',
      duration: '30 mins',
      participants: ['SC', 'DK', 'AP'],
      host: 'Sarah Chen',
    },
    {
      id: 'm3',
      title: 'Enterprise Security & SOC 2 Certification Check',
      time: 'Tomorrow, 10:00 AM',
      duration: '60 mins',
      participants: ['MV', 'ER', 'TL'],
      host: 'Dr. Marcus Vance',
    },
  ];

  const recentSummaries: MeetingSummaryItem[] = [
    {
      id: 's1',
      title: 'Executive Cloud Architecture All-Hands',
      date: 'Today, 11:30 AM',
      duration: '52 mins',
      brief:
        'Approved multi-region redundancy architecture. Latency reduced below 18ms across APAC clusters. AI audio processing verified with zero retention.',
      decisionsCount: 4,
      tags: ['Architecture', 'Cloud', 'Latency'],
    },
    {
      id: 's2',
      title: 'Enterprise Customer Advisory Board Retro',
      date: 'Yesterday, 02:15 PM',
      duration: '40 mins',
      brief:
        'Client adoption up 40% in first month. 99.8% transcription accuracy confirmed. Roadmap prioritized autonomous follow-up email drafts for Q4.',
      decisionsCount: 3,
      tags: ['Customer', 'Feedback', 'AI Companion'],
    },
    {
      id: 's3',
      title: 'Security & Privacy Compliance Audit',
      date: 'Oct 7, 2026',
      duration: '35 mins',
      brief:
        'Audit concluded 100% adherence to SOC-2 Type II standards. End-to-end 256-bit encryption validated across active conferencing rooms.',
      decisionsCount: 5,
      tags: ['Security', 'SOC-2', 'Compliance'],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleStartInstantMeeting = () => {
    setDemoNotice(
      'Demo Mode: Starting instant enterprise AI meeting room "Room-408". Live WebRTC audio & transcription pipeline simulated.'
    );
    setTimeout(() => setDemoNotice(null), 6000);
  };

  return (
    <div className="im-dashboard-root">
      {/* 1. Sidebar Navigation */}
      <aside className={`im-dash-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="im-sidebar-brand">
          <div className="im-dash-logo-icon" aria-hidden="true">
            <BrandIcon />
          </div>
          <div className="im-dash-brand-text">
            <span className="im-dash-brand-name">IntellMeet</span>
            <span className="im-dash-brand-tag">WORKSPACE</span>
          </div>
        </div>

        <div className="im-sidebar-quick-action">
          <button
            type="button"
            className="im-quick-meeting-btn"
            onClick={handleStartInstantMeeting}
            id="dash-quick-meeting-btn"
          >
            <PlusIcon />
            <span>New Meeting</span>
          </button>
        </div>

        <nav className="im-sidebar-nav" aria-label="Dashboard Navigation">
          <button
            type="button"
            className={`im-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-overview"
          >
            <LayoutDashboardIcon />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`im-nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('meetings');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-meetings"
          >
            <VideoIcon />
            <span>Meetings</span>
            <span className="im-nav-badge live">3</span>
          </button>

          <button
            type="button"
            className={`im-nav-item ${activeTab === 'summaries' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('summaries');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-summaries"
          >
            <FileTextIcon />
            <span>AI Summaries</span>
            <span className="im-nav-badge">12</span>
          </button>

          <button
            type="button"
            className={`im-nav-item ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('actions');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-actions"
          >
            <CheckSquareIcon />
            <span>Action Items</span>
            <span className="im-nav-badge orange">
              {actionItems.filter((i) => !i.completed).length}
            </span>
          </button>

          <button
            type="button"
            className={`im-nav-item ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('workspaces');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-workspaces"
          >
            <FolderIcon />
            <span>Workspaces</span>
          </button>

          <button
            type="button"
            className={`im-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setMobileMenuOpen(false);
            }}
            id="dash-nav-settings"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer with Active Enterprise Workspace Info */}
        <div className="im-sidebar-footer">
          <div className="im-sidebar-plan-card">
            <div className="im-plan-header">
              <SparkleIcon />
              <span>Enterprise AI Tier</span>
            </div>
            <p className="im-plan-desc">Unlimited 4K synthesis &amp; zero-retention privacy active.</p>
          </div>

          <button
            type="button"
            className="im-sidebar-logout-btn"
            onClick={handleLogout}
            id="dash-sidebar-logout-btn"
          >
            <LogOutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace Layout */}
      <div className="im-dash-main-area">
        {/* Top Navigation Bar */}
        <header className="im-dash-topbar">
          <div className="im-topbar-left">
            <button
              type="button"
              className="im-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            <div className="im-topbar-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search meetings, transcripts, decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search dashboard"
              />
            </div>
          </div>

          <div className="im-topbar-right">
            <button
              type="button"
              className="im-icon-btn"
              title="Notifications"
              aria-label="Notifications"
              onClick={() =>
                setDemoNotice('You have 3 notifications: APAC meeting summarized, 1 action item assigned.')
              }
            >
              <BellIcon />
              <span className="im-notification-dot" />
            </button>

            {/* User Profile Menu */}
            <div className="im-profile-menu-wrapper">
              <button
                type="button"
                className="im-profile-trigger"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                id="dash-profile-menu-trigger"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <div className="im-user-avatar">{user?.avatar || 'ER'}</div>
                <div className="im-profile-info">
                  <span className="im-profile-name">{user?.name || 'Elena Rostova'}</span>
                  <span className="im-profile-role">{user?.company || 'Enterprise Inc.'}</span>
                </div>
                <ChevronDownIcon />
              </button>

              {profileMenuOpen && (
                <div className="im-profile-dropdown" role="menu">
                  <div className="im-dropdown-header">
                    <p className="im-dd-name">{user?.name || 'Elena Rostova'}</p>
                    <p className="im-dd-email">{user?.email || 'elena.rostova@enterprise.com'}</p>
                    <div className="im-dd-status">
                      <span className="status-dot green" />
                      <span>Active Demo Session</span>
                    </div>
                  </div>

                  <div className="im-dropdown-divider" />

                  <button
                    type="button"
                    className="im-dropdown-item"
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileMenuOpen(false);
                    }}
                  >
                    <SettingsIcon />
                    <span>Workspace Settings</span>
                  </button>

                  <button
                    type="button"
                    className="im-dropdown-item"
                    onClick={() => {
                      setActiveTab('workspaces');
                      setProfileMenuOpen(false);
                    }}
                  >
                    <FolderIcon />
                    <span>Manage Workspaces</span>
                  </button>

                  <div className="im-dropdown-divider" />

                  <button
                    type="button"
                    className="im-dropdown-item logout"
                    onClick={handleLogout}
                    id="dash-dropdown-logout-btn"
                    role="menuitem"
                  >
                    <LogOutIcon />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Demo Notice Banner */}
        {demoNotice && (
          <div className="im-dash-notice-bar" role="status">
            <SparkleIcon />
            <span>{demoNotice}</span>
            <button
              type="button"
              className="im-notice-close"
              onClick={() => setDemoNotice(null)}
              aria-label="Dismiss notice"
            >
              &times;
            </button>
          </div>
        )}

        {/* Dynamic Main Workspace Content */}
        <main className="im-dash-content-container">
          {activeTab === 'overview' && (
            <div className="im-overview-view">
              {/* Welcome Header */}
              <div className="im-welcome-banner">
                <div className="im-welcome-text">
                  <h1>Welcome back, {user?.name || 'Elena'}! 👋</h1>
                  <p>
                    Here is your AI meeting intelligence summary for{' '}
                    <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                    You have 1 live meeting and 3 scheduled calls today.
                  </p>
                </div>

                <div className="im-welcome-actions">
                  <button
                    type="button"
                    className="im-primary-action-btn"
                    onClick={handleStartInstantMeeting}
                  >
                    <VideoIcon />
                    <span>Start Instant Meeting</span>
                  </button>

                  <button
                    type="button"
                    className="im-secondary-action-btn"
                    onClick={() => setActiveTab('meetings')}
                  >
                    <CalendarIcon />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>

              {/* Statistics Metric Cards */}
              <div className="im-stats-cards-grid">
                <div className="im-stat-card">
                  <div className="im-stat-top">
                    <span className="im-stat-title">Total Meetings</span>
                    <span className="im-stat-trend positive">+12% mo/mo</span>
                  </div>
                  <div className="im-stat-number">28</div>
                  <span className="im-stat-sub">Across 4 connected channels</span>
                </div>

                <div className="im-stat-card">
                  <div className="im-stat-top">
                    <span className="im-stat-title">Hours Saved by AI</span>
                    <span className="im-stat-badge purple">Autonomous</span>
                  </div>
                  <div className="im-stat-number">42.5 hrs</div>
                  <span className="im-stat-sub">Automated minutes &amp; follow-ups</span>
                </div>

                <div className="im-stat-card">
                  <div className="im-stat-top">
                    <span className="im-stat-title">AI Summaries</span>
                    <span className="im-stat-trend positive">99.9% Accuracy</span>
                  </div>
                  <div className="im-stat-number">34</div>
                  <span className="im-stat-sub">Executive briefs generated</span>
                </div>

                <div className="im-stat-card">
                  <div className="im-stat-top">
                    <span className="im-stat-title">Action Items</span>
                    <span className="im-stat-badge emerald">82% Completed</span>
                  </div>
                  <div className="im-stat-number">18 / 22</div>
                  <span className="im-stat-sub">4 deliverables pending review</span>
                </div>
              </div>

              {/* Two-Column Core Layout */}
              <div className="im-content-split-grid">
                {/* Left Column: Upcoming Meetings & Live Room */}
                <div className="im-grid-column">
                  {/* Upcoming Schedule Card */}
                  <div className="im-panel-card">
                    <div className="im-panel-header">
                      <div className="im-panel-title">
                        <VideoIcon />
                        <h2>Upcoming Meetings</h2>
                      </div>
                      <button
                        type="button"
                        className="im-link-btn"
                        onClick={() => setActiveTab('meetings')}
                      >
                        View All
                      </button>
                    </div>

                    <div className="im-meetings-list">
                      {upcomingMeetings.map((m) => (
                        <div
                          key={m.id}
                          className={`im-meeting-item ${m.isLive ? 'live-item' : ''}`}
                        >
                          <div className="im-meeting-time-box">
                            <ClockIcon />
                            <span>{m.time}</span>
                          </div>

                          <div className="im-meeting-info">
                            <div className="im-meeting-title-row">
                              <h4>{m.title}</h4>
                              {m.isLive && <span className="im-live-badge">&bull; LIVE NOW</span>}
                            </div>
                            <div className="im-meeting-meta">
                              <span>Hosted by {m.host}</span>
                              <span>&bull;</span>
                              <div className="im-avatars-row">
                                <UsersIcon />
                                <span>{m.participants.length} attendees</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`im-join-btn ${m.isLive ? 'join-live' : ''}`}
                            onClick={handleStartInstantMeeting}
                          >
                            {m.isLive ? 'Join Room' : 'Details'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items Interactive Checklist Card */}
                  <div className="im-panel-card">
                    <div className="im-panel-header">
                      <div className="im-panel-title">
                        <CheckSquareIcon />
                        <h2>Action Items &amp; Deliverables</h2>
                      </div>
                      <span className="im-badge-count">
                        {actionItems.filter((i) => !i.completed).length} pending
                      </span>
                    </div>

                    <div className="im-action-items-list">
                      {actionItems.map((item) => (
                        <div
                          key={item.id}
                          className={`im-action-item-row ${item.completed ? 'completed' : ''}`}
                        >
                          <label className="im-action-checkbox">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleActionItem(item.id)}
                            />
                            <span className="im-checkmark" />
                          </label>

                          <div className="im-action-text-area">
                            <p className="im-action-title">{item.title}</p>
                            <div className="im-action-sub-row">
                              <span>{item.assignee}</span>
                              <span>&bull;</span>
                              <span className="im-action-due">Due {item.dueDate}</span>
                            </div>
                          </div>

                          <span className={`im-priority-pill priority-${item.priority.toLowerCase()}`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Meeting Summaries & Workspace Health */}
                <div className="im-grid-column">
                  {/* AI Meeting Synthesis Card */}
                  <div className="im-panel-card">
                    <div className="im-panel-header">
                      <div className="im-panel-title">
                        <BrainIcon />
                        <h2>Recent AI Meeting Summaries</h2>
                      </div>
                      <button
                        type="button"
                        className="im-link-btn"
                        onClick={() => setActiveTab('summaries')}
                      >
                        All Summaries
                      </button>
                    </div>

                    <div className="im-summaries-list">
                      {recentSummaries.map((s) => (
                        <div key={s.id} className="im-summary-item-card">
                          <div className="im-summary-top">
                            <h4>{s.title}</h4>
                            <span className="im-summary-date">{s.date}</span>
                          </div>

                          <p className="im-summary-brief">{s.brief}</p>

                          <div className="im-summary-footer">
                            <div className="im-tags-group">
                              {s.tags.map((t) => (
                                <span key={t} className="im-tag-pill">
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <span className="im-decisions-badge">
                              <CheckCircleIcon />
                              <span>{s.decisionsCount} Decisions Logged</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workspace Integrations & Zero-Knowledge Status */}
                  <div className="im-panel-card">
                    <div className="im-panel-header">
                      <div className="im-panel-title">
                        <ShieldCheckIcon />
                        <h2>Enterprise Security &amp; Integrations</h2>
                      </div>
                    </div>

                    <div className="im-security-widget">
                      <div className="im-security-item">
                        <span className="sec-dot green" />
                        <div>
                          <strong>Zero-Knowledge Audio Processing</strong>
                          <p>Ephemeral streaming active. Audio purged post-transcription.</p>
                        </div>
                      </div>

                      <div className="im-security-item">
                        <span className="sec-dot green" />
                        <div>
                          <strong>SOC-2 Type II &amp; AES-256 Encryption</strong>
                          <p>All data streams encrypted in transit and at rest.</p>
                        </div>
                      </div>

                      <div className="im-integrations-row">
                        <span className="im-int-badge active">Google Workspace Connected</span>
                        <span className="im-int-badge active">Microsoft 365 Connected</span>
                        <span className="im-int-badge active">Slack Bot Synced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="im-tab-placeholder-view">
              <div className="im-placeholder-card">
                <VideoIcon />
                <h2>IntellMeet Video Conferencing Suite</h2>
                <p>
                  Manage active rooms, virtual scheduling, participant permissions, and automated transcription
                  settings across your enterprise team.
                </p>
                <button
                  type="button"
                  className="im-primary-action-btn"
                  onClick={handleStartInstantMeeting}
                >
                  <PlusIcon />
                  <span>Start Instant HD Meeting</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'summaries' && (
            <div className="im-tab-placeholder-view">
              <div className="im-placeholder-card">
                <BrainIcon />
                <h2>Autonomous Executive Synthesis Archive</h2>
                <p>
                  Explore searchable meeting archives, key decisions, speaker analytics, and automated minutes.
                </p>
                <div className="im-summaries-list full-width">
                  {recentSummaries.map((s) => (
                    <div key={s.id} className="im-summary-item-card">
                      <div className="im-summary-top">
                        <h4>{s.title}</h4>
                        <span className="im-summary-date">{s.date}</span>
                      </div>
                      <p className="im-summary-brief">{s.brief}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="im-tab-placeholder-view">
              <div className="im-placeholder-card">
                <CheckSquareIcon />
                <h2>Team Action Items &amp; Deliverables</h2>
                <p>Track tasks identified during meetings, assign deadlines, and sync with Jira/Asana.</p>
                <div className="im-action-items-list full-width">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className={`im-action-item-row ${item.completed ? 'completed' : ''}`}
                    >
                      <label className="im-action-checkbox">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleActionItem(item.id)}
                        />
                        <span className="im-checkmark" />
                      </label>
                      <div className="im-action-text-area">
                        <p className="im-action-title">{item.title}</p>
                        <span>{item.assignee} &bull; Due {item.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspaces' && (
            <div className="im-tab-placeholder-view">
              <div className="im-placeholder-card">
                <FolderIcon />
                <h2>Enterprise Workspaces &amp; Directories</h2>
                <p>
                  Active tenant: <strong>{user?.company || 'Enterprise Workspace'}</strong>. Manage team channels,
                  role-based access control (RBAC), and calendar federation.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="im-tab-placeholder-view">
              <div className="im-placeholder-card">
                <SettingsIcon />
                <h2>Workspace &amp; Account Settings</h2>
                <p>Configure transcription language models, custom vocabulary, and zero-knowledge retention limits.</p>
                <div className="im-settings-preview">
                  <div className="im-setting-row">
                    <div>
                      <strong>Zero Data Retention Mode</strong>
                      <p>Purge raw meeting audio recordings immediately post-synthesis</p>
                    </div>
                    <span className="im-badge-active">Enabled</span>
                  </div>
                  <div className="im-setting-row">
                    <div>
                      <strong>Automated Action Item Dispatch</strong>
                      <p>Notify assignees via email and Slack immediately</p>
                    </div>
                    <span className="im-badge-active">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
