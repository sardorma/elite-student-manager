import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GRADE_SYMBOLS = { done: '✓', fail: '✗', warn: '⚠', null: '—' };
const GRADE_COLORS = {
  done: [220, 252, 231],
  fail: [254, 226, 226],
  warn: [254, 249, 195],
};

export function exportPDF({ groupName, date, students, cols, getG, getAttendance }) {
  const doc = new jsPDF({ orientation: cols.length > 6 ? 'landscape' : 'portrait' });

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Elite Student Manager', 14, 18);

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text(`Guruh: ${groupName || '—'}    Sana: ${date || '—'}`, 14, 26);
  doc.setTextColor(0);

  // Table
  const head = [['#', "O'quvchi", 'Davomat', ...cols]];

  const body = students.map((s, idx) => {
    const att = getAttendance(s.id);
    const attLabel = att === 'present' ? '✓' : att === 'absent' ? '✗' : '—';
    const grades = cols.map((_, ci) => GRADE_SYMBOLS[getG(s.id, ci)] || '—');
    return [idx + 1, s.name, attLabel, ...grades];
  });

  autoTable(doc, {
    startY: 32,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index > 2) {
        const grade = Object.entries(GRADE_SYMBOLS).find(([, v]) => v === data.cell.raw)?.[0];
        if (GRADE_COLORS[grade]) {
          data.cell.styles.fillColor = GRADE_COLORS[grade];
          data.cell.styles.halign = 'center';
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Elite Student Manager · ${date} · Sahifa ${i}/${pageCount}`,
      doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8,
      { align: 'center' }
    );
  }

  // Brauzerda yangi tabda ochish (yuklab olish o'rniga)
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
