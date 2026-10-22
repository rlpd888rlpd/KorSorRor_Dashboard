import { fetchSheetValues } from '@/lib/google-sheets/sheet-fetcher';
import { parseThaiDate } from '@/lib/google-sheets/date-parser';
import { upsertSupabaseBatch, getValidMediatorKeys } from '@/lib/supabase/upsert';

const SPREADSHEET_ID = '1ymV56b-tomPpF6mH0mqKWVGyphmoDzVZC36GPX6nX7A';
const TAB_NAME = 'ทะเบียนปชช.';

export async function syncPublicRegistrationsTable(token: string): Promise<number> {
  const [rows, validKeys] = await Promise.all([
    fetchSheetValues(SPREADSHEET_ID, TAB_NAME, token),
    getValidMediatorKeys(),
  ]);
  if (rows.length < 2) return 0;

  const headers = rows[0].map(h => String(h || '').trim());
  const hMap: Record<string, number> = {};
  headers.forEach((h, i) => (hMap[h] = i));

  const records: Record<string, unknown>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const keyPub = String(row[hMap['key_ทะเบียนปชช.']] || '').trim();
    const keyMed = String(row[hMap['key_ผกก.']] || '').trim();
    if (!keyPub || !keyMed || !validKeys.has(keyMed)) continue;

    const effRaw = String(row[hMap['มีผลปชช.']] || '').trim();
    const expRaw = String(row[hMap['หมดอายุปชช.']] || '').trim();
    const ordRaw = String(row[hMap['คำสั่งทะเบียนปชช.ออกเมื่อ']] || '').trim();

    records.push({
      key_public: keyPub,
      key_mediator: keyMed,
      status: String(row[hMap['สถานะทะเบียนปชช.']] || '').trim() || null,
      action: String(row[hMap['action']] || '').trim() || null,
      batch_no: String(row[hMap['ครั้งที่ปชช.']] || '').trim() || null,
      batch_year: String(row[hMap['ปีครั้งปชช.']] || '').trim() || null,
      order_no: String(row[hMap['คำสั่งทะเบียนปชช.']] || '').trim() || null,
      order_year: String(row[hMap['ปีคำสั่งทะเบียนปชช.']] || '').trim() || null,
      order_date_raw: ordRaw || null,
      order_date: parseThaiDate(ordRaw),
      account_order_no: String(row[hMap['คำสั่งบัญชีปชช.']] || '').trim() || null,
      account_order_year: String(row[hMap['ปีคำสั่งบัญชีปชช.']] || '').trim() || null,
      account_order_date_raw: String(row[hMap['คำสั่งบัญชีปชช.ออกเมื่อ']] || '').trim() || null,
      registration_no: String(row[hMap['เลขทะเบียนผกก.ปชช.']] || '').trim() || null,
      registration_year: String(row[hMap['ปีทะเบียนผกก.ปชช.']] || '').trim() || null,
      effective_date_raw: effRaw || null,
      effective_date: parseThaiDate(effRaw),
      expiration_date_raw: expRaw || null,
      expiration_date: parseThaiDate(expRaw),
      work_status: String(row[hMap['การปฏิบัติงานปชช.']] || '').trim() || null,
      province_1: String(row[hMap['จังหวัดปชช.1']] || '').trim() || null,
      district_1: String(row[hMap['อำเภอปชช.1']] || '').trim() || null,
      province_2: String(row[hMap['จังหวัดปชช.2']] || '').trim() || null,
      district_2: String(row[hMap['อำเภอปชช.2']] || '').trim() || null,
      province_3: String(row[hMap['จังหวัดปชช.3']] || '').trim() || null,
      district_3: String(row[hMap['อำเภอปชช.3']] || '').trim() || null,
      remarks: String(row[hMap['บันทึกข้อความ']] || '').trim() || null,
    });
  }

  return await upsertSupabaseBatch('mediator_public_registrations', records, 'key_public');
}
