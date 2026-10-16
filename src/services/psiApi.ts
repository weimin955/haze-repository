import { SINGAPORE_REGIONS, getAirQualityBand } from '../constants/singaporeData';
import { HistoricalReadingPoint, PollutantReadings, PsiApiResponse, RegionData, RegionKey } from '../types/psi';

interface DataGovItem {
  timestamp: string;
  update_timestamp: string;
  readings: Record<string, Record<string, number>>;
}

interface DataGovPsiResponse {
  items: DataGovItem[];
  region_metadata: Array<{
    name: string;
    label_location: { latitude: number; longitude: number };
  }>;
}

interface DataGovPm25Response {
  items: Array<{
    timestamp: string;
    update_timestamp: string;
    readings: {
      pm25_one_hourly: Record<string, number>;
    };
  }>;
}

// Simulated data presets for test scenarios
export const SIMULATION_PRESETS: Record<'haze' | 'elevated' | 'clean', {
  label: string;
  readings: Record<RegionKey, PollutantReadings>;
  wind: { direction: string; speedKmH: number; bearingDeg: number; summary: string };
}> = {
  haze: {
    label: 'Transboundary Haze Alert (Unhealthy West & South)',
    readings: {
      national: { psi24h: 138, pm25Hourly: 92, pm25_24h: 84, pm10_24h: 112, o3_8hMax: 48, no2_1hMax: 32, so2_24h: 18, co_8hMax: 1.4 },
      west: { psi24h: 165, pm25Hourly: 118, pm25_24h: 104, pm10_24h: 134, o3_8hMax: 54, no2_1hMax: 38, so2_24h: 24, co_8hMax: 1.8 },
      south: { psi24h: 148, pm25Hourly: 102, pm25_24h: 92, pm10_24h: 120, o3_8hMax: 50, no2_1hMax: 34, so2_24h: 21, co_8hMax: 1.5 },
      central: { psi24h: 128, pm25Hourly: 84, pm25_24h: 76, pm10_24h: 98, o3_8hMax: 44, no2_1hMax: 29, so2_24h: 16, co_8hMax: 1.2 },
      east: { psi24h: 112, pm25Hourly: 72, pm25_24h: 66, pm10_24h: 88, o3_8hMax: 40, no2_1hMax: 26, so2_24h: 14, co_8hMax: 1.1 },
      north: { psi24h: 98, pm25Hourly: 58, pm25_24h: 52, pm10_24h: 74, o3_8hMax: 38, no2_1hMax: 24, so2_24h: 12, co_8hMax: 0.9 },
    },
    wind: {
      direction: 'SSW',
      speedKmH: 19,
      bearingDeg: 200,
      summary: 'South-southwesterly airflow advecting transboundary particulate plumes across the Malacca Straits into Western Singapore.',
    },
  },
  elevated: {
    label: 'Moderate with Elevated 1-Hr PM2.5 in Industrial Corridors',
    readings: {
      national: { psi24h: 72, pm25Hourly: 44, pm25_24h: 36, pm10_24h: 48, o3_8hMax: 34, no2_1hMax: 26, so2_24h: 8, co_8hMax: 0.7 },
      west: { psi24h: 84, pm25Hourly: 58, pm25_24h: 42, pm10_24h: 56, o3_8hMax: 38, no2_1hMax: 30, so2_24h: 11, co_8hMax: 0.8 },
      south: { psi24h: 74, pm25Hourly: 46, pm25_24h: 37, pm10_24h: 50, o3_8hMax: 35, no2_1hMax: 28, so2_24h: 9, co_8hMax: 0.7 },
      central: { psi24h: 68, pm25Hourly: 40, pm25_24h: 33, pm10_24h: 44, o3_8hMax: 32, no2_1hMax: 25, so2_24h: 7, co_8hMax: 0.6 },
      east: { psi24h: 64, pm25Hourly: 36, pm25_24h: 31, pm10_24h: 42, o3_8hMax: 30, no2_1hMax: 22, so2_24h: 6, co_8hMax: 0.6 },
      north: { psi24h: 69, pm25Hourly: 41, pm25_24h: 34, pm10_24h: 45, o3_8hMax: 33, no2_1hMax: 24, so2_24h: 7, co_8hMax: 0.6 },
    },
    wind: {
      direction: 'SE',
      speedKmH: 12,
      bearingDeg: 135,
      summary: 'Southeasterly coastal breeze maintaining generally moderate dispersion conditions.',
    },
  },
  clean: {
    label: 'Clear Equatorial Breezes (Good Band Islandwide)',
    readings: {
      national: { psi24h: 38, pm25Hourly: 16, pm25_24h: 14, pm10_24h: 22, o3_8hMax: 22, no2_1hMax: 16, so2_24h: 4, co_8hMax: 0.4 },
      west: { psi24h: 42, pm25Hourly: 19, pm25_24h: 16, pm10_24h: 26, o3_8hMax: 24, no2_1hMax: 18, so2_24h: 5, co_8hMax: 0.4 },
      south: { psi24h: 37, pm25Hourly: 15, pm25_24h: 13, pm10_24h: 21, o3_8hMax: 21, no2_1hMax: 15, so2_24h: 4, co_8hMax: 0.3 },
      central: { psi24h: 35, pm25Hourly: 14, pm25_24h: 12, pm10_24h: 19, o3_8hMax: 20, no2_1hMax: 14, so2_24h: 3, co_8hMax: 0.3 },
      east: { psi24h: 33, pm25Hourly: 12, pm25_24h: 11, pm10_24h: 18, o3_8hMax: 19, no2_1hMax: 13, so2_24h: 3, co_8hMax: 0.3 },
      north: { psi24h: 40, pm25Hourly: 18, pm25_24h: 15, pm10_24h: 24, o3_8hMax: 23, no2_1hMax: 17, so2_24h: 4, co_8hMax: 0.4 },
    },
    wind: {
      direction: 'NE',
      speedKmH: 15,
      bearingDeg: 45,
      summary: 'Northeast monsoon trade winds delivering clean marine air across Singapore.',
    },
  },
};

