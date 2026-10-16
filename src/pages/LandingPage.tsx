import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMeetings } from '../context/MeetingContext';
import { ThemeCustomizationPopover } from '../components/theme/ThemeCustomizationPopover';
import { getEffectiveThemeMode } from '../config/themePresets';
import {
  SparkleIcon,
  CheckIcon,
  ArrowRightIcon,
  BrainIcon,
  SunIcon,
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  UsersIcon,
  VideoIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BrandIcon,
} from '../components/icons';
import '../components/LandingPage.css';

/* Local helper icons for landing showcase */
const MicLiveIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StarFilledIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

type FeatureTabKey = 'summaries' | 'transcription' | 'actionItems' | 'collaboration' | 'video' | 'security';

interface DemoActionItem {
  id: string;
  text: string;
  owner: string;
  due: string;
  priority: 'urgent' | 'high' | 'med';
  completed: boolean;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = useMeetings();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTabKey>('summaries');

  // Interactive Action Items demo state
  const [demoActionItems, setDemoActionItems] = useState<DemoActionItem[]>([
    {
      id: 'act-1',
      text: 'Finalize multi-region latency benchmarks for APAC deployment',
      owner: 'Sarah Chen',
      due: 'Friday, 5:00 PM',
      priority: 'urgent',
      completed: true,
    },
    {
      id: 'act-2',
      text: 'Deploy Zero-Knowledge key validation checks to engineering channel',
      owner: 'Dr. Marcus Vance',
      due: 'Tomorrow, 12:00 PM',
      priority: 'high',
      completed: false,
    },
    {
      id: 'act-3',
      text: 'Review SOC-2 compliance checklist with security lead',
      owner: 'Elena Rostova',
      due: 'Oct 14',
      priority: 'med',
      completed: false,
    },
  ]);

  // Interactive transcription demo state
  const [transcriptSearch, setTranscriptSearch] = useState('');
  // Interactive workspace channel state
  const [activeChannel, setActiveChannel] = useState<'exec' | 'arch' | 'q4'>('exec');
  // Interactive zero retention toggle
  const [zeroRetentionActive, setZeroRetentionActive] = useState(true);

  const themePopoverRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const effectiveMode = getEffectiveThemeMode(preferences.theme);

  // Smooth scroll to element by ID
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // If redirected to root with OAuth callback parameters (e.g. from Google or proxy),
  // forward immediately to OAuthCallbackPage to complete the authentication lifecycle.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasCodeAndState = Boolean(params.get('code') && params.get('state'));
    const hasTokens = Boolean(params.get('token') && params.get('refreshToken'));
    const hasOAuthError = Boolean(
      params.get('error') && (params.get('state') || params.get('code'))
    );

