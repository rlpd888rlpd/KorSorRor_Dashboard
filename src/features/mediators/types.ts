export type RegistrationType = 'DUAL' | 'GOVERNMENT' | 'PUBLIC' | 'UNREGISTERED';

export interface MediatorKPISummary {
  total: number;
  dualCount: number;
  govCount: number;
  publicCount: number;
  unregisteredCount: number;
  activeCount: number;
  inactiveCount: number;
  activeRate: number;
  provinceCoverage: number;
}

export interface YearTrendItem {
  year: string;
  registrations: number;
  cumulative: number;
}

export interface ExpiryForecastItem {
  year: string;
  expiringCount: number;
}

export interface RegionStatItem {
  region: string;
  total: number;
  active: number;
}

export interface ProvinceStatItem {
  province: string;
  region: string;
  total: number;
  govCount: number;
  publicCount: number;
  activeCount: number;
  expiredCount: number;
  activeRate: number;
}

export interface GenderRatioItem {
  name: string;
  value: number;
  color: string;
}

export interface ExecutiveStatsResponse {
  kpis: MediatorKPISummary;
  yearTrends: YearTrendItem[];
  expiryForecasts: ExpiryForecastItem[];
  topProvinces: ProvinceStatItem[];
  regionalStats: RegionStatItem[];
  allProvinces: ProvinceStatItem[];
  genderRatios: GenderRatioItem[];
}
