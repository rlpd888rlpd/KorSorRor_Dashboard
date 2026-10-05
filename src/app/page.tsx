'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Award, CheckCircle2, RefreshCw } from 'lucide-react';
import { KPICard } from '@/features/mediators/components/kpi-card';
import { FilterBar } from '@/features/mediators/components/filter-bar';
import { MediatorsTable } from '@/features/mediators/components/mediators-table';
import { StatsCharts } from '@/features/mediators/components/stats-charts';
import { getMediatorKPIs, getMediatorsList, getProvinceList } from '@/features/mediators/services/mediator-service';
import { MediatorItem, MediatorKPISummary, MediatorFilters } from '@/features/mediators/types';

export default function MediatorsDashboardPage() {
  const [kpis, setKpis] = useState<MediatorKPISummary>({
    total: 0, dualCount: 0, govCount: 0, publicCount: 0, unregisteredCount: 0, activeCount: 0, inactiveCount: 0
  });
  const [provinces, setProvinces] = useState<string[]>([]);
  const [mediators, setMediators] = useState<MediatorItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<MediatorFilters>({
    search: '',
    province: 'ALL',
    type: 'ALL',
    status: 'ALL',
    page: 1,
    pageSize: 15
  });

  const loadData = async (currentFilters: MediatorFilters) => {
    setLoading(true);
    const [kpiRes, listRes, provRes] = await Promise.all([
      getMediatorKPIs(),
      getMediatorsList(currentFilters),
      getProvinceList()
    ]);
    setKpis(kpiRes);
    setMediators(listRes.data);
    setTotalResults(listRes.count);
    setProvinces(provRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData(filters);
  }, [filters.province, filters.type, filters.status, filters.page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData(filters);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const handleReset = () => {
    const defaultFilters: MediatorFilters = {
      search: '',
      province: 'ALL',
      type: 'ALL',
      status: 'ALL',
      page: 1,
      pageSize: 15
    };
    setFilters(defaultFilters);
    loadData(defaultFilters);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData(filters);
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            ฐานข้อมูลและสถิติผู้ไกล่เกลี่ยข้อพิพาท
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตามพระราชบัญญัติการไกล่เกลี่ยข้อพิพาท พ.ศ. 2562 (ซิงค์อัตโนมัติจากฐานข้อมูลกลาง)
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="ผู้ไกล่เกลี่ยทั้งหมด"
          value={kpis.total}
          subtitle="ยอดสะสมในฐานข้อมูล"
          icon={Users}
          badge="ทั่วประเทศ"
          badgeColor="blue"
        />
        <KPICard
          title="ขึ้นทะเบียนทั้ง 2 ประเภท"
          value={kpis.dualCount}
          subtitle="ภาครัฐและภาคประชาชน"
          icon={Award}
          badge="สัดส่วนหลัก"
          badgeColor="purple"
        />
        <KPICard
          title="เฉพาะภาคประชาชน"
          value={kpis.publicCount}
          subtitle="ศูนย์ไกล่เกลี่ยภาคประชาชน"
          icon={Shield}
          badge="ประชาชน"
          badgeColor="green"
        />
        <KPICard
          title="สถานะมีผลใช้งาน"
          value={kpis.activeCount}
          subtitle={`หมดอายุแล้ว ${kpis.inactiveCount.toLocaleString()} คน`}
          icon={CheckCircle2}
          badge="Active"
          badgeColor="green"
        />
      </div>

      {/* Stats Charts */}
      <StatsCharts kpis={kpis} />

      {/* Filter and Table Section */}
      <div>
        <FilterBar
          filters={filters}
          provinces={provinces}
          onFilterChange={setFilters}
          onReset={handleReset}
          totalResults={totalResults}
        />

        <MediatorsTable
          mediators={mediators}
          page={filters.page || 1}
          pageSize={filters.pageSize || 15}
          total={totalResults}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
          loading={loading}
        />
      </div>
    </div>
  );
}
