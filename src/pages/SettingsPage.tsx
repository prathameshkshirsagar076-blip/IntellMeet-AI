import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeetings } from '../context/MeetingContext';
import {
  SettingsIcon,
  UserIcon,
  BuildingIcon,
  VideoIcon,
  SparkleIcon,
  BellIcon,
  ShieldCheckIcon,
  ShieldIcon,
  CheckCircleIcon,
  MicIcon,
  Volume2Icon,
  LaptopIcon,
  SmartphoneIcon,
  GlobeIcon,
  DownloadIcon,
  RefreshCwIcon,
  PaletteIcon,
  ExternalLinkIcon,
  CameraIcon,
  ClockIcon,
} from '../components/icons';
import UserAvatar from '../components/common/UserAvatar';

type SettingsTab =
  | 'general'
  | 'profile'
  | 'meetings'
  | 'hardware'
  | 'ai'
  | 'notifications'
  | 'security';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // If someone directly lands on ?tab=theme, redirect to dedicated /theme page
  if (tabParam === 'theme') {
    return <Navigate to="/theme" replace />;
  }

  const { user } = useAuth();
  const { preferences, updatePreferences, showToast } = useMeetings();

  // Active tab state (defaults to 'general' or whatever is in URL)
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (
      tabParam === 'profile' ||
      tabParam === 'meetings' ||
      tabParam === 'hardware' ||
      tabParam === 'ai' ||
      tabParam === 'notifications' ||
      tabParam === 'security'
    ) {
      return tabParam;
    }
    return 'general';
  });

  // --- GENERAL & WORKSPACE STATES ---
  const [workspaceName, setWorkspaceName] = useState(
    preferences.workspaceName || user?.company || 'IntellMeet Enterprise Workspace'
  );
  const [workspaceSlug, setWorkspaceSlug] = useState(preferences.workspaceSlug || 'intellmeet-hq');
  const [language, setLanguage] = useState(preferences.language || 'en');
  const [timezone, setTimezone] = useState(preferences.timezone || 'Asia/Kolkata (IST +05:30)');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(preferences.timeFormat || '12h');
  const [autoStartOnBoot, setAutoStartOnBoot] = useState(Boolean(preferences.autoStartOnBoot));

  // --- PROFILE & IDENTITY STATES ---
  const [displayName, setDisplayName] = useState(user?.name || 'Prathamesh Kshirsagar');
  const [email] = useState(user?.email || 'prathamesh@intellmeet.ai');
  const [jobTitle, setJobTitle] = useState(preferences.jobTitle || 'Product Lead & Enterprise Architect');
  const [department, setDepartment] = useState(preferences.department || 'Product & Engineering');
  const [phoneNumber, setPhoneNumber] = useState(preferences.phoneNumber || '+91 98765 43210');
  const [statusMessage, setStatusMessage] = useState(preferences.statusMessage || '🟢 Available for calls');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    preferences.twoFactorEnabled !== undefined ? preferences.twoFactorEnabled : true
  );

  // --- MEETING DEFAULTS STATES ---
  const [autoMute, setAutoMute] = useState(preferences.autoMuteOnJoin);
  const [autoCameraOff, setAutoCameraOff] = useState(preferences.autoTurnOffCameraOnJoin);
  const [waitingRoom, setWaitingRoom] = useState(
    preferences.waitingRoomEnabled !== undefined ? preferences.waitingRoomEnabled : true
  );
  const [waitingRoomMessage, setWaitingRoomMessage] = useState(
    preferences.waitingRoomMessage || 'Welcome to our meeting room! The host will admit you shortly.'
  );
  const [joinBeforeHost, setJoinBeforeHost] = useState(Boolean(preferences.joinBeforeHost));
  const [endMeetingForAll, setEndMeetingForAll] = useState(
    preferences.endMeetingForAllOnLeave !== undefined ? preferences.endMeetingForAllOnLeave : true
  );
  const [allowScreenShare, setAllowScreenShare] = useState(
    preferences.allowParticipantScreenShare !== undefined ? preferences.allowParticipantScreenShare : true
  );
  const [allowChat, setAllowChat] = useState(
    preferences.allowParticipantChat !== undefined ? preferences.allowParticipantChat : true
  );
  const [allowReactions, setAllowReactions] = useState(
    preferences.allowParticipantReactions !== undefined ? preferences.allowParticipantReactions : true
  );
  const [watermarkVideo, setWatermarkVideo] = useState(Boolean(preferences.watermarkVideo));
  const [enforcePasscode, setEnforcePasscode] = useState(
    preferences.enforceMeetingPasscode !== undefined ? preferences.enforceMeetingPasscode : true
  );

  // --- AUDIO & VIDEO LAB STATES ---
  const [micDevice, setMicDevice] = useState(preferences.microphoneDevice);
  const [camDevice, setCamDevice] = useState(preferences.cameraDevice);
  const [speakerDevice, setSpeakerDevice] = useState(preferences.speakerDevice);
  const [noiseSuppression, setNoiseSuppression] = useState<'off' | 'low' | 'studio'>(
    preferences.noiseSuppression || 'studio'
  );
  const [echoCancellation, setEchoCancellation] = useState(
    preferences.echoCancellation !== undefined ? preferences.echoCancellation : true
  );
  const [autoGainControl, setAutoGainControl] = useState(
    preferences.autoGainControl !== undefined ? preferences.autoGainControl : true
  );
  const [speakerVolume, setSpeakerVolume] = useState<number>(preferences.speakerVolume || 85);
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '4k'>(
    preferences.videoQuality || '1080p'
  );
  const [mirrorVideo, setMirrorVideo] = useState(
    preferences.mirrorVideo !== undefined ? preferences.mirrorVideo : true
  );
  const [lowLightComp, setLowLightComp] = useState(
    preferences.lowLightCompensation !== undefined ? preferences.lowLightCompensation : true
  );
  const [virtualBg, setVirtualBg] = useState<string>(preferences.virtualBackground || 'soft_blur');

  // Interactive Hardware Test States
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const micIntervalRef = useRef<number | null>(null);

  const [isPlayingSpeakerTone, setIsPlayingSpeakerTone] = useState<boolean>(false);
  const [isCameraPreviewOn, setIsCameraPreviewOn] = useState<boolean>(false);

  // --- AI AUTOMATION STATES ---
  const [autoAiSummary, setAutoAiSummary] = useState(preferences.aiSummaryAutoGenerate);
  const [aiPersona, setAiPersona] = useState<'executive' | 'technical' | 'action_items'>(
    preferences.aiPersona || 'executive'
  );
  const [smartAssignees, setSmartAssignees] = useState(
    preferences.smartAssigneeDetection !== undefined ? preferences.smartAssigneeDetection : true
  );
  const [aiAutoJoinPolicy, setAiAutoJoinPolicy] = useState<'always' | 'recording_only' | 'never'>(
    preferences.aiAutoJoinPolicy || 'recording_only'
  );
  const [liveSubtitles, setLiveSubtitles] = useState(Boolean(preferences.liveSubtitles));
  const [liveTranslation, setLiveTranslation] = useState(Boolean(preferences.liveTranslation));
  const [translationLanguage, setTranslationLanguage] = useState(preferences.translationLanguage || 'en');
  const [sentimentAnalytics, setSentimentAnalytics] = useState(
    preferences.sentimentAnalytics !== undefined ? preferences.sentimentAnalytics : true
  );

  // --- NOTIFICATIONS & INTEGRATIONS STATES ---
  const [reminderTime, setReminderTime] = useState<number>(preferences.reminderTimeMinutes || 15);
  const [emailReminders, setEmailReminders] = useState(preferences.emailReminders);
  const [desktopNotifs, setDesktopNotifs] = useState(preferences.desktopNotifications);
  const [soundAlerts, setSoundAlerts] = useState(
    preferences.soundAlerts !== undefined ? preferences.soundAlerts : true
  );
  const [dailyDigestEmail, setDailyDigestEmail] = useState(
    preferences.dailyDigestEmail !== undefined ? preferences.dailyDigestEmail : true
  );
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(
    preferences.googleCalendarConnected !== undefined ? preferences.googleCalendarConnected : true
  );
  const [slackConnected, setSlackConnected] = useState(
    preferences.slackConnected !== undefined ? preferences.slackConnected : true
  );
  const [outlookConnected, setOutlookConnected] = useState(Boolean(preferences.outlookConnected));
  const [dndEnabled, setDndEnabled] = useState(Boolean(preferences.dndEnabled));
  const [dndStartTime, setDndStartTime] = useState(preferences.dndStartTime || '21:00');
  const [dndEndTime, setDndEndTime] = useState(preferences.dndEndTime || '08:00');

  // --- SECURITY & COMPLIANCE STATES ---
  const [e2eeEnabled, setE2eeEnabled] = useState(
    preferences.e2eeEnabled !== undefined ? preferences.e2eeEnabled : true
  );
  const [cloudStorageRegion, setCloudStorageRegion] = useState(
    preferences.cloudStorageRegion || 'ap-south-1 (Mumbai)'
  );
  const [retentionDays, setRetentionDays] = useState<number>(preferences.retentionPolicyDays || 90);
  const [requireRecordingConsent, setRequireRecordingConsent] = useState(
    preferences.requireRecordingConsent !== undefined ? preferences.requireRecordingConsent : true
  );
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && tabParam !== 'theme') {
      setActiveTab(tabParam as SettingsTab);
    }
  }, [tabParam]);

  const handleTabClick = (tab: SettingsTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  // --- HARDWARE TEST FUNCTIONS ---
  // 1. Microphone Test Simulation
  const handleToggleMicTest = () => {
    if (isTestingMic) {
      setIsTestingMic(false);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      setMicLevel(0);
      showToast('Microphone test ended', 'info');
    } else {
      setIsTestingMic(true);
      showToast('🎙️ Testing microphone input level. Speak now...', 'info');
      // Animate level realistically
      micIntervalRef.current = window.setInterval(() => {
        // Random level between 25% and 85%
        const simulatedLevel = Math.floor(Math.random() * 60) + 25;
        setMicLevel(simulatedLevel);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
    };
  }, []);

  // 2. Speaker Test Sound via Web Audio API
  const handlePlaySpeakerTest = () => {
    if (isPlayingSpeakerTone) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        showToast('🔊 AudioContext not supported on this browser', 'warning');
        return;
      }
      setIsPlayingSpeakerTone(true);
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Play 3 melodic chime notes (C5, E5, G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.18);

        const volumeScale = (speakerVolume / 100) * 0.25;
        gain.gain.setValueAtTime(0, now + index * 0.18);
        gain.gain.linearRampToValueAtTime(volumeScale, now + index * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.18);
        osc.stop(now + index * 0.18 + 0.36);
      });

      showToast('🔊 Playing speaker test chime melody...', 'info');
      setTimeout(() => {
        setIsPlayingSpeakerTone(false);
      }, 900);
    } catch {
      setIsPlayingSpeakerTone(false);
      showToast('Speaker test tone played', 'info');
    }
  };

  // 3. Camera Test Toggle
  const handleToggleCameraPreview = () => {
    setIsCameraPreviewOn((prev) => !prev);
    if (!isCameraPreviewOn) {
      showToast('📹 Camera preview stream initialized (1080p 60fps)', 'info');
    } else {
      showToast('Camera preview stopped', 'info');
    }
  };

  // --- SAVE ALL PREFERENCES ---
  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updatePreferences(
      {
        workspaceName,
        workspaceSlug,
        language,
        timezone,
        timeFormat,
        autoStartOnBoot,
        jobTitle,
        department,
        phoneNumber,
        statusMessage,
        twoFactorEnabled,
        microphoneDevice: micDevice,
        cameraDevice: camDevice,
        speakerDevice,
        autoMuteOnJoin: autoMute,
        autoTurnOffCameraOnJoin: autoCameraOff,
        waitingRoomEnabled: waitingRoom,
        waitingRoomMessage,
        joinBeforeHost,
        endMeetingForAllOnLeave: endMeetingForAll,
        allowParticipantScreenShare: allowScreenShare,
        allowParticipantChat: allowChat,
        allowParticipantReactions: allowReactions,
        watermarkVideo,
        enforceMeetingPasscode: enforcePasscode,
        noiseSuppression,
        echoCancellation,
        autoGainControl,
        speakerVolume,
        videoQuality,
        mirrorVideo,
        lowLightCompensation: lowLightComp,
        virtualBackground: virtualBg,
        aiSummaryAutoGenerate: autoAiSummary,
        aiPersona,
        smartAssigneeDetection: smartAssignees,
        aiAutoJoinPolicy,
        liveSubtitles,
        liveTranslation,
        translationLanguage,
        sentimentAnalytics,
        reminderTimeMinutes: reminderTime,
        emailReminders,
        desktopNotifications: desktopNotifs,
        soundAlerts,
        dailyDigestEmail,
        googleCalendarConnected,
        slackConnected,
        outlookConnected,
        dndEnabled,
        dndStartTime,
        dndEndTime,
        e2eeEnabled,
        cloudStorageRegion,
        retentionPolicyDays: retentionDays,
        requireRecordingConsent,
      },
      { silent: true }
    );
    showToast('✅ All workspace settings saved successfully!', 'success');
  };

  // --- AUDIT LOG EXPORT ---
  const handleDownloadAuditLog = () => {
    const auditData = {
      workspace: workspaceName,
      slug: workspaceSlug,
      exportedAt: new Date().toISOString(),
      user: {
        name: displayName,
        email,
        role: 'Enterprise Administrator',
      },
      security: {
        endToEndEncryption: e2eeEnabled ? 'AES-256-GCM Active' : 'Standard TLS 1.3',
        twoFactorAuthentication: twoFactorEnabled ? 'TOTP Enabled' : 'Disabled',
        recordingRetentionDays: retentionDays,
        storageRegion: cloudStorageRegion,
        activeSessions: 3,
      },
      recentEvents: [
        { event: 'LOGIN_SUCCESS', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '103.21.144.12', client: 'Linux Chrome' },
        { event: 'SETTINGS_UPDATE', timestamp: new Date(Date.now() - 1800000).toISOString(), section: 'Hardware & AI' },
        { event: 'MEETING_E2EE_INITIALIZED', timestamp: new Date(Date.now() - 7200000).toISOString(), room: 'standup-sync' },
      ],
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intellmeet-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📁 Enterprise security audit log downloaded', 'success');
  };

  // --- RESET ALL ---
  const handleResetAllPreferences = () => {
    updatePreferences(
      {
        autoMuteOnJoin: false,
        autoTurnOffCameraOnJoin: false,
        waitingRoomEnabled: true,
        joinBeforeHost: false,
        endMeetingForAllOnLeave: true,
        noiseSuppression: 'studio',
        echoCancellation: true,
        autoGainControl: true,
        speakerVolume: 85,
        videoQuality: '1080p',
        aiSummaryAutoGenerate: true,
        aiPersona: 'executive',
        smartAssigneeDetection: true,
        emailReminders: true,
        desktopNotifications: true,
        soundAlerts: true,
        e2eeEnabled: true,
        retentionPolicyDays: 90,
      },
      { silent: true }
    );
    setShowResetConfirmModal(false);
    showToast('🔄 Settings restored to default enterprise configuration', 'info');
  };

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
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
              <SettingsIcon size={22} />
            </span>
            <div>
              <h1 className="im-page-title" style={{ margin: 0 }}>Preferences & Settings</h1>
              <p className="im-page-subtitle" style={{ margin: '2px 0 0 0' }}>
                Manage profile identity, room automation, audio/video studio, AI intelligence, and compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="im-page-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            to="/theme"
            className="im-btn im-btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PaletteIcon size={16} />
            Theme & Appearance Studio
          </Link>
          <button type="button" className="im-btn im-btn-primary" onClick={() => handleSaveAll()}>
            Save All Preferences
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs Container */}
      <div className="im-settings-tabs-container" role="tablist">
        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => handleTabClick('general')}
          role="tab"
          aria-selected={activeTab === 'general'}
        >
          <BuildingIcon size={16} />
          General & Workspace
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabClick('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
        >
          <UserIcon size={16} />
          Profile & Account
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => handleTabClick('meetings')}
          role="tab"
          aria-selected={activeTab === 'meetings'}
        >
          <VideoIcon size={16} />
          Meeting Defaults
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
          onClick={() => handleTabClick('hardware')}
          role="tab"
          aria-selected={activeTab === 'hardware'}
        >
          <MicIcon size={16} />
          Audio & Video Lab
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => handleTabClick('ai')}
          role="tab"
          aria-selected={activeTab === 'ai'}
        >
          <SparkleIcon size={16} />
          AI & Automation
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => handleTabClick('notifications')}
          role="tab"
          aria-selected={activeTab === 'notifications'}
        >
          <BellIcon size={16} />
          Notifications & Apps
        </button>

        <button
          type="button"
          className={`im-settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => handleTabClick('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
        >
          <ShieldCheckIcon size={16} />
          Security & Cloud
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveAll(); }}>
        {/* =========================================================================
            TAB 1: GENERAL & WORKSPACE SETTINGS
            ========================================================================= */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Link Card to Theme Studio */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 'var(--im-radius-lg)',
                background: 'linear-gradient(135deg, var(--im-primary-light) 0%, var(--im-bg-surface) 100%)',
                border: '1px solid var(--im-border)',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--im-radius-md)',
                    backgroundColor: 'var(--im-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PaletteIcon size={22} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                    Looking to customize Colors, Dark Mode, or Theme Presets?
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--im-text-secondary)' }}>
                    Switch between 8 enterprise palettes, configure custom HEX accents, and toggle high-contrast accessibility.
                  </p>
                </div>
              </div>
              <Link
                to="/theme"
                className="im-btn im-btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Theme & Styling Studio</span>
                <ExternalLinkIcon size={14} />
              </Link>
            </div>

            {/* Workspace Profile Card */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <BuildingIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Workspace Profile & Vanity Domain
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Organization identifiers used for shared links, invites, and team onboarding
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                <div className="im-form-row">
                  <div className="im-form-group">
                    <label className="im-form-label">Workspace Display Name</label>
                    <input
                      type="text"
                      className="im-input"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Acme Enterprise Workspace"
                    />
                  </div>

                  <div className="im-form-group">
                    <label className="im-form-label">Company Domain Tag</label>
                    <input
                      type="text"
                      className="im-input"
                      defaultValue="@intellmeet.ai"
                      readOnly
                      style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                    />
                  </div>
                </div>

                <div className="im-form-group" style={{ marginBottom: 0 }}>
                  <label className="im-form-label">Workspace Custom Vanity URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '0 12px',
                        height: 38,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 'var(--im-radius-md)',
                        backgroundColor: 'var(--im-bg-subtle)',
                        border: '1px solid var(--im-border)',
                        color: 'var(--im-text-muted)',
                        fontSize: '0.84rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      https://intellmeet.ai/w/
                    </span>
                    <input
                      type="text"
                      className="im-input"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="workspace-slug"
                      style={{ maxWidth: 260 }}
                    />
                    <button
                      type="button"
                      className="im-btn im-btn-secondary"
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://intellmeet.ai/w/${workspaceSlug}`);
                        showToast('Workspace URL copied to clipboard!', 'success');
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Localization & Region Preferences */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <GlobeIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Localization & Regional Standards
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Sets calendar schedule timezones, timestamp formatting, and UI language
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                <div className="im-form-row">
                  <div className="im-form-group">
                    <label className="im-form-label">Interface Primary Language</label>
                    <select
                      className="im-select"
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        showToast(`Language set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
                      }}
                    >
                      <option value="en">English (US / International)</option>
                      <option value="en-gb">English (United Kingdom)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="ja">日本語 (Japanese)</option>
                    </select>
                  </div>

                  <div className="im-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="im-form-label">Default Meeting Timezone</label>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--im-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          marginBottom: 4,
                        }}
                        onClick={() => {
                          const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
                          setTimezone(`${detected} (Detected)`);
                          showToast(`Detected timezone: ${detected}`, 'success');
                        }}
                      >
                        ⚡ Detect Current
                      </button>
                    </div>
                    <select
                      className="im-select"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                      <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York (EST -05:00)">America/New_York (EST -05:00)</option>
                      <option value="America/Los_Angeles (PST -08:00)">America/Los_Angeles (PST -08:00)</option>
                      <option value="Europe/London (GMT +00:00)">Europe/London (GMT +00:00)</option>
                      <option value="Europe/Berlin (CET +01:00)">Europe/Berlin (CET +01:00)</option>
                      <option value="Asia/Tokyo (JST +09:00)">Asia/Tokyo (JST +09:00)</option>
                      <option value="Asia/Singapore (SGT +08:00)">Asia/Singapore (SGT +08:00)</option>
                    </select>
                  </div>
                </div>

                <div className="im-form-row" style={{ marginBottom: 0 }}>
                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">Time Format</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        className={`im-btn ${timeFormat === '12h' ? 'im-btn-primary' : 'im-btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setTimeFormat('12h')}
                      >
                        12-Hour (2:30 PM)
                      </button>
                      <button
                        type="button"
                        className={`im-btn ${timeFormat === '24h' ? 'im-btn-primary' : 'im-btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setTimeFormat('24h')}
                      >
                        24-Hour (14:30)
                      </button>
                    </div>
                  </div>

                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">System Launch Behavior</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', height: 38 }}>
                      <input
                        type="checkbox"
                        className="im-checkbox"
                        checked={autoStartOnBoot}
                        onChange={(e) => setAutoStartOnBoot(e.target.checked)}
                      />
                      <span style={{ fontSize: '0.84rem' }}>Launch IntellMeet automatically on system boot</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PROFILE & ACCOUNT IDENTITY
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Identity Banner & Avatar Card */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <UserIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Personal Profile & Directory Presence
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    This information appears across meeting attendee rosters, AI notes, and direct chat.
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                {/* Avatar Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: '1px solid var(--im-border)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <UserAvatar
                      avatar={user?.avatar}
                      name={displayName}
                      size={72}
                      className="im-profile-avatar"
                      style={{ border: '3px solid var(--im-border)' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid var(--im-bg-surface)',
                      }}
                      title="Status: Active"
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{displayName}</h3>
                      <span className="im-badge im-badge-upcoming">Enterprise Verified</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      {email} • {jobTitle}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="im-btn im-btn-secondary"
                      onClick={() => showToast('Avatar change dialog: Default enterprise monogram active', 'info')}
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Status Message Selector */}
                <div className="im-form-group">
                  <label className="im-form-label">Current Availability Status</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {[
                      '🟢 Available for calls',
                      '📅 In meetings all day',
                      '🎯 Deep Focus / DND',
                      '✈️ Out of Office',
                    ].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`im-btn ${statusMessage === status ? 'im-btn-primary' : 'im-btn-secondary'}`}
                        style={{ height: 32, fontSize: '0.8rem', padding: '0 10px' }}
                        onClick={() => {
                          setStatusMessage(status);
                          showToast(`Status updated: ${status}`, 'info');
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="im-input"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="Custom status message..."
                  />
                </div>

                {/* Editable Fields */}
                <div className="im-form-row">
                  <div className="im-form-group">
                    <label className="im-form-label">Full Name</label>
                    <input
                      type="text"
                      className="im-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>

                  <div className="im-form-group">
                    <label className="im-form-label">Work Email Address</label>
                    <input
                      type="email"
                      className="im-input"
                      value={email}
                      readOnly
                      style={{ backgroundColor: 'var(--im-bg-subtle)' }}
                    />
                  </div>
                </div>

                <div className="im-form-row" style={{ marginBottom: 0 }}>
                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">Job Title / Role</label>
                    <input
                      type="text"
                      className="im-input"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">Department</label>
                    <input
                      type="text"
                      className="im-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="im-input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <ShieldIcon size={18} style={{ color: 'var(--im-success)' }} />
                    Account Security & Two-Factor Authentication (2FA)
                  </h2>
                </div>
                {twoFactorEnabled && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--im-success-text)',
                      backgroundColor: 'var(--im-success-light)',
                      padding: '3px 8px',
                      borderRadius: 'var(--im-radius-sm)',
                    }}
                  >
                    ✓ 2FA Active
                  </span>
                )}
              </div>

              <div className="im-card-body">
                <div className="im-setting-toggle-card" style={{ marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600 }}>
                      Two-Factor Authentication (TOTP Authenticator App)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Requires a 6-digit confirmation code from Google Authenticator or 1Password when signing in.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => {
                      setTwoFactorEnabled(e.target.checked);
                      showToast(
                        e.target.checked ? '2FA enabled on your account' : '2FA disabled (Warning: Security reduced)',
                        e.target.checked ? 'success' : 'warning'
                      );
                    }}
                  />
                </div>

                {/* Active Sessions List */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--im-text-primary)' }}>
                  Active Enterprise Login Sessions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--im-radius-md)',
                      backgroundColor: 'var(--im-bg-subtle)',
                      border: '1px solid var(--im-border)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <LaptopIcon size={18} style={{ color: 'var(--im-primary)' }} />
                      <div>
                        <strong>Ubuntu Linux 24.04 (Chrome 131)</strong> — <em>Current Session</em>
                        <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>IP: 103.21.144.12 • Pune, Maharashtra</div>
                      </div>
                    </div>
                    <span className="im-badge im-badge-live">Active Now</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--im-radius-md)',
                      backgroundColor: 'var(--im-bg-subtle)',
                      border: '1px solid var(--im-border)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SmartphoneIcon size={18} style={{ color: 'var(--im-text-secondary)' }} />
                      <div>
                        <strong>Apple iPhone 15 Pro (IntellMeet iOS App)</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>Last active 2 hours ago • Cellular</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="im-btn im-btn-secondary"
                      style={{ height: 28, fontSize: '0.75rem', padding: '0 8px' }}
                      onClick={() => showToast('Session revoked', 'info')}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MEETING DEFAULTS & ROOM POLICIES
            ========================================================================= */}
        {activeTab === 'meetings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Join & Entry Behavior */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <VideoIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Lobby & Room Entry Rules
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Default states applied automatically when you or invited guests join meetings
                  </div>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Auto-Mute Microphone on Join
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Always enter conference calls with your audio muted to prevent background noise interruptions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={autoMute}
                    onChange={(e) => setAutoMute(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Turn Off Video Camera on Join
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Keep your webcam disabled until you manually toggle video on inside the meeting room dock.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={autoCameraOff}
                    onChange={(e) => setAutoCameraOff(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Enable Virtual Waiting Room by Default
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Participants wait in a secure holding area until the host or co-host admits them.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={waitingRoom}
                    onChange={(e) => setWaitingRoom(e.target.checked)}
                  />
                </div>

                {waitingRoom && (
                  <div className="im-form-group" style={{ paddingLeft: 12, borderLeft: '3px solid var(--im-primary)', marginBottom: 0 }}>
                    <label className="im-form-label">Custom Waiting Room Greeting Message</label>
                    <input
                      type="text"
                      className="im-input"
                      value={waitingRoomMessage}
                      onChange={(e) => setWaitingRoomMessage(e.target.value)}
                    />
                  </div>
                )}

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Allow Participants to Join Before Host
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Attendees can enter room and chat up to 15 minutes before the scheduled start time.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={joinBeforeHost}
                    onChange={(e) => setJoinBeforeHost(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* In-Meeting Host Governance & Collaboration */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <ShieldCheckIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    In-Meeting Collaboration & Anti-Leak Controls
                  </h2>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      End Meeting for All When Host Leaves
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Automatically disconnects all remaining attendees and generates AI summary immediately upon host departure.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={endMeetingForAll}
                    onChange={(e) => setEndMeetingForAll(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Allow Participant Screen Sharing
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Non-host participants may present browser tabs, applications, or dual screens.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={allowScreenShare}
                    onChange={(e) => setAllowScreenShare(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Allow In-Meeting Public & Direct Chat
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Enables real-time side channel messaging and file link sharing during calls.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={allowChat}
                    onChange={(e) => setAllowChat(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Allow Live Emoji Reactions & Gestures
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Enables floating applause, thumbs-up, heart, and raised-hand animation cues during calls.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={allowReactions}
                    onChange={(e) => setAllowReactions(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Watermark Video & Screen Share Streams
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Superimposes the viewing participant’s email address across video streams to deter unauthorized confidential screen recordings.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={watermarkVideo}
                    onChange={(e) => {
                      setWatermarkVideo(e.target.checked);
                      showToast(
                        e.target.checked ? 'Confidentiality watermarking enabled' : 'Watermarking disabled',
                        'info'
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: AUDIO & VIDEO HARDWARE LAB (LIVE INTERACTIVE TEST LAB)
            ========================================================================= */}
        {activeTab === 'hardware' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Microphone Studio Card */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <MicIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Microphone Input & Noise Suppression Studio
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    High-fidelity WebRTC audio engine with Krisp-grade background acoustic filtering
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                <div className="im-form-group">
                  <label htmlFor="settings-mic-select" className="im-form-label">Active Input Device</label>
                  <select
                    id="settings-mic-select"
                    className="im-select"
                    value={micDevice}
                    onChange={(e) => setMicDevice(e.target.value)}
                  >
                    <option value="Default - MacBook Pro Microphone (Built-in)">Default - MacBook Pro Microphone (Built-in)</option>
                    <option value="External USB Condenser Studio Mic (Rode NT-USB)">External USB Condenser Studio Mic (Rode NT-USB)</option>
                    <option value="Bluetooth Headset (AirPods Pro Hands-Free)">Bluetooth Headset (AirPods Pro Hands-Free)</option>
                    <option value="Shure MV7 Broadcast Mic">Shure MV7 Broadcast Mic</option>
                  </select>
                </div>

                {/* Live Microphone Test & Meter */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--im-radius-md)',
                    backgroundColor: 'var(--im-bg-subtle)',
                    border: '1px solid var(--im-border)',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Live Audio Input Meter</span>
                      {isTestingMic && (
                        <span className="im-badge im-badge-live" style={{ fontSize: '0.6875rem' }}>
                          ● Listening ({micLevel}%)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`im-btn ${isTestingMic ? 'im-btn-secondary' : 'im-btn-primary'}`}
                      style={{ height: 32, fontSize: '0.78rem' }}
                      onClick={handleToggleMicTest}
                    >
                      <MicIcon size={14} />
                      {isTestingMic ? 'Stop Test' : 'Test Microphone'}
                    </button>
                  </div>

                  {/* 12-segment VU Meter */}
                  <div className="im-vu-meter-bar">
                    {Array.from({ length: 18 }).map((_, i) => {
                      const threshold = (i / 18) * 100;
                      const isActive = isTestingMic && micLevel >= threshold;
                      const isHot = i > 14;
                      const isMedium = i > 9;
                      const activeColor = isHot ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';

                      return (
                        <div
                          key={i}
                          className="im-vu-segment"
                          style={{
                            height: `${Math.min(100, Math.max(20, (i + 1) * 6))}%`,
                            backgroundColor: isActive ? activeColor : 'var(--im-border)',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.7rem', color: 'var(--im-text-muted)' }}>
                    <span>-48 dB (Quiet)</span>
                    <span>-18 dB (Nominal Speech)</span>
                    <span>0 dB (Clip)</span>
                  </div>
                </div>

                {/* Noise Cancellation Selector */}
                <div className="im-form-group">
                  <label className="im-form-label">AI Noise Suppression Profile</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {[
                      { id: 'off', label: 'Off', desc: 'Raw unfiltered audio capture' },
                      { id: 'low', label: 'Standard', desc: 'Mild air conditioner hum suppression' },
                      { id: 'studio', label: 'Krisp Studio Isolation', desc: 'Deep learning speech separation' },
                    ].map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => setNoiseSuppression(mode.id as 'off' | 'low' | 'studio')}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--im-radius-md)',
                          border: `2px solid ${noiseSuppression === mode.id ? 'var(--im-primary)' : 'var(--im-border)'}`,
                          backgroundColor: noiseSuppression === mode.id ? 'var(--im-primary-light)' : 'var(--im-bg-surface)',
                          cursor: 'pointer',
                          transition: 'var(--im-transition)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.84rem', color: noiseSuppression === mode.id ? 'var(--im-primary-text)' : 'var(--im-text-primary)' }}>
                            {mode.label}
                          </span>
                          {noiseSuppression === mode.id && <CheckCircleIcon size={16} style={{ color: 'var(--im-primary)' }} />}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>{mode.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="im-checkbox"
                      checked={echoCancellation}
                      onChange={(e) => setEchoCancellation(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Acoustic Echo Cancellation (AEC)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="im-checkbox"
                      checked={autoGainControl}
                      onChange={(e) => setAutoGainControl(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Automatic Gain Control (AGC)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Speaker & Audio Output Card */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <Volume2Icon size={18} style={{ color: 'var(--im-primary)' }} />
                    Speaker Output & Tone Verification
                  </h2>
                </div>
              </div>

              <div className="im-card-body">
                <div className="im-form-group">
                  <label htmlFor="settings-speaker-select" className="im-form-label">Output Device</label>
                  <select
                    id="settings-speaker-select"
                    className="im-select"
                    value={speakerDevice}
                    onChange={(e) => setSpeakerDevice(e.target.value)}
                  >
                    <option value="Default - Internal Speakers (Stereo)">Default - Internal Speakers (Stereo)</option>
                    <option value="External Hi-Fi Studio Monitors">External Hi-Fi Studio Monitors</option>
                    <option value="Wireless AirPods Pro (Spatial Audio)">Wireless AirPods Pro (Spatial Audio)</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--im-radius-md)',
                    backgroundColor: 'var(--im-bg-subtle)',
                    border: '1px solid var(--im-border)',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 220 }}>
                    <Volume2Icon size={20} style={{ color: 'var(--im-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>Master Output Volume</span>
                        <span style={{ color: 'var(--im-text-muted)' }}>{speakerVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={speakerVolume}
                        onChange={(e) => setSpeakerVolume(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--im-primary)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`im-btn ${isPlayingSpeakerTone ? 'im-btn-secondary' : 'im-btn-primary'}`}
                    style={{ height: 36 }}
                    onClick={handlePlaySpeakerTest}
                  >
                    <Volume2Icon size={16} />
                    {isPlayingSpeakerTone ? 'Playing Sound...' : 'Test Speaker Melody'}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Camera & Preview Card */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <CameraIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Video Camera Studio & Broadcast Preview
                  </h2>
                </div>
                <button
                  type="button"
                  className={`im-btn ${isCameraPreviewOn ? 'im-btn-secondary' : 'im-btn-primary'}`}
                  style={{ height: 32, fontSize: '0.78rem' }}
                  onClick={handleToggleCameraPreview}
                >
                  <CameraIcon size={14} />
                  {isCameraPreviewOn ? 'Hide Video Preview' : 'Start Camera Preview'}
                </button>
              </div>

              <div className="im-card-body">
                <div className="im-form-group">
                  <label htmlFor="settings-cam-select" className="im-form-label">Camera Sensor</label>
                  <select
                    id="settings-cam-select"
                    className="im-select"
                    value={camDevice}
                    onChange={(e) => setCamDevice(e.target.value)}
                  >
                    <option value="Default - FaceTime HD Camera (1080p)">Default - FaceTime HD Camera (1080p)</option>
                    <option value="4K Ultra-HD External USB Webcam (Logitech Brio)">4K Ultra-HD External USB Webcam (Logitech Brio)</option>
                    <option value="OBS Virtual Camera (60 FPS)">OBS Virtual Camera (60 FPS)</option>
                  </select>
                </div>

                {/* Interactive Video Preview Box */}
                {isCameraPreviewOn && (
                  <div className="im-camera-test-screen" style={{ marginBottom: 16 }}>
                    <div className="im-camera-grid-lines" />
                    <div style={{ textAlign: 'center', zIndex: 2, color: '#ffffff', padding: 20 }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(79, 70, 229, 0.4)',
                          border: '2px solid rgba(255,255,255,0.8)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <UserIcon size={32} style={{ color: '#ffffff' }} />
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {displayName} • Live Camera Feed
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 4 }}>
                        {videoQuality.toUpperCase()} • 60 FPS • WebRTC H.264
                      </div>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.6875rem',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    >
                      ● SENSOR ONLINE
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.6875rem',
                        color: '#ffffff',
                      }}
                    >
                      BG: {virtualBg.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Resolution & Virtual Background Options */}
                <div className="im-form-row">
                  <div className="im-form-group">
                    <label className="im-form-label">Send Resolution</label>
                    <select
                      className="im-select"
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as '720p' | '1080p' | '4k')}
                    >
                      <option value="720p">720p HD (Low bandwidth)</option>
                      <option value="1080p">1080p Full HD (Recommended)</option>
                      <option value="4k">4K Ultra HD (High clarity)</option>
                    </select>
                  </div>

                  <div className="im-form-group">
                    <label className="im-form-label">Virtual Background Default</label>
                    <select
                      className="im-select"
                      value={virtualBg}
                      onChange={(e) => setVirtualBg(e.target.value)}
                    >
                      <option value="none">None (Natural Background)</option>
                      <option value="soft_blur">Soft Portrait Blur (25%)</option>
                      <option value="heavy_blur">Heavy Studio Blur (75%)</option>
                      <option value="office">Executive Glass Boardroom</option>
                      <option value="tech_loft">Modern Tech Loft</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="im-checkbox"
                      checked={mirrorVideo}
                      onChange={(e) => setMirrorVideo(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Mirror my video preview</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="im-checkbox"
                      checked={lowLightComp}
                      onChange={(e) => setLowLightComp(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Low-light video enhancement</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: AI INTELLIGENCE & AUTOMATION
            ========================================================================= */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Summary Engine */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <SparkleIcon size={18} style={{ color: 'var(--im-ai-purple)' }} />
                    IntellMeet AI Co-Pilot & Autonomous Notes
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Proprietary Gemini-powered meeting synthesis, transcript mining, and action item mapping
                  </div>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Auto-Generate AI Meeting Summaries & Action Items
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      As soon as a meeting concludes, IntellMeet creates an executive briefing document and action items.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={autoAiSummary}
                    onChange={(e) => setAutoAiSummary(e.target.checked)}
                  />
                </div>

                {/* AI Summary Persona / Format */}
                <div className="im-form-group" style={{ marginBottom: 0 }}>
                  <label className="im-form-label">AI Summary Tone & Structure</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {[
                      { id: 'executive', title: '👔 Executive Brief', desc: 'High-level strategic takeaways, key decisions, and business risks.' },
                      { id: 'technical', title: '🛠️ Technical Architecture', desc: 'Code references, system design tradeoffs, and technical steps.' },
                      { id: 'action_items', title: '✅ Action-Item Centric', desc: 'Strictly prioritized task checklists with assigned deadlines.' },
                    ].map((tone) => (
                      <div
                        key={tone.id}
                        onClick={() => setAiPersona(tone.id as 'executive' | 'technical' | 'action_items')}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--im-radius-md)',
                          border: `2px solid ${aiPersona === tone.id ? 'var(--im-primary)' : 'var(--im-border)'}`,
                          backgroundColor: aiPersona === tone.id ? 'var(--im-primary-light)' : 'var(--im-bg-surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: aiPersona === tone.id ? 'var(--im-primary-text)' : 'var(--im-text-primary)' }}>
                          {tone.title}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                          {tone.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Smart Assignee Detection
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      AI parses spoken names (e.g. &quot;Prathamesh will finalize the deployment&quot;) and maps task ownership automatically.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={smartAssignees}
                    onChange={(e) => setSmartAssignees(e.target.checked)}
                  />
                </div>

                <div className="im-form-group" style={{ marginBottom: 0 }}>
                  <label className="im-form-label">AI Meeting Bot Auto-Join Policy</label>
                  <select
                    className="im-select"
                    value={aiAutoJoinPolicy}
                    onChange={(e) => setAiAutoJoinPolicy(e.target.value as 'always' | 'recording_only' | 'never')}
                  >
                    <option value="recording_only">Only join when meeting recording is turned on (Recommended)</option>
                    <option value="always">Always auto-join every scheduled and instant call</option>
                    <option value="never">Never join automatically (Require manual host invite)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Captions & Translation */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <GlobeIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Live Subtitles & Real-Time Multilingual Translation
                  </h2>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Automatic Live Closed Captions (Subtitles)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Displays real-time spoken captions at the bottom of the video viewport with sub-100ms latency.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={liveSubtitles}
                    onChange={(e) => setLiveSubtitles(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Real-Time Language Translation
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Translates spoken foreign dialogue into your target language on-the-fly.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={liveTranslation}
                    onChange={(e) => setLiveTranslation(e.target.checked)}
                  />
                </div>

                {liveTranslation && (
                  <div className="im-form-group" style={{ marginBottom: 0 }}>
                    <label className="im-form-label">Translate Speech Directly Into</label>
                    <select
                      className="im-select"
                      value={translationLanguage}
                      onChange={(e) => setTranslationLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="ja">日本語 (Japanese)</option>
                    </select>
                  </div>
                )}

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Sentiment & Participant Engagement Telemetry
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Calculates speaking time ratio and meeting energy level to help balance team collaboration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={sentimentAnalytics}
                    onChange={(e) => setSentimentAnalytics(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: NOTIFICATIONS & INTEGRATIONS
            ========================================================================= */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Alerts & Reminders */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <BellIcon size={18} style={{ color: 'var(--im-primary)' }} />
                    Notification Channels & Reminder Timings
                  </h2>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="im-form-group">
                  <label className="im-form-label">Upcoming Meeting Reminder Lead Time</label>
                  <select
                    className="im-select"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(Number(e.target.value))}
                  >
                    <option value="5">5 minutes before start</option>
                    <option value="10">10 minutes before start</option>
                    <option value="15">15 minutes before start (Recommended)</option>
                    <option value="30">30 minutes before start</option>
                    <option value="60">1 hour before start</option>
                  </select>
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Email Calendar Reminders
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Receive synchronized emails with direct one-click room join buttons.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={emailReminders}
                    onChange={(e) => setEmailReminders(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Desktop In-App Banner Alerts
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Displays top-right notifications when team members start calls or mention you.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={desktopNotifs}
                    onChange={(e) => setDesktopNotifs(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Play Audio Chime on Incoming Calls
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Plays pleasant ringtone melody when invited to join an active meeting.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Daily Morning Agenda Digest
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Delivers an 8:00 AM summary of all scheduled sessions and pending action items.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={dailyDigestEmail}
                    onChange={(e) => setDailyDigestEmail(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Do Not Disturb Schedule */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <ClockIcon size={18} style={{ color: 'var(--im-warning)' }} />
                    Do Not Disturb (Quiet Hours)
                  </h2>
                </div>
                <input
                  type="checkbox"
                  className="im-checkbox"
                  checked={dndEnabled}
                  onChange={(e) => setDndEnabled(e.target.checked)}
                />
              </div>

              <div className="im-card-body">
                <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: 'var(--im-text-secondary)' }}>
                  Silence all audio chimes and desktop popups during your focus hours or sleep schedules.
                </p>

                {dndEnabled && (
                  <div className="im-form-row" style={{ marginBottom: 0 }}>
                    <div className="im-form-group" style={{ marginBottom: 0 }}>
                      <label className="im-form-label">Quiet Hours Start</label>
                      <input
                        type="time"
                        className="im-input"
                        value={dndStartTime}
                        onChange={(e) => setDndStartTime(e.target.value)}
                      />
                    </div>
                    <div className="im-form-group" style={{ marginBottom: 0 }}>
                      <label className="im-form-label">Quiet Hours End</label>
                      <input
                        type="time"
                        className="im-input"
                        value={dndEndTime}
                        onChange={(e) => setDndEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Connected Enterprise Apps */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    Connected Integrations & Workspaces
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Sync calendar events, push meeting summaries to channels, and bridge video
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                <div className="im-integration-grid">
                  {/* Google Calendar */}
                  <div className="im-integration-box">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Google Calendar</span>
                        {googleCalendarConnected ? (
                          <span className="im-badge im-badge-upcoming">Connected</span>
                        ) : (
                          <span className="im-badge" style={{ backgroundColor: 'var(--im-bg-subtle)' }}>Disconnected</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                        Two-way calendar sync for Google Meet invitations and automated schedule creation.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`im-btn ${googleCalendarConnected ? 'im-btn-secondary' : 'im-btn-primary'}`}
                      style={{ marginTop: 14 }}
                      onClick={() => {
                        setGoogleCalendarConnected(!googleCalendarConnected);
                        showToast(
                          googleCalendarConnected ? 'Google Calendar disconnected' : 'Google Calendar connected successfully!',
                          googleCalendarConnected ? 'info' : 'success'
                        );
                      }}
                    >
                      {googleCalendarConnected ? 'Disconnect' : 'Connect Account'}
                    </button>
                  </div>

                  {/* Slack */}
                  <div className="im-integration-box">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Slack Workspace</span>
                        {slackConnected ? (
                          <span className="im-badge im-badge-upcoming">Connected</span>
                        ) : (
                          <span className="im-badge" style={{ backgroundColor: 'var(--im-bg-subtle)' }}>Disconnected</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                        Posts AI meeting summaries and action items into #general and #team channels.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`im-btn ${slackConnected ? 'im-btn-secondary' : 'im-btn-primary'}`}
                      style={{ marginTop: 14 }}
                      onClick={() => {
                        setSlackConnected(!slackConnected);
                        showToast(
                          slackConnected ? 'Slack disconnected' : 'Slack channel integrated!',
                          slackConnected ? 'info' : 'success'
                        );
                      }}
                    >
                      {slackConnected ? 'Configure Channels' : 'Connect Slack'}
                    </button>
                  </div>

                  {/* Microsoft Outlook 365 */}
                  <div className="im-integration-box">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Microsoft Outlook</span>
                        {outlookConnected ? (
                          <span className="im-badge im-badge-upcoming">Connected</span>
                        ) : (
                          <span className="im-badge" style={{ backgroundColor: 'var(--im-bg-subtle)' }}>Available</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                        Exchange and Office 365 calendar synchronization with Outlook Add-in.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`im-btn ${outlookConnected ? 'im-btn-secondary' : 'im-btn-primary'}`}
                      style={{ marginTop: 14 }}
                      onClick={() => {
                        setOutlookConnected(!outlookConnected);
                        showToast(
                          outlookConnected ? 'Outlook disconnected' : 'Outlook 365 connected!',
                          'success'
                        );
                      }}
                    >
                      {outlookConnected ? 'Disconnect' : 'Connect 365'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: SECURITY, PRIVACY & CLOUD COMPLIANCE
            ========================================================================= */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cryptographic Controls */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    <ShieldCheckIcon size={18} style={{ color: 'var(--im-success)' }} />
                    Cryptographic Encryption & Participant Consent
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--im-radius-full)',
                    backgroundColor: 'var(--im-success-light)',
                    color: 'var(--im-success-text)',
                  }}
                >
                  AES-256 GCM Compliant
                </span>
              </div>

              <div className="im-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      End-to-End Encryption (E2EE) for All Rooms
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      WebRTC peer streams are encrypted directly in the browser. Even relay servers cannot inspect video or audio packets.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={e2eeEnabled}
                    onChange={(e) => {
                      setE2eeEnabled(e.target.checked);
                      showToast(
                        e.target.checked ? 'End-to-End Encryption activated' : 'Standard encryption active',
                        'info'
                      );
                    }}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Mandatory Participant Recording Consent
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Requires every attendee to accept an on-screen consent prompt before meeting recording or AI transcription can begin.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={requireRecordingConsent}
                    onChange={(e) => setRequireRecordingConsent(e.target.checked)}
                  />
                </div>

                <div className="im-setting-toggle-card">
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                      Enforce Meeting Passcodes
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      Generates a secure 6-digit numeric passcode for every new scheduled and instant meeting.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="im-checkbox"
                    checked={enforcePasscode}
                    onChange={(e) => setEnforcePasscode(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Cloud Storage & Governance */}
            <div className="im-card">
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title">
                    Cloud Storage Governance & Retention Policy
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)', marginTop: 2 }}>
                    Manage data residency region, automatic recording purge, and storage quotas
                  </div>
                </div>
              </div>

              <div className="im-card-body">
                {/* Storage Quota Bar */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Cloud Storage Usage</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                      <strong>18.4 GB</strong> of 50.0 GB Used (36.8%)
                    </span>
                  </div>

                  <div className="im-storage-progress-bar">
                    <div style={{ width: '28%', backgroundColor: 'var(--im-primary)' }} title="Recordings: 14.0 GB" />
                    <div style={{ width: '6%', backgroundColor: 'var(--im-ai-purple)' }} title="AI Transcripts: 3.0 GB" />
                    <div style={{ width: '2.8%', backgroundColor: '#10b981' }} title="Chat Attachments: 1.4 GB" />
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                    <span>● <strong style={{ color: 'var(--im-primary)' }}>Video Recordings</strong> (14.0 GB)</span>
                    <span>● <strong style={{ color: 'var(--im-ai-purple)' }}>AI Summaries & Audio</strong> (3.0 GB)</span>
                    <span>● <strong style={{ color: '#10b981' }}>Chat Files</strong> (1.4 GB)</span>
                  </div>
                </div>

                <div className="im-form-row">
                  <div className="im-form-group">
                    <label className="im-form-label">Data Residency Storage Region</label>
                    <select
                      className="im-select"
                      value={cloudStorageRegion}
                      onChange={(e) => setCloudStorageRegion(e.target.value)}
                    >
                      <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai, India)</option>
                      <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia, US)</option>
                      <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt, EU)</option>
                      <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                    </select>
                  </div>

                  <div className="im-form-group">
                    <label className="im-form-label">Auto-Purge Retention Schedule</label>
                    <select
                      className="im-select"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                    >
                      <option value="30">Delete recordings after 30 days</option>
                      <option value="60">Delete recordings after 60 days</option>
                      <option value="90">Delete recordings after 90 days (Enterprise Standard)</option>
                      <option value="365">Delete recordings after 365 days (1 Year)</option>
                      <option value="0">Never delete (Keep indefinitely)</option>
                    </select>
                  </div>
                </div>

                {/* Audit Log Download */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--im-radius-md)',
                    backgroundColor: 'var(--im-bg-subtle)',
                    border: '1px solid var(--im-border)',
                    marginTop: 10,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.84rem' }}>Export Workspace Security Audit Trail</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--im-text-muted)' }}>
                      Download cryptographic verification keys, meeting access history, and admin logs.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="im-btn im-btn-secondary"
                    onClick={handleDownloadAuditLog}
                  >
                    <DownloadIcon size={14} />
                    Download Audit JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="im-card" style={{ borderColor: 'var(--im-danger)' }}>
              <div className="im-card-header">
                <div>
                  <h2 className="im-card-title" style={{ color: 'var(--im-danger-text)' }}>
                    Danger Zone & Factory Reset
                  </h2>
                </div>
              </div>

              <div className="im-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '0.875rem', fontWeight: 600 }}>
                    Reset All Preferences to Enterprise Default
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                    Restores standard meeting rules, device configs, and notification schedules.
                  </p>
                </div>
                <button
                  type="button"
                  className="im-btn im-btn-secondary"
                  style={{ color: 'var(--im-danger-text)', borderColor: 'var(--im-danger)' }}
                  onClick={() => setShowResetConfirmModal(true)}
                >
                  <RefreshCwIcon size={14} />
                  Restore Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating / Sticky Save Footer */}
        <div
          className="im-card-footer"
          style={{
            marginTop: 24,
            borderRadius: 'var(--im-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
            All settings persist instantly across your workspace
          </span>
          <button type="submit" className="im-btn im-btn-primary">
            Save All Preferences
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="im-modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="im-modal" style={{ maxWidth: 460 }}>
            <div className="im-modal-header">
              <h3 className="im-modal-title">Reset Workspace Settings?</h3>
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
                Are you sure you want to revert your workspace and device settings back to factory defaults?
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--im-text-muted)' }}>
                Your scheduled meetings, recordings, and account credentials will not be deleted.
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
                style={{ backgroundColor: 'var(--im-danger)', borderColor: 'var(--im-danger)' }}
                onClick={handleResetAllPreferences}
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

export default SettingsPage;
