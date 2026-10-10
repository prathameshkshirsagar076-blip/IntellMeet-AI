import React from 'react';
import type { ThemePreset } from '../../config/themePresets';

interface ThemeMiniPreviewProps {
  preset: ThemePreset;
  mode: 'light' | 'dark';
}

export const ThemeMiniPreview: React.FC<ThemeMiniPreviewProps> = ({ preset, mode }) => {
  const palette = mode === 'dark' ? preset.dark : preset.light;

  return (
    <div
      className="im-mini-dashboard-preview"
      style={{
        backgroundColor: palette.bgCanvas,
        borderColor: palette.border,
      }}
      aria-hidden="true"
    >
      {/* Mini Sidebar */}
      <div
        className="im-mini-sidebar"
        style={{
          backgroundColor: palette.bgSidebar,
          borderColor: palette.borderSidebar,
        }}
      >
        <div
          className="im-mini-logo-mark"
          style={{
            backgroundColor: palette.primary,
          }}
        />
        <div
          className="im-mini-nav-item active"
          style={{
            backgroundColor: palette.primary,
          }}
        />
        <div className="im-mini-nav-item" />
        <div className="im-mini-nav-item" />
      </div>

      {/* Mini Canvas Area */}
      <div className="im-mini-canvas">
        {/* Mini Topbar */}
        <div
          className="im-mini-topbar"
          style={{
            backgroundColor: palette.bgSurface,
            borderColor: palette.border,
          }}
        >
          <div
            className="im-mini-search"
            style={{
              backgroundColor: palette.bgSubtle,
              border: `1px solid ${palette.borderSubtle}`,
            }}
          />
          <div
            className="im-mini-avatar"
            style={{
              backgroundColor: palette.accent,
            }}
          />
        </div>

        {/* Mini Content Area */}
        <div className="im-mini-content">
          {/* Mini Welcome Banner */}
          <div
            className="im-mini-hero"
            style={{
              background: `linear-gradient(135deg, ${palette.bgSidebar} 0%, ${palette.primary} 120%)`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            <div className="im-mini-hero-line" />
            <div
              className="im-mini-hero-pill"
              style={{
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          {/* Mini Metric Cards */}
          <div className="im-mini-cards-row">
            <div
              className="im-mini-card-tile"
              style={{
                backgroundColor: palette.bgSurface,
                borderColor: palette.border,
              }}
            >
              <div
                className="im-mini-tile-icon"
                style={{ backgroundColor: palette.primaryLight }}
              />
              <div
                className="im-mini-tile-line"
                style={{ backgroundColor: palette.textSecondary, opacity: 0.6 }}
              />
            </div>
            <div
              className="im-mini-card-tile"
              style={{
                backgroundColor: palette.bgSurface,
                borderColor: palette.border,
              }}
            >
              <div
                className="im-mini-tile-icon"
                style={{ backgroundColor: palette.primaryLight }}
              />
              <div
                className="im-mini-tile-line"
                style={{ backgroundColor: palette.textSecondary, opacity: 0.6 }}
              />
            </div>
          </div>

          {/* Mini Meeting Row */}
          <div
            className="im-mini-meeting-row"
            style={{
              backgroundColor: palette.bgSurface,
              borderColor: palette.border,
            }}
          >
            <div
              className="im-mini-row-left"
              style={{ backgroundColor: palette.textPrimary, opacity: 0.7 }}
            />
            <div
              className="im-mini-row-badge"
              style={{ backgroundColor: palette.primary }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
