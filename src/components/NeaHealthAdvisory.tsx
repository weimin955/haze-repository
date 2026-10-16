import React from 'react';
import { AIR_QUALITY_LEVELS } from '../constants/singaporeData';
import { AirQualityBand } from '../types/psi';
import { HeartPulse, Users, Baby, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NeaHealthAdvisoryProps {
  currentBand: AirQualityBand;
  currentPsi: number;
}

export const NeaHealthAdvisory: React.FC<NeaHealthAdvisoryProps> = ({
  currentBand,
  currentPsi,
}) => {
  const activeLevel = AIR_QUALITY_LEVELS[currentBand];

  return (
    <section id="advisory" className="space-y-6 pt-6 border-t border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-400 font-semibold">Public Health Protocols</span>
            <span aria-hidden="true">·</span>
            <span>Singapore MOH & NEA Official Guidelines</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Singapore Health Advisory Matrix
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Islandwide State:</span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider"
            style={{
              color: activeLevel.color,
              borderColor: activeLevel.borderColor,
              backgroundColor: activeLevel.bgColor,
            }}
          >
            {activeLevel.label} (PSI {currentPsi})
          </span>
        </div>
      </div>

      {/* Target Demographic Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Healthy Population */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Healthy Persons</h3>
                <span className="text-[11px] text-slate-400">General Working Adult Population</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Current Status Guidance
                </span>
                <p className="font-medium text-slate-200">
                  {currentPsi <= 100
                    ? 'Normal outdoor activities permitted without restriction. Exercise and sports outdoors are safe.'
                    : currentPsi <= 200
                    ? 'Reduce prolonged or strenuous outdoor physical exertion. Take regular indoor breaks.'
                    : 'Avoid prolonged or strenuous outdoor physical exertion. Prefer indoor conditioned environments.'}
                </p>
              </div>

              <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                <li>Jogging & cycling: Monitor personal respiration during exercise.</li>
                <li>Stay well hydrated and rinse eyes if mild particulate irritation occurs.</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>N95 respirator optional unless exerting strenuous work in Unhealthy band.</span>
          </div>
        </div>

        {/* Elderly, Pregnant & Children */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Elderly, Pregnant & Children</h3>
                <span className="text-[11px] text-slate-400">Vulnerable Physiological Groups</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Current Status Guidance
                </span>
                <p className="font-medium text-slate-200">
                  {currentPsi <= 100
                    ? 'Normal outdoor recreation permitted. Ensure hydration in sunny conditions.'
                    : currentPsi <= 200
                    ? 'Minimize prolonged or strenuous outdoor activities. Pre-schoolers and children should remain in sheltered indoor spaces.'
                    : 'Avoid outdoor activity completely. Stay indoors with windows closed.'}
                </p>
              </div>

              <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                <li>Pre-schools and schools observe MOE Haze Management Standard Operating Procedures.</li>
                <li>Keep indoor air purifiers running on HEPA mode if available.</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Pregnant women and elderly should not wear tight N95 for extended hours without rest.</span>
          </div>
        </div>

        {/* Chronic Respiratory & Cardiac Conditions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Chronic Heart & Lung Conditions</h3>
                <span className="text-[11px] text-slate-400">Asthma, COPD, Cardiovascular</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Current Status Guidance
                </span>
                <p className="font-medium text-slate-200">
                  {currentPsi <= 50
                    ? 'Normal outdoor activities permitted.'
                    : currentPsi <= 100
                    ? 'Monitor symptoms. Keep personal relief medication (inhalers) within immediate reach.'
                    : 'Avoid outdoor activity. Remain in sealed, air-conditioned environments.'}
                </p>
              </div>

              <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                <li>Have 2-3 weeks of maintenance medication replenished.</li>
                <li>Seek prompt medical attention at a polyclinic or clinic if wheezing occurs.</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Consult doctor prior to N95 use as respirators increase breathing resistance.</span>
          </div>
        </div>
      </div>

      {/* Practical Guide on 1-Hr PM2.5 vs 24-Hr PSI */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
        <h4 className="font-bold text-white text-sm mb-1">
          Understanding Singapore's 1-Hour PM2.5 vs 24-Hour PSI
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-slate-400">
          <div>
            <strong className="text-cyan-300">1-Hour PM2.5 (µg/m³):</strong> Reflects immediate, real-time particulate concentrations over the past hour. Use this to decide immediate activities in the next 1 to 2 hours (e.g. deciding whether to go for a jog right now).
          </div>
          <div>
            <strong className="text-amber-300">24-Hour PSI:</strong> An integrated composite index reflecting the total exposure dosage over the past 24 hours. Used by government agencies and schools to guide overall daily operational planning.
          </div>
        </div>
      </div>
    </section>
  );
};
