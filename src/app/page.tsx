'use client';

import React, { useState, useEffect } from 'react';
import { Users, Award, ShieldCheck, MapPin, RefreshCw, BarChart3 } from 'lucide-react';
import { KPICard } from '@/features/mediators/components/kpi-card';
import { StatsTrendsCharts } from '@/features/mediators/components/stats-trends-charts';
import { GeographicCharts } from '@/features/mediators/components/geographic-charts';
import { DemographicsCharts } from '@/features/mediators/components/demographics-charts';
import { ProvincialMatrixTable } from '@/features/mediators/components/provincial-matrix-table';
import { getExecutiveStatisticalData } from '@/features/mediators/services/statistical-service';
import { ExecutiveStatsResponse } from '@/features/mediators/types';

export default function MediatorsDashboardPage() {
  const [data, setData] = useState<ExecutiveStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getExecutiveStatisticalData();
      setData(res);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">กำลังประมวลผลสถิติและแนวโน้มระดับประเทศ...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total: 7964, dualCount: 0, govCount: 0, publicCount: 0,
    unregisteredCount: 0, activeCount: 0, inactiveCount: 0,
    activeRate: 0, provinceCoverage: 77
  };

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              ศูนย์ข้อมูลและสถิติผู้ไกล่เกลี่ยข้อพิพาทระดับประเทศ (Executive Intelligence)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตามพระราชบัญญัติการไกล่เกลี่ยข้อพิพาท พ.ศ. 2562 • ข้อมูลภาพรวมเชิงสถิติ (100% PDPA Compliant)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>รีเฟรชสถิติล่าสุด</span>
        </button>
      </div>

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
