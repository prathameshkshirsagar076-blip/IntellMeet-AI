import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BrandIcon,
  SparkleIcon,
  CheckIcon,
  ArrowRightIcon,
  BrainIcon,
} from '../components/icons';
import '../components/LandingPage.css';

/* Local helper icons for landing showcase */
const MicLiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StarFilledIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'summaries' | 'transcription' | 'actionItems' | 'collaboration' | 'video' | 'security'>('summaries');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root">
      {/* 1. Announcement Bar */}
      {!bannerDismissed && (
        <div className="lp-announcement-bar" role="banner">
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
        </div>
      )}

      {/* 2. Sticky Header Navbar */}
      <header className="lp-navbar">
        <div className="lp-nav-container">
          <div className="lp-nav-left">
            <Link to="/" className="lp-brand-logo" title="IntellMeet AI Platform">
              <div className="lp-brand-icon" aria-hidden="true">
                <BrandIcon />
              </div>
              <span className="lp-brand-name">IntellMeet</span>
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
            <Link to="/login" className="lp-btn-ghost lp-signin-btn" id="lp-nav-signin">
              Sign In
            </Link>
            <Link to="/signup" className="lp-btn-primary lp-signup-btn" id="lp-nav-signup">
              Get Started
            </Link>
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

            <p className="lp-hero-subtext">
              Transform discussions into decisions. IntellMeet unites crystal-clear video conferencing,
              autonomous real-time transcription, executive summaries, and automatic action items
              into one seamless enterprise platform.
            </p>

            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-hero-btn-primary" id="lp-hero-signup">
                <span>Get Started</span>
                <ArrowRightIcon />
              </Link>
              <Link to="/login" className="lp-hero-btn-outline" id="lp-hero-signin">
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Visual Preview of IntellMeet Dashboard / AI Meeting Workspace */}
          <div className="lp-meeting-mockup-frame">
            <div className="lp-mockup-window-bar">
              <div className="lp-window-dots" aria-hidden="true">
                <span className="dot-red" />
                <span className="dot-yellow" />
                <span className="dot-green" />
              </div>
              <div className="lp-window-title">
                IntellMeet Enterprise Workspace &bull; Live Meeting Synthesis
              </div>
              <span className="lp-window-live-badge">&bull; 00:34:18 Live</span>
            </div>

            <div className="lp-mockup-body">
              {/* Virtual Video Tiles */}
              <div className="lp-mockup-video-stage">
                <div className="lp-participant-tile tile-1">
                  <div className="lp-avatar-initials">ER</div>
                  <span className="lp-participant-name">Elena Rostova (Host)</span>
                  <div className="lp-tile-speaking-badge">
                    <MicLiveIcon /> Speaking
                  </div>
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

              {/* Docked AI Companion Panel */}
              <div className="lp-mockup-ai-panel">
                <div className="lp-ai-panel-header">
                  <div className="lp-ai-panel-title">
                    <SparkleIcon />
                    <span>AI Companion Live</span>
                  </div>
                  <span className="lp-ai-badge">Autonomous</span>
                </div>

                <div className="lp-ai-panel-content">
                  <div className="lp-ai-section-item">
                    <h4>Executive Summary</h4>
                    <p>
                      APAC cloud infrastructure migration timeline advanced to Q4. Latency reduced below
                      18ms across primary enterprise clusters.
                    </p>
                  </div>

                  <div className="lp-ai-section-item">
                    <h4>Key Strategic Decisions</h4>
                    <ul className="lp-ai-check-list">
                      <li>
                        <CheckIcon /> Approved budget for multi-region redundancy
                      </li>
                      <li>
                        <CheckIcon /> Adopted Zero-Knowledge audio processing
                      </li>
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
            >
              AI Summaries
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'transcription' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('transcription')}
            >
              Live Transcription
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'actionItems' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('actionItems')}
            >
              Automatic Action Items
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'collaboration' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('collaboration')}
            >
              Team Workspaces
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('video')}
            >
              Video &amp; Screen Sharing
            </button>
            <button
              type="button"
              className={`lp-tab-btn ${activeFeatureTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('security')}
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
                    <li><CheckIcon /> 99.8% semantic accuracy powered by advanced LLM inference</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    Explore AI Summaries &rarr;
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
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    Experience Live Transcription &rarr;
                  </button>
                </>
              )}

              {activeFeatureTab === 'actionItems' && (
                <>
                  <h3>Automated Deliverable &amp; Task Assignment</h3>
                  <p>
                    Never let commitments fall through the cracks. IntellMeet detects action verbs, assigns
                    deliverables to attendees, and establishes deadlines.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Automatic synchronization with Jira, Asana, and Linear</li>
                    <li><CheckIcon /> Assignee notifications dispatched via email and Slack</li>
                    <li><CheckIcon /> Interactive checklist dashboard to track completion rates</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    See Action Items in Action &rarr;
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
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    Explore Workspaces &rarr;
                  </button>
                </>
              )}

              {activeFeatureTab === 'video' && (
                <>
                  <h3>Crystal-Clear 4K Video &amp; Screen Sharing</h3>
                  <p>
                    Host up to 1,000 video participants with studio-quality audio, AI background noise removal,
                    and high-frame-rate screen sharing.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> Zero-latency adaptive bitrate streaming</li>
                    <li><CheckIcon /> Multi-screen presentation mode and shared virtual whiteboards</li>
                    <li><CheckIcon /> One-touch join from web, mobile, and boardroom hardware</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    Test Video Conferencing &rarr;
                  </button>
                </>
              )}

              {activeFeatureTab === 'security' && (
                <>
                  <h3>Zero-Knowledge Architecture &amp; Compliance</h3>
                  <p>
                    Protect sensitive intellectual property with military-grade encryption, SOC-2 Type II
                    certification, and zero-retention audio policies.
                  </p>
                  <ul className="lp-tab-features-list">
                    <li><CheckIcon /> End-to-end 256-bit AES encryption for all multimedia streams</li>
                    <li><CheckIcon /> Zero-retention mode: raw audio purged immediately after synthesis</li>
                    <li><CheckIcon /> Customer meeting data is NEVER used for public model training</li>
                  </ul>
                  <button type="button" className="lp-tab-cta" onClick={() => navigate('/signup')}>
                    Review Security Standard &rarr;
                  </button>
                </>
              )}
            </div>

            <div className="lp-tab-right">
              <div className="lp-tab-preview-card">
                <div className="lp-preview-topbar">
                  <div className="lp-preview-dot-group" aria-hidden="true">
                    <span /> <span /> <span />
                  </div>
                  <span className="lp-preview-title">IntellMeet AI Engine</span>
                </div>
                <div className="lp-preview-inner">
                  <div className="lp-preview-search">
                    <SparkleIcon />
                    <span>Search meetings, decisions, or follow-ups...</span>
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
                      <span className="lp-act-badge">PROCESSED</span>
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
                One-click join from Google Meet, Microsoft Teams, Zoom, or IntellMeet Web. Crystal-clear
                real-time streaming with zero software installation required.
              </p>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">STEP 2 &bull; SYNTHESIS</div>
              <h3>Autonomous Understanding</h3>
              <p>
                Our multi-modal language models distinguish speakers, extract debate nuances, pinpoint
                consensus, and log key decisions in real time.
              </p>
            </div>

            <div className="lp-triplet-card">
              <div className="lp-triplet-badge">STEP 3 &bull; EXECUTION</div>
              <h3>Instant Workflow Dispatch</h3>
              <p>
                Meeting minutes, action items, and follow-up emails are automatically drafted and pushed into
                your team&apos;s project management tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Security Section */}
      <section className="lp-stories-section" id="security" style={{ background: '#0a0d1f', color: '#ffffff' }}>
        <div className="lp-section-container">
          <div className="lp-stories-header">
            <span className="lp-kicker" style={{ color: '#818cf8' }}>
              SECURITY &amp; PRIVACY
            </span>
            <h2 className="lp-stories-title" style={{ color: '#ffffff' }}>
              Built for the Most Demanding Enterprise Standards
            </h2>
          </div>

          <div className="lp-stories-card-main" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="lp-story-content">
              <span className="lp-story-badge" style={{ background: '#1e1b4b', color: '#a5b4fc', border: '1px solid #3730a3' }}>
                ZERO-KNOWLEDGE ARCHITECTURE
              </span>
              <h3 className="lp-story-headline" style={{ color: '#ffffff' }}>
                &ldquo;Your conversations belong to you. We never train public AI models on private customer data.&rdquo;
              </h3>
              <p className="lp-story-quote" style={{ color: '#94a3b8' }}>
                IntellMeet applies end-to-end 256-bit AES encryption across all video and audio packets.
                Enterprises can enable automated zero-retention rules so raw recordings are discarded
                the moment summaries are validated.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe' }}>
                  ✓ SOC-2 Type II Certified
                </span>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe' }}>
                  ✓ GDPR &amp; HIPAA Compliant
                </span>
                <span className="im-tag-pill" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe' }}>
                  ✓ Zero-Data Retention Available
                </span>
              </div>
            </div>

            <div className="lp-story-stats-side">
              <div className="lp-story-stat-card" style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="stat-big" style={{ color: '#818cf8' }}>256-bit</span>
                <span className="stat-sub" style={{ color: '#94a3b8' }}>AES encryption at rest &amp; transit</span>
              </div>
              <div className="lp-story-stat-card" style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="stat-big" style={{ color: '#818cf8' }}>99.99%</span>
                <span className="stat-sub" style={{ color: '#94a3b8' }}>Global uptime SLA</span>
              </div>
              <div className="lp-story-stat-card" style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="stat-big" style={{ color: '#818cf8' }}>0 Days</span>
                <span className="stat-sub" style={{ color: '#94a3b8' }}>Optional raw audio retention</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials / About Section */}
      <section className="lp-ratings-section" id="about">
        <div className="lp-section-container">
          <div className="lp-tabs-header">
            <span className="lp-kicker">CUSTOMER PROOF (DEMO SHOWCASE)</span>
            <h2 className="lp-tabs-title">Loved by High-Velocity Engineering &amp; Product Teams</h2>
          </div>

          <div className="lp-ratings-grid">
            <div className="lp-rating-card">
              <div className="lp-stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p style={{ marginTop: '12px', fontSize: '13.5px', lineHeight: '1.6', color: '#334155' }}>
                &ldquo;IntellMeet reduced our executive team&apos;s meeting overhead by 40% in our very first month.
                Decisions are documented immediately.&rdquo;
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Chief Technology Officer
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Global Cloud Systems (Sample Enterprise)</div>
            </div>

            <div className="lp-rating-card">
              <div className="lp-stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p style={{ marginTop: '12px', fontSize: '13.5px', lineHeight: '1.6', color: '#334155' }}>
                &ldquo;The autonomous action item tracking alone pays for itself. Nobody forgets deliverables,
                and our sprint syncs take half the time.&rdquo;
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                VP of Product Operations
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Nexus BioTech (Sample Enterprise)</div>
            </div>

            <div className="lp-rating-card">
              <div className="lp-stars">
                <StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon /><StarFilledIcon />
              </div>
              <p style={{ marginTop: '12px', fontSize: '13.5px', lineHeight: '1.6', color: '#334155' }}>
                &ldquo;Zero-Knowledge privacy was our primary requirement. IntellMeet is the only platform our
                compliance officer cleared for global deployment.&rdquo;
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                Head of Information Security
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>FinTech Prime (Sample Enterprise)</div>
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
                  <BrandIcon />
                </div>
                <span className="lp-brand-name">IntellMeet</span>
              </div>
              <p className="lp-footer-mission">
                The AI-first meeting and collaboration platform for modern distributed enterprises.
              </p>
              <div className="lp-footer-badges">
                <span className="lp-fbadge">SOC-2 Type II Certified</span>
                <span className="lp-fbadge">GDPR &amp; HIPAA Compliant</span>
              </div>
            </div>

            <div className="lp-footer-links-grid">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <button type="button" className="lp-footer-link-btn" onClick={() => scrollToSection('features')}>
                  AI Summaries
                </button>
                <button type="button" className="lp-footer-link-btn" onClick={() => scrollToSection('features')}>
                  Live Transcription
                </button>
                <button type="button" className="lp-footer-link-btn" onClick={() => scrollToSection('features')}>
                  Action Items
                </button>
                <button type="button" className="lp-footer-link-btn" onClick={() => scrollToSection('features')}>
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
