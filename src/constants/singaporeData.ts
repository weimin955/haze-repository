import { AirQualityBand, AirQualityLevelInfo, RegionKey, RegionMetadata } from '../types/psi';

export const SINGAPORE_REGIONS: Record<RegionKey, RegionMetadata> = {
  national: {
    key: 'national',
    name: 'Singapore (National)',
    stationName: 'National Telemetry Aggregate',
    latitude: 1.3521,
    longitude: 103.8198,
    suburbs: ['Singapore Islandwide', 'Offshore Islands'],
  },
  central: {
    key: 'central',
    name: 'Central Region',
    stationName: 'Central Telemetry Station (Bishan / Orchard)',
    latitude: 1.35735,
    longitude: 103.82,
    suburbs: ['Orchard', 'Bishan', 'Marina Bay', 'Toa Payoh', 'Ang Mo Kio', 'Novena'],
  },
  north: {
    key: 'north',
    name: 'North Region',
    stationName: 'North Telemetry Station (Woodlands)',
    latitude: 1.41803,
    longitude: 103.82,
    suburbs: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Admiralty'],
  },
  south: {
    key: 'south',
    name: 'South Region',
    stationName: 'South Telemetry Station (HarbourFront)',
    latitude: 1.29587,
    longitude: 103.82,
    suburbs: ['HarbourFront', 'Telok Blangah', 'Sentosa', 'Queenstown', 'Marina South', 'Pasir Panjang'],
  },
  east: {
    key: 'east',
    name: 'East Region',
    stationName: 'East Telemetry Station (Tampines)',
    latitude: 1.357197,
    longitude: 103.94,
    suburbs: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar', 'Marine Parade'],
  },
  west: {
    key: 'west',
    name: 'West Region',
    stationName: 'West Telemetry Station (Jurong)',
    latitude: 1.35735,
    longitude: 103.7,
    suburbs: ['Jurong East', 'Jurong West', 'Tuas', 'Clementi', 'Boon Lay', 'Bukit Batok'],
  },
};

export const AIR_QUALITY_LEVELS: Record<AirQualityBand, AirQualityLevelInfo> = {
  good: {
    band: 'good',
    label: 'Good',
    psiRange: '0 – 50',
    pm25Range: '0 – 12 µg/m³',
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    textColor: 'text-emerald-400',
    description: 'Air quality is satisfactory and poses minimal or no health risk.',
    healthImplications: 'Air pollution poses little or no risk to the general population.',
    healthyGeneralGuidance: 'Normal outdoor activities can be enjoyed without restrictions.',
    vulnerableGuidance: 'Normal activities permitted.',
  },
  moderate: {
    band: 'moderate',
    label: 'Moderate',
    psiRange: '51 – 100',
    pm25Range: '13 – 55 µg/m³',
    color: '#06b6d4', // cyan-500 / teal
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    textColor: 'text-cyan-400',
    description: 'Air quality is acceptable. Fine particulate matter is within tolerable limits.',
    healthImplications: 'Minor sensitivity or eye irritation in a very small number of unusually sensitive individuals.',
    healthyGeneralGuidance: 'Normal outdoor activities for healthy individuals.',
    vulnerableGuidance: 'Sensitive persons with respiratory conditions should monitor symptoms during prolonged exertion.',
  },
  unhealthy: {
    band: 'unhealthy',
    label: 'Unhealthy',
    psiRange: '101 – 200',
    pm25Range: '56 – 150 µg/m³',
    color: '#f59e0b', // amber-500
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    textColor: 'text-amber-400',
    description: 'Pollutant concentrations exceed recommended safe exposure bounds.',
    healthImplications: 'Mild aggravation of symptoms among sensitive individuals, potential throat/eye irritation in general public.',
    healthyGeneralGuidance: 'Reduce prolonged or strenuous outdoor physical exertion.',
    vulnerableGuidance: 'Elderly, pregnant women, and children should avoid prolonged outdoor exertion. Persons with chronic lung/heart diseases should avoid outdoor activity. Wear N95 respirator if outdoor presence is required.',
  },
  very_unhealthy: {
    band: 'very_unhealthy',
    label: 'Very Unhealthy',
    psiRange: '201 – 300',
    pm25Range: '151 – 250 µg/m³',
    color: '#f97316', // orange-500
    bgColor: 'rgba(249, 115, 22, 0.18)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
    textColor: 'text-orange-400',
    description: 'Significant transboundary haze or stagnant atmospheric pollution detected.',
    healthImplications: 'Increased risk of throat irritation and breathing difficulty across general public; marked aggravation of heart/lung diseases.',
    healthyGeneralGuidance: 'Avoid prolonged or strenuous outdoor physical exertion.',
    vulnerableGuidance: 'Avoid all outdoor activity. Remain indoors with windows closed and air purifiers activated.',
  },
  hazardous: {
    band: 'hazardous',
    label: 'Hazardous',
    psiRange: '> 300',
    pm25Range: '> 250 µg/m³',
    color: '#ef4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.22)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
    textColor: 'text-rose-400',
    description: 'Emergency air pollution threshold. Health warning of emergency conditions.',
    healthImplications: 'General population likely to experience noticeable symptoms; severe aggravation of respiratory and cardiac diseases.',
    healthyGeneralGuidance: 'Minimize all outdoor activity. Stay indoors and seal ventilation gaps.',
    vulnerableGuidance: 'Stay indoors with air filtration. Seek medical attention if experiencing breathing distress.',
  },
};

export function getAirQualityBand(psi: number): AirQualityBand {
  if (psi <= 50) return 'good';
  if (psi <= 100) return 'moderate';
  if (psi <= 200) return 'unhealthy';
  if (psi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function getPm25Band(pm25: number): AirQualityBand {
  if (pm25 <= 12) return 'good';
  if (pm25 <= 55) return 'moderate';
  if (pm25 <= 150) return 'unhealthy';
  if (pm25 <= 250) return 'very_unhealthy';
  return 'hazardous';
}

export const REGIONAL_COORDINATES_POLYGONS: Record<
  Exclude<RegionKey, 'national'>,
  { center: [number, number]; coordinates: [number, number][] }
> = {
  west: {
    center: [1.35735, 103.7],
    coordinates: [
      [1.442, 103.685],
      [1.398, 103.745],
      [1.345, 103.775],
      [1.295, 103.745],
      [1.228, 103.635],
      [1.285, 103.605],
      [1.375, 103.635],
    ],
  },
  north: {
    center: [1.41803, 103.82],
    coordinates: [
      [1.472, 103.765],
      [1.458, 103.845],
      [1.415, 103.875],
      [1.385, 103.825],
      [1.398, 103.745],
      [1.442, 103.685],
    ],
  },
  central: {
    center: [1.35735, 103.82],
    coordinates: [
      [1.385, 103.825],
      [1.378, 103.872],
      [1.328, 103.875],
      [1.305, 103.845],
      [1.312, 103.795],
      [1.345, 103.775],
    ],
  },
  east: {
    center: [1.357197, 103.94],
    coordinates: [
      [1.415, 103.875],
      [1.412, 103.975],
      [1.385, 104.035],
      [1.325, 103.995],
      [1.295, 103.915],
      [1.328, 103.875],
      [1.378, 103.872],
    ],
  },
  south: {
    center: [1.29587, 103.82],
    coordinates: [
      [1.312, 103.795],
      [1.305, 103.845],
      [1.328, 103.875],
      [1.295, 103.915],
      [1.265, 103.865],
      [1.242, 103.825],
      [1.265, 103.785],
      [1.295, 103.745],
    ],
  },
};
