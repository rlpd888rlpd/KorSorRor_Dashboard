import { createClient } from '@/lib/supabase/client';
import { MediatorItem, MediatorKPISummary, MediatorFilters } from '../types';

export async function getMediatorKPIs(): Promise<MediatorKPISummary> {
  const supabase = createClient();
  try {
    const { data, count, error } = await supabase
      .from('v_mediators_dashboard')
      .select('registration_type, is_active_overall', { count: 'exact' });

    if (error) throw error;
    const items = data || [];

    let dualCount = 0;
    let govCount = 0;
    let publicCount = 0;
    let unregisteredCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    for (const row of items) {
      if (row.registration_type === 'DUAL') dualCount++;
      else if (row.registration_type === 'GOVERNMENT') govCount++;
      else if (row.registration_type === 'PUBLIC') publicCount++;
      else unregisteredCount++;

      if (row.is_active_overall) activeCount++;
      else inactiveCount++;
    }

    return {
      total: count || items.length,
      dualCount,
      govCount,
      publicCount,
      unregisteredCount,
      activeCount,
      inactiveCount
    };
  } catch (err) {
    console.error('Error fetching mediator KPIs:', err);
    return { total: 0, dualCount: 0, govCount: 0, publicCount: 0, unregisteredCount: 0, activeCount: 0, inactiveCount: 0 };
  }
}

export async function getMediatorsList(filters: MediatorFilters = {}): Promise<{ data: MediatorItem[]; count: number }> {
  const supabase = createClient();
  try {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 15;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('v_mediators_dashboard')
      .select('*', { count: 'exact' });

    if (filters.search) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`first_name.ilike.${term},last_name.ilike.${term},key_mediator.ilike.${term},province.ilike.${term}`);
    }

    if (filters.province && filters.province !== 'ALL') {
      query = query.eq('province', filters.province);
    }

    if (filters.type && filters.type !== 'ALL') {
      query = query.eq('registration_type', filters.type);
    }

    if (filters.status && filters.status !== 'ALL') {
      const isActive = filters.status === 'ACTIVE';
      query = query.eq('is_active_overall', isActive);
    }

    const { data, count, error } = await query
      .order('key_mediator', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data: (data as MediatorItem[]) || [], count: count || 0 };
  } catch (err) {
    console.error('Error fetching mediators list:', err);
    return { data: [], count: 0 };
  }
}

export async function getProvinceList(): Promise<string[]> {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('mediators')
      .select('province')
      .not('province', 'is', null);

    const set = new Set<string>();
    (data || []).forEach(d => {
      const p = String(d.province || '').trim();
      if (p && p !== 'ไม่ระบุ') set.add(p);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  } catch {
    return [];
  }
}
