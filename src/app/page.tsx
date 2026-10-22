'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { MediatorsTabView } from '@/features/mediators/components/mediators-tab-view';
import { ExpoTabView } from '@/features/mediation-expo/components/expo-tab-view';
import { DashboardNav, ActiveTab } from '@/features/navigation/components/dashboard-nav';
import { SyncButton } from '@/features/sync/components/sync-button';
import { getExecutiveStatisticalData } from '@/features/mediators/services/statistical-service';
import { ExecutiveStatsResponse } from '@/features/mediators/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mediators');
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

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {activeTab === 'mediators'
                ? 'ศูนย์ข้อมูลและสถิติผู้ไกล่เกลี่ยข้อพิพาทระดับประเทศ (Executive Intelligence)'
                : 'ศูนย์ติดตามสถิติมหกรรมไกล่เกลี่ยข้อพิพาท (Mediation Expo)'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตามพระราชบัญญัติการไกล่เกลี่ยข้อพิพาท พ.ศ. 2562 • ข้อมูลภาพรวมเชิงสถิติ (100% PDPA Compliant)
          </p>
        </div>

        {/* Action Buttons: Google Sheets Sync & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SyncButton onSyncComplete={loadData} />

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>รีเฟรชสถิติ</span>
          </button>
        </div>
      </div>

      {/* Tab Views */}
      {loading && !data ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">กำลังประมวลผลสถิติและแนวโน้มระดับประเทศ...</p>
        </div>
      ) : activeTab === 'mediators' ? (
        <MediatorsTabView data={data} />
      ) : (
        <ExpoTabView />
      )}
    </div>
  );
}
