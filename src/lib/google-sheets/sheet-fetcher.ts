export async function fetchSheetValues(
  spreadsheetId: string,
  tabName: string,
  token: string
): Promise<string[][]> {
  const encodedTab = encodeURIComponent(tabName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTab}?valueRenderOption=UNFORMATTED_VALUE`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Sheets fetch failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.values || [];
}