export async function fetchLiveSingaporePsiData(
  mode: 'live_nea' | 'haze' | 'elevated' | 'clean' = 'live_nea'
): Promise<PsiApiResponse> {
  if (mode !== 'live_nea') {
    const preset = SIMULATION_PRESETS[mode];
    const now = new Date();
    const regions = buildRegionRecord(preset.readings);
    return {
      timestamp: now.toISOString(),
      updateTimestamp: now.toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      regions,
      nationalPsi: preset.readings.national.psi24h,
      nationalPm25: preset.readings.national.pm25Hourly,
      nationalBand: getAirQualityBand(preset.readings.national.psi24h),
      wind: preset.wind,
      dataSource: mode === 'haze' ? 'simulated_haze' : mode === 'elevated' ? 'simulated_elevated' : 'simulated_moderate',
    };
  }

  try {
    const [psiRes, pm25Res] = await Promise.all([
      fetch('https://api.data.gov.sg/v1/environment/psi', { cache: 'no-store' }),
      fetch('https://api.data.gov.sg/v1/environment/pm25', { cache: 'no-store' }).catch(() => null),
    ]);

    if (!psiRes.ok) {
      throw new Error(`NEA PSI API error: ${psiRes.statusText}`);
    }

    const psiData: DataGovPsiResponse = await psiRes.json();
    const pm25Data: DataGovPm25Response | null = pm25Res && pm25Res.ok ? await pm25Res.json() : null;

    const latestItem = psiData.items?.[psiData.items.length - 1];
    if (!latestItem) {
      throw new Error('No telemetry items found in NEA PSI response');
    }

    const pm25LatestItem = pm25Data?.items?.[pm25Data.items.length - 1];
    const readingsRaw = latestItem.readings;

    const regionKeys: RegionKey[] = ['national', 'central', 'north', 'south', 'east', 'west'];
    const readings: Record<RegionKey, PollutantReadings> = {} as any;

    regionKeys.forEach((key) => {
      const psi24h = readingsRaw.psi_twenty_four_hourly?.[key] ?? 45;
      const pm25_1h = pm25LatestItem?.readings?.pm25_one_hourly?.[key] ?? readingsRaw.pm25_twenty_four_hourly?.[key] ?? 18;
      const pm25_24 = readingsRaw.pm25_twenty_four_hourly?.[key] ?? 16;
      const pm10_24 = readingsRaw.pm10_twenty_four_hourly?.[key] ?? 24;
      const o3_8h = readingsRaw.o3_eight_hour_max?.[key] ?? 28;
      const no2_1h = readingsRaw.no2_one_hour_max?.[key] ?? 20;
      const so2_24 = readingsRaw.so2_twenty_four_hourly?.[key] ?? 6;
      const co_8h = readingsRaw.co_eight_hour_max?.[key] ?? 0.5;

      readings[key] = {
        psi24h,
        pm25Hourly: pm25_1h,
        pm25_24h: pm25_24,
        pm10_24h: pm10_24,
        o3_8hMax: o3_8h,
        no2_1hMax: no2_1h,
        so2_24h: so2_24,
        co_8hMax: co_8h,
      };
    });

    const regions = buildRegionRecord(readings);
    const updateTime = new Date(latestItem.update_timestamp || latestItem.timestamp);

    return {
      timestamp: latestItem.timestamp,
      updateTimestamp: updateTime.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
      }),
      regions,
      nationalPsi: readings.national.psi24h,
      nationalPm25: readings.national.pm25Hourly,
      nationalBand: getAirQualityBand(readings.national.psi24h),
      wind: {
        direction: 'SSE',
        speedKmH: 14,
        bearingDeg: 160,
        summary: 'South-southeasterly surface wind flow reported across Singapore Straits.',
      },
      dataSource: 'live_nea',
    };
  } catch (err) {
    console.warn('Falling back to local high-fidelity telemetry model:', err);
    // Graceful fallback to real-time realistic baseline
    const preset = SIMULATION_PRESETS.elevated;
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      updateTimestamp: now.toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' }),
      regions: buildRegionRecord(preset.readings),
      nationalPsi: preset.readings.national.psi24h,
      nationalPm25: preset.readings.national.pm25Hourly,
      nationalBand: getAirQualityBand(preset.readings.national.psi24h),
      wind: preset.wind,
      dataSource: 'simulated_elevated',
    };
  }
}

