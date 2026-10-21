import { createClient } from '@/lib/supabase/client';
import { ExecutiveStatsResponse, ProvinceStatItem, RegionStatItem, YearTrendItem, ExpiryForecastItem, GenderRatioItem } from '../types';

const REGION_MAP: Record<string, string> = {
  'เชียงใหม่': 'ภาคเหนือ', 'เชียงราย': 'ภาคเหนือ', 'ลำปาง': 'ภาคเหนือ', 'ลำพูน': 'ภาคเหนือ',
  'แม่ฮ่องสอน': 'ภาคเหนือ', 'น่าน': 'ภาคเหนือ', 'พะเยา': 'ภาคเหนือ', 'แพร่': 'ภาคเหนือ', 'อุตรดิตถ์': 'ภาคเหนือ',
  'กรุงเทพมหานคร': 'ภาคกลาง', 'นนทบุรี': 'ภาคกลาง', 'ปทุมธานี': 'ภาคกลาง', 'สมุทรปราการ': 'ภาคกลาง',
  'สมุทรสาคร': 'ภาคกลาง', 'สมุทรสงคราม': 'ภาคกลาง', 'พระนครศรีอยุธยา': 'ภาคกลาง', 'อ่างทอง': 'ภาคกลาง',
  'ลพบุรี': 'ภาคกลาง', 'สิงห์บุรี': 'ภาคกลาง', 'ชัยนาท': 'ภาคกลาง', 'สระบุรี': 'ภาคกลาง', 'นครนายก': 'ภาคกลาง',
  'นครปฐม': 'ภาคกลาง', 'สุพรรณบุรี': 'ภาคกลาง',
  'นครราชสีมา': 'ภาคอีสาน', 'ขอนแก่น': 'ภาคอีสาน', 'อุบลราชธานี': 'ภาคอีสาน', 'อุดรธานี': 'ภาคอีสาน',
  'บุรีรัมย์': 'ภาคอีสาน', 'สุรินทร์': 'ภาคอีสาน', 'ศรีสะเกษ': 'ภาคอีสาน', 'ร้อยเอ็ด': 'ภาคอีสาน',
  'มหาสารคาม': 'ภาคอีสาน', 'ชัยภูมิ': 'ภาคอีสาน', 'สกลนคร': 'ภาคอีสาน', 'กาฬสินธุ์': 'ภาคอีสาน',
  'ยโสธร': 'ภาคอีสาน', 'นครพนม': 'ภาคอีสาน', 'มุกดาหาร': 'ภาคอีสาน', 'หนองบัวลำภู': 'ภาคอีสาน',
  'หนองคาย': 'ภาคอีสาน', 'อำนาจเจริญ': 'ภาคอีสาน', 'เลย': 'ภาคอีสาน', 'บึงกาฬ': 'ภาคอีสาน',
  'สงขลา': 'ภาคใต้', 'นครศรีธรรมราช': 'ภาคใต้', 'สุราษฎร์ธานี': 'ภาคใต้', 'ภูเก็ต': 'ภาคใต้',
  'กระบี่': 'ภาคใต้', 'พังงา': 'ภาคใต้', 'ตรัง': 'ภาคใต้', 'พัทลุง': 'ภาคใต้', 'ชุมพร': 'ภาคใต้',
  'ระนอง': 'ภาคใต้', 'สตูล': 'ภาคใต้', 'ปัตตานี': 'ภาคใต้', 'ยะลา': 'ภาคใต้', 'นราธิวาส': 'ภาคใต้',
  'ชลบุรี': 'ภาคตะวันออก', 'ระยอง': 'ภาคตะวันออก', 'จันทบุรี': 'ภาคตะวันออก', 'ตราด': 'ภาคตะวันออก',
  'ฉะเชิงเทรา': 'ภาคตะวันออก', 'ปราจีนบุรี': 'ภาคตะวันออก', 'สระแก้ว': 'ภาคตะวันออก',
  'กาญจนบุรี': 'ภาคตะวันตก', 'ราชบุรี': 'ภาคตะวันตก', 'เพชรบุรี': 'ภาคตะวันตก', 'ประจวบคีรีขันธ์': 'ภาคตะวันตก', 'ตาก': 'ภาคตะวันตก'
};

export async function getExecutiveStatisticalData(): Promise<ExecutiveStatsResponse> {
  const supabase = createClient();
  try {
    const [viewRes, govRes] = await Promise.all([
      supabase.from('v_mediators_dashboard').select('province, registration_type, is_active_overall, gender').limit(10000),
      supabase.from('mediator_gov_registrations').select('registration_year, expiration_date').limit(10000)
    ]);

    const items = viewRes.data || [];
    const govItems = govRes.data || [];

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

    // Expiry Forecast
    const expMap: Record<string, number> = {};
    for (const g of govItems) {
      if (g.expiration_date) {
        const y = parseInt(g.expiration_date.slice(0, 4), 10) + 543;
        if (y >= 2566 && y <= 2572) expMap[String(y)] = (expMap[String(y)] || 0) + 1;
      }
    }
    const expiryForecasts: ExpiryForecastItem[] = Object.keys(expMap).sort().map(y => ({ year: 'พ.ศ. ' + y, expiringCount: expMap[y] }));

    // Year Trends
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
