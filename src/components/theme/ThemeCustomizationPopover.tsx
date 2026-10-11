import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMeetings } from '../../context/MeetingContext';
import {
  THEME_PRESETS,
  CURATED_ACCENTS,
  getEffectiveThemeMode,
} from '../../config/themePresets';
import type { ThemeMode, ThemePresetId, AccentColor } from '../../types/meeting';
import { SunIcon, MoonIcon, PaletteIcon } from '../icons';

interface ThemeCustomizationPopoverProps {
  isOpen?: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const ThemeCustomizationPopover: React.FC<ThemeCustomizationPopoverProps> = ({
  isOpen = true,
  onClose,
  triggerRef,
}) => {
  const { preferences, updatePreferences, showToast } = useMeetings();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape key or outside click
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        (!triggerRef?.current || !triggerRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const currentThemeMode: ThemeMode = preferences.theme || 'light';
  const currentPresetId: ThemePresetId = preferences.themePreset || 'signature';
  const currentAccent: AccentColor = preferences.accentColor || 'preset';
  const effectiveMode = getEffectiveThemeMode(currentThemeMode);

  const handleSelectMode = (mode: ThemeMode) => {
    updatePreferences({ theme: mode });
    showToast(
      mode === 'dark'
        ? '🌙 Dark Navy theme activated'
        : mode === 'light'
        ? '☀️ Light Canvas theme activated'
        : '💻 System theme matching activated',
      'info'
    );
  };

  const handleSelectPreset = (presetId: ThemePresetId) => {
    updatePreferences({ themePreset: presetId });
    const p = THEME_PRESETS.find((x) => x.id === presetId);
    showToast(`✨ ${p?.name || presetId} theme activated`, 'success');
  };

  const handleSelectAccent = (accId: AccentColor) => {
    updatePreferences({ accentColor: accId });
    const acc = CURATED_ACCENTS.find((a) => a.id === accId);
    showToast(
      accId === 'preset'
        ? 'Default preset accent restored'
        : `Accent updated to ${acc?.label || accId}!`,
      'success'
    );
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    updatePreferences({
      accentColor: 'custom',
      customAccentHex: hex,
    });
    showToast(`Custom accent set to ${hex}`, 'success');
  };

  return (
    <div
      ref={popoverRef}
      className="im-theme-popover-pro"
      role="dialog"
      aria-label="Theme & Appearance Customizer"
    >
      {/* Popover Header */}
      <div className="im-theme-popover-header">
        <div className="im-theme-popover-header-title">
          <PaletteIcon size={16} style={{ color: 'var(--im-primary)' }} />
          <span>Theme & Appearance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/settings?tab=theme"
            className="im-theme-popover-link"
            onClick={onClose}
          >
            Customize / All Themes →
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme customizer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--im-text-muted)',
              fontSize: '18px',
              lineHeight: 1,
              padding: '2px 4px',
              borderRadius: '4px',
            }}
          >
            &times;
          </button>
        </div>
      </div>

      {/* Popover Scrollable Body */}
      <div className="im-theme-popover-body">
        {/* Section 1: Appearance Mode */}
        <div>
          <div className="im-popover-section-label">
            <span>Appearance Mode</span>
            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
              {currentThemeMode === 'system' ? 'Auto (OS Sync)' : currentThemeMode}
            </span>
          </div>

