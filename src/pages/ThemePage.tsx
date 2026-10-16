import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  SparkleIcon,
  PaletteIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SettingsIcon,
  RefreshCwIcon,
} from '../components/icons';

export const ThemePage: React.FC = () => {
  const { preferences, updatePreferences, showToast } = useMeetings();

  // Theme states
  const [themeMode, setThemeMode] = useState<ThemeMode>(preferences.theme || 'light');
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

  const customColorInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local states with preferences
  useEffect(() => {
    setThemeMode(preferences.theme || 'light');
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

  const handleSelectThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    updatePreferences({ theme: mode }, { silent: true });
    showToast(`Switched to ${mode === 'system' ? 'System Sync' : `${mode.toUpperCase()} mode`}`, 'info');
  };

  const handleSelectThemePreset = (presetId: ThemePresetId) => {
    setThemePreset(presetId);
    updatePreferences({ themePreset: presetId }, { silent: true });
    const targetPreset = getThemePreset(presetId);
    showToast(`Applied ${targetPreset.name} theme preset`, 'success');
  };

  const handleSelectAccent = (color: AccentColor) => {
    setAccentColor(color);
    updatePreferences({ accentColor: color }, { silent: true });
    showToast(`Accent highlight updated`, 'info');
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomAccentHex(hex);
    setAccentColor('custom');
    updatePreferences(
      {
        accentColor: 'custom',
        customAccentHex: hex,
      },
      { silent: true }
    );
  };

  const handleToggleHighContrast = (checked: boolean) => {
    setHighContrast(checked);
    updatePreferences({ highContrast: checked }, { silent: true });
    showToast(checked ? 'High contrast enabled (WCAG AAA)' : 'Standard contrast restored', 'info');
  };

  const handleToggleReducedMotion = (checked: boolean) => {
    setReducedMotion(checked);
    updatePreferences({ reducedMotion: checked }, { silent: true });
    showToast(checked ? 'Reduced motion enabled' : 'Motion animations enabled', 'info');
  };

  const handleResetThemeDefaults = () => {
    updatePreferences(
      {
        theme: 'light',
        themePreset: DEFAULT_THEME_PRESET_ID,
        accentColor: 'preset',
        customAccentHex: '#4f46e5',
        highContrast: false,
        reducedMotion: false,
      },
      { silent: true }
    );
    setShowResetConfirmModal(false);
    showToast('🔄 Theme reset to IntellMeet Signature default settings!', 'success');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(
      {
        theme: themeMode,
        themePreset,
        accentColor,
        customAccentHex,
        highContrast,
        reducedMotion,
      },
      { silent: true }
    );
    showToast('Theme & styling preferences saved successfully!', 'success');
  };

  const activePresetObj = getThemePreset(themePreset);
  const effectiveMode = getEffectiveThemeMode(themeMode);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header Banner */}
      <div className="im-page-header">
        <div className="im-page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--im-radius-md)',
                backgroundColor: 'var(--im-primary-light)',
                color: 'var(--im-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PaletteIcon size={22} />
            </span>
            <div>
              <h1 className="im-page-title" style={{ margin: 0 }}>Theme & Styling Studio</h1>
              <p className="im-page-subtitle" style={{ margin: '2px 0 0 0' }}>
                Configure enterprise theme presets, lighting modes, brand accents, and visual ergonomics.
              </p>
            </div>
          </div>
        </div>

        <div className="im-page-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/settings" className="im-btn im-btn-secondary" style={{ textDecoration: 'none' }}>
            <SettingsIcon size={16} />
            Workspace Settings
          </Link>
          <button type="button" className="im-btn im-btn-primary" onClick={handleSaveAll}>
            Save Theme Preferences
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectThemeMode('light')}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectThemeMode('dark')}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectThemeMode('system')}
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

            <div className="im-theme-gallery-grid" role="radiogroup" aria-label="Theme presets selection">
              {THEME_PRESETS.map((preset) => (
                <ThemePreviewCard
                  key={preset.id}
                  preset={preset}
                  isSelected={themePreset === preset.id}
                  effectiveMode={effectiveMode}
                  onSelect={handleSelectThemePreset}
                />
              ))}
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
                  htmlFor="theme-custom-hex-input"
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
                  id="theme-custom-hex-input"
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

              <div className="im-form-row" style={{ marginTop: 14 }}>
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
              <RefreshCwIcon size={14} />
              Reset to Default
            </button>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="im-card-footer" style={{ borderRadius: 'var(--im-radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
            Theme changes apply immediately across all application routes
          </span>
          <button type="submit" className="im-btn im-btn-primary">
            Save Preferences
          </button>
        </div>
      </form>

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
  );
};

export default ThemePage;
