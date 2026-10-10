import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import {
  VideoIcon,
  SparkleIcon,
} from '../components/icons';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useMeetings();

  // Local state for editable settings
  const [theme, setTheme] = useState<'light' | 'dark'>(preferences.theme);
  const [micDevice, setMicDevice] = useState(preferences.microphoneDevice);
  const [camDevice, setCamDevice] = useState(preferences.cameraDevice);
  const [speakerDevice, setSpeakerDevice] = useState(preferences.speakerDevice);
  const [autoMute, setAutoMute] = useState(preferences.autoMuteOnJoin);
  const [autoCameraOff, setAutoCameraOff] = useState(preferences.autoTurnOffCameraOnJoin);
  const [emailReminders, setEmailReminders] = useState(preferences.emailReminders);
  const [desktopNotifs, setDesktopNotifs] = useState(preferences.desktopNotifications);
  const [autoAiSummary, setAutoAiSummary] = useState(preferences.aiSummaryAutoGenerate);

  const handleToggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      theme,
      microphoneDevice: micDevice,
      cameraDevice: camDevice,
      speakerDevice,
      autoMuteOnJoin: autoMute,
      autoTurnOffCameraOnJoin: autoCameraOff,
      emailReminders,
      desktopNotifications: desktopNotifs,
      aiSummaryAutoGenerate: autoAiSummary,
    });
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="im-page-header">
        <div className="im-page-title-group">
          <h1 className="im-page-title">User Preferences & Settings</h1>
          <p className="im-page-subtitle">
            Configure your video conferencing devices, AI automation co-pilot, and display theme.
          </p>
        </div>

        <div className="im-page-actions">
          <button className="im-btn im-btn-primary" onClick={handleSaveAll}>
            Save Preferences
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* Appearance & Theme Card */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">Appearance & Theme</h2>
          </div>
          <div className="im-card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--im-text-primary)' }}>
                  Dashboard Interface Theme
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                  Switch between clean light canvas and immersive dark navy night mode.
                </div>
              </div>

              <div className="im-tabs-group">
                <button
                  type="button"
                  className={`im-tab-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleToggleTheme('light')}
                >
                  ☀️ Light Mode
                </button>
                <button
                  type="button"
                  className={`im-tab-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleToggleTheme('dark')}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">Profile Information</h2>
          </div>
          <div className="im-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="im-form-group">
                <label className="im-form-label">Display Name</label>
                <input
                  type="text"
                  className="im-input"
                  defaultValue={user?.name || 'Alex Morgan'}
                  readOnly
                  style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                />
              </div>

              <div className="im-form-group">
                <label className="im-form-label">Email Address</label>
                <input
                  type="email"
                  className="im-input"
                  defaultValue={user?.email || 'alex.morgan@intellmeet.com'}
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

        {/* Hardware Devices Card */}
        <div className="im-card">
          <div className="im-card-header">
            <h2 className="im-card-title">
              <VideoIcon size={18} />
              Audio & Video Hardware (Simulated)
            </h2>
          </div>
          <div className="im-card-body">
            <div className="im-form-group">
              <label htmlFor="settings-mic" className="im-form-label">Default Microphone</label>
              <select
                id="settings-mic"
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
              <label htmlFor="settings-cam" className="im-form-label">Default Camera</label>
              <select
                id="settings-cam"
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
              <label htmlFor="settings-speaker" className="im-form-label">Default Speaker Output</label>
              <select
                id="settings-speaker"
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

        {/* AI & Notifications Card */}
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

          <div className="im-card-footer">
            <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
              SOC2 Type II compliant • Local browser preference persistence
            </span>
            <button type="submit" className="im-btn im-btn-primary">
              Save All Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
