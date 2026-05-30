export function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => resolve(ev.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function scoreColor(pct) {
  if (pct >= 70) return '#16a34a';
  if (pct >= 40) return '#d97706';
  return '#dc2626';
}

export function scoreBg(pct) {
  if (pct >= 70) return '#f0fdf4';
  if (pct >= 40) return '#fffbeb';
  return '#fff1f2';
}

export function printReport(group, columns, students, getG, date) {
  const thCols = columns.map(c => `<th style="background:#f5f7fa;border:1px solid #dde;padding:7px 10px;font-size:12px">${escHtml(c)}</th>`).join('');
  const rows = students.map(s => {
    const cells = columns.map((_, ci) => {
      const g = getG(s.id, ci);
      const sym = g === 'done' ? '<span style="color:#22c55e;font-weight:700">✓</span>' : g === 'fail' ? '<span style="color:#ef4444;font-weight:700">✗</span>' : g === 'warn' ? '<span style="color:#f59e0b;font-weight:700">⚠</span>' : '—';
      return `<td style="border:1px solid #dde;padding:7px 12px;text-align:center">${sym}</td>`;
    }).join('');
    return `<tr><td style="border:1px solid #dde;padding:7px 12px;font-weight:500">${escHtml(s.name)}</td>${cells}</tr>`;
  }).join('');
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:28px;color:#111}
  h1{font-size:20px;margin-bottom:4px}p{font-size:12px;color:#666;margin-bottom:20px}
  table{width:100%;border-collapse:collapse}@media print{body{padding:0}}</style></head><body>
  <h1>📋 ${escHtml(group?.name || '')} — Hisobot</h1><p>Sana: ${escHtml(date)}</p>
  <table><thead><tr><th style="background:#f5f7fa;border:1px solid #dde;padding:7px 12px;text-align:left;font-size:12px">O'quvchi</th>${thCols}</tr></thead>
  <tbody>${rows}</tbody></table>
  <p style="margin-top:24px;font-size:11px;color:#999;text-align:center">Elite Student Manager · ${escHtml(date)}</p>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}
