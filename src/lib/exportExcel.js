import * as XLSX from 'xlsx';

const GRADE_SYMBOLS = { done: '✓', fail: '✗', warn: '⚠' };

export function exportExcel({ groupName, date, students, cols, getG, getAttendance }) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Grade table ──────────────────────────────────
  const gradeHeader = ["#", "O'quvchi", "🪙 Token", "Davomat", ...cols];
  const gradeRows = students.map((s, i) => {
    const att = getAttendance(s.id);
    return [
      i + 1,
      s.name,
      s.tokens || 0,
      att === 'present' ? '✓ Keldi' : att === 'absent' ? '✗ Kelmadi' : '—',
      ...cols.map((_, ci) => GRADE_SYMBOLS[getG(s.id, ci)] || '—'),
    ];
  });

  const ws1 = XLSX.utils.aoa_to_sheet([gradeHeader, ...gradeRows]);

  // Column widths
  ws1['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 8 }, { wch: 12 },
    ...cols.map(() => ({ wch: 12 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws1, "Baholar");

  // ── Sheet 2: Leaderboard ─────────────────────────────────
  const ranked = [...students].map(s => {
    let done = 0, fail = 0, warn = 0;
    cols.forEach((_, ci) => {
      const g = getG(s.id, ci);
      if (g === 'done') done++;
      else if (g === 'fail') fail++;
      else if (g === 'warn') warn++;
    });
    const total = cols.length * 3;
    const pct = total ? Math.round(((done * 3 + warn) / total) * 100) : 0;
    return { name: s.name, tokens: s.tokens || 0, done, fail, warn, pct };
  }).sort((a, b) => b.pct - a.pct);

  const lbHeader = ["O'rin", "O'quvchi", "Bajargan", "Bajarmagan", "Qisman", "🪙 Token", "Natija %"];
  const lbRows = ranked.map((s, i) => [i + 1, s.name, s.done, s.fail, s.warn, s.tokens, `${s.pct}%`]);

  const ws2 = XLSX.utils.aoa_to_sheet([lbHeader, ...lbRows]);
  ws2['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 10 }, { wch: 13 }, { wch: 8 }, { wch: 8 }, { wch: 10 }];

  XLSX.utils.book_append_sheet(wb, ws2, "Leaderboard");

  // Save
  XLSX.writeFile(wb, `esm_${groupName || 'report'}_${date || 'export'}.xlsx`);
}
