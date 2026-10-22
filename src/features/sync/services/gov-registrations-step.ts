import { fetchSheetValues } from '@/lib/google-sheets/sheet-fetcher';
import { parseThaiDate } from '@/lib/google-sheets/date-parser';
import { upsertSupabaseBatch } from '@/lib/supabase/upsert';

const SPREADSHEET_ID = '1nG87sI7TXJIuSD3kDsX8dZLAlJh97CYoK1-UVnU1aD4';
const TAB_NAME = 'ทะเบียนรัฐ';

export async function syncGovRegistrationsTable(token: string): Promise<number> {
  const rows = await fetchSheetValues(SPREADSHEET_ID, TAB_NAME, token);
  if (rows.length < 2) return 0;

  const headers = rows[0].map(h => String(h || '').trim());
  const hMap: Record<string, number> = {};
  headers.forEach((h, i) => (hMap[h] = i));

  const records: Record<string, unknown>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const keyGov = String(row[hMap['key_ทะเบียนรัฐ']] || '').trim();
    const keyMed = String(row[hMap['key_ผกก.']] || '').trim();
    if (!keyGov || !keyMed) continue;

    const effRaw = String(row[hMap['มีผลรัฐ']] || '').trim();
    const expRaw = String(row[hMap['หมดอายุรัฐ']] || '').trim();
    const ordRaw = String(row[hMap['คำสั่งทะเบียนรัฐออกเมื่อ']] || '').trim();

    records.push({
      key_gov: keyGov,
      key_mediator: keyMed,
      status: String(row[hMap['สถานะทะเบียนรัฐ']] || '').trim() || null,
      action: String(row[hMap['action']] || '').trim() || null,
      batch_no: String(row[hMap['ครั้งที่รัฐ.']] || '').trim() || null,
      batch_year: String(row[hMap['ปีครั้งรัฐ']] || '').trim() || null,
      order_no: String(row[hMap['คำสั่งทะเบียนรัฐ']] || '').trim() || null,
      order_year: String(row[hMap['ปีคำสั่งทะเบียนรัฐ']] || '').trim() || null,
      order_date_raw: ordRaw || null,
      order_date: parseThaiDate(ordRaw),
      account_order_no: String(row[hMap['คำสั่งบัญชีรัฐ']] || '').trim() || null,
      account_order_year: String(row[hMap['ปีคำสั่งบัญชีรัฐ']] || '').trim() || null,
      account_order_date_raw: String(row[hMap['คำสั่งบัญชีรัฐออกเมื่อ']] || '').trim() || null,
      registration_no: String(row[hMap['เลขทะเบียนผกก.รัฐ']] || '').trim() || null,
      registration_year: String(row[hMap['ปีทะเบียนผกก.รัฐ']] || '').trim() || null,
      effective_date_raw: effRaw || null,
      effective_date: parseThaiDate(effRaw),
      expiration_date_raw: expRaw || null,
      expiration_date: parseThaiDate(expRaw),
      work_status: String(row[hMap['การปฏิบัติงานรัฐ']] || '').trim() || null,
      agency_1: String(row[hMap['หน่วยงานรัฐ1']] || '').trim() || null,
      agency_2: String(row[hMap['หน่วยงานรัฐ2']] || '').trim() || null,
      agency_3: String(row[hMap['หน่วยงานรัฐ3']] || '').trim() || null,
      agency_4: String(row[hMap['หน่วยงานรัฐ4']] || '').trim() || null,
      remarks: String(row[hMap['บันทึกข้อความ']] || '').trim() || null,
    });
  }

  return await upsertSupabaseBatch('mediator_gov_registrations', records, 'key_gov');
}
