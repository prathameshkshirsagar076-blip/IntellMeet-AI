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

const MonitorIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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
  const { preferences, updatePreferences } = useMeetings();
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
    updatePreferences({ theme: mode }, { silent: true });
  };

  const handleSelectPreset = (presetId: ThemePresetId) => {
    updatePreferences({ themePreset: presetId }, { silent: true });
  };

  const handleSelectAccent = (accId: AccentColor) => {
    updatePreferences({ accentColor: accId }, { silent: true });
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    updatePreferences(
      {
        accentColor: 'custom',
        customAccentHex: hex,
      },
      { silent: true }
    );
  };

  const activePreset = THEME_PRESETS.find((p) => p.id === currentPresetId);

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
          <div className="im-theme-popover-header-icon">
            <PaletteIcon size={15} />
          </div>
          <span>Theme & Appearance</span>
        </div>
        <div className="im-theme-popover-header-actions">
          <Link
            to="/theme"
            className="im-theme-popover-link-pill"
            onClick={onClose}
            title="Open Full Theme Studio"
          >
            <span>Theme Studio</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              width={10}
              height={10}
              aria-hidden="true"
            >
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            className="im-theme-popover-close-btn"
            onClick={onClose}
            aria-label="Close theme customizer"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* Popover Scrollable Body */}
      <div className="im-theme-popover-body">
        {/* Section 1: Appearance Mode */}
        <div className="im-popover-section">
          <div className="im-popover-section-label">
            <span>Appearance Mode</span>
            <span className="im-popover-badge">
              {currentThemeMode === 'system' ? 'Auto (OS)' : currentThemeMode}
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
              <MonitorIcon size={15} />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Section 2: Enterprise Theme Presets (8 Presets) */}
        <div className="im-popover-section">
          <div className="im-popover-section-label">
            <span>Theme Presets ({THEME_PRESETS.length})</span>
            <span className="im-popover-badge">
              {activePreset?.name.replace('IntellMeet ', '')}
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
                  {isSelected && (
                    <span className="im-popover-preset-check" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Accent Color Customization */}
        <div className="im-popover-section">
          <div className="im-popover-section-label">
            <span>Accent Highlight</span>
            <span className="im-popover-badge im-popover-badge-mono">
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
              className={`im-accent-swatch-chip im-accent-swatch-def ${currentAccent === 'preset' ? 'active' : ''}`}
              onClick={() => handleSelectAccent('preset')}
              title="Reset to Theme Preset Default"
            >
              <span>DEF</span>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" width={11} height={11}>
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
                className="im-custom-color-preview-dot"
                style={{
                  backgroundColor: preferences.customAccentHex || '#ec4899',
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
    </div>
  );
};

export default ThemeCustomizationPopover;
