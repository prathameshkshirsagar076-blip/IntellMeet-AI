import type { ThemePresetId, AccentColor, ThemeMode, UserPreferences } from '../types/meeting';

export interface ThemeColorPalette {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  secondary: string;
  accent: string;
  bgCanvas: string;
  bgSurface: string;
  bgSurfaceHover: string;
  bgSubtle: string;
  bgSidebar: string;
  bgSidebarHover: string;
  bgSidebarActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textSidebar: string;
  textSidebarActive: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  borderSidebar: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  tagline: string;
  description: string;
  swatches: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  };
  light: ThemeColorPalette;
  dark: ThemeColorPalette;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'signature',
    name: 'IntellMeet Signature',
    tagline: 'Indigo, electric violet, clean white surfaces',
    description: 'The iconic IntellMeet aesthetic with enterprise indigo, balanced violet accents, and high-clarity surfaces.',
    swatches: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      accent: '#6366f1',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
    },
    light: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      primaryLight: '#eef2ff',
      primaryText: '#4338ca',
      secondary: '#7c3aed',
      accent: '#6366f1',
      bgCanvas: '#f8fafc',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#f1f5f9',
      bgSubtle: '#f8fafc',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#f1f5f9',
      bgSidebarActive: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      textSidebar: '#475569',
      textSidebarActive: '#ffffff',
      border: '#e2e8f0',
      borderSubtle: '#f1f5f9',
      borderFocus: '#4f46e5',
      borderSidebar: '#e2e8f0',
    },
    dark: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      primaryLight: 'rgba(99, 102, 241, 0.22)',
      primaryText: '#a5b4fc',
      secondary: '#a855f7',
      accent: '#818cf8',
      bgCanvas: '#090d16',
      bgSurface: '#111827',
      bgSurfaceHover: '#1f2937',
      bgSubtle: '#161e2e',
      bgSidebar: '#060911',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#6366f1',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      textSidebar: '#94a3b8',
      textSidebarActive: '#ffffff',
      border: '#1f2937',
      borderSubtle: '#172033',
      borderFocus: '#6366f1',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Professional',
    tagline: 'Deep navy, ocean blue, cyan highlights',
    description: 'Crisp maritime palette engineered for analytical focus, executive readability, and calming high-seas depth.',
    swatches: {
      primary: '#0284c7',
      secondary: '#0ea5e9',
      accent: '#06b6d4',
      background: '#f0f9ff',
      surface: '#ffffff',
      border: '#bae6fd',
    },
    light: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryLight: '#e0f2fe',
      primaryText: '#0284c7',
      secondary: '#0ea5e9',
      accent: '#06b6d4',
      bgCanvas: '#f0f9ff',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#e0f2fe',
      bgSubtle: '#f8fafc',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#e0f2fe',
      bgSidebarActive: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      textPrimary: '#082f49',
      textSecondary: '#0c4a6e',
      textMuted: '#475569',
      textSidebar: '#334155',
      textSidebarActive: '#ffffff',
      border: '#bae6fd',
      borderSubtle: '#e0f2fe',
      borderFocus: '#0284c7',
      borderSidebar: '#bae6fd',
    },
    dark: {
      primary: '#38bdf8',
      primaryHover: '#0284c7',
      primaryLight: 'rgba(2, 132, 199, 0.22)',
      primaryText: '#7dd3fc',
      secondary: '#0ea5e9',
      accent: '#22d3ee',
      bgCanvas: '#031726',
      bgSurface: '#082f49',
      bgSurfaceHover: '#0c4a6e',
      bgSubtle: '#0a3d5e',
      bgSidebar: '#02111b',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#38bdf8',
      textPrimary: '#f0f9ff',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      textSidebar: '#7dd3fc',
      textSidebarActive: '#ffffff',
      border: '#0e4973',
      borderSubtle: '#0a3857',
      borderFocus: '#38bdf8',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Executive',
    tagline: 'Deep emerald, mint accents, neutral surfaces',
    description: 'Distinguished botanical and financial theme that promotes calm productivity and strategic decision-making.',
    swatches: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#f2fbf7',
      surface: '#ffffff',
      border: '#a7f3d0',
    },
    light: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#ecfdf5',
      primaryText: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      bgCanvas: '#f2fbf7',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#ecfdf5',
      bgSubtle: '#f8fafc',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#ecfdf5',
      bgSidebarActive: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      textPrimary: '#064e3b',
      textSecondary: '#065f46',
      textMuted: '#4b5563',
      textSidebar: '#334155',
      textSidebarActive: '#ffffff',
      border: '#a7f3d0',
      borderSubtle: '#d1fae5',
      borderFocus: '#059669',
      borderSidebar: '#d1fae5',
    },
    dark: {
      primary: '#34d399',
      primaryHover: '#059669',
      primaryLight: 'rgba(5, 150, 105, 0.22)',
      primaryText: '#6ee7b7',
      secondary: '#10b981',
      accent: '#6ee7b7',
      bgCanvas: '#02241b',
      bgSurface: '#064e3b',
      bgSurfaceHover: '#065f46',
      bgSubtle: '#04382a',
      bgSidebar: '#011711',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#34d399',
      textPrimary: '#ecfdf5',
      textSecondary: '#a7f3d0',
      textMuted: '#6ee7b7',
      textSidebar: '#a7f3d0',
      textSidebarActive: '#ffffff',
      border: '#0a634c',
      borderSubtle: '#074535',
      borderFocus: '#34d399',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Pro',
    tagline: 'Near-black navy, violet highlights, subtle borders',
    description: 'Designed for intensive low-light focus. Ultra-deep slate tones accented with neon violet and disciplined borders.',
    swatches: {
      primary: '#312e81',
      secondary: '#4338ca',
      accent: '#6366f1',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#cbd5e1',
    },
    light: {
      primary: '#312e81',
      primaryHover: '#1e1b4b',
      primaryLight: '#e0e7ff',
      primaryText: '#312e81',
      secondary: '#4338ca',
      accent: '#6366f1',
      bgCanvas: '#f8fafc',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#eef2ff',
      bgSubtle: '#f1f5f9',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#eef2ff',
      bgSidebarActive: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textMuted: '#64748b',
      textSidebar: '#334155',
      textSidebarActive: '#ffffff',
      border: '#cbd5e1',
      borderSubtle: '#e2e8f0',
      borderFocus: '#312e81',
      borderSidebar: '#cbd5e1',
    },
    dark: {
      primary: '#818cf8',
      primaryHover: '#6366f1',
      primaryLight: 'rgba(99, 102, 241, 0.25)',
      primaryText: '#c7d2fe',
      secondary: '#a5b4fc',
      accent: '#c7d2fe',
      bgCanvas: '#030712',
      bgSurface: '#0b0f19',
      bgSurfaceHover: '#131b2e',
      bgSubtle: '#0f172a',
      bgSidebar: '#02040a',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#818cf8',
      textPrimary: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      textSidebar: '#cbd5e1',
      textSidebarActive: '#ffffff',
      border: '#1e293b',
      borderSubtle: '#111827',
      borderFocus: '#818cf8',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Minimal',
    tagline: 'Cool whites, slate gray, icy blue accents',
    description: 'Clean Scandinavian-inspired minimalism with glacial blue accents, subtle shadows, and crisp typographic hierarchy.',
    swatches: {
      primary: '#0284c7',
      secondary: '#64748b',
      accent: '#38bdf8',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
    },
    light: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryLight: '#f0f9ff',
      primaryText: '#0284c7',
      secondary: '#64748b',
      accent: '#38bdf8',
      bgCanvas: '#f8fafc',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#f1f5f9',
      bgSubtle: '#f8fafc',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#f0f9ff',
      bgSidebarActive: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      textSidebar: '#334155',
      textSidebarActive: '#ffffff',
      border: '#e2e8f0',
      borderSubtle: '#f1f5f9',
      borderFocus: '#0284c7',
      borderSidebar: '#e2e8f0',
    },
    dark: {
      primary: '#38bdf8',
      primaryHover: '#0284c7',
      primaryLight: 'rgba(56, 189, 248, 0.2)',
      primaryText: '#7dd3fc',
      secondary: '#94a3b8',
      accent: '#7dd3fc',
      bgCanvas: '#0b111a',
      bgSurface: '#121a26',
      bgSurfaceHover: '#1c2838',
      bgSubtle: '#15202e',
      bgSidebar: '#080c12',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#38bdf8',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      textSidebar: '#94a3b8',
      textSidebarActive: '#ffffff',
      border: '#1e293b',
      borderSubtle: '#162130',
      borderFocus: '#38bdf8',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    tagline: 'Deep purple, lavender, soft neutral surfaces',
    description: 'Sophisticated amethyst and royal violet palette curated for creative leadership, design studios, and high-impact meetings.',
    swatches: {
      primary: '#7e22ce',
      secondary: '#9333ea',
      accent: '#a855f7',
      background: '#faf5ff',
      surface: '#ffffff',
      border: '#e9d5ff',
    },
    light: {
      primary: '#7e22ce',
      primaryHover: '#6b21a8',
      primaryLight: '#f3e8ff',
      primaryText: '#7e22ce',
      secondary: '#9333ea',
      accent: '#a855f7',
      bgCanvas: '#faf5ff',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#f3e8ff',
      bgSubtle: '#faf5ff',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#f3e8ff',
      bgSidebarActive: 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)',
      textPrimary: '#3b0764',
      textSecondary: '#581c87',
      textMuted: '#6b7280',
      textSidebar: '#475569',
      textSidebarActive: '#ffffff',
      border: '#e9d5ff',
      borderSubtle: '#f3e8ff',
      borderFocus: '#7e22ce',
      borderSidebar: '#e9d5ff',
    },
    dark: {
      primary: '#c084fc',
      primaryHover: '#a855f7',
      primaryLight: 'rgba(168, 85, 247, 0.22)',
      primaryText: '#d8b4fe',
      secondary: '#d8b4fe',
      accent: '#e9d5ff',
      bgCanvas: '#140524',
      bgSurface: '#260b42',
      bgSurfaceHover: '#381161',
      bgSubtle: '#1f0936',
      bgSidebar: '#0e0319',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#c084fc',
      textPrimary: '#faf5ff',
      textSecondary: '#e9d5ff',
      textMuted: '#c084fc',
      textSidebar: '#e9d5ff',
      textSidebarActive: '#ffffff',
      border: '#3b0764',
      borderSubtle: '#2c084a',
      borderFocus: '#c084fc',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Coral',
    tagline: 'Warm coral, muted orange, sophisticated cream surfaces',
    description: 'Inviting and energetic warm palette with terracotta tones, amber highlights, and friendly collaborative surfaces.',
    swatches: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#fffaf5',
      surface: '#ffffff',
      border: '#fed7aa',
    },
    light: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      primaryLight: '#ffedd5',
      primaryText: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      bgCanvas: '#fffaf5',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#fff1e6',
      bgSubtle: '#fff7ed',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#ffedd5',
      bgSidebarActive: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      textPrimary: '#431407',
      textSecondary: '#7c2d12',
      textMuted: '#78716c',
      textSidebar: '#475569',
      textSidebarActive: '#ffffff',
      border: '#fed7aa',
      borderSubtle: '#ffedd5',
      borderFocus: '#ea580c',
      borderSidebar: '#fed7aa',
    },
    dark: {
      primary: '#fb923c',
      primaryHover: '#ea580c',
      primaryLight: 'rgba(234, 88, 12, 0.22)',
      primaryText: '#fdba74',
      secondary: '#f97316',
      accent: '#fdba74',
      bgCanvas: '#1c0b05',
      bgSurface: '#2c1208',
      bgSurfaceHover: '#3e1a0b',
      bgSubtle: '#240f06',
      bgSidebar: '#130703',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#fb923c',
      textPrimary: '#fff7ed',
      textSecondary: '#fed7aa',
      textMuted: '#fdba74',
      textSidebar: '#fed7aa',
      textSidebarActive: '#ffffff',
      border: '#431407',
      borderSubtle: '#351006',
      borderFocus: '#fb923c',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite Elite',
    tagline: 'Charcoal, cool gray, restrained blue highlights',
    description: 'Subtle monochrome architecture engineered for minimal distraction, engineering rigor, and dark obsidian elegance.',
    swatches: {
      primary: '#475569',
      secondary: '#64748b',
      accent: '#0284c7',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#cbd5e1',
    },
    light: {
      primary: '#475569',
      primaryHover: '#334155',
      primaryLight: '#f1f5f9',
      primaryText: '#334155',
      secondary: '#64748b',
      accent: '#0284c7',
      bgCanvas: '#f8fafc',
      bgSurface: '#ffffff',
      bgSurfaceHover: '#f1f5f9',
      bgSubtle: '#f8fafc',
      bgSidebar: '#ffffff',
      bgSidebarHover: '#f1f5f9',
      bgSidebarActive: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      textSidebar: '#334155',
      textSidebarActive: '#ffffff',
      border: '#cbd5e1',
      borderSubtle: '#e2e8f0',
      borderFocus: '#475569',
      borderSidebar: '#cbd5e1',
    },
    dark: {
      primary: '#94a3b8',
      primaryHover: '#64748b',
      primaryLight: 'rgba(148, 163, 184, 0.2)',
      primaryText: '#cbd5e1',
      secondary: '#cbd5e1',
      accent: '#38bdf8',
      bgCanvas: '#090d14',
      bgSurface: '#111622',
      bgSurfaceHover: '#1a2030',
      bgSubtle: '#151c2b',
      bgSidebar: '#06080e',
      bgSidebarHover: 'rgba(255, 255, 255, 0.08)',
      bgSidebarActive: '#94a3b8',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      textSidebar: '#94a3b8',
      textSidebarActive: '#ffffff',
      border: '#1e293b',
      borderSubtle: '#172033',
      borderFocus: '#94a3b8',
      borderSidebar: 'rgba(255, 255, 255, 0.08)',
    },
  },
];

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'signature';

