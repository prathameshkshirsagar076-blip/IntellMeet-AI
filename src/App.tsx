import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPanel from './components/LoginPanel';
import RightPanel from './components/RightPanel';

/* ---- SVG Icons for Floating Route Switcher ---- */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

type AppView = 'landing' | 'login' | 'signup';

const parseViewFromHash = (hash: string): AppView => {
  const clean = hash.toLowerCase().replace(/^[#\/\s]+/, '').split('?')[0].split('&')[0];
  if (clean === 'login') return 'login';
  if (clean === 'signup') return 'signup';
  return 'landing';
};

function App() {
  const [view, setView] = useState<AppView>(() => {
    return parseViewFromHash(window.location.hash);
  });

  useEffect(() => {
    const handleHashChange = () => {
      const nextView = parseViewFromHash(window.location.hash);
      setView(nextView);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: AppView) => {
    setView(newView);
    if (newView === 'landing') {
      window.location.hash = '#/landing';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#/${newView}`;
    }
  };

  return (
    <>
      {/* Dynamic View Rendering */}
      {view === 'login' || view === 'signup' ? (
        <div className="intellmeet-app">
          <aside className="im-left-panel" aria-label="Login panel">
            <LoginPanel 
              mode={view} 
              onSwitchMode={(mode) => navigateTo(mode)} 
              onBackToHome={() => navigateTo('landing')} 
            />
          </aside>
          <main className="im-right-panel" aria-label="AI intelligence panel">
            <RightPanel />
          </main>
        </div>
      ) : (
        <LandingPage 
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignUp={() => navigateTo('signup')}
        />
      )}

      {/* Floating Route Switcher Bar (Always accessible for easy testing & routing) */}
      <nav className="im-floating-route-bar" aria-label="Page Routing Switcher">
        <span className="im-route-label">Pages:</span>
        <button
          type="button"
          className={`im-route-pill-btn ${view === 'landing' ? 'active' : ''}`}
          onClick={() => navigateTo('landing')}
          id="route-btn-landing"
        >
          <HomeIcon />
          <span>Landing Page</span>
        </button>

        <button
          type="button"
          className={`im-route-pill-btn ${view === 'login' ? 'active' : ''}`}
          onClick={() => navigateTo('login')}
          id="route-btn-login"
        >
          <LockIcon />
          <span>Login Page</span>
        </button>

        <button
          type="button"
          className={`im-route-pill-btn ${view === 'signup' ? 'active' : ''}`}
          onClick={() => navigateTo('signup')}
          id="route-btn-signup"
        >
          <UserPlusIcon />
          <span>Sign Up Page</span>
        </button>
      </nav>
    </>
  );
}

export default App;
