import React, { useState } from 'react';
import {
  AlertLogItem,
  AlertThresholdConfig,
  RegionKey,
} from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/singaporeData';
import {
  Bell,
  Check,
  Code,
  Copy,
  ExternalLink,
  History,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { playAlertChime, requestPushPermission } from '../services/notificationService';

interface AlertThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertThresholdConfig;
  onSaveConfig: (newConfig: AlertThresholdConfig) => void;
  alertLogs: AlertLogItem[];
  onClearLogs: () => void;
  onTriggerTestNotification: () => void;
}

export const AlertThresholdModal: React.FC<AlertThresholdModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  alertLogs,
  onClearLogs,
  onTriggerTestNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'backend'>('settings');
  const [psiThreshold, setPsiThreshold] = useState<number>(config.psiThreshold);
  const [pm25Threshold, setPm25Threshold] = useState<number>(config.pm25Threshold);
  const [monitoredRegions, setMonitoredRegions] = useState<RegionKey[]>(config.monitoredRegions);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(config.soundEnabled);
  const [pushEnabled, setPushEnabled] = useState<boolean>(config.pushEnabled);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestPushPermission();
    setPermissionState(res);
  };

  const toggleRegion = (regKey: RegionKey) => {
    if (monitoredRegions.includes(regKey)) {
      if (monitoredRegions.length > 1) {
        setMonitoredRegions(monitoredRegions.filter((r) => r !== regKey));
      }
    } else {
      setMonitoredRegions([...monitoredRegions, regKey]);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      psiThreshold,
      pm25Threshold,
      monitoredRegions,
      soundEnabled,
      pushEnabled,
      notifyOnRecovery: config.notifyOnRecovery,
    });
    onClose();
  };

  const sampleServerlessCode = `// Serverless Backend Handler (e.g. AWS Lambda / Cloud Run / Vercel API)
// Scheduled cron: every 15 minutes to poll Singapore NEA API
import webpush from 'web-push';

export async function handler() {
  const res = await fetch('https://api.data.gov.sg/v1/environment/psi');
  const data = await res.json();
  const latest = data.items[data.items.length - 1];
  const psiReadings = latest.readings.psi_twenty_four_hourly;

  // Check each region against registered subscriber threshold
  for (const [region, psi] of Object.entries(psiReadings)) {
    if (psi >= ${psiThreshold}) {
      const payload = JSON.stringify({
        title: \`Air Quality Alert: \${region.toUpperCase()} Region\`,
        body: \`PSI has reached \${psi} (Unhealthy). Minimize outdoor physical exertion.\`,
        icon: '/icon-192.png',
        data: { region, psi, url: 'https://ais-dev-xm32u5mzzkmx5q6so45lga-592513198918.asia-northeast1.run.app' }
      });

      // Send to registered Web Push subscriptions in your database
      // await webpush.sendNotification(subscriberPushSubscription, payload);
    }
  }
  return { statusCode: 200, body: 'Checked' };
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleServerlessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const regionKeys: RegionKey[] = ['central', 'north', 'south', 'east', 'west'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 id="alert-settings-title" className="text-base font-bold text-white">
                Air Quality Alert Settings & Push Notifications
              </h3>
              <p className="text-xs text-slate-400">
                Configure threshold alerts for Singapore regions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Bar */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Threshold Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Alert Log ({alertLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'backend'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Serverless Backend Hook</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Browser Push Notification Permission Banner */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">
                      Web Push Notification Permission
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        permissionState === 'granted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : permissionState === 'denied'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {permissionState}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Receive immediate desktop / mobile alerts even when this tab is in the background.
                  </p>
                </div>

                {permissionState !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>

              {/* 24-Hr PSI Threshold Scrubber */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="psi-threshold-slider" className="text-xs font-semibold text-white">
                    24-Hour PSI Alert Trigger Threshold
                  </label>
                  <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                    PSI &ge; {psiThreshold}
                  </span>
                </div>
                <input
                  id="psi-threshold-slider"
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={psiThreshold}
                  onChange={(e) => setPsiThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>50 (Moderate)</span>
                  <span className="text-amber-400 font-bold">100 (Unhealthy - Standard NEA)</span>
                  <span>150 (Mid-Unhealthy)</span>
                  <span>200 (Very Unhealthy)</span>
                </div>
              </div>

              {/* 1-Hr PM2.5 Threshold Scrubber */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="pm25-threshold-slider" className="text-xs font-semibold text-white">
                    1-Hour PM2.5 Alert Trigger Threshold
                  </label>
                  <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                    {pm25Threshold} µg/m³
                  </span>
                </div>
                <input
                  id="pm25-threshold-slider"
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={pm25Threshold}
                  onChange={(e) => setPm25Threshold(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>30 µg/m³</span>
                  <span className="text-cyan-400 font-bold">55 µg/m³ (Band II Elevated)</span>
                  <span>100 µg/m³</span>
                  <span>150 µg/m³</span>
                </div>
              </div>

              {/* Region Subscription Checkboxes */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white block">
                  Monitored Singapore Regions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {regionKeys.map((key) => {
                    const isChecked = monitoredRegions.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleRegion(key)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                              : 'border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span className="text-xs font-medium capitalize">{key} Region</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound & Dispatch Options */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      if (!soundEnabled) playAlertChime();
                    }}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      soundEnabled
                        ? 'bg-cyan-950 text-cyan-400 border-cyan-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Synthesized Audio Chime
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Plays clean acoustic alert double-tone upon threshold crossing
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => playAlertChime()}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Test Chime
                </button>
              </div>

              {/* Instant Test Push Alert Trigger */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Verify Device Push Pipeline
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Dispatches a sample unhealthy air alert immediately
                  </span>
                </div>
                <button
                  onClick={onTriggerTestNotification}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Send Test Push Alert</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Logged Threshold Breaches & Dispatches
                </span>
                {alertLogs.length > 0 && (
                  <button
                    onClick={onClearLogs}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {alertLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800/80 rounded-xl bg-slate-950/40">
                  <p className="text-xs">No threshold breaches logged in this session.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Try switching feed to "Transboundary Haze" or click "Send Test Push Alert"
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {log.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {log.body}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-amber-400 block">
                          PSI {log.psi}
                        </span>
                        <span className="font-mono text-[10px] text-cyan-400">
                          {log.pm25} µg/m³
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white">
                  Serverless Backend Ready
                </p>
                <p className="text-slate-400 leading-relaxed">
                  As requested, this frontend is fully self-contained and manages browser notifications. When you add your serverless backend (AWS Lambda, Cloudflare Workers, Google Cloud Functions, or Supabase Edge), you can deploy a cron task that polls data.gov.sg and pushes notifications directly to subscriber devices using standard VAPID Web Push.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-lg text-xs text-slate-400">
                  <span className="font-mono text-[11px]">serverless-alert-cron.js</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950/90 border border-slate-800 rounded-b-lg font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-64">
                  {sampleServerlessCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