export function getThemePreset(id?: string): ThemePreset {
  const match = THEME_PRESETS.find((p) => p.id === id);
  return match || THEME_PRESETS[0];
}

export interface CuratedAccent {
  id: AccentColor;
  label: string;
  hex: string;
  description: string;
}

export const CURATED_ACCENTS: CuratedAccent[] = [
  { id: 'preset', label: 'Preset Default', hex: '', description: 'Follow current theme preset accent' },
  { id: 'indigo', label: 'Indigo Blurple', hex: '#4f46e5', description: 'Enterprise standard' },
  { id: 'blue', label: 'Ocean Blue', hex: '#0284c7', description: 'Precision and clarity' },
  { id: 'emerald', label: 'Emerald Mint', hex: '#059669', description: 'Vibrant and productive' },
  { id: 'violet', label: 'Royal Violet', hex: '#7c3aed', description: 'Creative & AI-centric' },
  { id: 'rose', label: 'Crimson Rose', hex: '#e11d48', description: 'Bold and energetic' },
  { id: 'amber', label: 'Warm Amber', hex: '#d97706', description: 'Warm and collaborative' },
  { id: 'teal', label: 'Teal Mint', hex: '#0d9488', description: 'Fresh and balanced' },
  { id: 'cyan', label: 'Sky Cyan', hex: '#0891b2', description: 'Modern and focused' },
  { id: 'custom', label: 'Custom Accent', hex: '#ec4899', description: 'Custom chosen hex tone' },
];

