import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../layouts/LegalLayout';

export const PrivacyPage: React.FC = () => {
  return (
    <LegalLayout activeDoc="privacy">
      <article className="im-legal-article">
        {/* Document Header */}
        <header className="im-legal-header">
          <div className="im-legal-meta-row">
            <span className="im-legal-badge">Privacy &amp; Data Governance</span>
            <span className="im-legal-updated">Last Updated: March 2026 &bull; Version 1.2</span>
          </div>
          <h1>Privacy Policy</h1>
          <p className="im-legal-intro">
            This Privacy Policy outlines the principles governing how IntellMeet collects, processes, and protects
            information in connection with our AI-powered meeting and collaboration platform.
          </p>
        </header>

        {/* Explicit Placeholder Notice */}
        <div className="im-legal-placeholder-alert" role="note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="im-legal-alert-icon"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="im-legal-alert-text">
            <strong>Placeholder Policy Notice</strong>
            This Privacy Policy is a frontend design placeholder for the IntellMeet prototype. The text below illustrates
            data handling concepts and platform architecture. Before commercial deployment, an official enterprise privacy
            policy prepared by qualified legal counsel must be provided in accordance with applicable regional privacy regulations.
          </div>
        </div>

        {/* Organized Sections */}
        <div className="im-legal-sections">
          <section className="im-legal-section">
            <h2>1. Scope &amp; Privacy Commitment</h2>
            <p>
              IntellMeet is committed to transparency in the collection and treatment of user information. This policy applies
              to all visitors, registered workspace members, and invited meeting participants using our web application, desktop
              clients, calendar extensions, and connected recording bots.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>2. Information We Collect</h2>
            <p>We collect and process the following categories of information to provide collaboration services:</p>
            <ul>
              <li><strong>Account &amp; Profile Information:</strong> Name, work email address, company name, job title, and authentication tokens.</li>
              <li><strong>Meeting Metadata:</strong> Session duration, scheduled start/end times, attendee rosters, and meeting titles.</li>
              <li><strong>Real-Time Meeting Content:</strong> Live audio, video streams, text chat messages, and shared screen feeds when active in a session.</li>
              <li><strong>Usage &amp; Telemetry Data:</strong> Browser environment, network quality metrics, feature interaction statistics, and error diagnostic logs.</li>
            </ul>
          </section>

          <section className="im-legal-section">
            <h2>3. AI Audio &amp; Video Processing Safeguards</h2>
            <p>
              IntellMeet uses machine learning models to transcribe spoken dialogue, extract action items, and generate contextual meeting briefs.
              Our architecture emphasizes data minimization:
            </p>
            <ul>
              <li>Audio segments are streamed securely to private inference processors solely for transcription and synthesis during the meeting.</li>
              <li>Enterprise tenants may configure zero-retention policies where raw audio files are automatically purged once transcription completes.</li>
              <li>Customer audio and transcripts are never pooled into open, public model training sets.</li>
            </ul>
          </section>

          <section className="im-legal-section">
            <h2>4. Third-Party Calendar &amp; Conferencing Integrations</h2>
            <p>
              If your administrator connects IntellMeet with Google Workspace, Microsoft 365, Zoom, or Slack, we access calendar events
              and roster directories solely to schedule meetings and dispatch AI assistance bots as authorized by your workspace administrators.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>5. Data Subject Rights &amp; Workspace Controls</h2>
            <p>
              Depending on your location and governing data protection laws, you may hold rights to inspect, rectify, export, or delete your
              personal records. Enterprise administrators retain administrative controls within the IntellMeet workspace console to fulfill
              data deletion requests and export transcripts.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>6. Policy Updates &amp; Privacy Inquiries</h2>
            <p>
              We may revise this placeholder policy as IntellMeet evolves. For privacy inquiries or questions regarding workspace data
              retention options, please reach out to <code>privacy@intellmeet-ai.internal</code>.
            </p>
          </section>
        </div>

        {/* Bottom Action Footer */}
        <div className="im-legal-bottom-action">
          <div className="im-legal-action-text">
            <span>Return to registration or access your existing account.</span>
          </div>
          <div className="im-legal-action-buttons">
            <Link to="/signup" className="im-legal-nav-btn primary">
              Create Account
            </Link>
            <Link to="/login" className="im-legal-nav-btn secondary">
              Back to Sign In
            </Link>
          </div>
        </div>
      </article>
    </LegalLayout>
  );
};

export default PrivacyPage;
