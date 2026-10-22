'use client';

import React from 'react';
import { Users, Award, ShieldCheck, MapPin } from 'lucide-react';
import { KPICard } from './kpi-card';
import { StatsTrendsCharts } from './stats-trends-charts';
import { GeographicCharts } from './geographic-charts';
import { DemographicsCharts } from './demographics-charts';
import { ProvincialMatrixTable } from './provincial-matrix-table';
import { ExecutiveStatsResponse } from '../types';

interface MediatorsTabViewProps {
  data: ExecutiveStatsResponse | null;
}

export function MediatorsTabView({ data }: MediatorsTabViewProps) {
  const kpis = data?.kpis || {
    total: 7964,
    dualCount: 0,
    govCount: 0,
    publicCount: 0,
    unregisteredCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    activeRate: 0,
    provinceCoverage: 77,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="ผู้ไกล่เกลี่ยสะสมทั้งหมด"
          value={kpis.total}
          subtitle="ยอดผู้ผ่านการขึ้นทะเบียนทั่วประเทศ"
          icon={Users}
          badge="สะสม 2562-ปัจจุบัน"
          badgeColor="blue"
        />
        <KPICard
          title="ขึ้นทะเบียนทั้ง 2 ด้าน"
          value={kpis.dualCount}
          subtitle="ความพร้อมทั้งภาครัฐและภาคประชาชน"
          icon={Award}
          badge="สัดส่วนหลัก"
          badgeColor="purple"
        />
        <KPICard
          title="สถานะพร้อมปฏิบัติงาน"
          value={kpis.activeCount}
          subtitle={`คิดเป็น ${kpis.activeRate}% ของผู้ไกล่เกลี่ยทั้งหมด`}
          icon={ShieldCheck}
          badge="Active"
          badgeColor="green"
        />
        <KPICard
          title="พื้นที่ครอบคลุมทั่วประเทศ"
          value={`${kpis.provinceCoverage} จังหวัด`}
          subtitle="กระจายตัวครบทุกภูมิภาค"
          icon={MapPin}
          badge="100% ครอบคลุม"
          badgeColor="amber"
        />
      </div>

      {/* 1. Growth & Expiry Forecasts */}
      {data && (
        <StatsTrendsCharts
          yearTrends={data.yearTrends}
          expiryForecasts={data.expiryForecasts}
        />
      )}

      {/* 2. Geographic & Regional Distribution */}
      {data && (
        <GeographicCharts
          topProvinces={data.topProvinces}
          regionalStats={data.regionalStats}
        />
      )}

      {/* 3. Demographics & Registration Categories */}
      {data && (
        <DemographicsCharts
          genderRatios={data.genderRatios}
          kpis={data.kpis}
        />
      )}

      {/* 4. Provincial Statistical Matrix (No PII) */}
      {data && (
        <ProvincialMatrixTable
          provinces={data.allProvinces}
        />
      )}
    </div>
  );
}
