import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BrandIcon,
  SparkleIcon,
  BrainIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  VideoIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  LogOutIcon,
  PlusIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
  LayoutDashboardIcon,
} from '../components/icons';
import './DashboardPage.css';

/* =========================================================================
   Custom Clean SVG Icons for Dashboard Workplace Showcase & Navigation
   ========================================================================= */
const HistoryClockIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const MenuBurgerIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LaurelWreathIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M14 36c-4.4-3.5-7-8.8-7-14.5C7 13.5 13.5 7 21.5 7c1.5 0 3 .2 4.5.7" />
    <path d="M34 36c4.4-3.5 7-8.8 7-14.5 0-8-6.5-14.5-14.5-14.5-1.5 0-3 .2-4.5.7" />
    <path d="M12 28c-2-1.5-3.5-4-3.5-6.8 0-4.5 3.7-8.2 8.2-8.2 1.3 0 2.5.3 3.6.8" />
    <path d="M36 28c2-1.5 3.5-4 3.5-6.8 0-4.5-3.7-8.2-8.2-8.2-1.3 0-2.5.3-3.6.8" />
    <path d="M19 41l5-5 5 5" />
    <path d="M24 36v6" />
  </svg>
);

const GlobeGridIcon: React.FC<{ size?: number; className?: string }> = ({ size = 28, className }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const TrophyAwardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 28, className }) => (
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
    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
    <path d="M4 3h16v6a8 8 0 0 1-16 0V3z" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
);

const MicWaveIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
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
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ScreenShareIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
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
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M12 10l-3 3h6l-3-3z" />
  </svg>
);

const MessageChatIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/* =========================================================================
   Types and Interfaces
   ========================================================================= */
type FeatureTabKey = 'meetings' | 'chat' | 'companion' | 'notes' | 'spaces';

interface HeroCardItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  badgeType: 'live' | 'ai' | 'chat' | 'docs' | 'calendar';
  previewDetails: {
    avatarInitial: string;
    avatarColor: string;
    metric1: string;
    metric2: string;
    statusText: string;
  };
}