    if (hasCodeAndState || hasTokens || hasOAuthError) {
      navigate(`/auth/google/callback${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  // Handle URL hash on initial load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToSection(id);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, scrollToSection]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themePopoverRef.current && !themePopoverRef.current.contains(e.target as Node)) {
        setThemePopoverOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('.lp-mobile-menu-toggle')
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setThemePopoverOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleActionItem = (id: string) => {
    setDemoActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const selectTabAndScroll = (tab: FeatureTabKey) => {
    setActiveFeatureTab(tab);
    scrollToSection('features');
  };

  return (
    <div className="landing-page-root">
      {/* 1. Announcement Bar */}
      {!bannerDismissed && (
        <aside className="lp-announcement-bar" role="banner" aria-label="Product announcement">
          <div className="lp-announcement-content">
            <span className="lp-badge-pill">NEW RELEASE</span>
            <span>IntellMeet AI Companion 2.0 with Real-Time Meeting Synthesis is live!</span>
            <button
              type="button"
              className="lp-announcement-link"
              onClick={() => navigate('/signup')}
            >
              Get Started Free &rarr;
            </button>
          </div>
          <button
            type="button"
            className="lp-announcement-close"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
          >
            &times;
          </button>
        </aside>
      )}

      {/* 2. Sticky Header Navbar */}
      <header className="lp-navbar">
        <div className="lp-nav-container">
          <div className="lp-nav-left">
            <Link to="/" className="lp-brand-logo" title="IntellMeet — Meet Smarter With AI">
              <div className="lp-brand-icon" aria-hidden="true">
                <BrandIcon size={28} />
              </div>
              <div className="lp-brand-text-block">
                <span className="lp-brand-name">
                  <span className="lp-brand-intell">Intell</span>
                  <span className="lp-brand-meet">Meet</span>
                </span>
                <span className="lp-brand-tagline">MEET SMARTER WITH AI</span>
              </div>
            </Link>

            <nav className="lp-nav-menu" aria-label="Main Navigation">
              <button
                type="button"
                className="lp-nav-item"
                onClick={() => scrollToSection('features')}
              >
                Features
              </button>
              <button
                type="button"
                className="lp-nav-item"
                onClick={() => scrollToSection('ai-intelligence')}
              >
                AI Intelligence
              </button>
              <button
                type="button"
                className="lp-nav-item"
                onClick={() => scrollToSection('security')}
              >
                Security
              </button>
              <button
                type="button"
                className="lp-nav-item"
                onClick={() => scrollToSection('about')}
              >
                About
              </button>
            </nav>
          </div>

          <div className="lp-nav-right">
            {/* Header Theme Popover Control */}
            <div className="im-profile-wrapper" ref={themePopoverRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="lp-theme-btn"
                onClick={() => setThemePopoverOpen((prev) => !prev)}
                title="Customize Theme & Palette"
                aria-label="Customize theme mode and accent colors"
                aria-expanded={themePopoverOpen}
              >
                {effectiveMode === 'dark' ? <MoonIcon size={17} /> : <SunIcon size={17} />}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--im-primary)',
                    boxShadow: '0 0 0 1.5px var(--im-bg-surface)',
                  }}
                  aria-hidden="true"
                />
              </button>

              <ThemeCustomizationPopover
                isOpen={themePopoverOpen}
                onClose={() => setThemePopoverOpen(false)}
              />
            </div>

            <Link to="/login" className="lp-btn-ghost lp-signin-btn" id="lp-nav-signin">
              Sign In
            </Link>
            <Link to="/signup" className="lp-btn-primary lp-signup-btn" id="lp-nav-signup">
              Get Started
            </Link>

            <button
              type="button"
              className="lp-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div ref={mobileMenuRef} className={`lp-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="lp-mobile-drawer-inner">
            <nav className="lp-mobile-nav-links" aria-label="Mobile Navigation">
              <button
                type="button"
                className="lp-mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('features');
                }}
              >
                Features
              </button>
              <button
                type="button"
                className="lp-mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('ai-intelligence');
                }}
              >
                AI Intelligence
              </button>
              <button
                type="button"
                className="lp-mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('security');
                }}
              >
                Security
              </button>
              <button
                type="button"
                className="lp-mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('about');
                }}
              >
                About
              </button>
            </nav>

            <div className="lp-mobile-nav-actions">
              <button
                type="button"
                className="lp-btn-ghost lp-mobile-btn"
                onClick={() => {
                  setThemePopoverOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <PaletteIcon size={16} />
                <span>Customize Theme & Appearance</span>
              </button>
              <Link
                to="/login"
                className="lp-btn-ghost lp-mobile-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="lp-btn-primary lp-mobile-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started Free &rarr;
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="lp-hero-section">
        <div className="lp-hero-glow-bg" aria-hidden="true" />
        <div className="lp-hero-container">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <SparkleIcon />
              <span>THE AI-FIRST MEETING PLATFORM</span>
            </div>

            <h1 className="lp-hero-heading">
              Meet Smarter.<br />Work Better.
            </h1>

            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-hero-btn-primary" id="lp-hero-signup">
                <span>Get Started Free</span>
                <ArrowRightIcon />
              </Link>
              <button
                type="button"
                className="lp-hero-btn-outline"
                id="lp-hero-preview-cta"
                onClick={() => scrollToSection('features')}
              >
                <span>Explore Capabilities</span>
              </button>
            </div>
          </div>

          {/* High-Resolution Enterprise Meeting Intelligence Stage & Floating Animated Widgets */}
          <div className="lp-hero-stage-container">
            <div className="lp-meeting-mockup-frame">
              {/* Window Header */}
              <div className="lp-mockup-window-bar">
                <div className="lp-window-dots" aria-hidden="true">
                  <span className="dot-red" />
                  <span className="dot-yellow" />
                  <span className="dot-green" />
                </div>
                <div className="lp-window-title">
                  <span className="lp-window-title-dot" />
                  IntellMeet Enterprise Workspace &bull; Project Phoenix Sync
                </div>
                <span className="lp-window-live-badge">
                  <span className="lp-pulse-dot" />
                  00:34:18 Live
                </span>
              </div>

              {/* High-Res Showcase Image with Animated Floating Glass Cards */}
              <div className="lp-mockup-image-stage">
                <img
                  src="/hero-preview.jpg"
                  alt="IntellMeet AI Enterprise Workspace Interface"
                  className="lp-hero-dashboard-img"
                  loading="eager"
                />

                {/* Floating Widget 1: Real-time Audio Wave & Diarization */}
                <div className="lp-floating-widget lp-widget-transcription">
                  <div className="lp-widget-header">
                    <span className="lp-widget-indicator" />
                    <MicLiveIcon />
                    <span className="lp-widget-label">LIVE TRANSCRIPTION</span>
                  </div>
                  <p className="lp-widget-quote">
                    &ldquo;Launch timeline confirmed for Q3. Multi-region redundancy approved.&rdquo;
                  </p>
                  <div className="lp-widget-waveform" aria-hidden="true">
                    <span className="lp-wave-bar bar-1" />
                    <span className="lp-wave-bar bar-2" />
                    <span className="lp-wave-bar bar-3" />
                    <span className="lp-wave-bar bar-4" />
                    <span className="lp-wave-bar bar-5" />
                    <span className="lp-wave-bar bar-6" />
                    <span className="lp-wave-bar bar-7" />
                  </div>
                </div>

                {/* Floating Widget 2: Action Item Auto-Assigned */}
                <div className="lp-floating-widget lp-widget-action">
                  <div className="lp-widget-header">
                    <span className="lp-widget-check-icon">&#10003;</span>
                    <span className="lp-widget-label">ACTION ITEM AUTO-DISPATCHED</span>
                  </div>
                  <div className="lp-widget-item">
                    <span className="lp-widget-assignee">@Sarah Jones</span>
                    <span className="lp-widget-task">Finalize Q3 Architecture Spec</span>
                  </div>
                  <div className="lp-widget-meta">
                    <span className="lp-widget-tag">High Priority</span>
                    <span className="lp-widget-due">Due Oct 26</span>
                  </div>
                </div>

                {/* Floating Widget 3: Live Meeting Metrics */}
                <div className="lp-floating-widget lp-widget-stats">
                  <div className="lp-stat-pill">
                    <span className="lp-stat-num">99.4%</span>
                    <span className="lp-stat-desc">Synthesis Accuracy</span>
                  </div>
                  <div className="lp-stat-divider" />
                  <div className="lp-stat-pill">
                    <span className="lp-stat-num">&lt;18ms</span>
                    <span className="lp-stat-desc">Audio Latency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Features Section */}
      <section className="lp-tabs-section" id="features">
        <div className="lp-section-container">
          <div className="lp-tabs-header">
            <span className="lp-kicker">CORE CAPABILITIES</span>
            <h2 className="lp-tabs-title">
              Engineered for seamless collaboration<br />and intelligent decision-making
            </h2>
            <p className="lp-tabs-desc">
              Discover how IntellMeet turns conversations into actionable knowledge across every stage of your meetings.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="lp-tab-nav" role="tablist" aria-label="Feature categories">
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'summaries' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('summaries')}
              role="tab"
              aria-selected={activeFeatureTab === 'summaries'}
            >
              AI Summaries
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'transcription' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('transcription')}
              role="tab"
              aria-selected={activeFeatureTab === 'transcription'}
            >
              Live Transcription
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'actionItems' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('actionItems')}
              role="tab"
              aria-selected={activeFeatureTab === 'actionItems'}
            >
              Automatic Action Items
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'collaboration' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('collaboration')}
              role="tab"
              aria-selected={activeFeatureTab === 'collaboration'}
            >
              Team Workspaces
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('video')}
              role="tab"
              aria-selected={activeFeatureTab === 'video'}
            >
              Video &amp; Screen Sharing
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('security')}
              role="tab"
              aria-selected={activeFeatureTab === 'security'}
            >
              Enterprise Security
            </button>
          </div>

          {/* Dynamic Feature Content Box */}
          <div className="lp-tab-content-box">
            <div className="lp-tab-left">
              {activeFeatureTab === 'summaries' && (
                <>
                  <h3>Autonomous Executive Meeting Summaries</h3>
                  <p>
                    Eliminate manual meeting notes. IntellMeet extracts key discussion points, context-rich
                    takeaways, and strategic decisions in real time.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> One-click executive briefs formatted for team distribution</li>
                    <li><CheckIcon /> Topic outlines with clickable transcript timestamps</li>
                    <li><CheckIcon /> 99.8% semantic accuracy powered by multi-agent LLM inference</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => navigate('/ai-notes')}
                  >
                    <span>Explore AI Summaries Studio</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeFeatureTab === 'transcription' && (
                <>
                  <h3>Ultra-Low Latency Live Transcription</h3>
                  <p>
                    Follow discussions with millisecond-grade live transcription and multi-speaker separation
                    across 30+ enterprise languages.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Automated speaker diarization and voice-tagging</li>
                    <li><CheckIcon /> Industry-specific terminology and custom enterprise vocabulary</li>
                    <li><CheckIcon /> Instant searchable audio archives post-call</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => navigate('/meetings')}
                  >
                    <span>View Meeting Transcripts</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeFeatureTab === 'actionItems' && (
                <>
                  <h3>Automated Deliverable &amp; Task Assignment</h3>
                  <p>
                    Never let commitments fall through the cracks. IntellMeet detects commitments, assigns
                    deliverables to attendees, and establishes deadlines.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Automatic detection of verbs, owners, and due dates</li>
                    <li><CheckIcon /> Assignee notifications dispatched via email and Slack</li>
                    <li><CheckIcon /> Interactive checklist dashboard to track completion rates</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => navigate('/dashboard')}
                  >
                    <span>Manage Workspace Action Items</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeFeatureTab === 'collaboration' && (
                <>
                  <h3>Persistent Workspaces &amp; Team Channels</h3>
                  <p>
                    Keep momentum going before, during, and after meetings with shared team workspaces, notes,
                    and discussion threads.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Dedicated channels for ongoing projects and departments</li>
                    <li><CheckIcon /> Live collaborative agendas with simultaneous editing</li>
                    <li><CheckIcon /> Role-based access control (RBAC) and enterprise tenant isolation</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => navigate('/team')}
                  >
                    <span>Open Team Workspaces</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeFeatureTab === 'video' && (
                <>
                  <h3>Crystal-Clear 4K Video &amp; Screen Sharing</h3>
                  <p>
                    Host high-fidelity video meetings with studio-quality audio, AI background noise removal,
                    and high-frame-rate screen sharing.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Zero-latency adaptive bitrate streaming</li>
                    <li><CheckIcon /> Multi-screen presentation mode and shared virtual whiteboards</li>
                    <li><CheckIcon /> One-touch join from web and browser with zero installation</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => navigate('/meetings/new')}
                  >
                    <span>Start Video Meeting</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}

              {activeFeatureTab === 'security' && (
                <>
                  <h3>Zero-Knowledge Architecture &amp; Enterprise Compliance</h3>
                  <p>
                    Protect sensitive intellectual property with end-to-end encryption, configurable zero-data retention,
                    and client-side cryptographic guarantees.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> End-to-end 256-bit AES encryption for all multimedia streams</li>
                    <li><CheckIcon /> Zero-retention mode: raw audio purged immediately after synthesis</li>
                    <li><CheckIcon /> Customer meeting data is NEVER used for public model training</li>
                  </ul>
                  <button
                    type="button"
                    className="lp-tab-cta"
                    onClick={() => scrollToSection('security')}
                  >
                    <span>Review Security Architecture</span>
                    <ArrowRightIcon size={16} />
                  </button>
                </>
              )}
            </div>

            {/* DYNAMIC RIGHT PREVIEW SHOWCASE */}
            <div className="lp-tab-right">
              {/* Showcase 1: AI Summaries */}
              {activeFeatureTab === 'summaries' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <SparkleIcon size={15} style={{ color: 'var(--im-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Executive Summary Brief</span>
                    </div>
                    <span className="lp-dynamic-badge">AI Synthesized &bull; 99.8%</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div className="lp-brief-card">
                      <div className="lp-brief-title">
                        <CheckCircleIcon size={16} style={{ color: 'var(--im-success)' }} />
                        <span>Core Synthesis — Q4 Cloud Migration Sync</span>
                      </div>
                      <p className="lp-brief-snippet">
                        Architecture team ratified the multi-region VPC deployment strategy. Primary compute cluster
                        latency targeted below 18ms across all enterprise endpoints.
                      </p>
                      <div className="lp-brief-tags">
                        <span className="lp-brief-tag">Decisions (3)</span>
                        <span className="lp-brief-tag">Action Items (4)</span>
                        <span className="lp-brief-tag">Sentiment: High Alignment</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.45)', borderRadius: 10, padding: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Clickable Timestamps</span>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                          04:12 Latency Review
                        </span>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                          18:45 Budget Clearance
                        </span>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                          31:20 Security Sign-off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Showcase 2: Live Transcription */}
              {activeFeatureTab === 'transcription' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <div className="lp-waveform-bars" aria-hidden="true">
                        <span className="lp-waveform-bar" />
                        <span className="lp-waveform-bar" />
                        <span className="lp-waveform-bar" />
                        <span className="lp-waveform-bar" />
                        <span className="lp-waveform-bar" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Live Speaker Diarization</span>
                    </div>
                    <span className="lp-dynamic-badge">Latency: 94ms &bull; 30+ Languages</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Filter transcript keywords..."
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 8,
                          padding: '8px 12px 8px 32px',
                          color: '#ffffff',
                          fontSize: 12,
                        }}
                      />
                      <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                    </div>

                    <div className="lp-transcript-stream">
                      <div className="lp-transcript-bubble">
                        <div className="lp-transcript-speaker">
                          <span>Elena Rostova (Host)</span>
                          <span style={{ color: '#94a3b8' }}>00:14:02</span>
                        </div>
                        <p style={{ margin: 0 }}>
                          &ldquo;Our primary priority is validating the APAC cloud migration timeline without customer downtime.&rdquo;
                        </p>
                      </div>

                      <div className="lp-transcript-bubble" style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                        <div className="lp-transcript-speaker">
                          <span>Dr. Marcus Vance (VP Infrastructure)</span>
                          <span style={{ color: '#94a3b8' }}>00:14:26</span>
                        </div>
                        <p style={{ margin: 0 }}>
                          &ldquo;Benchmark tests confirmed average latency under 18ms across all three primary regions.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Showcase 3: Automatic Action Items */}
              {activeFeatureTab === 'actionItems' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <CheckCircleIcon size={15} style={{ color: 'var(--im-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Interactive Deliverable Tracker</span>
                    </div>
                    <span className="lp-dynamic-badge">Click to toggle demo state</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div className="lp-action-checklist">
                      {demoActionItems.map((item) => (
                        <div
                          key={item.id}
                          className={`lp-action-item-row ${item.completed ? 'completed' : ''}`}
                          onClick={() => toggleActionItem(item.id)}
                          role="checkbox"
                          aria-checked={item.completed}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleActionItem(item.id);
                            }
                          }}
                        >
                          <div className={`lp-action-check-box ${item.completed ? 'checked' : ''}`}>
                            {item.completed && <CheckIcon size={12} style={{ color: '#ffffff' }} />}
                          </div>
                          <div className="lp-action-item-details">
                            <div className="lp-action-item-text">{item.text}</div>
                            <div className="lp-action-meta">
                              <span>👤 {item.owner}</span>
                              <span>📅 {item.due}</span>
                              <span
                                className={`lp-action-priority ${
                                  item.priority === 'urgent'
                                    ? 'lp-priority-urgent'
                                    : item.priority === 'high'
                                    ? 'lp-priority-high'
                                    : 'lp-priority-med'
                                }`}
                              >
                                {item.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                        ✓ Jira Sync Active
                      </span>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                        ✓ Slack Dispatched
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Showcase 4: Team Workspaces */}
              {activeFeatureTab === 'collaboration' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <UsersIcon size={15} style={{ color: 'var(--im-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Enterprise Team Channels</span>
                    </div>
                    <span className="lp-dynamic-badge">8 Members Active</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div className="lp-workspace-channels">
                      <button
                        type="button"
                        className={`lp-channel-chip ${activeChannel === 'exec' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('exec')}
                      >
                        <span># 01-executive-sync</span>
                        <span style={{ fontSize: 11, color: '#38bdf8' }}>Active Now</span>
                      </button>
                      <button
                        type="button"
                        className={`lp-channel-chip ${activeChannel === 'arch' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('arch')}
                      >
                        <span># 02-cloud-architecture</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>14 notes</span>
                      </button>
                      <button
                        type="button"
                        className={`lp-channel-chip ${activeChannel === 'q4' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('q4')}
                      >
                        <span># 03-q4-product-strategy</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>9 notes</span>
                      </button>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10, padding: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
                        Shared Collaborative Agenda
                      </span>
                      <p style={{ fontSize: 12.5, color: '#e2e8f0', margin: '6px 0 0', lineHeight: 1.5 }}>
                        &bull; Review regional infrastructure budget allocations<br />
                        &bull; Approve zero-retention security protocols<br />
                        &bull; Assign rollout leads for APAC datacenter deployment
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Showcase 5: Video & Screen Sharing */}
              {activeFeatureTab === 'video' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <VideoIcon size={15} style={{ color: 'var(--im-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Studio Video Grid Preview</span>
                    </div>
                    <span className="lp-dynamic-badge">4K UHD &bull; 60 FPS</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div className="lp-video-preview-stage">
                      <div className="lp-video-screen-banner">
                        <span style={{ display: 'block', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                          📊 Elena Rostova is sharing screen
                        </span>
                        <span>APAC Cloud Architecture &bull; Low-Latency Redundancy Topology</span>
                      </div>
                      <div className="lp-video-indicators">
                        <span>🎙️ AI Noise Cancellation: Active</span>
                        <span>📶 Latency: 12ms</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: 8 }}>
                      <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 11, color: '#cbd5e1' }}>
                        ER (Host)
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 11, color: '#cbd5e1' }}>
                        MV
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 11, color: '#cbd5e1' }}>
                        SC
                      </div>
                      <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 11, color: '#cbd5e1' }}>
                        DK
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Showcase 6: Enterprise Security */}
              {activeFeatureTab === 'security' && (
                <div className="lp-dynamic-showcase">
                  <div className="lp-dynamic-topbar">
                    <div className="lp-dynamic-topbar-left">
                      <ShieldCheckIcon size={15} style={{ color: 'var(--im-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Security &amp; Encryption Console</span>
                    </div>
                    <span className="lp-dynamic-badge">Enterprise Isolation Verified</span>
                  </div>
                  <div className="lp-dynamic-body">
                    <div className="lp-sec-grid">
                      <div className="lp-sec-stat">
                        <div className="lp-sec-stat-val">256-bit</div>
                        <div className="lp-sec-stat-lbl">End-to-End AES Encryption</div>
                      </div>
                      <div className="lp-sec-stat">
                        <div className="lp-sec-stat-val">0 Days</div>
                        <div className="lp-sec-stat-lbl">Raw Audio Retention Mode</div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: 10,
                        padding: 14,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 12.5, color: '#ffffff', display: 'block' }}>Zero-Retention Audio Policy</strong>
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Purge audio buffer immediately following AI synthesis</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setZeroRetentionActive(!zeroRetentionActive)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 999,
                          border: 'none',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: zeroRetentionActive ? 'var(--im-success)' : '#475569',
                          color: '#ffffff',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {zeroRetentionActive ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>

                    <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>
                      🔒 Zero-Knowledge Guarantee: IntellMeet architecture ensures customer meeting transcripts are strictly isolated and never utilized for model fine-tuning.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. How IntellMeet Works / AI Intelligence Section */}
      <section className="lp-ai-spotlight-section" id="ai-intelligence">
        <div className="lp-section-container">
          <div className="lp-spotlight-header">
            <div className="lp-spotlight-pill">
              <BrainIcon />
              <span>HOW INTELLMEET WORKS</span>
            </div>
            <h2 className="lp-spotlight-title">AI-Powered Productivity at Every Step</h2>
            <p className="lp-spotlight-subtitle">
              From the moment you start your call to the post-meeting execution phase, our intelligent agents
              streamline every workflow.
            </p>
          </div>

          <div className="lp-spotlight-triplet">
            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">STEP 1 &bull; INGESTION</div>
              <h3>Connect &amp; Stream</h3>
              <p>
                One-click join from Web with zero software installation required. Crystal-clear
                real-time streaming with intelligent audio capture.
              </p>
              <Link to="/meetings/join" className="lp-triplet-link">
                Learn about joining &rarr;
              </Link>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">STEP 2 &bull; SYNTHESIS</div>
              <h3>Autonomous Understanding</h3>
              <p>
                Our multi-modal language models distinguish speakers, extract debate nuances, pinpoint
                consensus, and log key decisions in real time.
              </p>
              <Link to="/ai-notes" className="lp-triplet-link">
                Explore AI synthesis &rarr;
              </Link>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">STEP 3 &bull; EXECUTION</div>
              <h3>Instant Workflow Dispatch</h3>
              <p>
                Meeting minutes, action items, and follow-ups are automatically structured and ready to export
                into your team&apos;s productivity channels.
              </p>
              <Link to="/dashboard" className="lp-triplet-link">
                View workflow portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Security Section */}
      <section className="lp-stories-section" id="security">
        <div className="lp-section-container">
          <div className="lp-stories-header">
            <span className="lp-kicker">
              SECURITY &amp; PRIVACY
            </span>
            <h2 className="lp-stories-title">
              Built for the Most Demanding Enterprise Standards
            </h2>
          </div>

          <div className="lp-stories-card-main">
            <div className="lp-story-content">
              <span className="lp-story-badge" style={{ background: '#1e1b4b', color: '#a5b4fc', border: '1px solid #3730a3', borderRadius: 999, padding: '3px 10px' }}>
                ZERO-KNOWLEDGE ARCHITECTURE
              </span>
              <h3 className="lp-story-headline">
                &ldquo;Your conversations belong to you. We never train public AI models on private customer data.&rdquo;
              </h3>
              <p className="lp-story-quote">
                IntellMeet applies end-to-end 256-bit AES encryption across all video and audio packets.
                Enterprises can enable automated zero-retention rules so raw recordings are discarded
                the moment summaries are validated.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.25)', color: '#c7d2fe', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                  ✓ 256-Bit AES End-to-End Encryption
                </span>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.25)', color: '#c7d2fe', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                  ✓ Zero-Data Retention Architecture
                </span>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.25)', color: '#c7d2fe', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                  ✓ Secure JWT Client Token Storage
                </span>
              </div>
            </div>

            <div className="lp-story-stats-side">
              <div className="lp-story-stat-card">
                <span className="stat-big">256-bit</span>
                <span className="stat-sub">AES encryption at rest &amp; transit</span>
              </div>
              <div className="lp-story-stat-card">
                <span className="stat-big">0 Days</span>
                <span className="stat-sub">Configurable raw audio retention</span>
              </div>
              <div className="lp-story-stat-card">
                <span className="stat-big">100%</span>
                <span className="stat-sub">Private workspace tenant isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials / About Section */}
      <section className="lp-ratings-section" id="about">
        <div className="lp-section-container">
          <div className="lp-tabs-header">
            <span className="lp-kicker">ENTERPRISE SHOWCASE &bull; CASE STUDIES</span>
            <h2 className="lp-tabs-title">Loved by High-Velocity Engineering &amp; Product Teams</h2>
          </div>

          <div className="lp-ratings-grid">
            <div className="lp-rating-card">
              <div className="lp-stars" aria-label="5 out of 5 stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p>
                &ldquo;IntellMeet reduced our executive team&apos;s meeting overhead by 40% in our very first month.
                Decisions are documented immediately without taking someone away from the conversation.&rdquo;
              </p>
              <div className="lp-rating-source">
                Chief Technology Officer
              </div>
              <div style={{ fontSize: '12px', color: 'var(--im-text-muted)' }}>Global Cloud Systems (Enterprise Demo Case)</div>
            </div>

            <div className="lp-rating-card">
              <div className="lp-stars" aria-label="5 out of 5 stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p>
                &ldquo;The autonomous action item tracking alone pays for itself. Nobody forgets deliverables,
                and our sprint syncs take half the time because consensus is pinned in real time.&rdquo;
              </p>
              <div className="lp-rating-source">
                VP of Product Operations
              </div>
              <div style={{ fontSize: '12px', color: 'var(--im-text-muted)' }}>Nexus BioTech (Enterprise Demo Case)</div>
            </div>

            <div className="lp-rating-card">
              <div className="lp-stars" aria-label="5 out of 5 stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p>
                &ldquo;Zero-Knowledge privacy was our primary requirement. IntellMeet is the only platform our
                information security officer cleared for global engineering deployment.&rdquo;
              </p>
              <div className="lp-rating-source">
                Head of Information Security
              </div>
              <div style={{ fontSize: '12px', color: 'var(--im-text-muted)' }}>FinTech Prime (Enterprise Demo Case)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final Call-to-Action Section */}
      <section className="lp-cta-banner-section">
        <div className="lp-section-container">
          <div className="lp-cta-box">
            <h2 className="lp-cta-title">Ready to Meet Smarter and Work Better?</h2>
            <p className="lp-cta-subtitle">
              Join forward-thinking enterprise teams using autonomous AI intelligence to turn every meeting into clear decisions.
            </p>
            <div className="lp-cta-btn-group">
              <Link to="/signup" className="lp-btn-cta-primary" id="lp-bottom-signup">
                <span>Get Started Free</span>
                <ArrowRightIcon />
              </Link>
              <Link to="/login" className="lp-btn-cta-secondary" id="lp-bottom-signin">
                <span>Sign In to Workspace</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Enterprise Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand-col">
              <div className="lp-brand-logo footer-logo">
                <div className="lp-brand-icon">
                  <BrandIcon size={32} />
                </div>
                <div className="lp-brand-text-block">
                  <span className="lp-brand-name">
                    <span className="lp-brand-intell" style={{ color: '#ffffff' }}>Intell</span>
                    <span className="lp-brand-meet">Meet</span>
                  </span>
                  <span className="lp-brand-tagline">MEET SMARTER WITH AI</span>
                </div>
              </div>
              <p className="lp-footer-mission">
                The AI-first meeting and collaboration platform for modern distributed enterprises.
              </p>
              <div className="lp-footer-badges">
                <span className="lp-fbadge">256-Bit End-to-End Encryption</span>
                <span className="lp-fbadge">Zero-Knowledge Data Processing</span>
              </div>
            </div>

            <div className="lp-footer-links-grid">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <button
                  type="button"
                  className="lp-footer-link-btn"
                  onClick={() => selectTabAndScroll('summaries')}
                >
                  AI Summaries
                </button>
                <button
                  type="button"
                  className="lp-footer-link-btn"
                  onClick={() => selectTabAndScroll('transcription')}
                >
                  Live Transcription
                </button>
                <button
                  type="button"
                  className="lp-footer-link-btn"
                  onClick={() => selectTabAndScroll('actionItems')}
                >
                  Action Items
                </button>
                <button
                  type="button"
                  className="lp-footer-link-btn"
                  onClick={() => selectTabAndScroll('video')}
                >
                  Video Meetings
                </button>
              </div>

              <div className="lp-footer-col">
                <h4>Solutions</h4>
                <Link to="/signup">Enterprise Teams</Link>
                <Link to="/signup">Product &amp; Engineering</Link>
                <Link to="/signup">Financial Services</Link>
                <Link to="/signup">Customer Support</Link>
              </div>

              <div className="lp-footer-col">
                <h4>Account</h4>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Create Account</Link>
                <Link to="/forgot-password">Reset Password</Link>
                <Link to="/dashboard">Workspace Portal</Link>
              </div>

              <div className="lp-footer-col">
                <h4>Legal &amp; Privacy</h4>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div className="lp-footer-copy">
              &copy; {new Date().getFullYear()} IntellMeet AI Inc. All rights reserved.
            </div>
            <div className="lp-footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
