import React from 'react';
import type { ThemePreset } from '../../config/themePresets';
import { ThemeMiniPreview } from './ThemeMiniPreview';

interface ThemePreviewCardProps {
  preset: ThemePreset;
  isSelected: boolean;
  effectiveMode: 'light' | 'dark';
  onSelect: (presetId: ThemePreset['id']) => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  preset,
  isSelected,
  effectiveMode,
  onSelect,
}) => {
  const currentPalette = effectiveMode === 'dark' ? preset.dark : preset.light;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={`im-theme-preview-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(preset.id)}
      aria-label={`Select ${preset.name} theme preset`}
    >
      {/* Selected Indicator Badge */}
      {isSelected && (
        <div className="im-theme-selected-badge" title="Active Theme">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width={14} height={14}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Realistic Miniature Dashboard Preview */}
      <ThemeMiniPreview preset={preset} mode={effectiveMode} />

      {/* Coordinated Color Palette Swatches Bar */}
      <div className="im-theme-palette-labels">
        <span>Palette Tokens</span>
        <span>{effectiveMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
      </div>
      <div className="im-theme-palette-swatches">
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.primary }}
          title={`Primary: ${currentPalette.primary}`}
        />
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.secondary }}
          title={`Secondary: ${currentPalette.secondary}`}
        />
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.accent }}
          title={`Accent: ${currentPalette.accent}`}
        />
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.bgCanvas }}
          title={`Background: ${currentPalette.bgCanvas}`}
        />
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.bgSurface }}
          title={`Surface: ${currentPalette.bgSurface}`}
        />
        <div
          className="im-theme-palette-swatch-item"
          style={{ backgroundColor: currentPalette.border }}
          title={`Border: ${currentPalette.border}`}
        />
      </div>

      {/* Theme Info */}
      <div className="im-theme-card-info">
        <h3 className="im-theme-card-title">
          {preset.name}
        </h3>
        <div className="im-theme-card-tagline">
          {preset.tagline}
        </div>
        <p className="im-theme-card-desc">
          {preset.description}
        </p>
      </div>
    </button>
  );
};
