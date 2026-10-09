import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPanel from './components/LoginPanel';
import RightPanel from './components/RightPanel';

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#/login') return 'login';
    if (hash === '#/signup') return 'signup';
    // Starting default is the Landing Page as requested!
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/login') {
        setView('login');
      } else if (hash === '#/signup') {
        setView('signup');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: 'landing' | 'login' | 'signup') => {
    setView(newView);
    if (newView === 'landing') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#/${newView}`;
    }
  };

  // When on login or signup view: show the two-column enterprise workspace login interface
  if (view === 'login' || view === 'signup') {
    return (
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
    );
  }

  // Default view: Full Zoom-style IntellMeet Landing Page
  return (
    <LandingPage 
      onNavigateToLogin={() => navigateTo('login')}
      onNavigateToSignUp={() => navigateTo('signup')}
    />
  );
}

export default App;
