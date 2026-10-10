import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import type { ThemeMode, AccentColor } from '../types/meeting';
import {
  VideoIcon,
  SparkleIcon,
  PaletteIcon,
  CheckCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
} from '../components/icons';

const ACCENT_COLORS: { id: AccentColor; name: string; hex: string; description: string }[] = [
  { id: 'indigo', name: 'Indigo Blurple', hex: '#4f46e5', description: 'Enterprise standard' },
  { id: 'blue', name: 'Ocean Cyan', hex: '#0284c7', description: 'Precision and clarity' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669', description: 'Vibrant and productive' },
  { id: 'violet', name: 'Royal Violet', hex: '#7c3aed', description: 'Creative and AI-centric' },
  { id: 'rose', name: 'Crimson Rose', hex: '#e11d48', description: 'Bold and energetic' },
  { id: 'amber', name: 'Warm Amber', hex: '#d97706', description: 'Warm and collaborative' },
  { id: 'teal', name: 'Teal Mint', hex: '#0d9488', description: 'Fresh and balanced' },
  { id: 'cyan', name: 'Sky Cyan', hex: '#0891b2', description: 'Modern and focused' },
];

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'theme';

  const { user } = useAuth();
  const { preferences, updatePreferences, showToast } = useMeetings();

  const [activeTab, setActiveTab] = useState<'theme' | 'profile' | 'hardware' | 'ai'>(
    initialTab === 'profile' || initialTab === 'hardware' || initialTab === 'ai' ? initialTab : 'theme'
  );

  // Theme states
  const [themeMode, setThemeMode] = useState<ThemeMode>(preferences.theme);
  const [accentColor, setAccentColor] = useState<AccentColor>(preferences.accentColor || 'indigo');
  const [highContrast, setHighContrast] = useState<boolean>(Boolean(preferences.highContrast));
  const [reducedMotion, setReducedMotion] = useState<boolean>(Boolean(preferences.reducedMotion));

  // Device & other states
  const [micDevice, setMicDevice] = useState(preferences.microphoneDevice);
  const [camDevice, setCamDevice] = useState(preferences.cameraDevice);
  const [speakerDevice, setSpeakerDevice] = useState(preferences.speakerDevice);
  const [autoMute, setAutoMute] = useState(preferences.autoMuteOnJoin);
  const [autoCameraOff, setAutoCameraOff] = useState(preferences.autoTurnOffCameraOnJoin);
  const [emailReminders, setEmailReminders] = useState(preferences.emailReminders);
  const [desktopNotifs, setDesktopNotifs] = useState(preferences.desktopNotifications);
  const [autoAiSummary, setAutoAiSummary] = useState(preferences.aiSummaryAutoGenerate);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'theme' || tabParam === 'profile' || tabParam === 'hardware' || tabParam === 'ai') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabClick = (tab: 'theme' | 'profile' | 'hardware' | 'ai') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  const handleSelectThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    updatePreferences({ theme: mode });
    showToast(
      mode === 'dark'
        ? '🌙 Dark Navy theme activated'
        : mode === 'light'
        ? '☀️ Light theme activated'
        : '💻 System theme matching activated',
      'success'
    );
  };

  const handleSelectAccent = (color: AccentColor) => {
    setAccentColor(color);
    updatePreferences({ accentColor: color });
    const match = ACCENT_COLORS.find((c) => c.id === color);
    showToast(`Accent color updated to ${match?.name || color}!`, 'success');
  };

  const handleToggleHighContrast = (checked: boolean) => {
    setHighContrast(checked);
    updatePreferences({ highContrast: checked });
    showToast(checked ? 'High contrast enabled' : 'Standard contrast restored', 'info');
  };

  const handleToggleReducedMotion = (checked: boolean) => {
    setReducedMotion(checked);
    updatePreferences({ reducedMotion: checked });
    showToast(checked ? 'Reduced motion enabled' : 'Motion animations enabled', 'info');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      theme: themeMode,
      accentColor,
      highContrast,
      reducedMotion,
      microphoneDevice: micDevice,
      cameraDevice: camDevice,
      speakerDevice,
      autoMuteOnJoin: autoMute,
      autoTurnOffCameraOnJoin: autoCameraOff,
      emailReminders,
      desktopNotifications: desktopNotifs,
      aiSummaryAutoGenerate: autoAiSummary,
    });
  };

  const activeColorObj = ACCENT_COLORS.find((c) => c.id === accentColor) || ACCENT_COLORS[0];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Workspace Settings</h1>
          <p className="im-page-subtitle">
            Customize visual themes, brand accents, hardware defaults, and AI meeting automation.
          </p>
        </div>

        <div className="im-page-actions">
          <button className="im-btn im-btn-primary" onClick={handleSaveAll}>
            Save All Preferences
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="im-filter-bar" style={{ marginBottom: 24 }}>
        <div className="im-tabs-group" role="tablist">
          <button
            type="button"
            className={`im-tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => handleTabClick('theme')}
            role="tab"
            aria-selected={activeTab === 'theme'}
          >
            🎨 Theme & Appearance
          </button>
          <button
            type="button"
            className={`im-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
            role="tab"
            aria-selected={activeTab === 'profile'}
          >
            👤 Profile & Account
          </button>
          <button
            type="button"
            className={`im-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
            onClick={() => handleTabClick('hardware')}
            role="tab"
            aria-selected={activeTab === 'hardware'}
          >
            🎙️ Audio & Video Devices
          </button>
          <button
            type="button"
            className={`im-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => handleTabClick('ai')}
            role="tab"
            aria-selected={activeTab === 'ai'}
          >
            ⚡ AI & Notifications
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* =========================================================================
            TAB 1: THEME & APPEARANCE (FEATURED SECTION)
            ========================================================================= */}
        {activeTab === 'theme' && (
          <div>
            {/* 1. Theme Mode Card */}
            <div className="im-card">
              <div className="im-card-header">
                <h2 className="im-card-title">
                  <PaletteIcon size={18} style={{ color: 'var(--im-primary)' }} />
                  Theme Mode & Interface Style
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                  Applies instantly across your entire workspace
                </span>
              </div>
              <div className="im-card-body">
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
                  Choose your preferred workspace aesthetic. Switch between clean daylight surfaces, deep dark navy, or automatic operating system synchronization.
                </p>

                <div className="im-theme-card-grid">
                  {/* Light Mode Option */}
                  <div
                    className={`im-theme-mode-card ${themeMode === 'light' ? 'active' : ''}`}
                    onClick={() => handleSelectThemeMode('light')}
                  >
                    <div className="im-theme-mini-ui im-mini-light">
                      <div className="im-mini-sidebar">
                        <div className="im-mini-dot active" />
                        <div className="im-mini-dot" />
                        <div className="im-mini-dot" />
                      </div>
                      <div className="im-mini-body">
                        <div className="im-mini-topbar" />
                        <div className="im-mini-card-row">
                          <div className="im-mini-card" />
                          <div className="im-mini-card" />
                        </div>
                        <div className="im-mini-primary-pill" />
                      </div>
                    </div>
                    <div className="im-theme-card-footer">
                      <div>
                        <h3 className="im-theme-card-title">☀️ Light Canvas</h3>
                        <p className="im-theme-card-subtitle">Crisp, clean neutral surfaces</p>
                      </div>
                      {themeMode === 'light' && (
                        <span style={{ color: 'var(--im-primary)' }}>
                          <CheckCircleIcon size={18} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dark Mode Option */}
                  <div
                    className={`im-theme-mode-card ${themeMode === 'dark' ? 'active' : ''}`}
                    onClick={() => handleSelectThemeMode('dark')}
                  >
                    <div className="im-theme-mini-ui im-mini-dark">
                      <div className="im-mini-sidebar" style={{ backgroundColor: '#060911' }}>
                        <div className="im-mini-dot active" />
                        <div className="im-mini-dot" />
                        <div className="im-mini-dot" />
                      </div>
                      <div className="im-mini-body">
                        <div className="im-mini-topbar" />
                        <div className="im-mini-card-row">
                          <div className="im-mini-card" />
                          <div className="im-mini-card" />
                        </div>
                        <div className="im-mini-primary-pill" />
                      </div>
                    </div>
                    <div className="im-theme-card-footer">
                      <div>
                        <h3 className="im-theme-card-title">🌙 Dark Navy</h3>
                        <p className="im-theme-card-subtitle">Deep contrast, reduced glare</p>
                      </div>
                      {themeMode === 'dark' && (
                        <span style={{ color: 'var(--im-primary)' }}>
                          <CheckCircleIcon size={18} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* System Sync Option */}
                  <div
                    className={`im-theme-mode-card ${themeMode === 'system' ? 'active' : ''}`}
                    onClick={() => handleSelectThemeMode('system')}
                  >
                    <div className="im-theme-mini-ui im-mini-system">
                      <div className="im-mini-sidebar">
                        <div className="im-mini-dot active" />
                        <div className="im-mini-dot" />
                        <div className="im-mini-dot" />
                      </div>
                      <div className="im-mini-body">
                        <div className="im-mini-topbar" />
                        <div className="im-mini-card-row">
                          <div className="im-mini-card" />
                          <div className="im-mini-card" />
                        </div>
                        <div className="im-mini-primary-pill" />
                      </div>
                    </div>
                    <div className="im-theme-card-footer">
                      <div>
                        <h3 className="im-theme-card-title">💻 System Auto</h3>
                        <p className="im-theme-card-subtitle">Syncs with OS day/night cycles</p>
                      </div>
                      {themeMode === 'system' && (
                        <span style={{ color: 'var(--im-primary)' }}>
                          <CheckCircleIcon size={18} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Brand Accent Color Palette */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">Brand Accent Palette</h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Selected: <strong>{activeColorObj.name}</strong> ({activeColorObj.hex}) — {activeColorObj.description}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--im-radius-full)',
                    backgroundColor: 'var(--im-primary-light)',
                    color: 'var(--im-primary-text)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--im-primary)' }} />
                  Live Token Sync
                </div>
              </div>

              <div className="im-card-body">
                <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
                  Personalize buttons, active highlights, navigation indicators, and badges:
                </p>

                <div className="im-swatch-list">
                  {ACCENT_COLORS.map((color) => {
                    const isSelected = accentColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        className={`im-swatch-btn ${isSelected ? 'active' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => handleSelectAccent(color.id)}
                        data-tooltip={`${color.name} (${color.hex})`}
                        aria-label={`Select ${color.name} accent`}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width={18}
                            height={18}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 3. Live Interactive Component Playground */}
                <div className="im-theme-live-preview-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                      Live Component Interactive Preview
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                      Updates in real-time as you switch colors above
                    </span>
                  </div>

                  <div className="im-live-preview-row">
                    <button type="button" className="im-btn im-btn-primary">
                      Primary Button
                    </button>
                    <button type="button" className="im-btn im-btn-secondary">
                      Secondary Button
                    </button>
                    <span className="im-badge im-badge-live">● Live Meeting</span>
                    <span className="im-badge im-badge-upcoming">Scheduled 14:00</span>
                    <span className="im-badge im-badge-ai">✨ AI Co-Pilot</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420 }}>
                    <input
                      type="text"
                      className="im-input"
                      style={{ height: 38 }}
                      placeholder="Interactive input focus ring preview..."
                      defaultValue="sub-20ms audio latency benchmark"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Accessibility and Visual Ergonomics */}
            <div className="im-card">
              <div className="im-card-header">
                <h2 className="im-card-title">
                  <ShieldCheckIcon size={18} style={{ color: 'var(--im-success)' }} />
                  Accessibility & Visual Ergonomics
                </h2>
              </div>
              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={highContrast}
                    onChange={(e) => handleToggleHighContrast(e.target.checked)}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                      High Contrast Mode (WCAG AAA)
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                      Sharpens borders, boosts font contrast ratios, and outlines interactive cards.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={reducedMotion}
                    onChange={(e) => handleToggleReducedMotion(e.target.checked)}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                      Reduced Motion
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                      Suppresses subtle micro-animations, slide transitions, and pulsing indicators.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PROFILE & ACCOUNT
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">
                <UsersIcon size={18} />
                Profile Information
              </h2>
            </div>
            <div className="im-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="im-form-group">
                  <label className="im-form-label">Display Name</label>
                  <input
                    type="text"
                    className="im-input"
                    defaultValue={user?.name || 'Alex Morgan'}
                    readOnly
                    style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                  />
                </div>

                <div className="im-form-group">
                  <label className="im-form-label">Email Address</label>
                  <input
                    type="email"
                    className="im-input"
                    defaultValue={user?.email || 'alex.morgan@intellmeet.com'}
                    readOnly
                    style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="im-form-group" style={{ marginBottom: 0 }}>
                  <label className="im-form-label">Company / Workspace</label>
                  <input
                    type="text"
                    className="im-input"
                    defaultValue={user?.company || 'IntellMeet HQ'}
                    readOnly
                    style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                  />
                </div>

                <div className="im-form-group" style={{ marginBottom: 0 }}>
                  <label className="im-form-label">Role</label>
                  <input
                    type="text"
                    className="im-input"
                    defaultValue="Product Lead & Enterprise Architect"
                    readOnly
                    style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: HARDWARE DEVICES
            ========================================================================= */}
        {activeTab === 'hardware' && (
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">
                <VideoIcon size={18} />
                Audio & Video Hardware (Simulated)
              </h2>
            </div>
            <div className="im-card-body">
              <div className="im-form-group">
                <label htmlFor="settings-mic-select" className="im-form-label">Default Microphone</label>
                <select
                  id="settings-mic-select"
                  className="im-select"
                  value={micDevice}
                  onChange={(e) => setMicDevice(e.target.value)}
                >
                  <option value="Default - MacBook Pro Microphone (Built-in)">Default - MacBook Pro Microphone (Built-in)</option>
                  <option value="External USB Condenser Studio Mic">External USB Condenser Studio Mic</option>
                  <option value="Bluetooth Headset (Hands-Free Audio)">Bluetooth Headset (Hands-Free Audio)</option>
                </select>
              </div>

              <div className="im-form-group">
                <label htmlFor="settings-cam-select" className="im-form-label">Default Camera</label>
                <select
                  id="settings-cam-select"
                  className="im-select"
                  value={camDevice}
                  onChange={(e) => setCamDevice(e.target.value)}
                >
                  <option value="Default - FaceTime HD Camera (1080p)">Default - FaceTime HD Camera (1080p)</option>
                  <option value="4K Ultra-HD External USB Webcam">4K Ultra-HD External USB Webcam</option>
                  <option value="Virtual Background Green Screen">Virtual Background Green Screen</option>
                </select>
              </div>

              <div className="im-form-group">
                <label htmlFor="settings-speaker-select" className="im-form-label">Default Speaker Output</label>
                <select
                  id="settings-speaker-select"
                  className="im-select"
                  value={speakerDevice}
                  onChange={(e) => setSpeakerDevice(e.target.value)}
                >
                  <option value="Default - Internal Speakers (Stereo)">Default - Internal Speakers (Stereo)</option>
                  <option value="External Hi-Fi Studio Monitors">External Hi-Fi Studio Monitors</option>
                  <option value="Wireless AirPods Pro (Spatial Audio)">Wireless AirPods Pro (Spatial Audio)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={autoMute}
                    onChange={(e) => setAutoMute(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>Auto-mute my microphone when joining meetings</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={autoCameraOff}
                    onChange={(e) => setAutoCameraOff(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>Turn off my camera when joining meetings</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: AI & NOTIFICATIONS
            ========================================================================= */}
        {activeTab === 'ai' && (
          <div className="im-card">
            <div className="im-card-header">
              <h2 className="im-card-title">
                <SparkleIcon size={18} style={{ color: 'var(--im-ai-purple)' }} />
                AI Automation & Notifications
              </h2>
            </div>
            <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="im-checkbox"
                  checked={autoAiSummary}
                  onChange={(e) => setAutoAiSummary(e.target.checked)}
                />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Automatically generate AI Meeting Summaries & Action Items
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                    When meetings conclude, IntellMeet Companion drafts key decisions and extracts actionable checklists.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="im-checkbox"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Email Calendar Reminders (15 minutes prior)
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                    Receive synchronized email alerts with one-click direct room join links.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="im-checkbox"
                  checked={desktopNotifs}
                  onChange={(e) => setDesktopNotifs(e.target.checked)}
                />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    In-App Desktop Notifications
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                    Displays topbar notification bell alerts when team members start calls or mention you.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="im-card-footer" style={{ marginTop: 24, borderRadius: 'var(--im-radius-md)' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
            All preferences persist in your local browser profile
          </span>
          <button type="submit" className="im-btn im-btn-primary">
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
