import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';

/* ---- SVG Icons ---- */
const BrandLogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
  </svg>
);

const NotesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const RoomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ShieldLockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

interface LandingPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToSignUp?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToSignUp }) => {
  const navigate = useNavigate();
  const handleLogin = onNavigateToLogin || (() => navigate('/login'));
  const handleSignUp = onNavigateToSignUp || (() => navigate('/signup'));
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<'meetings' | 'chat' | 'notes' | 'ai' | 'security'>('meetings');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const heroCards = [
    {
      id: 'ai-meetings',
      tag: 'AI MEETINGS',
      title: 'Real-Time Video & Audio',
      desc: 'Crystal-clear 4K video with zero latency and automatic meeting synthesis.',
      color: 'blue',
      icon: <VideoIcon />,
    },
    {
      id: 'team-chat',
      tag: 'TEAM CHAT',
      title: 'Persistent Collaboration',
      desc: 'Connected team channels, file sharing, and AI thread summaries.',
      color: 'purple',
      icon: <ChatIcon />,
    },
    {
      id: 'ai-companion',
      tag: 'AI COMPANION',
      title: 'Autonomous Synthesis',
      desc: 'Instant action items, executive briefs, and real-time meeting coaching.',
      color: 'indigo',
      icon: <BrainIcon />,
    },
    {
      id: 'smart-notes',
      tag: 'SMART DOCS',
      title: 'Live Shared Workspaces',
      desc: 'Collaborative note-taking with automatic agenda and decision tracking.',
      color: 'emerald',
      icon: <NotesIcon />,
    },
    {
      id: 'spaces',
      tag: 'ROOMS & SPACES',
      title: 'Hybrid Conference Sync',
      desc: 'Seamless one-touch join for boardrooms, meeting pods, and remote hubs.',
      color: 'cyan',
      icon: <RoomIcon />,
    },
  ];

  const handleNextCard = () => {
    setCarouselIndex((prev) => (prev + 1) % heroCards.length);
  };

  const handlePrevCard = () => {
    setCarouselIndex((prev) => (prev - 1 + heroCards.length) % heroCards.length);
  };