interface CustomerStoryItem {
  id: string;
  company: string;
  headline: string;
  quote: string;
  author: string;
  role: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  themeColor: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation & Dropdown states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalMode, setMeetingModalMode] = useState<'instant' | 'join'>('instant');
  const [meetingRoomId, setMeetingRoomId] = useState('');

  // Active Navigation & Mobile Drawer states
  const [activeNavSection, setActiveNavSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navSections = [
    { key: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboardIcon },
    { key: 'meetings', label: 'Meetings', shortLabel: 'Meetings', icon: VideoIcon },
    { key: 'schedule', label: 'My Schedule', shortLabel: 'Schedule', icon: CalendarIcon },
    { key: 'history', label: 'Meeting History', shortLabel: 'History', icon: HistoryClockIcon },
    { key: 'notes', label: 'AI Notes & Summaries', shortLabel: 'AI Notes', icon: SparkleIcon },
    { key: 'team', label: 'Team & Collaboration', shortLabel: 'Team', icon: UsersIcon },
    { key: 'settings', label: 'Settings', shortLabel: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (sectionKey: string) => {
    setActiveNavSection(sectionKey);
    setMobileMenuOpen(false);

    switch (sectionKey) {
      case 'dashboard':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'meetings':
        setActiveTab('meetings');
        document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
        showToast('Meetings: 4K Ultra-HD Video & Spatial Audio loaded.');
        break;
      case 'schedule':
        showToast('My Schedule: 3 upcoming AI-synced meetings on your calendar today.');
        break;
      case 'history':
        showToast('Meeting History: 14 recent recordings & AI transcripts available.');
        break;
      case 'notes':
        setActiveTab('notes');
        document.getElementById('ai-companion')?.scrollIntoView({ behavior: 'smooth' });
        showToast('AI Notes & Summaries: Executive summaries & auto-action items ready.');
        break;
      case 'team':
        setActiveTab('chat');
        document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
        showToast('Team & Collaboration: Real-time workspace channels active.');
        break;
      case 'settings':
        setProfileMenuOpen(true);
        showToast('Settings: Workspace encryption & audio devices preferences.');
        break;
      default:
        break;
    }
  };

  // Interactive Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Feature Tabs state
  const [activeTab, setActiveTab] = useState<FeatureTabKey>('meetings');

  // Customer Stories state
  const [storyIndex, setStoryIndex] = useState(0);

  // AI Spotlight prompt simulation
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);

  // Auto-slide carousel gently
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 5);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleStartInstantMeeting = () => {
    setMeetingModalMode('instant');
    setMeetingModalOpen(true);
  };

  const handleJoinMeeting = () => {
    setMeetingModalMode('join');
    setMeetingModalOpen(true);
  };

  const handleLaunchMeetingRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setMeetingModalOpen(false);
    showToast(
      meetingModalMode === 'instant'
        ? '🚀 Room 408 started! WebRTC streaming & AI Companion active.'
        : `🔗 Connecting to room "${meetingRoomId || 'Enterprise-Sync'}"...`
    );
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiIsGenerating(true);
    setAiAnswer(null);
    setTimeout(() => {
      setAiIsGenerating(false);
      setAiAnswer(
        `IntellMeet AI: During the Q4 Architecture sync, Elena confirmed latency dropped below 16ms across APAC. Action item: Dr. Vance to deliver compliance sign-off by Friday.`
      );
    }, 900);
  };

  // 5 Hero Showcase Cards matching the screenshot
  const heroCards: HeroCardItem[] = [
    {
      id: 'hc-video',
      tag: 'MEETINGS & HD AUDIO',
      title: 'Global Collaboration',
      subtitle: 'Spatial audio & studio noise cancellation',
      badgeType: 'live',
      previewDetails: {
        avatarInitial: 'ER',
        avatarColor: '#2563eb',
        metric1: '4K Ultra HD',
        metric2: '16ms Latency',
        statusText: 'Elena Rostova (Speaking)',
      },
    },
    {
      id: 'hc-chat',
      tag: 'TEAM CHAT & THREADS',
      title: 'Continuous Workspace',
      subtitle: 'Real-time sync between mobile & desktop',
      badgeType: 'chat',
      previewDetails: {
        avatarInitial: 'SC',
        avatarColor: '#8b5cf6',
        metric1: '52 Channels',
        metric2: 'AI Auto-Drafts',
        statusText: 'Sarah Chen: "Report shared!"',
      },
    },
    {
      id: 'hc-grid',
      tag: 'MULTI-PARTY VIDEO',
      title: 'Unified Team Grid',
      subtitle: 'Interactive reactions & active speaker aura',
      badgeType: 'live',
      previewDetails: {
        avatarInitial: 'DK',
        avatarColor: '#059669',
        metric1: '4 Active Feeds',
        metric2: '👏 Live Reactions',
        statusText: 'Team All-Hands (408)',
      },
    },
    {
      id: 'hc-notes',
      tag: 'AI COMPANION NOTES',
      title: 'Automated Minutes',
      subtitle: 'Executive summaries & auto action items',
      badgeType: 'docs',
      previewDetails: {
        avatarInitial: 'AI',
        avatarColor: '#d97706',
        metric1: '99.9% Accuracy',
        metric2: 'Zero-Retention',
        statusText: 'Synthesizing Roadmap...',
      },
    },
    {
      id: 'hc-calendar',
      tag: 'SPACES & SCHEDULER',
      title: 'Smart Meeting Rooms',
      subtitle: 'One-click federation with Google & M365',
      badgeType: 'calendar',
      previewDetails: {
        avatarInitial: 'MV',
        avatarColor: '#0284c7',
        metric1: '3 Calls Today',
        metric2: 'Room 408 Ready',
        statusText: 'Next: APAC Review in 15m',
      },
    },
  ];

  // Customer stories data
  const customerStories: CustomerStoryItem[] = [
    {
      id: 'story-mlb',
      company: 'Major League Baseball (MLB)',
      headline: 'How MLB Powers Gameday Coordination and Broadcast Operations with IntellMeet',
      quote:
        '"IntellMeet changed the speed at which our operations teams execute. Real-time AI transcription and instant executive summaries allow coaching and tech teams to communicate with zero latency across ballparks."',
      author: 'David Thomas',
      role: 'SVP of Technology & Operations, MLB',
      stat1Value: '40%',
      stat1Label: 'Faster Decision Cycles',
      stat2Value: '10x',
      stat2Label: 'Meeting Productivity Boost',
      stat3Value: '100%',
      stat3Label: 'Team Adoption Worldwide',
      themeColor: '#0284c7',
    },
    {
      id: 'story-tech',
      company: 'Apex Global Financial',
      headline: 'Securing Financial All-Hands with Zero-Knowledge Audio Encryption',
      quote:
        '"The SOC-2 Type II validation and automated zero-retention guarantee gave our security board total confidence. We save 3,000+ engineer hours monthly on automated meeting follow-ups."',
      author: 'Sophia Zhang',
      role: 'Chief Information Officer, Apex Financial',
      stat1Value: '3,200h',
      stat1Label: 'Engineer Hours Saved / Mo',
      stat2Value: '99.99%',
      stat2Label: 'Enterprise SLA Uptime',
      stat3Value: '0',
      stat3Label: 'Data Retention Footprint',
      themeColor: '#4f46e5',
    },
  ];

  return (
    <div className="zm-workplace-root">
      {/* =====================================================================
          1. Global Top Navigation Bar (Dark Enterprise Header)
          ===================================================================== */}
      <header className="zm-topbar" role="banner">
        <div className="zm-topbar-container">
          {/* Left: Brand & Main Navigation Links */}
          <div className="zm-topbar-left">
            {/* Mobile / Drawer Menu Trigger */}
            <button
              type="button"
              className="zm-mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <CloseIcon size={19} /> : <MenuBurgerIcon size={19} />}
            </button>

            <button
              type="button"
              className="zm-brand-link"
              onClick={() => handleNavClick('dashboard')}
              title="IntellMeet Workplace Dashboard"
            >
              <div className="zm-brand-icon" aria-hidden="true">
                <VideoIcon size={20} />
              </div>
              <div className="zm-brand-typography">
                <span className="zm-brand-title">IntellMeet</span>
                <span className="zm-brand-pill">WORKPLACE</span>
              </div>
            </button>

            <nav className="zm-nav-links" aria-label="Workplace Navigation">
              {navSections.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeNavSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`zm-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.key)}
                    id={`zm-nav-${item.key}`}
                    title={item.label}
                  >
                    <IconComponent size={15} />
                    <span>{item.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Language, Active User Profile & Meeting Launcher */}
          <div className="zm-topbar-right">
            <button
              type="button"
              className="zm-icon-action-btn"
              title="Search Meetings & Transcripts"
              onClick={() => showToast('Search: Type to query across meeting archives & notes.')}
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>

            <button
              type="button"
              className="zm-icon-action-btn"
              title="Notifications"
              onClick={() => showToast('You have 2 new AI meeting summaries ready to review.')}
              aria-label="Notifications"
            >
              <BellIcon size={18} />
              <span className="zm-notification-dot" />
            </button>

            <div className="zm-nav-divider" />

            {/* Quick Action: Start/Join Meeting */}
            <div className="zm-quick-actions-group">
              <button
                type="button"
                className="zm-schedule-btn"
                onClick={handleJoinMeeting}
                id="zm-btn-join"
              >
                Join Meeting
              </button>

              <button
                type="button"
                className="zm-host-btn"
                onClick={handleStartInstantMeeting}
                id="zm-btn-host"
              >
                <PlusIcon size={16} />
                <span>Start a Meeting</span>
              </button>
            </div>

            {/* User Profile Dropdown */}
            <div className="zm-user-profile-wrapper">
              <button
                type="button"
                className="zm-profile-trigger"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                id="zm-profile-menu-button"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <div className="zm-avatar-circle">
                  <span>{user?.avatar || 'ER'}</span>
                  <span className="zm-online-status-dot" />
                </div>
                <div className="zm-profile-meta">
                  <span className="zm-user-name">{user?.name || 'Elena Rostova'}</span>
                  <span className="zm-user-tier">PRO WORKSPACE</span>
                </div>
                <ChevronDownIcon size={14} className={`zm-chevron ${profileMenuOpen ? 'open' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="zm-profile-dropdown" role="menu">
                  <div className="zm-dropdown-user-card">
                    <p className="zm-dd-name">{user?.name || 'Elena Rostova'}</p>
                    <p className="zm-dd-email">{user?.email || 'elena.rostova@enterprise.com'}</p>
                    <div className="zm-dd-badge">
                      <SparkleIcon size={13} />
                      <span>Enterprise AI Tier &bull; Active</span>
                    </div>
                  </div>

                  <div className="zm-dropdown-separator" />

                  <button
                    type="button"
                    className="zm-dropdown-link"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleStartInstantMeeting();
                    }}
                  >
                    <VideoIcon size={16} />
                    <span>My Personal Meeting Room</span>
                  </button>

                  <button
                    type="button"
                    className="zm-dropdown-link"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      showToast('Calendar synced with Google Workspace & M365.');
                    }}
                  >
                    <CalendarIcon size={16} />
                    <span>Meeting Schedule</span>
                  </button>

                  <button
                    type="button"
                    className="zm-dropdown-link"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      showToast('Preferences: 256-bit encryption & ephemeral audio storage enabled.');
                    }}
                  >
                    <SettingsIcon size={16} />
                    <span>Workspace Settings</span>
                  </button>

                  <div className="zm-dropdown-separator" />

                  <button
                    type="button"
                    className="zm-dropdown-link zm-logout-btn"
                    onClick={handleLogout}
                    id="zm-btn-signout"
                    role="menuitem"
                  >
                    <LogOutIcon size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-in Navigation Drawer (Matching User Screenshot) */}
      {mobileMenuOpen && (
        <div className="zm-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <aside className="zm-drawer-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="zm-drawer-header">
              <div className="zm-drawer-brand">
                <div className="zm-drawer-brand-icon">
                  <VideoIcon size={20} />
                </div>
                <span className="zm-drawer-brand-title">IntellMeet</span>
              </div>
              <div className="zm-drawer-header-actions">
                <button
                  type="button"
                  className="zm-icon-action-btn"
                  onClick={() => showToast('You have 2 new AI meeting summaries ready to review.')}
                  aria-label="Notifications"
                >
                  <BellIcon size={17} />
                  <span className="zm-notification-dot" />
                </button>
                <div className="zm-avatar-circle" style={{ width: 32, height: 32, fontSize: 11 }}>
                  <span>{user?.avatar || 'ER'}</span>
                </div>
              </div>
            </div>

            <nav className="zm-drawer-nav">
              {navSections.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeNavSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`zm-drawer-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="zm-drawer-footer">
              <button
                type="button"
                className="zm-drawer-logout-btn"
                onClick={handleLogout}
              >
                <LogOutIcon size={18} />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================================
          2. Hero Section: "Find out what's possible when work connects"
          Deep Midnight Radial Blue Gradient + 5-Card Interactive Carousel
          ===================================================================== */}
      <section className="zm-hero-section" id="overview">
        {/* Animated Radial Glows */}
        <div className="zm-hero-glow-orb-primary" aria-hidden="true" />
        <div className="zm-hero-glow-orb-secondary" aria-hidden="true" />

        <div className="zm-hero-inner">
          {/* Header Typography */}
          <div className="zm-hero-text-block">
            <h1 className="zm-hero-headline">
              Find out what&apos;s possible<br />when work connects
            </h1>
            <p className="zm-hero-subheadline">
              Empower your teams with an AI-first work platform that combines video, team chat, phone,
              whiteboards, notes, and spaces.
            </p>

            <div className="zm-hero-cta-row">
              <button
                type="button"
                className="zm-primary-cta-btn"
                onClick={handleStartInstantMeeting}
                id="hero-start-meeting-btn"
              >
                <span>Start a Meeting</span>
              </button>
              <button
                type="button"
                className="zm-secondary-cta-btn"
                onClick={() => {
                  const el = document.getElementById('ai-companion');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                id="hero-plans-btn"
              >
                <span>Discover AI</span>
              </button>
            </div>
          </div>

          {/* Interactive 5-Card Workplace Showcase Carousel */}
          <div className="zm-carousel-container" aria-label="Workplace Features Carousel">
            {/* Left / Right Circular Navigation Arrows */}
            <button
              type="button"
              className="zm-carousel-arrow left"
              onClick={() => setCarouselIndex((prev) => (prev === 0 ? 4 : prev - 1))}
              aria-label="Previous workplace card"
            >
              <ArrowLeftIcon size={20} />
            </button>

            <button
              type="button"
              className="zm-carousel-arrow right"
              onClick={() => setCarouselIndex((prev) => (prev === 4 ? 0 : prev + 1))}
              aria-label="Next workplace card"
            >
              <ArrowRightIcon size={20} />
            </button>

            {/* Cards Track */}
            <div className="zm-carousel-track">
              {heroCards.map((card, idx) => {
                const isActive = idx === carouselIndex;
                return (
                  <div
                    key={card.id}
                    className={`zm-carousel-card ${isActive ? 'active' : ''}`}
                    onClick={() => setCarouselIndex(idx)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${card.title}`}
                  >
                    {/* Top Tag & Title */}
                    <div className="zm-card-tag-pill">{card.tag}</div>
                    <h3 className="zm-card-title">{card.title}</h3>
                    <p className="zm-card-subtitle">{card.subtitle}</p>

                    {/* Card Mockup Visual Preview */}
                    <div className="zm-card-screen-mockup">
                      <div className="zm-mockup-header-bar">
                        <span className="zm-dot red" />
                        <span className="zm-dot yellow" />
                        <span className="zm-dot green" />
                        <span className="zm-mockup-label">{card.previewDetails.metric1}</span>
                      </div>

                      {/* Mockup Body Content based on card type */}
                      <div className="zm-mockup-body">
                        {card.badgeType === 'live' && (
                          <div className="zm-mockup-live-video">
                            <div
                              className="zm-video-caller-avatar"
                              style={{ backgroundColor: card.previewDetails.avatarColor }}
                            >
                              {card.previewDetails.avatarInitial}
                            </div>
                            <div className="zm-live-wave-bars">
                              <span className="zm-bar b1" />
                              <span className="zm-bar b2" />
                              <span className="zm-bar b3" />
                              <span className="zm-bar b4" />
                            </div>
                            <div className="zm-video-status-tag">
                              <span className="zm-pulse-circle" />
                              <span>{card.previewDetails.statusText}</span>
                            </div>
                          </div>
                        )}

                        {card.badgeType === 'chat' && (
                          <div className="zm-mockup-chat-screen">
                            <div className="zm-chat-bubble incoming">
                              <span className="zm-sender">Dr. Marcus Vance</span>
                              <p>Live AI transcription enabled for APAC cluster.</p>
                            </div>
                            <div className="zm-chat-bubble outgoing">
                              <span className="zm-sender">You</span>
                              <p>Approved. Pushing zero-retention updates.</p>
                            </div>
                            <div className="zm-chat-reaction-row">
                              <span>👍 4</span>
                              <span>🚀 8</span>
                              <span>🔥 2</span>
                            </div>
                          </div>
                        )}

                        {card.badgeType === 'docs' && (
                          <div className="zm-mockup-notes-screen">
                            <div className="zm-notes-heading">
                              <SparkleIcon size={14} />
                              <span>Executive AI Minutes</span>
                            </div>
                            <div className="zm-notes-bullet">
                              <CheckIcon size={12} />
                              <span>16ms latency achieved across nodes</span>
                            </div>
                            <div className="zm-notes-bullet">
                              <CheckIcon size={12} />
                              <span>SOC-2 Type II audit verified</span>
                            </div>
                            <div className="zm-notes-badge">Automated Summary</div>
                          </div>
                        )}

                        {card.badgeType === 'calendar' && (
                          <div className="zm-mockup-calendar-screen">
                            <div className="zm-cal-time-pill">
                              <ClockIcon size={13} />
                              <span>03:00 PM - 03:45 PM</span>
                            </div>
                            <p className="zm-cal-title">Product All-Hands Sync</p>
                            <div className="zm-cal-attendees">
                              <UsersIcon size={13} />
                              <span>18 Team Members Connected</span>
                            </div>
                            <button
                              type="button"
                              className="zm-cal-join-now-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartInstantMeeting();
                              }}
                            >
                              Join Now
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mockup Footer Metric Pill */}
                      <div className="zm-mockup-footer-badge">
                        <span>{card.previewDetails.metric2}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            <div className="zm-carousel-pagination">
              {heroCards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`zm-dot-pill ${i === carouselIndex ? 'active' : ''}`}
                  onClick={() => setCarouselIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. AI Companion Spotlight ("Your new AI teammate")
          Desktop Scenic Window Mockup + 3 Feature Triplet Cards
          ===================================================================== */}
      <section className="zm-spotlight-section" id="ai-companion">
        <div className="zm-spotlight-container">
          {/* Section Header */}
          <div className="zm-spotlight-header-row">
            <div className="zm-spotlight-title-group">
              <div className="zm-ai-companion-badge">
                <SparkleIcon size={16} />
                <span>AI Companion 2.0</span>
              </div>
              <h2 className="zm-spotlight-heading">Your new AI teammate</h2>
              <p className="zm-spotlight-subtext">
                Included at no additional cost. Empower every meeting with real-time summarization,
                instant query answers, and automatic follow-up actions.
              </p>
            </div>

            <button
              type="button"
              className="zm-spotlight-action-btn"
              onClick={() => showToast('AI Companion 2.0 features are enabled for your workspace.')}
            >
              <span>Discover AI Companion</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>

          {/* Desktop Scenic Window Mockup */}
          <div className="zm-desktop-mockup-outer">
            <div className="zm-scenic-backdrop" aria-hidden="true" />

            <div className="zm-floating-app-window">
              {/* macOS Window Controls */}
              <div className="zm-app-window-header">
                <div className="zm-window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="zm-window-title-bar">
                  <VideoIcon size={14} />
                  <span>IntellMeet Workplace &bull; Q4 Global Architecture Review (Live)</span>
                  <span className="zm-live-timer">00:34:18</span>
                </div>
                <div className="zm-window-actions">
                  <span className="zm-recording-badge">● REC</span>
                </div>
              </div>

              {/* Split Video Call + AI Companion Sidebar */}
              <div className="zm-app-window-body">
                {/* Left: 4-Participant Video Conference Grid */}
                <div className="zm-video-grid-area">
                  <div className="zm-video-tile tile-speaker">
                    <div className="zm-tile-avatar">ER</div>
                    <div className="zm-tile-badge active-speaker">
                      <MicWaveIcon size={14} />
                      <span>Elena Rostova (Host)</span>
                    </div>
                    <div className="zm-speaker-glow" />
                  </div>

                  <div className="zm-video-tile">
                    <div className="zm-tile-avatar tile-2">MV</div>
                    <div className="zm-tile-badge">
                      <span>Dr. Marcus Vance</span>
                    </div>
                  </div>

                  <div className="zm-video-tile">
                    <div className="zm-tile-avatar tile-3">SC</div>
                    <div className="zm-tile-badge">
                      <span>Sarah Chen</span>
                    </div>
                  </div>

                  <div className="zm-video-tile">
                    <div className="zm-tile-avatar tile-4">DK</div>
                    <div className="zm-tile-badge">
                      <span>David Kim</span>
                    </div>
                  </div>

                  {/* Meeting Controls Bar */}
                  <div className="zm-meeting-controls-strip">
                    <button type="button" className="zm-ctrl-btn" title="Mute Audio">
                      <MicWaveIcon size={16} />
                    </button>
                    <button type="button" className="zm-ctrl-btn" title="Stop Video">
                      <VideoIcon size={16} />
                    </button>
                    <button type="button" className="zm-ctrl-btn" title="Share Screen">
                      <ScreenShareIcon size={16} />
                    </button>
                    <button type="button" className="zm-ctrl-btn" title="Chat">
                      <MessageChatIcon size={16} />
                    </button>
                    <button type="button" className="zm-ctrl-btn active-spark" title="AI Companion Active">
                      <SparkleIcon size={16} />
                      <span>AI Active</span>
                    </button>
                  </div>
                </div>

                {/* Right: Live AI Companion Notes & Assistant Panel */}
                <div className="zm-ai-sidebar-panel">
                  <div className="zm-ai-panel-header">
                    <div className="zm-ai-panel-title">
                      <BrainIcon size={18} />
                      <span>AI Companion Notes</span>
                    </div>
                    <span className="zm-pulse-live-tag">LIVE SYNTHESIS</span>
                  </div>

                  <div className="zm-ai-panel-scroll">
                    {/* Live Transcript Snippet */}
                    <div className="zm-ai-snippet-card">
                      <span className="zm-snippet-meta">11:32 AM &bull; Elena Rostova</span>
                      <p className="zm-snippet-text">
                        &quot;Our APAC migration benchmark validated 16ms latency. All media packets are encrypted
                        with zero retention.&quot;
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div className="zm-ai-summary-block">
                      <h4>
                        <SparkleIcon size={14} />
                        <span>Real-Time Executive Summary</span>
                      </h4>
                      <ul>
                        <li>Approved regional redundancy architecture for Q4 rollouts.</li>
                        <li>Validated zero-knowledge ephemeral audio processing.</li>
                        <li>SOC-2 Type II audit verification confirmed 100% compliant.</li>
                      </ul>
                    </div>

                    {/* Action Items */}
                    <div className="zm-ai-actions-block">
                      <h4>
                        <CheckCircleIcon size={14} />
                        <span>Action Items Assigned</span>
                      </h4>
                      <div className="zm-action-item-pill">
                        <span className="assignee">Sarah Chen</span>
                        <span className="task">Finalize APAC compliance sign-offs</span>
                      </div>
                      <div className="zm-action-item-pill">
                        <span className="assignee">Dr. Vance</span>
                        <span className="task">Deploy latency benchmark report</span>
                      </div>
                    </div>

                    {/* Interactive "Ask AI" bar */}
                    <form className="zm-ask-ai-form" onSubmit={handleAskAI}>
                      <div className="zm-ask-ai-input-wrap">
                        <input
                          type="text"
                          placeholder="Ask AI Companion about this meeting..."
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          aria-label="Ask AI Companion"
                        />
                        <button type="submit" disabled={aiIsGenerating} aria-label="Send Query">
                          {aiIsGenerating ? '...' : <ArrowRightIcon size={16} />}
                        </button>
                      </div>

                      {aiAnswer && (
                        <div className="zm-ai-answer-bubble">
                          <p>{aiAnswer}</p>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Triplet Feature Cards Matching the Image */}
          <div className="zm-triplet-cards-grid">
            {/* Card 1: Gartner MQ Leader */}
            <div className="zm-triplet-card">
              <div className="zm-triplet-icon-box">
                <LaurelWreathIcon size={34} />
              </div>
              <h3 className="zm-triplet-title">
                A Leader in the 2024 Gartner&reg; Magic Quadrant&trade;
              </h3>
              <p className="zm-triplet-desc">
                Recognized for Enterprise Completeness of Vision and Ability to Execute in Unified
                Communications &amp; AI.
              </p>
              <button
                type="button"
                className="zm-triplet-link"
                onClick={() => showToast('Opening Gartner 2024 Magic Quadrant Executive Report...')}
              >
                <span>Read the report</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>

            {/* Card 2: Customer Success Spotlight */}
            <div className="zm-triplet-card">
              <div className="zm-triplet-icon-box blue-badge">
                <UsersIcon size={30} />
              </div>
              <h3 className="zm-triplet-title">Empowering 50,000+ Hybrid Teams</h3>
              <p className="zm-triplet-desc">
                From Fortune 500 enterprises to fast-growing startups, IntellMeet reduces meeting fatigue
                by 42% through autonomous AI synthesis.
              </p>
              <button
                type="button"
                className="zm-triplet-link"
                onClick={() => showToast('Opening Global Customer Success Case Studies...')}
              >
                <span>Read customer stories</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>

            {/* Card 3: Global High-Availability Network */}
            <div className="zm-triplet-card">
              <div className="zm-triplet-icon-box emerald-badge">
                <GlobeGridIcon size={30} />
              </div>
              <h3 className="zm-triplet-title">99.999% SLA Global Reliability</h3>
              <p className="zm-triplet-desc">
                Engineered with multi-region redundancy, 256-bit AES encryption, and zero-retention
                ephemeral data pipelines.
              </p>
              <button
                type="button"
                className="zm-triplet-link"
                onClick={() => showToast('Opening Security & Trust Architecture Whitepaper...')}
              >
                <span>Explore trust center</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. "One platform. Endless ways to work together."
          Interactive Category Tabs & Side-by-Side Showcase
          ===================================================================== */}
      <section className="zm-tabs-section" id="solutions">
        <div className="zm-tabs-container">
          <div className="zm-tabs-header-block">
            <h2 className="zm-tabs-heading">
              One platform.<br />Endless ways to work together.
            </h2>

            {/* Interactive Pill Tabs */}
            <div className="zm-tabs-pill-bar" role="tablist">
              <button
                type="button"
                className={`zm-tab-pill-btn ${activeTab === 'meetings' ? 'active' : ''}`}
                onClick={() => setActiveTab('meetings')}
                role="tab"
                aria-selected={activeTab === 'meetings'}
              >
                Meetings
              </button>
              <button
                type="button"
                className={`zm-tab-pill-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
                role="tab"
                aria-selected={activeTab === 'chat'}
              >
                Team Chat
              </button>
              <button
                type="button"
                className={`zm-tab-pill-btn ${activeTab === 'companion' ? 'active' : ''}`}
                onClick={() => setActiveTab('companion')}
                role="tab"
                aria-selected={activeTab === 'companion'}
              >
                AI Companion
              </button>
              <button
                type="button"
                className={`zm-tab-pill-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
                role="tab"
                aria-selected={activeTab === 'notes'}
              >
                Docs &amp; Whiteboards
              </button>
              <button
                type="button"
                className={`zm-tab-pill-btn ${activeTab === 'spaces' ? 'active' : ''}`}
                onClick={() => setActiveTab('spaces')}
                role="tab"
                aria-selected={activeTab === 'spaces'}
              >
                Workspaces
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="zm-tab-display-grid">
            {/* Left: Bullet checklist & description */}
            <div className="zm-tab-info-col">
              {activeTab === 'meetings' && (
                <>
                  <h3 className="zm-tab-feature-title">Crystal-Clear Video Conferencing</h3>
                  <p className="zm-tab-feature-desc">
                    Connect teams across the globe with studio-grade 4K video, adaptive bandwidth
                    management, and immersive spatial audio.
                  </p>
                  <ul className="zm-tab-checklist">
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Dynamic noise reduction suppresses background chatter automatically.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>One-click breakout rooms and multi-stream screen sharing.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Integrated with Zoom Room hardware and SIP conference endpoints.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>End-to-end 256-bit encryption for every participant.</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="zm-tab-cta-btn"
                    onClick={handleStartInstantMeeting}
                  >
                    <span>Start Instant Meeting</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeTab === 'chat' && (
                <>
                  <h3 className="zm-tab-feature-title">Enterprise Team Chat &amp; Channels</h3>
                  <p className="zm-tab-feature-desc">
                    Keep momentum going before, during, and after meetings with continuous messaging,
                    file collaboration, and AI smart drafts.
                  </p>
                  <ul className="zm-tab-checklist">
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Organize projects with persistent public and private channels.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>AI Companion drafts replies and synthesizes long unread threads.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Instant transition from a chat conversation to a live video call.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Granular data loss prevention (DLP) and compliance retention.</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="zm-tab-cta-btn"
                    onClick={() => showToast('Opening Team Chat Workspace...')}
                  >
                    <span>Explore Team Chat</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeTab === 'companion' && (
                <>
                  <h3 className="zm-tab-feature-title">Zero-Cost AI Companion Included</h3>
                  <p className="zm-tab-feature-desc">
                    Never take manual notes again. Get automated executive minutes, catch-up briefs if
                    you arrive late, and next steps assigned to owners.
                  </p>
                  <ul className="zm-tab-checklist">
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Real-time meeting summarization with key decisions flagged.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Ask AI questions in plain language without interrupting the speaker.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Automatic translation across 36 international languages.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Zero customer audio or video data used to train AI models.</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="zm-tab-cta-btn"
                    onClick={() => showToast('AI Companion Active in your workspace.')}
                  >
                    <span>Try AI Companion</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeTab === 'notes' && (
                <>
                  <h3 className="zm-tab-feature-title">Collaborative Docs &amp; Whiteboards</h3>
                  <p className="zm-tab-feature-desc">
                    Brainstorm, wireframe, and co-author living documents during or outside meetings with
                    infinite digital canvases and real-time multiplayer editing.
                  </p>
                  <ul className="zm-tab-checklist">
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Infinite whiteboard canvas with sticky notes, diagrams, and shapes.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Convert sketches into polished flowcharts with AI shape completion.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Rich markdown document editing with live audio sidebar.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Export directly to Notion, Confluence, and PDF formats.</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="zm-tab-cta-btn"
                    onClick={() => showToast('Opening New Whiteboard Canvas...')}
                  >
                    <span>Create a Whiteboard</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeTab === 'spaces' && (
                <>
                  <h3 className="zm-tab-feature-title">Intelligent Spaces &amp; Room Booking</h3>
                  <p className="zm-tab-feature-desc">
                    Bridge physical conference rooms and remote colleagues with digital signage,
                    smart kiosk check-ins, and calendar scheduling.
                  </p>
                  <ul className="zm-tab-checklist">
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Touchless room join using mobile presence detection.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Interactive floor plans with real-time occupancy sensors.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Automated release of reserved rooms if no participants show up.</span>
                    </li>
                    <li>
                      <CheckCircleIcon size={18} />
                      <span>Full compatibility with Crestron, Poly, and Logitech hardware.</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="zm-tab-cta-btn"
                    onClick={() => showToast('Loading Enterprise Room Scheduler...')}
                  >
                    <span>Manage Spaces</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Right: Rich Interactive UI Preview Card */}
            <div className="zm-tab-preview-col">
              <div className="zm-tab-preview-frame">
                <div className="zm-preview-top-bar">
                  <div className="zm-dots-row">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="zm-preview-title">
                    IntellMeet {activeTab.toUpperCase()} &bull; Live Preview
                  </span>
                </div>

                <div className="zm-preview-inner-canvas">
                  {activeTab === 'meetings' && (
                    <div className="zm-meetings-preview-art">
                      <div className="zm-art-video-grid">
                        <div className="zm-art-tile active">
                          <span className="avatar">ER</span>
                          <span className="label">Elena Rostova</span>
                        </div>
                        <div className="zm-art-tile">
                          <span className="avatar color-2">SC</span>
                          <span className="label">Sarah Chen</span>
                        </div>
                      </div>
                      <div className="zm-art-bottom-controls">
                        <span className="ctrl mic active" />
                        <span className="ctrl cam active" />
                        <span className="ctrl share" />
                        <span className="ctrl leave">End</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="zm-chat-preview-art">
                      <div className="zm-channel-bar">
                        <span># global-engineering</span>
                        <span className="badge">14 online</span>
                      </div>
                      <div className="zm-art-msg left">
                        <strong>Marcus Vance:</strong>
                        <p>Latency test in Tokyo dropped to 14ms! 🚀</p>
                      </div>
                      <div className="zm-art-msg ai-bot">
                        <SparkleIcon size={13} />
                        <strong>AI Assistant:</strong>
                        <p>Summary created &amp; synced with Jira ticket ENG-408.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'companion' && (
                    <div className="zm-companion-preview-art">
                      <div className="zm-comp-header">
                        <SparkleIcon size={16} />
                        <span>AI Companion 2.0 Live Assistant</span>
                      </div>
                      <div className="zm-comp-bubble">
                        <p className="q">Q: What did the team decide about SOC-2 compliance?</p>
                        <p className="a">
                          A: Dr. Vance confirmed 100% compliance adherence with zero retention.
                        </p>
                      </div>
                      <div className="zm-comp-pill">✓ 3 Next Steps Generated</div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="zm-notes-preview-art">
                      <div className="zm-doc-title">Architecture Planning Whiteboard</div>
                      <div className="zm-doc-sketch-boxes">
                        <div className="box b1">WebRTC Ingest</div>
                        <div className="arrow">&rarr;</div>
                        <div className="box b2">AI Synthesis</div>
                        <div className="arrow">&rarr;</div>
                        <div className="box b3">Ephemeral Store</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'spaces' && (
                    <div className="zm-spaces-preview-art">
                      <div className="zm-space-room-card available">
                        <div className="room-name">Conference Room Alpha (Floor 4)</div>
                        <span className="status">Available &bull; 12 Seats</span>
                        <button type="button" className="book-btn">One-Touch Start</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. Enterprise Social Proof & Industry Ratings
          G2 (4.9/5), Gartner (4.8/5), TrustRadius (9.4/10) + Logo Strip
          ===================================================================== */}
      <section className="zm-proof-section">
        <div className="zm-proof-container">
          {/* Industry Ratings */}
          <div className="zm-ratings-grid">
            <div className="zm-rating-card">
              <div className="zm-rating-score">4.9 / 5</div>
              <div className="zm-rating-stars">★★★★★</div>
              <div className="zm-rating-source">G2 Crowd &bull; Leader 2024</div>
              <p className="zm-rating-desc">Highest Customer Satisfaction for Enterprise Video</p>
            </div>

            <div className="zm-rating-card">
              <div className="zm-rating-score">4.8 / 5</div>
              <div className="zm-rating-stars">★★★★★</div>
              <div className="zm-rating-source">Gartner Peer Insights&trade;</div>
              <p className="zm-rating-desc">Customers&apos; Choice for Meeting Solutions</p>
            </div>

            <div className="zm-rating-card">
              <div className="zm-rating-score">9.4 / 10</div>
              <div className="zm-rating-stars">★★★★★</div>
              <div className="zm-rating-source">TrustRadius Top Rated</div>
              <p className="zm-rating-desc">Voted Top Collaboration Suite for Large Enterprises</p>
            </div>
          </div>

          {/* Trusted Brands Logo Strip */}
          <div className="zm-logos-strip">
            <span className="zm-logos-label">POWERING TEAMS AT SCALE</span>
            <div className="zm-logos-row">
              <div className="zm-logo-pill">FORMULA 1&reg;</div>
              <div className="zm-logo-pill">MLB&reg;</div>
              <div className="zm-logo-pill">WWF&reg;</div>
              <div className="zm-logo-pill">NASDAQ</div>
              <div className="zm-logo-pill">COLUMBIA</div>
              <div className="zm-logo-pill">SPOTIFY</div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. Customer Stories ("Businesses achieve more with IntellMeet")
          Big Visual Case Study Showcase Card with Slider Controls
          ===================================================================== */}
      <section className="zm-stories-section">
        <div className="zm-stories-container">
          <div className="zm-stories-header">
            <span className="zm-tag-pill">CUSTOMER SPOTLIGHT</span>
            <h2 className="zm-stories-title">Businesses achieve more with IntellMeet</h2>
          </div>

          {/* Active Featured Case Study Card */}
          {customerStories[storyIndex] && (
            <div className="zm-featured-story-card">
              <div className="zm-story-card-inner">
                {/* Visual Banner */}
                <div className="zm-story-visual-side">
                  <div className="zm-story-company-badge">
                    {customerStories[storyIndex].company}
                  </div>
                  <h3 className="zm-story-main-headline">
                    {customerStories[storyIndex].headline}
                  </h3>
                  <div className="zm-story-quote-box">
                    <p>{customerStories[storyIndex].quote}</p>
                    <div className="zm-story-author-meta">
                      <strong>{customerStories[storyIndex].author}</strong>
                      <span>{customerStories[storyIndex].role}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics & Slide Controls */}
                <div className="zm-story-metrics-side">
                  <div className="zm-story-metric-stat">
                    <div className="stat-value">{customerStories[storyIndex].stat1Value}</div>
                    <div className="stat-label">{customerStories[storyIndex].stat1Label}</div>
                  </div>

                  <div className="zm-story-metric-stat">
                    <div className="stat-value">{customerStories[storyIndex].stat2Value}</div>
                    <div className="stat-label">{customerStories[storyIndex].stat2Label}</div>
                  </div>

                  <div className="zm-story-metric-stat">
                    <div className="stat-value">{customerStories[storyIndex].stat3Value}</div>
                    <div className="stat-label">{customerStories[storyIndex].stat3Label}</div>
                  </div>

                  {/* Slider Control Arrows */}
                  <div className="zm-story-controls-row">
                    <button
                      type="button"
                      className="zm-story-btn"
                      onClick={() =>
                        setStoryIndex((prev) => (prev === 0 ? customerStories.length - 1 : prev - 1))
                      }
                      aria-label="Previous customer story"
                    >
                      <ArrowLeftIcon size={18} />
                    </button>
                    <span className="zm-story-counter">
                      0{storyIndex + 1} / 0{customerStories.length}
                    </span>
                    <button
                      type="button"
                      className="zm-story-btn"
                      onClick={() =>
                        setStoryIndex((prev) => (prev + 1) % customerStories.length)
                      }
                      aria-label="Next customer story"
                    >
                      <ArrowRightIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          7. "Making moves, making impact" (3 Blue Modern Cards)
          ===================================================================== */}
      <section className="zm-impact-section">
        <div className="zm-impact-container">
          <div className="zm-impact-header">
            <span className="zm-tag-pill">INNOVATION &amp; IMPACT</span>
            <h2 className="zm-impact-title">Making moves, making impact</h2>
          </div>

          <div className="zm-impact-cards-grid">
            {/* Card 1 */}
            <div className="zm-impact-card">
              <div className="zm-impact-icon">
                <SparkleIcon size={32} />
              </div>
              <h3 className="zm-impact-card-title">AI Innovation of the Year</h3>
              <p className="zm-impact-card-desc">
                Awarded for breakthroughs in zero-retention real-time audio transcription and
                autonomous meeting synthesis.
              </p>
              <button
                type="button"
                className="zm-impact-card-link"
                onClick={() => showToast('Opening AI Innovation Report...')}
              >
                <span>Learn more</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>

            {/* Card 2 */}
            <div className="zm-impact-card">
              <div className="zm-impact-icon">
                <TrophyAwardIcon size={32} />
              </div>
              <h3 className="zm-impact-card-title">Technology &amp; Engineering Emmy&reg;</h3>
              <p className="zm-impact-card-desc">
                Honoring high-definition spatial audio codecs and broadcast streaming compression
                reliability at scale.
              </p>
              <button
                type="button"
                className="zm-impact-card-link"
                onClick={() => showToast('Opening Emmy Award Announcement...')}
              >
                <span>Read press release</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>

            {/* Card 3 */}
            <div className="zm-impact-card">
              <div className="zm-impact-icon">
                <ShieldCheckIcon size={32} />
              </div>
              <h3 className="zm-impact-card-title">100% Renewable Cloud Operations</h3>
              <p className="zm-impact-card-desc">
                Committed to carbon-neutral global server infrastructure and green computing data
                centers across all regions.
              </p>
              <button
                type="button"
                className="zm-impact-card-link"
                onClick={() => showToast('Opening ESG & Sustainability Report...')}
              >
                <span>View sustainability report</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. Bottom CTA Banner: "See what IntellMeet can do for your business"
          ===================================================================== */}
      <section className="zm-cta-banner-section" id="plans">
        <div className="zm-cta-banner-container">
          <h2 className="zm-cta-headline">
            See what IntellMeet can do for your business
          </h2>
          <p className="zm-cta-subhead">
            Experience next-generation enterprise video, collaborative workspaces, and zero-cost AI
            Companion today.
          </p>

          <div className="zm-cta-buttons-row">
            <button
              type="button"
              className="zm-cta-primary-btn"
              onClick={handleStartInstantMeeting}
            >
              <span>Start Free Meeting</span>
              <ArrowRightIcon size={16} />
            </button>
            <button
              type="button"
              className="zm-cta-secondary-btn"
              onClick={() => showToast('Enterprise Sales: Dedicated solution architect assigned.')}
            >
              <span>Contact Enterprise Sales</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. Full Enterprise Dark Footer
          ===================================================================== */}
      <footer className="zm-footer" role="contentinfo">
        <div className="zm-footer-container">
          <div className="zm-footer-top-grid">
            {/* Brand Column & Region Pickers */}
            <div className="zm-footer-brand-col">
              <div className="zm-footer-logo-row">
                <BrandIcon size={28} />
                <span className="zm-footer-logo-text">intellmeet</span>
              </div>
              <p className="zm-footer-tagline">
                AI-First Unified Communication &amp; Meeting Intelligence Platform.
              </p>

              <div className="zm-footer-selectors">
                <select className="zm-select-picker" aria-label="Language Selector">
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="ja-JP">日本語</option>
                </select>

                <select className="zm-select-picker" aria-label="Currency Selector">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {/* Links Column 1: Products */}
            <div className="zm-footer-col">
              <h4>Products</h4>
              <ul>
                <li><a href="#overview">Meetings</a></li>
                <li><a href="#overview">Team Chat</a></li>
                <li><a href="#ai-companion">AI Companion</a></li>
                <li><a href="#solutions">Whiteboards</a></li>
                <li><a href="#solutions">Workspaces</a></li>
                <li><a href="#plans">Enterprise Phone</a></li>
              </ul>
            </div>

            {/* Links Column 2: Solutions */}
            <div className="zm-footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#solutions">Large Enterprise</a></li>
                <li><a href="#solutions">Small &amp; Medium Business</a></li>
                <li><a href="#solutions">Healthcare &amp; HIPAA</a></li>
                <li><a href="#solutions">Higher Education</a></li>
                <li><a href="#solutions">Financial Services</a></li>
                <li><a href="#solutions">Government &amp; FedRAMP</a></li>
              </ul>
            </div>

            {/* Links Column 3: Resources */}
            <div className="zm-footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#resources">Customer Stories</a></li>
                <li><a href="#resources">Product Demos</a></li>
                <li><a href="#resources">Developer API &amp; SDK</a></li>
                <li><a href="#resources">Webinar Library</a></li>
                <li><a href="#resources">Security Architecture</a></li>
                <li><a href="#resources">System Status</a></li>
              </ul>
            </div>

            {/* Links Column 4: Company */}
            <div className="zm-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#overview">About Us</a></li>
                <li><a href="#overview">Careers</a></li>
                <li><a href="#overview">Press &amp; Awards</a></li>
                <li><a href="#overview">Trust Center</a></li>
                <li><a href="#overview">ESG &amp; Sustainability</a></li>
                <li><a href="#overview">Investor Relations</a></li>
              </ul>
            </div>
          </div>

          <div className="zm-footer-divider" />

          {/* Bottom Copyright & Legal Links */}
          <div className="zm-footer-bottom-row">
            <p className="zm-copyright-text">
              &copy; {new Date().getFullYear()} IntellMeet AI Technologies, Inc. All rights reserved.
            </p>
            <div className="zm-legal-links">
              <button type="button" onClick={() => navigate('/privacy')}>Privacy Statement</button>
              <span>&bull;</span>
              <button type="button" onClick={() => navigate('/terms')}>Terms of Service</button>
              <span>&bull;</span>
              <button type="button" onClick={() => showToast('Trust Center: SOC-2 Type II Validated.')}>Trust Center</button>
              <span>&bull;</span>
              <button type="button" onClick={() => showToast('Cookie Preferences: Strictly Necessary only.')}>Cookie Preferences</button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          10. Interactive Start/Join Meeting Modal Dialog
          ===================================================================== */}
      {meetingModalOpen && (
        <div className="zm-modal-backdrop" role="dialog" aria-modal="true">
          <div className="zm-modal-panel">
            <div className="zm-modal-header">
              <div className="zm-modal-title">
                <VideoIcon size={20} />
                <h3>{meetingModalMode === 'instant' ? 'Start an Instant Meeting' : 'Join a Meeting'}</h3>
              </div>
              <button
                type="button"
                className="zm-modal-close"
                onClick={() => setMeetingModalOpen(false)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLaunchMeetingRoom} className="zm-modal-form">
              {meetingModalMode === 'join' && (
                <div className="zm-form-group">
                  <label htmlFor="zm-room-input">Meeting ID or Room Name</label>
                  <input
                    id="zm-room-input"
                    type="text"
                    placeholder="e.g. 408-992-101 or APAC-Sync"
                    value={meetingRoomId}
                    onChange={(e) => setMeetingRoomId(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {meetingModalMode === 'instant' && (
                <div className="zm-instant-room-preview">
                  <div className="room-info">
                    <span className="room-label">Personal Meeting Room</span>
                    <strong className="room-id">https://intellmeet.ai/room/408-er-pro</strong>
                  </div>
                  <span className="zm-badge-tag">AI Companion 2.0 Enabled</span>
                </div>
              )}

              <div className="zm-modal-checkboxes">
                <label className="zm-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Enable Real-Time AI Companion Transcription</span>
                </label>
                <label className="zm-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Studio Noise Cancellation &amp; Spatial Audio</span>
                </label>
                <label className="zm-checkbox-label">
                  <input type="checkbox" />
                  <span>Turn off video when joining</span>
                </label>
              </div>

              <div className="zm-modal-actions">
                <button
                  type="button"
                  className="zm-btn-cancel"
                  onClick={() => setMeetingModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="zm-btn-submit">
                  {meetingModalMode === 'instant' ? 'Launch Room Now' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="zm-floating-toast" role="status">
          <SparkleIcon size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