export function getEffectiveThemeMode(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Apply theme variables, preset, and accents globally to documentElement.
 */
export function applyThemeToDom(preferences: Partial<UserPreferences>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const themeMode = preferences.theme || 'light';
  const presetId = preferences.themePreset || DEFAULT_THEME_PRESET_ID;
  const accent = preferences.accentColor || 'preset';
  const customHex = preferences.customAccentHex;

  const isDark = getEffectiveThemeMode(themeMode) === 'dark';

  // 1. Toggle dark-mode class
  root.classList.toggle('dark-mode', isDark);

  // 2. Set data-theme attribute
  root.setAttribute('data-theme', presetId);

  // 3. Set data-accent attribute
  root.setAttribute('data-accent', accent);

  // 4. Accessibility classes
  root.classList.toggle('high-contrast', Boolean(preferences.highContrast));
  root.classList.toggle('reduced-motion', Boolean(preferences.reducedMotion));

  // 5. Handle Custom Accent color or override
  if (accent === 'custom' && customHex) {
    root.style.setProperty('--im-primary', customHex);
    root.style.setProperty('--im-border-focus', customHex);
    root.style.setProperty('--im-primary-hover', adjustHexBrightness(customHex, isDark ? 15 : -15));
    root.style.setProperty(
      '--im-primary-light',
      isDark ? hexToRgba(customHex, 0.22) : hexToRgba(customHex, 0.12)
    );
    root.style.setProperty('--im-primary-text', isDark ? lightenHex(customHex, 20) : customHex);
    root.style.setProperty('--color-primary', customHex);
    root.style.setProperty('--color-focus-ring', customHex);
    root.style.setProperty(
      '--im-bg-sidebar-active',
      `linear-gradient(135deg, ${customHex} 0%, ${adjustHexBrightness(customHex, isDark ? 15 : -15)} 100%)`
    );
    root.style.setProperty('--im-primary-shadow', `0 4px 14px ${hexToRgba(customHex, 0.35)}`);
  } else {
    // Clear inline custom accent overrides so CSS data-accent and data-theme apply smoothly
    root.style.removeProperty('--im-primary');
    root.style.removeProperty('--im-border-focus');
    root.style.removeProperty('--im-primary-hover');
    root.style.removeProperty('--im-primary-light');
    root.style.removeProperty('--im-primary-text');
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-focus-ring');
    root.style.removeProperty('--im-bg-sidebar-active');
    root.style.removeProperty('--im-primary-shadow');
  }
}

/**
 * Helper to adjust hex color brightness
 */
function adjustHexBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function lightenHex(hex: string, percent: number): string {
  return adjustHexBrightness(hex, percent);
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(79, 70, 229, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
