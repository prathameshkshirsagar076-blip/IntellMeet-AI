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
  BrainIcon,
} from '../components/icons';
import NewMeetingModal from '../components/NewMeetingModal';
import { ThemeCustomizationPopover } from '../components/theme/ThemeCustomizationPopover';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import UserAvatar from '../components/common/UserAvatar';
import '../styles/dashboard.css';

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
    if (path.startsWith('/theme') || location.search.includes('tab=theme')) return 'Theme & Styling';
    if (path.startsWith('/meetings/new')) return 'Schedule Meeting';
    if (path.startsWith('/meetings/join')) return 'Join Meeting';
    if (path.startsWith('/meetings/') && path !== '/meetings') return 'Meeting Details';
    if (path.startsWith('/schedule')) return 'My Schedule & Calendar';
    if (path.startsWith('/meetings') && location.search.includes('filter=upcoming')) return 'Upcoming Meetings';
    if (path.startsWith('/meetings')) return 'Meetings Management';
    if (path.startsWith('/history')) return 'Meeting History';
    if (path.startsWith('/ai-notes')) return 'AI Notes & Summaries';
    if (path.startsWith('/ai-assistant') || path.startsWith('/dashboard/ai-assistant')) return 'AI Assistant';
    if (path.startsWith('/team')) return 'Team & Directory';
    if (path.startsWith('/chat')) return 'Direct Messaging & Chat';
    if (path.startsWith('/settings')) return 'Preferences & Settings';
    return 'Dashboard';
  };

  const displayName = user?.name || 'Workspace User';
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
            onClick={() => setMobileSidebarOpen(false)}
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
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <VideoIcon size={18} />
            </span>
            <span className="im-nav-item-label">Meetings</span>
          </NavLink>

          <NavLink
            to="/schedule"
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <CalendarIcon size={18} />
            </span>
            <span className="im-nav-item-label">My Schedule</span>
          </NavLink>

          <NavLink
            to="/history"
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <HistoryClockIcon size={18} />
            </span>
            <span className="im-nav-item-label">Meeting History</span>
          </NavLink>

          <NavLink
            to="/ai-notes"
            onClick={() => setMobileSidebarOpen(false)}
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
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <UsersIcon size={18} />
            </span>
            <span className="im-nav-item-label">Team & People</span>
          </NavLink>

          <NavLink
            to="/chat"
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) => `im-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="im-nav-item-icon">
              <ChatIcon size={18} />
            </span>
            <span className="im-nav-item-label">Chat</span>
          </NavLink>

          <NavLink
            to="/ai-assistant"
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `im-nav-item ${isActive || location.pathname.startsWith('/dashboard/ai-assistant') ? 'active' : ''}`
            }
          >
            <span className="im-nav-item-icon">
              <BrainIcon size={18} />
            </span>
            <span className="im-nav-item-label">AI Assistant</span>
            <span className="im-nav-badge">AI</span>
          </NavLink>

          <NavLink
            to="/theme"
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `im-nav-item ${isActive || (location.pathname === '/settings' && location.search.includes('tab=theme')) ? 'active' : ''}`
            }
          >
            <span className="im-nav-item-icon">
              <PaletteIcon size={18} />
            </span>
            <span className="im-nav-item-label">Theme & Styling</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setMobileSidebarOpen(false)}
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
      <div
        className={`im-main ${location.pathname.startsWith('/chat') ? 'im-main-chat-mode' : ''} ${
          location.pathname.startsWith('/ai-assistant') || location.pathname.startsWith('/dashboard/ai-assistant')
            ? 'im-main-ai-mode'
            : ''
        }`}
      >
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
              title="New Meeting"
              aria-label="New Meeting"
            >
              <PlusIcon size={15} />
              <span className="im-topbar-action-text">New Meeting</span>
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

              <ThemeCustomizationPopover
                isOpen={themePopoverOpen}
                onClose={() => setThemePopoverOpen(false)}
              />
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
                <UserAvatar avatar={user?.avatar} name={displayName} className="im-profile-avatar" />
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
                      navigate('/theme');
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
                    Workspace Settings
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
          <ErrorBoundary fallbackTitle="Page Content Error">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock (≤ 768px, hidden in chat/ai modes to maximize screen estate) */}
      {!location.pathname.startsWith('/chat') &&
        !location.pathname.startsWith('/ai-assistant') &&
        !location.pathname.startsWith('/dashboard/ai-assistant') && (
          <nav className="im-bottom-nav" aria-label="Mobile Navigation Dock">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `im-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label="Dashboard"
            >
              <LayoutDashboardIcon size={19} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/meetings"
              end
              className={({ isActive }) => `im-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label="Meetings"
            >
              <VideoIcon size={19} />
              <span>Meetings</span>
            </NavLink>

            <button
              type="button"
              className="im-bottom-nav-fab"
              onClick={handleStartInstantMeeting}
              title="Instant New Meeting"
              aria-label="Start instant new meeting"
            >
              <PlusIcon size={20} />
            </button>

            <NavLink
              to="/ai-assistant"
              className={({ isActive }) =>
                `im-bottom-nav-item ${
                  isActive || location.pathname.startsWith('/dashboard/ai-assistant') ? 'active' : ''
                }`
              }
              aria-label="AI Assistant"
            >
              <BrainIcon size={19} />
              <span>AI Chat</span>
            </NavLink>

            <button
              type="button"
              className={`im-bottom-nav-item ${mobileSidebarOpen ? 'active' : ''}`}
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              aria-label="Open navigation menu drawer"
              aria-expanded={mobileSidebarOpen}
            >
              <MenuBurgerIcon size={19} />
              <span>Menu</span>
            </button>
          </nav>
        )}

      {/* Zoom-Style Instant New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={closeNewMeetingModal}
      />
    </div>
  );
};

export default DashboardLayout;
