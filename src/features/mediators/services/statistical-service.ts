import { createClient } from '@/lib/supabase/client';
import { REGION_MAP } from '../constants';
import { ExecutiveStatsResponse, ProvinceStatItem, RegionStatItem, YearTrendItem, ExpiryForecastItem } from '../types';

async function fetchAllPaged<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
  pageCount: number
): Promise<T[]> {
  const pages = Array.from({ length: pageCount }, (_, i) => i);
  const results = await Promise.all(
    pages.map(async p => {
      const res = await query(p * 1000, p * 1000 + 999);
      return res.data || [];
    })
  );
  return results.flat();
}

export async function getExecutiveStatisticalData(): Promise<ExecutiveStatsResponse> {
  const supabase = createClient();
  try {
    const [items, govItems] = await Promise.all([
      fetchAllPaged(
        (from, to) => supabase.from('v_mediators_dashboard')
          .select('province, registration_type, is_active_overall, gender')
          .range(from, to),
        9
      ),
      fetchAllPaged(
        (from, to) => supabase.from('mediator_gov_registrations')
          .select('registration_year, expiration_date')
          .range(from, to),
        11
      ),
    ]);

    let dualCount = 0, govCount = 0, publicCount = 0, unregisteredCount = 0;
    let activeCount = 0, inactiveCount = 0;
    let maleCount = 0, femaleCount = 0, unspecifiedGender = 0;

    const provinceAgg: Record<string, { total: number; gov: number; pub: number; active: number; expired: number }> = {};
    const regionAgg: Record<string, { total: number; active: number }> = {
      'ภาคกลาง': { total: 0, active: 0 }, 'ภาคอีสาน': { total: 0, active: 0 },
      'ภาคเหนือ': { total: 0, active: 0 }, 'ภาคใต้': { total: 0, active: 0 },
      'ภาคตะวันออก': { total: 0, active: 0 }, 'ภาคตะวันตก': { total: 0, active: 0 },
      'อื่นๆ': { total: 0, active: 0 }
    };

    for (const r of items) {
      if (r.registration_type === 'DUAL') dualCount++;
      else if (r.registration_type === 'GOVERNMENT') govCount++;
      else if (r.registration_type === 'PUBLIC') publicCount++;
      else unregisteredCount++;

      if (r.is_active_overall) activeCount++; else inactiveCount++;

      const g = (r.gender || '').trim();
      if (g === 'ชาย') maleCount++;
      else if (g === 'หญิง') femaleCount++;
      else unspecifiedGender++;

      const prov = (r.province || '').trim() || 'ไม่ระบุ';
      if (!provinceAgg[prov]) provinceAgg[prov] = { total: 0, gov: 0, pub: 0, active: 0, expired: 0 };
      provinceAgg[prov].total++;
      if (r.registration_type === 'GOVERNMENT' || r.registration_type === 'DUAL') provinceAgg[prov].gov++;
      if (r.registration_type === 'PUBLIC' || r.registration_type === 'DUAL') provinceAgg[prov].pub++;
      if (r.is_active_overall) provinceAgg[prov].active++; else provinceAgg[prov].expired++;

      const reg = REGION_MAP[prov] || 'อื่นๆ';
      regionAgg[reg].total++;
      if (r.is_active_overall) regionAgg[reg].active++;
    }

    const expMap: Record<string, number> = {};
    for (const g of govItems) {
      if (g.expiration_date) {
        const y = parseInt(g.expiration_date.slice(0, 4), 10) + 543;
        if (y >= 2566 && y <= 2572) expMap[String(y)] = (expMap[String(y)] || 0) + 1;
      }
    }
    const expiryForecasts: ExpiryForecastItem[] = Object.keys(expMap).sort().map(y => ({ year: 'พ.ศ. ' + y, expiringCount: expMap[y] }));

    const yearMap: Record<string, number> = {};
    for (const g of govItems) {
      const y = (g.registration_year || '').trim();
      if (y && y.startsWith('25') && parseInt(y) >= 2562) yearMap[y] = (yearMap[y] || 0) + 1;
    }
    let cum = 0;
    const yearTrends: YearTrendItem[] = Object.keys(yearMap).sort().map(y => {
      cum += yearMap[y];
      return { year: 'ปี ' + y, registrations: yearMap[y], cumulative: cum };
    });

    const allProvinces: ProvinceStatItem[] = Object.keys(provinceAgg)
      .filter(p => p !== 'ไม่ระบุ')
      .map(p => {
        const d = provinceAgg[p];
        return {
          province: p,
          region: REGION_MAP[p] || 'อื่นๆ',
          total: d.total,
          govCount: d.gov,
          publicCount: d.pub,
          activeCount: d.active,
          expiredCount: d.expired,
          activeRate: Math.round((d.active / Math.max(1, d.total)) * 100)
        };
      })
      .sort((a, b) => b.total - a.total);

    const regionalStats: RegionStatItem[] = Object.keys(regionAgg)
      .filter(r => regionAgg[r].total > 0)
      .map(r => ({ region: r, total: regionAgg[r].total, active: regionAgg[r].active }))
      .sort((a, b) => b.total - a.total);

    return {
      kpis: {
        total: items.length || 7964,
        dualCount,
        govCount,
        publicCount,
        unregisteredCount,
        activeCount,
        inactiveCount,
        activeRate: Math.round((activeCount / Math.max(1, items.length)) * 100),
        provinceCoverage: allProvinces.length
      },
      yearTrends,
      expiryForecasts,
      topProvinces: allProvinces.slice(0, 10),
      regionalStats,
      allProvinces,
      genderRatios: [
        { name: 'ชาย', value: maleCount, color: '#0284c7' },
        { name: 'หญิง', value: femaleCount, color: '#ec4899' },
        { name: 'ไม่ระบุ', value: unspecifiedGender, color: '#94a3b8' }
      ]
    };
  } catch (err) {
    console.error('Error fetching statistical data:', err);
    throw err;
  }
}