          <div className="im-theme-mode-row" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`im-theme-mode-btn ${currentThemeMode === 'light' ? 'active' : ''}`}
              onClick={() => handleSelectMode('light')}
              aria-pressed={currentThemeMode === 'light'}
            >
              <SunIcon size={15} />
              <span>Light</span>
            </button>
            <button
              type="button"
              className={`im-theme-mode-btn ${currentThemeMode === 'dark' ? 'active' : ''}`}
              onClick={() => handleSelectMode('dark')}
              aria-pressed={currentThemeMode === 'dark'}
            >
              <MoonIcon size={15} />
              <span>Dark</span>
            </button>
            <button
              type="button"
              className={`im-theme-mode-btn ${currentThemeMode === 'system' ? 'active' : ''}`}
              onClick={() => handleSelectMode('system')}
              aria-pressed={currentThemeMode === 'system'}
            >
              <span style={{ fontSize: '0.85rem' }}>💻</span>
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Section 2: Enterprise Theme Presets (8 Presets) */}
        <div>
          <div className="im-popover-section-label">
            <span>Theme Presets (8)</span>
            <span style={{ fontWeight: 500 }}>
              {THEME_PRESETS.find((p) => p.id === currentPresetId)?.name.split(' ')[0]}
            </span>
          </div>

          <div className="im-popover-preset-grid">
            {THEME_PRESETS.map((preset) => {
              const isSelected = currentPresetId === preset.id;
              const palette = effectiveMode === 'dark' ? preset.dark : preset.light;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`im-popover-preset-tile ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset.id)}
                  title={`${preset.name}: ${preset.tagline}`}
                >
                  <div className="im-popover-preset-dots">
                    <span
                      className="im-popover-dot"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className="im-popover-dot"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <span
                      className="im-popover-dot"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <span className="im-popover-preset-name">
                    {preset.name.replace('IntellMeet ', '')}
                  </span>
                  {isSelected && <span className="im-popover-preset-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Accent Color Customization */}
        <div>
          <div className="im-popover-section-label">
            <span>Accent Highlight</span>
            <span style={{ fontWeight: 500 }}>
              {currentAccent === 'preset'
                ? 'Preset Default'
                : currentAccent === 'custom'
                ? preferences.customAccentHex || 'Custom'
                : CURATED_ACCENTS.find((a) => a.id === currentAccent)?.label}
            </span>
          </div>

          <div className="im-popover-accents-row">
            {/* Preset Default Chip */}
            <button
              type="button"
              className={`im-accent-swatch-chip ${currentAccent === 'preset' ? 'active' : ''}`}
              style={{
                backgroundColor: 'var(--im-bg-surface-hover)',
                border: '1px solid var(--im-border)',
                color: 'var(--im-text-primary)',
              }}
              onClick={() => handleSelectAccent('preset')}
              title="Reset to Theme Preset Default"
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>DEF</span>
            </button>

            {/* Curated Colors */}
            {CURATED_ACCENTS.filter((a) => a.id !== 'preset' && a.id !== 'custom').map((acc) => {
              const isSelected = currentAccent === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  className={`im-accent-swatch-chip ${isSelected ? 'active' : ''}`}
                  style={{ backgroundColor: acc.hex }}
                  onClick={() => handleSelectAccent(acc.id)}
                  title={acc.label}
                  aria-label={`Select ${acc.label} accent`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width={12} height={12}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Custom Color Picker Tool */}
            <div
              className={`im-custom-color-btn ${currentAccent === 'custom' ? 'active' : ''}`}
              title="Pick custom hex color"
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: preferences.customAccentHex || '#ec4899',
                  border: '1px solid rgba(0,0,0,0.15)',
                }}
              />
              <span>Hex Picker</span>
              <input
                ref={colorInputRef}
                type="color"
                className="im-native-color-input"
                value={preferences.customAccentHex || '#ec4899'}
                onChange={handleCustomHexChange}
                aria-label="Custom color picker"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popover Footer */}
      <div className="im-theme-popover-footer">
        <span style={{ fontSize: '0.72rem', color: 'var(--im-text-muted)' }}>
          Syncs across all workspace windows
        </span>
        <Link
          to="/settings?tab=theme"
          className="im-theme-popover-link"
          style={{ fontSize: '0.75rem', fontWeight: 700 }}
          onClick={onClose}
        >
          Full Theme Studio →
        </Link>
      </div>
    </div>
  );
};

export default ThemeCustomizationPopover;
