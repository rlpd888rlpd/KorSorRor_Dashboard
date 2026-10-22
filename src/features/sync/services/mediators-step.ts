import { fetchSheetValues } from '@/lib/google-sheets/sheet-fetcher';
import { upsertSupabaseBatch } from '@/lib/supabase/upsert';

const SPREADSHEET_ID = '13Ibc5QlPuhYOwQbWSaKcg-LGGJfR6ti5QUssfoRp_T8';
const TAB_NAME = 'ข้อมูลผู้ไกล่เกลี่ย';

export async function syncMediatorsTable(token: string): Promise<number> {
  const rows = await fetchSheetValues(SPREADSHEET_ID, TAB_NAME, token);
  if (rows.length < 2) return 0;

  const headers = rows[0].map(h => String(h || '').trim());
  const hMap: Record<string, number> = {};
  headers.forEach((h, i) => (hMap[h] = i));

  const records: Record<string, unknown>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const key = String(row[hMap['key_ผกก.']] || '').trim();
    if (!key) continue;

    records.push({
      key_mediator: key,
      citizen_id: String(row[hMap['เลขบัตรประชาชน']] || '').trim() || null,
      title: String(row[hMap['คำนำหน้า']] || '').trim() || null,
      first_name: String(row[hMap['ชื่อ']] || '').trim() || '-',
      last_name: String(row[hMap['สกุล']] || '').trim() || '-',
      gender: String(row[hMap['เพศ']] || '').trim() || null,
      phone: String(row[hMap['เบอร์โทรศัพท์']] || '').trim() || null,
      email: String(row[hMap['อีเมล์']] || '').trim() || null,
      line_id: String(row[hMap['ไลน์ไอดี']] || '').trim() || null,
      photo_path: String(row[hMap['รูป_ผกก.']] || '').trim() || null,
      photo_url: String(row[hMap['link_รูป']] || '').trim() || null,
      address_no: String(row[hMap['เลขที่']] || '').trim() || null,
      moo: String(row[hMap['หมู่']] || '').trim() || null,
      address_detail: String(row[hMap['อาคาร,สถานที่,ถนน,ซอย']] || '').trim() || null,
      province: String(row[hMap['จังหวัด']] || '').trim() || null,
      district: String(row[hMap['อำเภอ']] || '').trim() || null,
      subdistrict: String(row[hMap['ตำบล']] || '').trim() || null,
      postal_code: String(row[hMap['รหัสไปรษณีย์']] || '').trim() || null,
      social_position: String(row[hMap['ตำแหน่งทางสังคม']] || '').trim() || null,
      mediation_experience: String(row[hMap['ประสบการณ์ด้านการไกล่เกลี่ย']] || '').trim() || null,
      bank_name: String(row[hMap['ธนาคาร']] || '').trim() || null,
      bank_account_no: String(row[hMap['เลขบัญชี']] || '').trim() || null,
      remarks: String(row[hMap['บันทึกข้อความ']] || '').trim() || null,
    });
  }

  return await upsertSupabaseBatch('mediators', records, 'key_mediator');
}
