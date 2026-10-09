import './RightPanel.css';

/* ---- SVG Icons ---- */
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
  </svg>
);

const TaskCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const ConnectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="2" />
    <rect x="14" y="2" width="8" height="8" rx="2" />
    <rect x="14" y="14" width="8" height="8" rx="2" />
    <rect x="2" y="14" width="8" height="8" rx="2" />
  </svg>
);

const RightPanel = () => {
  return (
    <div className="right-panel">
      {/* Top Section: Brand & Product Introduction */}
      <div className="rp-header">
        <div className="rp-pill-badge">
          <SparkleIcon />
          <span>Enterprise AI Meeting Intelligence</span>
        </div>

        <h1 className="rp-brand-title">IntellMeet</h1>

        <h2 className="rp-brand-tagline">
          Turn Every Meeting into Actionable Intelligence
        </h2>

        <p className="rp-brand-desc">
          IntellMeet is an AI-powered collaboration platform designed for modern enterprises.
          It automatically captures, synthesizes, and organizes discussions across your audio
          and video meetings in real time—converting hours of talk into clear decisions, key
          takeaways, and automated follow-ups.
        </p>
      </div>

      {/* Middle Section: Core Capabilities Grid */}
      <div className="rp-features-grid">
        <div className="rp-feature-card">
          <div className="rp-feature-icon rp-icon-purple">
            <BrainIcon />
          </div>
          <div className="rp-feature-content">
            <h3 className="rp-feature-heading">Autonomous Synthesis</h3>
            <p className="rp-feature-text">
              Real-time executive summaries, discussion outlines, and contextual minutes without manual note-taking.
            </p>
          </div>
        </div>

        <div className="rp-feature-card">
          <div className="rp-feature-icon rp-icon-emerald">
            <TaskCheckIcon />
          </div>
          <div className="rp-feature-content">
            <h3 className="rp-feature-heading">Action Item Tracking</h3>
            <p className="rp-feature-text">
              Automatically logs deliverables, assigns team ownership, and sets deadlines directly into your workflows.
            </p>
          </div>
        </div>

        <div className="rp-feature-card">
          <div className="rp-feature-icon rp-icon-blue">
            <ShieldCheckIcon />
          </div>
          <div className="rp-feature-content">
            <h3 className="rp-feature-heading">Zero-Knowledge Privacy</h3>
            <p className="rp-feature-text">
              Enterprise-grade encryption and zero-retention audio processing keep sensitive discussions strictly confidential.
            </p>
          </div>
        </div>

        <div className="rp-feature-card">
          <div className="rp-feature-icon rp-icon-indigo">
            <ConnectIcon />
          </div>
          <div className="rp-feature-content">
            <h3 className="rp-feature-heading">Universal Integrations</h3>
            <p className="rp-feature-text">
              Seamlessly integrates with Google Meet, Microsoft Teams, Zoom, Slack, and your enterprise calendars.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Enterprise Value Metrics */}
      <div className="rp-footer-metrics">
        <div className="rp-metric-item">
          <span className="rp-metric-number">40%</span>
          <span className="rp-metric-label">Less Meeting Overhead</span>
        </div>
        <div className="rp-metric-divider" />
        <div className="rp-metric-item">
          <span className="rp-metric-number">99.9%</span>
          <span className="rp-metric-label">Transcription Accuracy</span>
        </div>
        <div className="rp-metric-divider" />
        <div className="rp-metric-item">
          <span className="rp-metric-number">10x</span>
          <span className="rp-metric-label">Faster Decision Velocity</span>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
