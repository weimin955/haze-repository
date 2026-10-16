export type RegionKey = 'central' | 'north' | 'south' | 'east' | 'west' | 'national';

export type AirQualityBand = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityLevelInfo {
  band: AirQualityBand;
  label: string;
  psiRange: string;
  pm25Range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  healthImplications: string;
  healthyGeneralGuidance: string;
  vulnerableGuidance: string;
}

export interface RegionMetadata {
  key: RegionKey;
  name: string;
  stationName: string;
  latitude: number;
  longitude: number;
  suburbs: string[];
}

export interface PollutantReadings {
  psi24h: number;
  pm25Hourly: number;
  pm25_24h: number;
  pm10_24h: number;
  o3_8hMax: number;
  no2_1hMax: number;
  so2_24h: number;
  co_8hMax: number;
}

export interface RegionData {
  region: RegionKey;
  name: string;
  coordinates: { lat: number; lng: number };
  readings: PollutantReadings;
  band: AirQualityBand;
  dominantPollutant: string;
  isBreached?: boolean;
}

export interface PsiApiResponse {
  timestamp: string;
  updateTimestamp: string;
  regions: Record<RegionKey, RegionData>;
  nationalPsi: number;
  nationalPm25: number;
  nationalBand: AirQualityBand;
  wind: {
    direction: string;
    speedKmH: number;
    bearingDeg: number;
    summary: string;
  };
  dataSource: 'live_nea' | 'simulated_haze' | 'simulated_elevated' | 'simulated_moderate';
}

export interface HistoricalReadingPoint {
  timeLabel: string;
  timestamp: string;
  nationalPsi: number;
  central: number;
  north: number;
  south: number;
  east: number;
  west: number;
  pm25National: number;
}

export interface AlertThresholdConfig {
  psiThreshold: number; // e.g. 100
  pm25Threshold: number; // e.g. 55
  monitoredRegions: RegionKey[];
  soundEnabled: boolean;
  pushEnabled: boolean;
  notifyOnRecovery: boolean;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  region: RegionKey;
  regionName: string;
  psi: number;
  pm25: number;
  band: AirQualityBand;
  title: string;
  body: string;
  acknowledged: boolean;
}
