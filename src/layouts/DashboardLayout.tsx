import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import {
  LayoutDashboardIcon,
  VideoIcon,
  CalendarIcon,
  SparkleIcon,
  UsersIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  PlusIcon,
  LogOutIcon,
  ChevronDownIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  ChatIcon,
} from '../components/icons';
import type { AccentColor } from '../types/meeting';
import NewMeetingModal from '../components/NewMeetingModal';
import '../styles/dashboard.css';

// Quick accent color presets for topbar palette
const QUICK_ACCENTS: { id: AccentColor; hex: string; label: string }[] = [
  { id: 'indigo', hex: '#4f46e5', label: 'Indigo' },
  { id: 'blue', hex: '#0284c7', label: 'Ocean' },
  { id: 'emerald', hex: '#059669', label: 'Emerald' },
  { id: 'violet', hex: '#7c3aed', label: 'Violet' },
  { id: 'rose', hex: '#e11d48', label: 'Rose' },
  { id: 'amber', hex: '#d97706', label: 'Amber' },
  { id: 'teal', hex: '#0d9488', label: 'Teal' },
  { id: 'cyan', hex: '#0891b2', label: 'Cyan' },
];

// SVG Icons for Shell
const HistoryClockIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const MenuBurgerIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    openNewMeetingModal,
    isNewMeetingModalOpen,
    closeNewMeetingModal,
    preferences,
    updatePreferences,
    showToast,
  } = useMeetings();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themePopoverRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifPopoverOpen(false);
      }
      if (themePopoverRef.current && !themePopoverRef.current.contains(e.target as Node)) {
        setThemePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleStartInstantMeeting = () => {
    openNewMeetingModal();
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      navigate(`/meetings?q=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  // Determine active breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (location.search.includes('tab=theme')) return 'Theme & Styling';
    if (path.startsWith('/meetings/new')) return 'Schedule Meeting';
    if (path.startsWith('/meetings/join')) return 'Join Meeting';
    if (path.startsWith('/meetings/')) return 'Meeting Details';
    if (path.startsWith('/meetings')) return 'Meetings';
    if (path.startsWith('/history')) return 'Meeting History';
    if (path.startsWith('/ai-notes')) return 'AI Notes & Summaries';
    if (path.startsWith('/team')) return 'Team & Directory';
    if (path.startsWith('/chat')) return 'Direct Messaging & Chat';
    if (path.startsWith('/settings')) return 'Preferences & Settings';
    return 'Dashboard';
  };

  const displayName = user?.name || 'Workspace User';
  const displayAvatar = user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'U');
  const displayEmail = user?.email || '';

  return (
    <div className="im-shell">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="im-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`im-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`} aria-label="Sidebar Navigation">
        <div className="im-sidebar-header">
          <Link to="/dashboard" className="im-sidebar-logo" title="IntellMeet — Meet Smarter With AI">
            <div className="im-sidebar-logo-icon">
              <img
                src="/intellmeet-icon.png"
                alt="IntellMeet"
                className="im-sidebar-logo-img"
              />
            </div>
            <div className="im-sidebar-logo-text">
              <div className="im-sidebar-logo-brand">
                <span className="im-sidebar-logo-intell">Intell</span>
                <span className="im-sidebar-logo-meet">Meet</span>
              </div>
              <span className="im-sidebar-logo-tag">MEET SMARTER WITH AI</span>
            </div>
          </Link>
          {mobileSidebarOpen && (
            <button
              className="im-modal-close"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>

        <nav className="im-sidebar-nav">
          <div className="im-sidebar-section-title">Navigation</div>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <LayoutDashboardIcon size={18} />
            </span>
            <span className="im-nav-item-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/meetings"
            end
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <VideoIcon size={18} />
            </span>
            <span className="im-nav-item-label">Meetings</span>
          </NavLink>

          <NavLink
            to="/meetings?filter=upcoming"
            className={({ isActive }) =>
              `im-nav-item ${isActive && location.search.includes('upcoming') ? 'active' : ''}`
            }
          >
            <span className="im-nav-item-icon">
              <CalendarIcon size={18} />
            </span>
            <span className="im-nav-item-label">My Schedule</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <HistoryClockIcon size={18} />
            </span>
            <span className="im-nav-item-label">Meeting History</span>
          </NavLink>

          <NavLink
            to="/ai-notes"
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <SparkleIcon size={18} />
            </span>
            <span className="im-nav-item-label">AI Notes</span>
            <span className="im-nav-badge">AI</span>
          </NavLink>

          <div className="im-sidebar-section-title">Workspace</div>

          <NavLink
            to="/team"
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <UsersIcon size={18} />
            </span>
            <span className="im-nav-item-label">Team & People</span>
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <ChatIcon size={18} />
            </span>
            <span className="im-nav-item-label">Chat</span>
          </NavLink>

          <NavLink
            to="/settings?tab=theme"
            className={() =>
              `im-nav-item ${location.pathname === '/settings' && location.search.includes('tab=theme') ? 'active' : ''}`
            }
          >
            <span className="im-nav-item-icon">
              <PaletteIcon size={18} />
            </span>
            <span className="im-nav-item-label">Theme & Styling</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `im-nav-item ${isActive && !location.search.includes('tab=theme') ? 'active' : ''}`
            }
          >
            <span className="im-nav-item-icon">
              <SettingsIcon size={18} />
            </span>
            <span className="im-nav-item-label">Settings</span>
          </NavLink>
        </nav>

        <div className="im-sidebar-footer">
          <div className="im-sidebar-workspace-card">
            <div className="im-sidebar-workspace-avatar">ENT</div>
            <div className="im-sidebar-workspace-info">
              <div className="im-sidebar-workspace-name">{user?.company || user?.companyName || 'Enterprise Workspace'}</div>
              <div className="im-sidebar-workspace-plan">Enterprise Tier</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="im-main">
        {/* Sticky Topbar */}
        <header className="im-topbar" role="banner">
          <div className="im-topbar-left">
            <button
              className="im-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <MenuBurgerIcon size={20} />
            </button>

            <div className="im-breadcrumbs">
              <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                IntellMeet
              </Link>
              <span>/</span>
              <span className="im-breadcrumbs-active">{getBreadcrumbTitle()}</span>
            </div>

            <form className="im-topbar-search" onSubmit={handleGlobalSearch}>
              <span className="im-topbar-search-icon">
                <SearchIcon size={16} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="im-topbar-search-input"
                placeholder="Search meetings, recordings, AI notes..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                aria-label="Search dashboard"
              />
              <span className="im-topbar-search-kbd">/</span>
            </form>
          </div>

          <div className="im-topbar-right">
            {/* Quick Actions in Topbar */}
            <button
              className="im-topbar-action-btn im-topbar-action-secondary"
              onClick={() => navigate('/meetings/join')}
            >
              Join Meeting
            </button>

            <button
              className="im-topbar-action-btn im-topbar-action-primary"
              onClick={handleStartInstantMeeting}
            >
              <PlusIcon size={15} />
              New Meeting
            </button>

            {/* Quick Theme & Color Palette Popover */}
            <div className="im-profile-wrapper" ref={themePopoverRef}>
              <button
                className="im-icon-btn"
                onClick={() => setThemePopoverOpen((prev) => !prev)}
                title="Theme Mode & Accent Colors"
                aria-label="Customize theme mode and accent colors"
                aria-expanded={themePopoverOpen}
                style={{ position: 'relative' }}
              >
                {preferences.theme === 'dark' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 3,
                    right: 3,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--im-primary)',
                    boxShadow: '0 0 0 1.5px var(--im-bg-surface)',
                  }}
                />
              </button>

              {themePopoverOpen && (
                <div className="im-theme-popover" role="dialog" aria-label="Theme & Color Customizer">
                  <div className="im-theme-popover-title">
                    <span>Theme & Accent Colors</span>
                    <Link
                      to="/settings?tab=theme"
                      style={{ fontSize: '0.72rem', color: 'var(--im-primary)', textDecoration: 'none', fontWeight: 600 }}
                      onClick={() => setThemePopoverOpen(false)}
                    >
                      All Settings →
                    </Link>
                  </div>

                  {/* Mode Selector */}
                  <div className="im-theme-mode-row">
                    <button
                      type="button"
                      className={`im-theme-mode-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                      onClick={() => {
                        updatePreferences({ theme: 'light' });
                        showToast('☀️ Light Canvas theme activated', 'info');
                      }}
                    >
                      <SunIcon size={15} />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      className={`im-theme-mode-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => {
                        updatePreferences({ theme: 'dark' });
                        showToast('🌙 Dark Navy theme activated', 'info');
                      }}
                    >
                      <MoonIcon size={15} />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      className={`im-theme-mode-btn ${preferences.theme === 'system' ? 'active' : ''}`}
                      onClick={() => {
                        updatePreferences({ theme: 'system' });
                        showToast('💻 System theme sync activated', 'info');
                      }}
                    >
                      <span>💻</span>
                      <span>Auto</span>
                    </button>
                  </div>

                  {/* Quick Color Swatches */}
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--im-text-muted)', marginBottom: 6 }}>
                    Select Accent Color:
                  </div>
                  <div className="im-quick-swatches">
                    {QUICK_ACCENTS.map((acc) => {
                      const isSelected = (preferences.accentColor || 'indigo') === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          className={`im-quick-swatch ${isSelected ? 'active' : ''}`}
                          style={{ backgroundColor: acc.hex }}
                          title={acc.label}
                          onClick={() => {
                            updatePreferences({ accentColor: acc.id });
                            showToast(`Accent updated to ${acc.label}!`, 'success');
                          }}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width={14} height={14}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="im-profile-wrapper" ref={notifRef}>
              <button
                className="im-icon-btn"
                onClick={() => setNotifPopoverOpen((prev) => !prev)}
                aria-label="View notifications"
                aria-expanded={notifPopoverOpen}
              >
                <BellIcon size={18} />
                {unreadNotificationCount > 0 && (
                  <span className="im-icon-badge">{unreadNotificationCount}</span>
                )}
              </button>

              {notifPopoverOpen && (
                <div className="im-notif-popover" role="dialog" aria-label="Notifications center">
                  <div className="im-notif-header">
                    <span className="im-notif-header-title">Notifications</span>
                    <div className="im-notif-actions">
                      <button
                        className="im-notif-btn-link"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all read
                      </button>
                      <span>•</span>
                      <button
                        className="im-notif-btn-link"
                        onClick={clearAllNotifications}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="im-notif-list">
                    {notifications.length === 0 ? (
                      <div className="im-empty-state" style={{ padding: '24px 16px' }}>
                        <p className="im-empty-state-desc" style={{ margin: 0 }}>
                          No notifications at this time.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`im-notif-item ${notif.read ? 'read' : 'unread'}`}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.actionUrl) {
                              navigate(notif.actionUrl);
                              setNotifPopoverOpen(false);
                            }
                          }}
                        >
                          <div className="im-notif-dot" />
                          <div className="im-notif-content">
                            <div className="im-notif-item-title">{notif.title}</div>
                            <div className="im-notif-item-msg">{notif.message}</div>
                            <div className="im-notif-item-time">{notif.timestamp}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="im-profile-wrapper" ref={profileRef}>
              <button
                className="im-profile-trigger"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-label="Open profile menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="im-profile-avatar">{displayAvatar}</div>
                <span className="im-profile-name">{displayName}</span>
                <ChevronDownIcon size={14} style={{ color: 'var(--im-text-muted)' }} />
              </button>

              {profileDropdownOpen && (
                <div className="im-dropdown" role="menu">
                  <div className="im-dropdown-header">
                    <div className="im-dropdown-user-name">{displayName}</div>
                    <div className="im-dropdown-user-email">{displayEmail}</div>
                  </div>

                  <button
                    className="im-dropdown-item"
                    onClick={() => {
                      navigate('/settings?tab=theme');
                      setProfileDropdownOpen(false);
                    }}
                    role="menuitem"
                  >
                    <PaletteIcon size={16} />
                    Theme & Colors
                  </button>

                  <button
                    className="im-dropdown-item"
                    onClick={() => {
                      navigate('/settings');
                      setProfileDropdownOpen(false);
                    }}
                    role="menuitem"
                  >
                    <SettingsIcon size={16} />
                    Account Settings
                  </button>

                  <button
                    className="im-dropdown-item"
                    onClick={() => {
                      navigate('/meetings/new');
                      setProfileDropdownOpen(false);
                    }}
                    role="menuitem"
                  >
                    <CalendarIcon size={16} />
                    Schedule Meeting
                  </button>

                  <button
                    className="im-dropdown-item"
                    onClick={() => {
                      navigate('/ai-notes');
                      setProfileDropdownOpen(false);
                    }}
                    role="menuitem"
                  >
                    <SparkleIcon size={16} />
                    AI Transcripts
                  </button>

                  <div className="im-dropdown-divider" />

                  <button
                    className="im-dropdown-item danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOutIcon size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main
          className={`im-content ${
            location.pathname.startsWith('/chat')
              ? 'im-chat-content-mode'
              : location.pathname.startsWith('/team')
              ? 'im-team-content-mode'
              : ''
          }`}
          role="main"
        >
          <Outlet />
        </main>
      </div>

      {/* Zoom-Style Instant New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={closeNewMeetingModal}
      />
    </div>
  );
};

export default DashboardLayout;
