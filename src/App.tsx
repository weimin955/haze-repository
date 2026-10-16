/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { PsiOverview } from './components/PsiOverview';
import { SingaporeMap } from './components/SingaporeMap';
import { PsiTrendCharts } from './components/PsiTrendCharts';
import { NeaHealthAdvisory } from './components/NeaHealthAdvisory';
import { AlertThresholdModal } from './components/AlertThresholdModal';
import {
  AlertLogItem,
  AlertThresholdConfig,
  HistoricalReadingPoint,
  PsiApiResponse,
  RegionData,
  RegionKey,
} from './types/psi';
import {
  fetchLiveSingaporePsiData,
  generate24HourHistory,
  SIMULATION_PRESETS,
} from './services/psiApi';
import {
  DEFAULT_ALERT_CONFIG,
  dispatchWebNotification,
  evaluateAirQualityThresholds,
  loadAlertConfig,
  loadAlertLogs,
  playAlertChime,
  saveAlertConfig,
  saveAlertLogs,
} from './services/notificationService';

export default function App() {
  const [data, setData] = useState<PsiApiResponse | null>(null);
  const [history, setHistory] = useState<HistoricalReadingPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'live_nea' | 'haze' | 'elevated' | 'clean'>('live_nea');
  const [selectedRegionKey, setSelectedRegionKey] = useState<RegionKey>('national');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Configuration and alert histories
  const [alertConfig, setAlertConfig] = useState<AlertThresholdConfig>(loadAlertConfig);
  const [alertLogs, setAlertLogs] = useState<AlertLogItem[]>(loadAlertLogs);
  const [handledBreaches, setHandledBreaches] = useState<Set<string>>(new Set());

  // Initial load & data fetching
  const loadData = useCallback(async (scenario = activeScenario) => {
    setIsRefreshing(true);
    try {
      const res = await fetchLiveSingaporePsiData(scenario);
      setData(res);
      setHistory(generate24HourHistory(res.nationalPsi));
    } catch (err) {
      console.error('Failed to load Singapore PSI telemetry', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeScenario]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      loadData();
    }, 120000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Scenario Switch
  const handleScenarioChange = (scenario: 'live_nea' | 'haze' | 'elevated' | 'clean') => {
    setActiveScenario(scenario);
    setBannerDismissed(false);
    loadData(scenario);
  };

  // Evaluate threshold breaches whenever data or config changes
  useEffect(() => {
    if (!data) return;

    const { newBreaches } = evaluateAirQualityThresholds(
      data.regions,
      alertConfig,
      handledBreaches
    );

    if (newBreaches.length > 0) {
      // Append to handled breach set
      const updatedHandled = new Set(handledBreaches);
      newBreaches.forEach((b) => updatedHandled.add(b.id));
      setHandledBreaches(updatedHandled);

      // Save to logs
      const updatedLogs = [...newBreaches, ...alertLogs];
      setAlertLogs(updatedLogs);
      saveAlertLogs(updatedLogs);

      // Play audio chime if enabled
      if (alertConfig.soundEnabled) {
        playAlertChime();
      }

      // Fire browser Web Notification
      if (alertConfig.pushEnabled) {
        newBreaches.forEach((b) => {
          dispatchWebNotification(b.title, {
            body: b.body,
          });
        });
      }
    }
  }, [data, alertConfig, handledBreaches, alertLogs]);

  // Active breached regions list
  const activeBreachedRegions = useMemo(() => {
    if (!data) return [];
    return alertConfig.monitoredRegions
      .map((key) => data.regions[key])
      .filter(
        (reg): reg is RegionData =>
          !!reg &&
          (reg.readings.psi24h >= alertConfig.psiThreshold ||
            reg.readings.pm25Hourly >= alertConfig.pm25Threshold)
      );
  }, [data, alertConfig]);

  // Manual Trigger Test Notification
  const handleTriggerTestNotification = () => {
    const testItem: AlertLogItem = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
      }),
      region: 'west',
      regionName: 'West Region (Jurong)',
      psi: 145,
      pm25: 98,
      band: 'unhealthy',
      title: 'Air Quality Alert: West Region (Test)',
      body: '24-hr PSI has reached 145 (UNHEALTHY). High PM2.5 detected. Reduce prolonged outdoor exertion.',
      acknowledged: false,
    };

    const updatedLogs = [testItem, ...alertLogs];
    setAlertLogs(updatedLogs);
    saveAlertLogs(updatedLogs);

    if (alertConfig.soundEnabled) {
      playAlertChime();
    }

    dispatchWebNotification(testItem.title, {
      body: testItem.body,
    });
  };

  const handleSaveConfig = (newConfig: AlertThresholdConfig) => {
    setAlertConfig(newConfig);
    saveAlertConfig(newConfig);
  };

  const handleClearLogs = () => {
    setAlertLogs([]);
    saveAlertLogs([]);
  };

  const selectedRegion = data ? data.regions[selectedRegionKey] || data.regions.national : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        activeBreachCount={activeBreachedRegions.length}
        unreadAlertCount={alertLogs.length}
      />

      {/* Persistent Threshold Breach Alert Banner */}
      {!bannerDismissed && activeBreachedRegions.length > 0 && (
        <ActiveAlertBanner
          breachedRegions={activeBreachedRegions}
          onDismiss={() => setBannerDismissed(true)}
          onOpenSettings={() => setIsAlertModalOpen(true)}
          onSelectRegion={(key) => setSelectedRegionKey(key)}
        />
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {data ? (
          <>
            {/* National & Regional PSI Overview */}
            <PsiOverview
              data={data}
              selectedRegionKey={selectedRegionKey}
              onSelectRegion={(key) => setSelectedRegionKey(key)}
              onRefresh={() => loadData(activeScenario)}
              isRefreshing={isRefreshing}
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              psiThreshold={alertConfig.psiThreshold}
            />

            {/* Interactive Singapore Map with Wind & Regional GIS */}
            <SingaporeMap
              data={data}
              selectedRegionKey={selectedRegionKey}
              onSelectRegion={(key) => setSelectedRegionKey(key)}
              psiThreshold={alertConfig.psiThreshold}
            />

            {/* 24-Hour PSI Trend Trajectory & Pollutant Breakdown */}
            {selectedRegion && (
              <PsiTrendCharts
                history={history}
                selectedRegion={selectedRegion}
                psiThreshold={alertConfig.psiThreshold}
              />
            )}

            {/* NEA & MOH Health Advisory Guidelines */}
            <NeaHealthAdvisory
              currentBand={data.nationalBand}
              currentPsi={data.nationalPsi}
            />
          </>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-slate-400">
              Connecting to Singapore NEA Telemetry API...
            </p>
          </div>
        )}
      </main>

      {/* Clean Scientific Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Data Source: National Environment Agency (NEA) Singapore</span>
            <span aria-hidden="true">·</span>
            <span>API: data.gov.sg/v1/environment/psi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Updated hourly by NEA</span>
            <span aria-hidden="true">·</span>
            <span>Ready for Serverless Push Dispatch</span>
          </div>
        </div>
      </footer>

      {/* Alert Configuration & Web Push Modal */}
      <AlertThresholdModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        config={alertConfig}
        onSaveConfig={handleSaveConfig}
        alertLogs={alertLogs}
        onClearLogs={handleClearLogs}
        onTriggerTestNotification={handleTriggerTestNotification}
      />
    </div>
  );
}
