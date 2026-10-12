import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import type { ThemeMode, AccentColor, ThemePresetId } from '../types/meeting';
import {
  THEME_PRESETS,
  CURATED_ACCENTS,
  DEFAULT_THEME_PRESET_ID,
  getEffectiveThemeMode,
  getThemePreset,
} from '../config/themePresets';
import { ThemePreviewCard } from '../components/theme/ThemePreviewCard';
import {
  VideoIcon,
  SparkleIcon,
  PaletteIcon,
  CheckCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
} from '../components/icons';

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
  const [themePreset, setThemePreset] = useState<ThemePresetId>(
    preferences.themePreset || DEFAULT_THEME_PRESET_ID
  );
  const [accentColor, setAccentColor] = useState<AccentColor>(preferences.accentColor || 'preset');
  const [customAccentHex, setCustomAccentHex] = useState<string>(
    preferences.customAccentHex || '#4f46e5'
  );
  const [highContrast, setHighContrast] = useState<boolean>(Boolean(preferences.highContrast));
  const [reducedMotion, setReducedMotion] = useState<boolean>(Boolean(preferences.reducedMotion));
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Device & other states
  const [micDevice, setMicDevice] = useState(preferences.microphoneDevice);
  const [camDevice, setCamDevice] = useState(preferences.cameraDevice);
  const [speakerDevice, setSpeakerDevice] = useState(preferences.speakerDevice);
  const [autoMute, setAutoMute] = useState(preferences.autoMuteOnJoin);
  const [autoCameraOff, setAutoCameraOff] = useState(preferences.autoTurnOffCameraOnJoin);
  const [emailReminders, setEmailReminders] = useState(preferences.emailReminders);
  const [desktopNotifs, setDesktopNotifs] = useState(preferences.desktopNotifications);
  const [autoAiSummary, setAutoAiSummary] = useState(preferences.aiSummaryAutoGenerate);

  const customColorInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local states with preferences (e.g. when modified from topbar popover)
  useEffect(() => {
    setThemeMode(preferences.theme);
    setThemePreset(preferences.themePreset || DEFAULT_THEME_PRESET_ID);
    setAccentColor(preferences.accentColor || 'preset');
    setCustomAccentHex(preferences.customAccentHex || '#4f46e5');
    setHighContrast(Boolean(preferences.highContrast));
    setReducedMotion(Boolean(preferences.reducedMotion));
  }, [
    preferences.theme,
    preferences.themePreset,
    preferences.accentColor,
    preferences.customAccentHex,
    preferences.highContrast,
    preferences.reducedMotion,
  ]);

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
        ? '☀️ Light Canvas theme activated'
        : '💻 System theme matching activated',
      'success'
    );
  };

  const handleSelectThemePreset = (presetId: ThemePresetId) => {
    setThemePreset(presetId);
    updatePreferences({ themePreset: presetId });
    const p = getThemePreset(presetId);
    showToast(`✨ ${p.name} theme preset activated!`, 'success');
  };

  const handleSelectAccent = (color: AccentColor) => {
    setAccentColor(color);
    updatePreferences({ accentColor: color });
    if (color === 'preset') {
      showToast('Theme preset default accent restored', 'info');
    } else {
      const match = CURATED_ACCENTS.find((c) => c.id === color);
      showToast(`Accent color updated to ${match?.label || color}!`, 'success');
    }
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomAccentHex(hex);
    setAccentColor('custom');
    updatePreferences({
      accentColor: 'custom',
      customAccentHex: hex,
    });
    showToast(`Custom accent set to ${hex}!`, 'success');
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

  const handleResetThemeDefaults = () => {
    updatePreferences({
      theme: 'light',
      themePreset: DEFAULT_THEME_PRESET_ID,
      accentColor: 'preset',
      customAccentHex: '#4f46e5',
      highContrast: false,
      reducedMotion: false,
    });
    setShowResetConfirmModal(false);
    showToast('🔄 Theme reset to IntellMeet Signature default settings!', 'success');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      theme: themeMode,
      themePreset,
      accentColor,
      customAccentHex,
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
    showToast('All workspace preferences saved successfully!', 'success');
  };

  const activePresetObj = getThemePreset(themePreset);
  const effectiveMode = getEffectiveThemeMode(themeMode);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">Workspace Settings</h1>
          <p className="im-page-subtitle">
            Configure enterprise theme presets, coordinated palettes, audio/video devices, and AI automation.
          </p>
        </div>

        <div className="im-page-actions">
          <button type="button" className="im-btn im-btn-primary" onClick={handleSaveAll}>
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
            TAB 1: THEME & APPEARANCE (UPGRADED ENTERPRISE THEME STUDIO)
            ========================================================================= */}
        {activeTab === 'theme' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 1. Theme Mode Card (Light, Dark, System Auto) */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <PaletteIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Appearance & Mode
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Active: <strong>{themeMode === 'system' ? 'System Auto Sync' : `${themeMode.toUpperCase()} Mode`}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                  Applies instantly across all workspace windows
                </span>
              </div>
              <div className="im-card-body">
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
                  Choose your interface lighting style. Seamlessly switch between daylight high-clarity surfaces,
                  deep dark navy, or synchronize automatically with your operating system preferences.
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
                        <p className="im-theme-card-subtitle">Deep contrast, reduced eye glare</p>
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

            {/* 2. Enterprise Theme Presets Gallery (8 Presets) */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <SparkleIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Enterprise Theme Presets (8 Coordinated Palettes)
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Current Preset: <strong>{activePresetObj.name}</strong> — {activePresetObj.tagline}
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
                  Full Application Transformation
                </div>
              </div>

              <div className="im-card-body">
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
                  Selecting a preset updates the entire application’s color palette, including surfaces, sidebars,
                  borders, badges, navigation, and typography. Each palette is tuned for accessibility and visual harmony.
                </p>

                {/* Responsive Theme Gallery Grid with Realistic Miniature Dashboard Previews */}
                <div className="im-theme-gallery-grid" role="radiogroup" aria-label="Theme presets selection">
                  {THEME_PRESETS.map((preset) => {
                    return (
                      <ThemePreviewCard
                        key={preset.id}
                        preset={preset}
                        isSelected={themePreset === preset.id}
                        effectiveMode={effectiveMode}
                        onSelect={handleSelectThemePreset}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Brand Accent Color Highlight Studio */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">Accent Color Highlight</h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Selected:{' '}
                    <strong>
                      {accentColor === 'preset'
                        ? `${activePresetObj.name} Default`
                        : accentColor === 'custom'
                        ? `Custom (${customAccentHex})`
                        : CURATED_ACCENTS.find((c) => c.id === accentColor)?.label}
                    </strong>
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
                    backgroundColor: 'var(--im-bg-subtle)',
                    border: '1px solid var(--im-border)',
                    color: 'var(--im-text-primary)',
                  }}
                >
                  <span>Independent Accent Override</span>
                </div>
              </div>

              <div className="im-card-body">
                <p style={{ margin: '0 0 14px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)' }}>
                  Personalize interactive buttons, active indicators, focus rings, and badges. Choose the preset’s native
                  accent, pick from curated high-contrast shades, or choose a custom hex color.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  {/* Option: Preset Default */}
                  <button
                    type="button"
                    className={`im-btn ${accentColor === 'preset' ? 'im-btn-primary' : 'im-btn-secondary'}`}
                    style={{ height: 36, padding: '0 14px', fontSize: '0.8125rem' }}
                    onClick={() => handleSelectAccent('preset')}
                  >
                    Preset Default ({activePresetObj.name.split(' ')[0]})
                  </button>

                  {/* Curated Swatches */}
                  <div className="im-swatch-list" style={{ margin: 0 }}>
                    {CURATED_ACCENTS.filter((c) => c.id !== 'preset' && c.id !== 'custom').map((color) => {
                      const isSelected = accentColor === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          className={`im-swatch-btn ${isSelected ? 'active' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => handleSelectAccent(color.id)}
                          data-tooltip={`${color.label} (${color.hex})`}
                          aria-label={`Select ${color.label} accent`}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              width={16}
                              height={16}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 10px',
                      borderRadius: 'var(--im-radius-md)',
                      border: '1px solid var(--im-border)',
                      backgroundColor: 'var(--im-bg-surface)',
                    }}
                  >
                    <label
                      htmlFor="custom-accent-color-input"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: customAccentHex,
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.2)',
                        display: 'block',
                        flexShrink: 0,
                      }}
                      title="Click to open color picker"
                    />
                    <input
                      id="custom-accent-color-input"
                      ref={customColorInputRef}
                      type="color"
                      value={customAccentHex}
                      onChange={(e) => handleCustomHexChange(e.target.value)}
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                    />
                    <input
                      type="text"
                      className="im-input"
                      style={{ width: 90, height: 28, fontSize: '0.78rem', padding: '0 6px', fontFamily: 'monospace' }}
                      value={customAccentHex}
                      onChange={(e) => handleCustomHexChange(e.target.value)}
                      placeholder="#4f46e5"
                      aria-label="Hex color value"
                    />
                    <button
                      type="button"
                      className={`im-btn ${accentColor === 'custom' ? 'im-btn-primary' : 'im-btn-secondary'}`}
                      style={{ height: 28, padding: '0 8px', fontSize: '0.72rem' }}
                      onClick={() => handleCustomHexChange(customAccentHex)}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* 4. Live Interactive Component Playground & Token Inspector */}
                <div className="im-theme-live-preview-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                        Live Interactive Component Playground
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                        Tests button contrast, focus rings, badges, and card borders in real-time
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: 'var(--im-primary-light)',
                        color: 'var(--im-primary-text)',
                      }}
                    >
                      Active Preset: {activePresetObj.name}
                    </span>
                  </div>

                  <div className="im-live-preview-row" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <button type="button" className="im-btn im-btn-primary">
                      Primary Action
                    </button>
                    <button type="button" className="im-btn im-btn-secondary">
                      Secondary Action
                    </button>
                    <button
                      type="button"
                      className="im-btn"
                      style={{
                        border: '1px solid var(--im-primary)',
                        color: 'var(--im-primary)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Outline Highlight
                    </button>
                    <span className="im-badge im-badge-live">● Live Meeting Room</span>
                    <span className="im-badge im-badge-upcoming">Scheduled 14:30</span>
                    <span className="im-badge im-badge-ai">✨ AI Co-Pilot Summary</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                    <input
                      type="text"
                      className="im-input"
                      style={{ height: 38 }}
                      placeholder="Interactive input focus ring preview..."
                      defaultValue="sub-20ms audio latency benchmark"
                    />
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--im-radius-md)',
                        backgroundColor: 'var(--im-bg-surface)',
                        border: '1px solid var(--im-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-primary)', fontWeight: 600 }}>
                        Surface Contrast Check
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                        WCAG AA / AAA Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Accessibility and Visual Ergonomics */}
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

            {/* 6. Reset to Defaults Section */}
            <div className="im-card" style={{ borderColor: 'var(--im-border)' }}>
              <div className="im-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--im-text-primary)' }}>
                    Reset Theme Preferences
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', margin: 0 }}>
                    Revert all appearance settings, preset selection, and custom accents back to factory defaults.
                  </p>
                </div>
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  style={{ color: 'var(--im-danger-text)', borderColor: 'var(--im-border)' }}
                  onClick={() => setShowResetConfirmModal(true)}
                >
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirmModal && (
              <div className="im-modal-backdrop" style={{ zIndex: 1200 }}>
                <div className="im-modal" style={{ maxWidth: 460 }}>
                  <div className="im-modal-header">
                    <h3 className="im-modal-title">Reset Theme to Default?</h3>
                    <button
                      type="button"
                      className="im-modal-close"
                      onClick={() => setShowResetConfirmModal(false)}
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="im-modal-body">
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--im-text-secondary)', lineHeight: 1.5 }}>
                      This will reset your workspace appearance to <strong>Light Canvas</strong>, the{' '}
                      <strong>IntellMeet Signature</strong> theme preset, and restore the default indigo accent.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Your meetings, account profile, and hardware devices will remain unaffected.
                    </p>
                  </div>
                  <div className="im-modal-footer">
                    <button
                      type="button"
                      className="im-btn im-btn-secondary"
                      onClick={() => setShowResetConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="im-btn im-btn-primary"
                      onClick={handleResetThemeDefaults}
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    defaultValue={user?.name || ''}
                    placeholder="User Name"
                    readOnly
                    style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                  />
                </div>

                <div className="im-form-group">
                  <label className="im-form-label">Email Address</label>
                  <input
                    type="email"
                    className="im-input"
                    defaultValue={user?.email || ''}
                    placeholder="user@example.com"
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
