const THAI_MONTHS: Record<string, number> = {
  'ม.ค.': 1, 'มกราคม': 1,
  'ก.พ.': 2, 'กุมภาพันธ์': 2,
  'มี.ค.': 3, 'มีนาคม': 3,
  'เม.ย.': 4, 'เมษายน': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5,
  'มิ.ย.': 6, 'มิถุนายน': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7,
  'ส.ค.': 8, 'สิงหาคม': 8,
  'ก.ย.': 9, 'กันยายน': 9,
  'ต.ค.': 10, 'ตุลาคม': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11,
  'ธ.ค.': 12, 'ธันวาคม': 12,
};

function clampDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12) return null;
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const validDay = Math.min(Math.max(1, day), maxDay);
  const mm = String(month).padStart(2, '0');
  const dd = String(validDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function parseThaiDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (!clean || clean === '-' || clean === 'ไม่มี') return null;

  // Pattern: "30 มิ.ย. 66" or "1 ก.ค. 2566"
  const dmyMatch = clean.match(/^(\d{1,2})\s+([ก-๙\.]+)\s+(\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = THAI_MONTHS[dmyMatch[2]];
    let year = parseInt(dmyMatch[3], 10);

    if (month && day) {
      if (year < 100) year += 2500;
      if (year > 2400) year -= 543; // BE to CE
      return clampDate(year, month, day);
    }
  }

  // Slash pattern: DD/MM/YYYY (BE)
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2500;
    if (year > 2400) year -= 543;
    return clampDate(year, month, day);
  }

  return null;
}