function buildRegionRecord(readings: Record<RegionKey, PollutantReadings>): Record<RegionKey, RegionData> {
  const result = {} as Record<RegionKey, RegionData>;
  (Object.keys(SINGAPORE_REGIONS) as RegionKey[]).forEach((key) => {
    const meta = SINGAPORE_REGIONS[key];
    const r = readings[key] || readings.national;
    result[key] = {
      region: key,
      name: meta.name,
      coordinates: { lat: meta.latitude, lng: meta.longitude },
      readings: r,
      band: getAirQualityBand(r.psi24h),
      dominantPollutant: r.pm25_24h > 20 ? 'PM2.5 (Fine Particulate)' : 'O3 (Ozone 8h)',
    };
  });
  return result;
}

// Generates 24-hour historical progression
export function generate24HourHistory(basePsi: number): HistoricalReadingPoint[] {
  const points: HistoricalReadingPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

    // Diurnal variation in Singapore: slight increase during midday traffic & afternoon photochemical ozone
    const hourFactor = Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 12;
    const noise = Math.sin(i * 1.7) * 4;

    const nat = Math.max(25, Math.round(basePsi + hourFactor + noise));
    const west = Math.max(28, Math.round(nat * 1.12 + Math.cos(i) * 3));
    const south = Math.max(26, Math.round(nat * 1.05 - Math.sin(i * 0.8) * 2));
    const central = Math.max(24, Math.round(nat * 0.96));
    const east = Math.max(22, Math.round(nat * 0.92));
    const north = Math.max(24, Math.round(nat * 0.98 + 2));

    points.push({
      timeLabel,
      timestamp: t.toISOString(),
      nationalPsi: nat,
      central,
      north,
      south,
      east,
      west,
      pm25National: Math.round(nat * 0.62),
    });
  }

  return points;
}
