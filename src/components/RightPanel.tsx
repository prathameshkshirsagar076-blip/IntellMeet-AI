import React from 'react';
import {
  SparkleIcon,
  BrainIcon,
  TaskCheckIcon,
  ShieldCheckIcon,
  ConnectIcon,
} from './icons';
import './RightPanel.css';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  description: string;
}

interface MetricItem {
  id: string;
  value: string;
  label: string;
}

const FEATURE_LIST: FeatureItem[] = [
  {
    id: 'synthesis',
    icon: <BrainIcon />,
    colorClass: 'rp-icon-purple',
    title: 'Autonomous Synthesis',
    description:
      'Real-time executive summaries, discussion outlines, and contextual minutes without manual note-taking.',
  },
  {
    id: 'action-items',
    icon: <TaskCheckIcon />,
    colorClass: 'rp-icon-emerald',
    title: 'Action Item Tracking',
    description:
      'Automatically logs deliverables, assigns team ownership, and sets deadlines directly into your workflows.',
  },
  {
    id: 'privacy',
    icon: <ShieldCheckIcon />,
    colorClass: 'rp-icon-blue',
    title: 'Zero-Knowledge Privacy',
    description:
      'Enterprise-grade encryption and zero-retention audio processing keep sensitive discussions strictly confidential.',
  },
  {
    id: 'integrations',
    icon: <ConnectIcon />,
    colorClass: 'rp-icon-indigo',
    title: 'Universal Integrations',
    description:
      'Seamlessly integrates with Google Meet, Microsoft Teams, Zoom, Slack, and your enterprise calendars.',
  },
];

const METRICS_LIST: MetricItem[] = [
  { id: 'overhead', value: '40%', label: 'Less Meeting Overhead' },
  { id: 'accuracy', value: '99.9%', label: 'Transcription Accuracy' },
  { id: 'velocity', value: '10x', label: 'Faster Decision Velocity' },
];

export const RightPanel: React.FC = () => {
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
        {FEATURE_LIST.map((feature) => (
          <div key={feature.id} className="rp-feature-card">
            <div className={`rp-feature-icon ${feature.colorClass}`}>
              {feature.icon}
            </div>
            <div className="rp-feature-content">
              <h3 className="rp-feature-heading">{feature.title}</h3>
              <p className="rp-feature-text">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Enterprise Value Metrics */}
      <div className="rp-footer-metrics">
        {METRICS_LIST.map((metric, index) => (
          <React.Fragment key={metric.id}>
            <div className="rp-metric-item">
              <span className="rp-metric-number">{metric.value}</span>
              <span className="rp-metric-label">{metric.label}</span>
            </div>
            {index < METRICS_LIST.length - 1 && <div className="rp-metric-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RightPanel;