  return (
    <div className="landing-page-root">
      {/* 1. Top Announcement Banner */}
      {!bannerDismissed && (
        <div className="lp-announcement-bar">
          <div className="lp-announcement-content">
            <span className="lp-badge-pill">NEW RELEASE</span>
            <span>IntellMeet AI Companion 2.0 is now live for enterprise teams</span>
            <button 
              type="button" 
              className="lp-announcement-link" 
              onClick={handleSignUp}
            >
              Start Free Trial &rarr;
            </button>
          </div>
          <button 
            type="button" 
            className="lp-announcement-close" 
            onClick={() => setBannerDismissed(true)} 
            aria-label="Dismiss banner"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Global Sticky Header */}
      <header className="lp-navbar">
        <div className="lp-nav-container">
          <div className="lp-nav-left">
            <div className="lp-brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="lp-brand-icon">
                <BrandLogoIcon />
              </div>
              <span className="lp-brand-name">IntellMeet</span>
            </div>

            <nav className="lp-nav-menu" aria-label="Main Navigation">
              <a href="#products" className="lp-nav-item">Products</a>
              <a href="#ai-companion" className="lp-nav-item">AI Companion</a>
              <a href="#solutions" className="lp-nav-item">Solutions</a>
              <a href="#pricing" className="lp-nav-item">Plans &amp; Pricing</a>
              <a href="#resources" className="lp-nav-item">Resources</a>
            </nav>
          </div>

          <div className="lp-nav-right">
            <button 
              type="button" 
              className="lp-btn-ghost lp-sales-btn" 
              onClick={handleLogin}
            >
              Contact Sales
            </button>
            <button 
              type="button" 
              className="lp-btn-ghost lp-signin-btn" 
              onClick={handleLogin}
              id="lp-nav-signin"
            >
              Sign In
            </button>
            <button 
              type="button" 
              className="lp-btn-primary lp-signup-btn" 
              onClick={handleSignUp}
              id="lp-nav-signup"
            >
              Sign Up Free
            </button>
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
              <span>THE AI-FIRST WORKSPACE PLATFORM</span>
            </div>

            <h1 className="lp-hero-heading">
              Find out what's possible<br />when work connects
            </h1>

            <p className="lp-hero-subtext">
              Transform discussions into decisions. IntellMeet unites smart video meetings,
              autonomous AI synthesis, team chat, and collaborative spaces in one intelligent platform.
            </p>

            <div className="lp-hero-actions">
              <button 
                type="button" 
                className="lp-hero-btn-primary" 
                onClick={handleSignUp}
                id="lp-hero-signup"
              >
                Sign Up Free
                <ArrowRightIcon />
              </button>
              <button 
                type="button" 
                className="lp-hero-btn-outline" 
                onClick={handleLogin}
                id="lp-hero-demo"
              >
                Request a Demo
              </button>
            </div>
          </div>

          {/* Hero Feature Cards Carousel */}
          <div className="lp-hero-carousel-wrap">
            <div className="lp-hero-carousel-header">
              <span className="lp-carousel-title">Explore the IntellMeet Platform</span>
              <div className="lp-carousel-nav">
                <button type="button" onClick={handlePrevCard} aria-label="Previous card">
                  <ChevronLeftIcon />
                </button>
                <button type="button" onClick={handleNextCard} aria-label="Next card">
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            <div className="lp-hero-cards-grid">
              {heroCards.map((card, idx) => (
                <div 
                  key={card.id} 
                  className={`lp-hero-card lp-card-${card.color} ${idx === carouselIndex ? 'active' : ''}`}
                  onClick={() => setCarouselIndex(idx)}
                >
                  <div className="lp-card-top">
                    <span className="lp-card-tag">{card.tag}</span>
                    <div className="lp-card-icon">{card.icon}</div>
                  </div>
                  <h3 className="lp-card-title">{card.title}</h3>
                  <p className="lp-card-desc">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="lp-carousel-dots">
              {heroCards.map((_, i) => (
                <span 
                  key={i} 
                  className={`lp-dot ${i === carouselIndex ? 'active' : ''}`} 
                  onClick={() => setCarouselIndex(i)} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI Companion Spotlight ("Your new AI teammate") */}
      <section className="lp-ai-spotlight-section" id="ai-companion">
        <div className="lp-section-container">
          <div className="lp-spotlight-header">
            <div className="lp-spotlight-pill">
              <SparkleIcon />
              <span>IntellMeet AI Companion</span>
            </div>
            <h2 className="lp-spotlight-title">Your new AI teammate</h2>
            <p className="lp-spotlight-subtitle">
              Included at no extra cost with paid plans. Summarizes meetings in real time, generates action items,
              and composes emails so you can stay fully present.
            </p>
            <button 
              type="button" 
              className="lp-spotlight-cta" 
              onClick={handleSignUp}
            >
              Explore AI Companion &rarr;
            </button>
          </div>

          {/* Realistic Virtual Meeting Mockup with docked AI Side Panel */}
          <div className="lp-meeting-mockup-frame">
            <div className="lp-mockup-window-bar">
              <div className="lp-window-dots">
                <span className="dot-red" />
                <span className="dot-yellow" />
                <span className="dot-green" />
              </div>
              <div className="lp-window-title">
                IntellMeet Meeting &bull; Global Product Strategy &amp; AI Roadmap Sync
              </div>
              <span className="lp-window-live-badge">&bull; 00:34:18 Live</span>
            </div>

            <div className="lp-mockup-body">
              {/* Virtual Video Tiles Grid */}
              <div className="lp-mockup-video-stage">
                <div className="lp-participant-tile tile-1">
                  <div className="lp-avatar-initials">ER</div>
                  <span className="lp-participant-name">Elena Rostova (Host)</span>
                  <div className="lp-tile-speaking-badge"><MicIcon /> Speaking</div>
                </div>

                <div className="lp-participant-tile tile-2">
                  <div className="lp-avatar-initials">MV</div>
                  <span className="lp-participant-name">Dr. Marcus Vance</span>
                </div>

                <div className="lp-participant-tile tile-3">
                  <div className="lp-avatar-initials">SC</div>
                  <span className="lp-participant-name">Sarah Chen</span>
                </div>

                <div className="lp-participant-tile tile-4">
                  <div className="lp-avatar-initials">DK</div>
                  <span className="lp-participant-name">David Kim</span>
                </div>
              </div>

              {/* Docked Real-Time AI Notes Side Panel */}
              <div className="lp-mockup-ai-panel">
                <div className="lp-ai-panel-header">
                  <div className="lp-ai-panel-title">
                    <SparkleIcon />
                    <span>AI Companion Live</span>
                  </div>
                  <span className="lp-ai-badge">Synthesizing</span>
                </div>

                <div className="lp-ai-panel-content">
                  <div className="lp-ai-section-item">
                    <h4>Executive Summary</h4>
                    <p>APAC cloud infrastructure migration timeline advanced to Q4. Latency reduced below 18ms across primary enterprise clusters.</p>
                  </div>

                  <div className="lp-ai-section-item">
                    <h4>Key Strategic Decisions</h4>
                    <ul className="lp-ai-check-list">
                      <li><CheckIcon /> Approved budget for multi-region redundancy</li>
                      <li><CheckIcon /> Adopted Zero-Knowledge audio processing</li>
                    </ul>
                  </div>

                  <div className="lp-ai-section-item">
                    <h4>Action Items Assigned</h4>
                    <div className="lp-action-card">
                      <span className="lp-action-owner">Sarah Chen</span>
                      <p>Finalize regional compliance sign-offs by Friday</p>
                    </div>
                    <div className="lp-action-card">
                      <span className="lp-action-owner">Dr. Marcus Vance</span>
                      <p>Deploy latency benchmark report to engineering channel</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Highlight Cards underneath Mockup */}
          <div className="lp-spotlight-triplet">
            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">GARTNER RECOGNIZED</div>
              <h3>Named a 2026 Leader</h3>
              <p>Ranked #1 for Vision and Execution in Enterprise Meeting and Unified Collaboration Platforms.</p>
              <a href="#gartner" onClick={(e) => { e.preventDefault(); handleSignUp(); }}>Read Report &rarr;</a>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">CUSTOMER SUCCESS</div>
              <h3>Supercharge Support Teams</h3>
              <p>Deliver faster resolutions and seamless agent intelligence with real-time meeting transcription.</p>
              <a href="#contact-center" onClick={(e) => { e.preventDefault(); handleSignUp(); }}>Learn More &rarr;</a>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GlobeIcon />
                <span>GLOBAL NETWORK</span>
              </div>
              <h3>99.99% Global Uptime</h3>
              <p>Distributed across 200+ edge locations worldwide for reliable, low-latency enterprise video.</p>
              <a href="#network" onClick={(e) => { e.preventDefault(); handleSignUp(); }}>View Infrastructure &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. One platform. Endless ways to work together. */}
      <section className="lp-tabs-section" id="products">
        <div className="lp-section-container">
          <div className="lp-tabs-header">
            <h2 className="lp-tabs-title">One platform.<br />Endless ways to work together.</h2>
            <p className="lp-tabs-desc">
              Whether meeting in boardrooms, collaborating across time zones, or working asynchronously,
              IntellMeet keeps every conversation connected and actionable.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="lp-tab-nav" role="tablist">
            <button 
              type="button" 
              className={`lp-tab-btn ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              Virtual Meetings
            </button>
            <button 
              type="button" 
              className={`lp-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Team Chat
            </button>
            <button 
              type="button" 
              className={`lp-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Smart Notes
            </button>
            <button 
              type="button" 
              className={`lp-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Companion
            </button>
            <button 
              type="button" 
              className={`lp-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Enterprise Security
            </button>
          </div>

          {/* Dynamic Tab Content */}
          <div className="lp-tab-content-box">
            <div className="lp-tab-left">
              {activeTab === 'meetings' && (
                <>
                  <h3>High-Definition Smart Meetings</h3>
                  <p>Engage participants with immersive video, intelligent background noise cancellation, and automated live transcriptions.</p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Support for up to 1,000 video participants with crystal clarity</li>
                    <li><CheckIcon /> Automated closed captions and multi-language live translation</li>
                    <li><CheckIcon /> Dynamic speaker focus and intelligent spotlight view</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={handleSignUp}>
                    Explore Virtual Meetings &rarr;
                  </button>
                </>
              )}

              {activeTab === 'chat' && (
                <>
                  <h3>Connected Enterprise Team Chat</h3>
                  <p>Keep conversations flowing effortlessly before, during, and after meetings with unified messaging channels.</p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Threaded discussions with instant AI summaries of long channels</li>
                    <li><CheckIcon /> Rich media sharing, secure document vaults, and emoji reactions</li>
                    <li><CheckIcon /> Cross-platform synchronization across mobile, desktop, and web</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={handleSignUp}>
                    Explore Team Chat &rarr;
                  </button>
                </>
              )}

              {activeTab === 'notes' && (
                <>
                  <h3>Collaborative Smart Notes &amp; Docs</h3>
                  <p>Capture ideas together in real time. Agendas, meeting minutes, and action trackers all in one live workspace.</p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Auto-generate meeting minutes from spoken conversation</li>
                    <li><CheckIcon /> Assign tasks directly with due dates and assignee notifications</li>
                    <li><CheckIcon /> Export instantly to Google Workspace, Notion, and Microsoft 365</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={handleSignUp}>
                    Explore Smart Notes &rarr;
                  </button>
                </>
              )}

              {activeTab === 'ai' && (
                <>
                  <h3>Autonomous Meeting Intelligence</h3>
                  <p>Let AI handle administrative overhead so your team can focus exclusively on strategic decision-making.</p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Ask questions mid-meeting without interrupting the speaker</li>
                    <li><CheckIcon /> Catch up on missed meeting minutes in under 30 seconds</li>
                    <li><CheckIcon /> Automated follow-up email drafts created with one click</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={handleSignUp}>
                    Learn About AI Companion &rarr;
                  </button>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', color: '#2563eb' }}>
                      <ShieldLockIcon />
                    </span>
                    <span>Zero-Knowledge Enterprise Protection</span>
                  </h3>
                  <p>Rest easy knowing your conversations are protected by military-grade encryption and zero-data retention.</p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> End-to-end 256-bit AES encryption for all audio and video streams</li>
                    <li><CheckIcon /> Zero-Knowledge audio processing—audio is discarded post-synthesis</li>
                    <li><CheckIcon /> SOC 2 Type II, HIPAA, and GDPR compliance certifications</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={handleSignUp}>
                    Explore Security Features &rarr;
                  </button>
                </>
              )}
            </div>

            <div className="lp-tab-right">
              <div className="lp-tab-preview-card">
                <div className="lp-preview-topbar">
                  <div className="lp-preview-dot-group">
                    <span /> <span /> <span />
                  </div>
                  <span className="lp-preview-title">IntellMeet Enterprise Suite</span>
                </div>
                <div className="lp-preview-inner">
                  <div className="lp-preview-search">
                    <SparkleIcon />
                    <span>Search meetings, executive summaries, or action items...</span>
                  </div>
                  <div className="lp-preview-stats-row">
                    <div className="lp-stat-box">
                      <span className="lp-stat-val">40%</span>
                      <span className="lp-stat-lbl">Time Saved</span>
                    </div>
                    <div className="lp-stat-box">
                      <span className="lp-stat-val">99.9%</span>
                      <span className="lp-stat-lbl">Accuracy</span>
                    </div>
                    <div className="lp-stat-box">
                      <span className="lp-stat-val">100%</span>
                      <span className="lp-stat-lbl">Encrypted</span>
                    </div>
                  </div>
                  <div className="lp-preview-activity">
                    <div className="lp-act-item">
                      <span className="lp-act-badge">LIVE</span>
                      <div>
                        <strong>Executive Sync Synthesized</strong>
                        <p>3 strategic decisions logged &bull; 4 follow-ups assigned</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Ratings & Social Proof Section */}
      <section className="lp-ratings-section">
        <div className="lp-section-container">
          <div className="lp-ratings-grid">
            <div className="lp-rating-card">
              <div className="lp-rating-score">4.9 / 5</div>
              <div className="lp-stars">
                <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
              </div>
              <div className="lp-rating-source">G2 Crowd Leader 2026</div>
              <p>Over 15,000 verified enterprise customer reviews</p>
            </div>

            <div className="lp-rating-card">
              <div className="lp-rating-score">4.8 / 5</div>
              <div className="lp-stars">
                <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
              </div>
              <div className="lp-rating-source">Gartner Peer Insights</div>
              <p>Customer's Choice for Enterprise Meeting Platforms</p>
            </div>

            <div className="lp-rating-card">
              <div className="lp-rating-score">9.4 / 10</div>
              <div className="lp-stars">
                <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
              </div>
              <div className="lp-rating-source">TrustRadius Top Rated</div>
              <p>Top Rated in Video Conferencing &amp; AI Productivity</p>
            </div>
          </div>

          <div className="lp-trusted-banner">
            <span>TRUSTED BY INDUSTRY LEADERS WORLDWIDE</span>
            <div className="lp-logos-row">
              <span className="lp-brand-partner">ACME Corp</span>
              <span className="lp-brand-partner">GlobalCloud</span>
              <span className="lp-brand-partner">FinTech Prime</span>
              <span className="lp-brand-partner">Nexus Bio</span>
              <span className="lp-brand-partner">Vanguard Tech</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Stories / Case Studies */}
      <section className="lp-stories-section">
        <div className="lp-section-container">
          <div className="lp-stories-header">
            <span className="lp-kicker">CUSTOMER STORIES</span>
            <h2 className="lp-stories-title">Businesses achieve more with IntellMeet</h2>
          </div>

          <div className="lp-stories-card-main">
            <div className="lp-story-content">
              <span className="lp-story-badge">FINANCIAL SERVICES</span>
              <h3 className="lp-story-headline">
                "IntellMeet reduced our executive team's meeting overhead by 40% in our very first month."
              </h3>
              <p className="lp-story-quote">
                "The autonomous synthesis feels like having an elite chief of staff in every sync.
                Decisions are documented immediately, and nobody has to spend hours compiling minutes anymore."
              </p>
              <div className="lp-story-author">
                <div className="lp-author-avatar-img">C</div>
                <div>
                  <strong>Chief Technology Officer</strong>
                  <span>Global Cloud Systems Inc.</span>
                </div>
              </div>
            </div>

            <div className="lp-story-stats-side">
              <div className="lp-story-stat-card">
                <span className="stat-big">40%</span>
                <span className="stat-sub">Reduction in meeting overhead</span>
              </div>
              <div className="lp-story-stat-card">
                <span className="stat-big">10x</span>
                <span className="stat-sub">Faster post-meeting turnaround</span>
              </div>
              <div className="lp-story-stat-card">
                <span className="stat-big">100%</span>
                <span className="stat-sub">Adoption across hybrid workforce</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Impact & Innovation Cards ("Making moves, making impact") */}
      <section className="lp-impact-section">
        <div className="lp-section-container">
          <div className="lp-impact-header">
            <span className="lp-kicker">INNOVATION &amp; IMPACT</span>
            <h2 className="lp-impact-title">Making moves, making impact</h2>
          </div>

          <div className="lp-impact-grid">
            <div className="lp-impact-card">
              <div className="lp-impact-tag">WORKPLACE RESEARCH</div>
              <h3>How Hybrid Teams Boost Focus by 3.5x</h3>
              <p>Discover how autonomous AI summaries eliminate the need for non-essential status meetings.</p>
              <button type="button" className="lp-impact-link" onClick={handleSignUp}>Read Report &rarr;</button>
            </div>

            <div className="lp-impact-card">
              <div className="lp-impact-tag">ANNUAL AWARDS</div>
              <h3>Top Enterprise AI Platform of 2026</h3>
              <p>IntellMeet celebrated for pioneering zero-knowledge privacy and seamless workflow integration.</p>
              <button type="button" className="lp-impact-link" onClick={handleSignUp}>View Award &rarr;</button>
            </div>

            <div className="lp-impact-card">
              <div className="lp-impact-tag">SECURITY BRIEF</div>
              <h3>Zero-Knowledge Architecture Standard</h3>
              <p>A deep dive into why enterprise security leaders choose our zero-data retention model.</p>
              <button type="button" className="lp-impact-link" onClick={handleSignUp}>Download Whitepaper &rarr;</button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Bottom CTA Banner */}
      <section className="lp-cta-banner-section">
        <div className="lp-section-container">
          <div className="lp-cta-box">
            <h2 className="lp-cta-title">See what IntellMeet can do for your business</h2>
            <p className="lp-cta-subtitle">
              Join thousands of organizations using intelligent collaboration to work smarter, decide faster, and achieve more.
            </p>
            <div className="lp-cta-btn-group">
              <button 
                type="button" 
                className="lp-btn-cta-primary" 
                onClick={handleSignUp}
                id="lp-bottom-signup"
              >
                Get Started Free
                <ArrowRightIcon />
              </button>
              <button 
                type="button" 
                className="lp-btn-cta-secondary" 
                onClick={handleLogin}
                id="lp-bottom-signin"
              >
                Sign In to Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Comprehensive Enterprise Dark Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand-col">
              <div className="lp-brand-logo footer-logo">
                <div className="lp-brand-icon">
                  <BrandLogoIcon />
                </div>
                <span className="lp-brand-name">IntellMeet</span>
              </div>
              <p className="lp-footer-mission">
                The next-generation AI meeting and collaboration platform for modern distributed teams.
              </p>
              <div className="lp-footer-badges">
                <span className="lp-fbadge">SOC-2 Type II Certified</span>
                <span className="lp-fbadge">GDPR &amp; HIPAA Compliant</span>
              </div>
            </div>

            <div className="lp-footer-links-grid">
              <div className="lp-footer-col">
                <h4>Products</h4>
                <a href="#meetings" onClick={(e) => { e.preventDefault(); setActiveTab('meetings'); }}>AI Meetings</a>
                <a href="#chat" onClick={(e) => { e.preventDefault(); setActiveTab('chat'); }}>Team Chat</a>
                <a href="#notes" onClick={(e) => { e.preventDefault(); setActiveTab('notes'); }}>Smart Notes</a>
                <a href="#ai" onClick={(e) => { e.preventDefault(); setActiveTab('ai'); }}>AI Companion</a>
                <a href="#spaces" onClick={(e) => { e.preventDefault(); setActiveTab('meetings'); }}>Conference Rooms</a>
              </div>

              <div className="lp-footer-col">
                <h4>Solutions</h4>
                <a href="#enterprise">Enterprise Teams</a>
                <a href="#financial">Financial Services</a>
                <a href="#healthcare">Healthcare</a>
                <a href="#education">Education</a>
                <a href="#support">Contact Centers</a>
              </div>

              <div className="lp-footer-col">
                <h4>Resources</h4>
                <a href="#blog">Product Blog</a>
                <a href="#guides">Customer Stories</a>
                <a href="#webinars">Live Webinars</a>
                <a href="#developer">Developer APIs</a>
                <a href="#status">System Status</a>
              </div>

              <div className="lp-footer-col">
                <h4>Company</h4>
                <a href="#about">About IntellMeet</a>
                <a href="#careers">Careers (We're Hiring!)</a>
                <a href="#leadership">Leadership</a>
                <a href="#press">Press &amp; Media</a>
                <a href="#contact" onClick={handleLogin}>Contact Sales</a>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div className="lp-footer-copy">
              &copy; 2026 IntellMeet AI Inc. All rights reserved.
            </div>
            <div className="lp-footer-legal">
              <Link to="/privacy">Privacy Statement</Link>
              <Link to="/terms">Terms of Service</Link>
              <a href="#trust">Trust Center</a>
              <a href="#cookies">Cookie Preferences</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
