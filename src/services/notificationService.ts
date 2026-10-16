import { AlertLogItem, AlertThresholdConfig, RegionData, RegionKey } from '../types/psi';

const STORAGE_KEY_CONFIG = 'sg_psi_alert_config';
const STORAGE_KEY_LOGS = 'sg_psi_alert_logs';

export const DEFAULT_ALERT_CONFIG: AlertThresholdConfig = {
  psiThreshold: 100, // Singapore NEA Unhealthy threshold
  pm25Threshold: 55, // Singapore NEA 1-hr PM2.5 Band II elevated threshold
  monitoredRegions: ['central', 'north', 'south', 'east', 'west'],
  soundEnabled: true,
  pushEnabled: true,
  notifyOnRecovery: true,
};

export function loadAlertConfig(): AlertThresholdConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return { ...DEFAULT_ALERT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load alert config from localStorage', e);
  }
  return DEFAULT_ALERT_CONFIG;
}

export function saveAlertConfig(config: AlertThresholdConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save alert config to localStorage', e);
  }
}

export function loadAlertLogs(): AlertLogItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load alert logs from localStorage', e);
  }
  return [];
}

export function saveAlertLogs(logs: AlertLogItem[]): void {
  try {
    // Keep last 30 logs
    const trimmed = logs.slice(0, 30);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save alert logs to localStorage', e);
  }
}

// Clean Web Audio Alert Chime (Harmonic double tone)
export function playAlertChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.18); // D5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(293.66, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio chime playback omitted or blocked by browser policy:', e);
  }
}

// Request browser native Notification permission
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return 'denied';
  }
}

// Trigger browser native Web Notification
export function dispatchWebNotification(title: string, options: NotificationOptions = {}): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const n = new Notification(title, {
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2306b6d4"><circle cx="12" cy="12" r="10"/></svg>',
      ...options,
    });

    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch (e) {
    console.warn('Could not launch native notification:', e);
    return false;
  }
}

// Evaluate air quality thresholds against monitored regions
export function evaluateAirQualityThresholds(
  regions: Record<RegionKey, RegionData>,
  config: AlertThresholdConfig,
  currentBreaches: Set<string>
): {
  newBreaches: AlertLogItem[];
  breachedKeys: string[];
} {
  const newBreaches: AlertLogItem[] = [];
  const currentBreachedKeys: string[] = [];

  config.monitoredRegions.forEach((regKey) => {
    const reg = regions[regKey];
    if (!reg) return;

    const psi = reg.readings.psi24h;
    const pm25 = reg.readings.pm25Hourly;
    const breachPsi = psi >= config.psiThreshold;
    const breachPm25 = pm25 >= config.pm25Threshold;

    if (breachPsi || breachPm25) {
      currentBreachedKeys.push(regKey);
      const breachId = `${regKey}_${Math.floor(Date.now() / (1000 * 60 * 30))}`; // Throttle to 30 mins per region

      if (!currentBreaches.has(breachId)) {
        let title = `Air Quality Alert: ${reg.name}`;
        let body = '';

        if (breachPsi && breachPm25) {
          body = `24-hr PSI has reached ${psi} (${reg.band.toUpperCase()}) and 1-hr PM2.5 is elevated at ${pm25} µg/m³. Reduce outdoor physical exertion.`;
        } else if (breachPsi) {
          body = `24-hr PSI has crossed threshold: currently ${psi} (${reg.band.toUpperCase()}). Stay indoors if sensitive.`;
        } else {
          body = `1-hr PM2.5 has spiked to ${pm25} µg/m³ (Above threshold of ${config.pm25Threshold} µg/m³).`;
        }

        newBreaches.push({
          id: breachId,
          timestamp: new Date().toLocaleTimeString('en-SG', {
            timeZone: 'Asia/Singapore',
            hour: '2-digit',
            minute: '2-digit',
          }),
          region: regKey,
          regionName: reg.name,
          psi,
          pm25,
          band: reg.band,
          title,
          body,
          acknowledged: false,
        });
      }
    }
  });

  return { newBreaches, breachedKeys: currentBreachedKeys };
}
