import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../layouts/LegalLayout';

export const TermsPage: React.FC = () => {
  return (
    <LegalLayout activeDoc="terms">
      <article className="im-legal-article">
        {/* Document Header */}
        <header className="im-legal-header">
          <div className="im-legal-meta-row">
            <span className="im-legal-badge">Legal Documentation</span>
            <span className="im-legal-updated">Last Updated: March 2026 &bull; Version 1.2</span>
          </div>
          <h1>Terms of Service</h1>
          <p className="im-legal-intro">
            These Terms of Service govern your access to and use of IntellMeet&apos;s AI-powered meeting platform,
            workspaces, APIs, and associated enterprise collaboration services.
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
            <strong>Placeholder Legal Notice</strong>
            This document serves as an enterprise UI structure and placeholder for the IntellMeet prototype.
            It does not constitute finalized legal counsel or a binding commercial contract. An official terms
            agreement tailored to your jurisdiction and corporate entity must be ratified prior to production deployment.
          </div>
        </div>

        {/* Organized Sections */}
        <div className="im-legal-sections">
          <section className="im-legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an IntellMeet account, accessing a shared workspace, or inviting participants to an AI-assisted session,
              you agree to be bound by these Terms of Service. If you represent an organization or enterprise entity,
              you certify that you possess the authority to bind that entity to these provisions.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>2. IntellMeet Service Description &amp; AI Processing</h2>
            <p>
              IntellMeet delivers real-time multimedia conferencing, persistent team messaging, automated audio/video
              transcription, and generative AI meeting synthesis. You acknowledge that AI-generated artifacts—including
              executive summaries, action items, and topic outlines—are algorithmic outputs designed to assist, not replace,
              human review and decision-making.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>3. Account Registration &amp; Enterprise Security</h2>
            <p>
              To access enterprise features, users must register using an authorized work email address. You are responsible for
              maintaining the confidentiality of your authentication credentials and for all activities conducted within your
              workspace. You agree to notify IntellMeet administrative personnel immediately upon discovering any unauthorized access.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>4. Customer Data &amp; Meeting Privacy Ownership</h2>
            <p>
              You retain full ownership and intellectual property rights over all audio streams, video recordings, presentation slides,
              chat messages, and meeting notes submitted to IntellMeet (&quot;Customer Data&quot;). IntellMeet will not claim ownership over
              any meeting content or use private customer discussions to train public foundational AI models without explicit,
              contractually documented enterprise consent.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>5. Acceptable Use &amp; Meeting Recording Compliance</h2>
            <p>
              You agree not to use IntellMeet for unlawful purposes or in violation of privacy, wiretapping, or recording consent statutes.
              You are solely responsible for providing required notices and obtaining legally required consent from all meeting participants
              prior to enabling automated transcription, recording, or AI listening agents.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>6. Service Availability &amp; Modifications</h2>
            <p>
              We continually iterate on IntellMeet features, transcription algorithms, and integration plugins. We may modify or
              discontinue certain platform capabilities with reasonable notice. We strive to provide high platform availability,
              backed by applicable enterprise Service Level Agreements (SLAs) specified in your master services order.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, IntellMeet AI Inc. and its affiliates shall not be liable for indirect, incidental,
              consequential, or punitive damages arising from interrupted meetings, third-party communication failures, or reliance upon
              algorithmic AI summaries.
            </p>
          </section>

          <section className="im-legal-section">
            <h2>8. Contact &amp; Governance</h2>
            <p>
              For inquiries regarding these Terms or to review tailored enterprise master subscription agreements, please contact our
              compliance office at <code>legal@intellmeet-ai.internal</code>.
            </p>
          </section>
        </div>

        {/* Bottom Action Footer */}
        <div className="im-legal-bottom-action">
          <div className="im-legal-action-text">
            <span>Ready to establish an enterprise collaborative workspace?</span>
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

export default TermsPage;
