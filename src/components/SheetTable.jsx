import { useState, useEffect } from 'react';
import StudentRow from './StudentRow';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function SheetTable({
  students, cols, getG, setG,
  getAttendance, setAttendance,
  setAvatar, renameStudent,
  getStudentScore, onDeleteStudent, onToggleFreeze,
  addToken,
  filter, statusF, perPage,
  onRenameCol,
  sheetDate,
}) {
  const [page, setPage] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { setPage(0); }, [sheetDate]);

  const pp = parseInt(perPage) || 7;
  const totalPages = Math.max(1, Math.ceil(cols.length / pp));
  const safePage = Math.min(page, totalPages - 1);
  const visStart = safePage * pp;
  const visibleCols = cols.slice(visStart, visStart + pp);

  const filteredStudents = students.filter(s => {
    const matchName = !filter || s.name.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusF === 'all' || cols.some((_, ci) => getG(s.id, ci) === statusF);
    return matchName && matchStatus;
  });

  return (
    <div style={{ margin: 12, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column' }}>

      {/* Pager bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
        {sheetDate !== today && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef3c7', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#b45309', fontWeight: 500 }}>
            <Calendar size={12} /> Ko'rsatilmoqda: {sheetDate}
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
            style={{ width: 26, height: 26, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: safePage === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', opacity: safePage === 0 ? .4 : 1 }}
          ><ChevronLeft size={13} /></button>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Page {safePage + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
            style={{ width: 26, height: 26, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: safePage >= totalPages - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', opacity: safePage >= totalPages - 1 ? .4 : 1 }}
          ><ChevronRight size={13} /></button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 480 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle({ minWidth: 250 })}>Student</th>
              <th style={thStyle({ width: 56, textAlign: 'center' })}>Att.</th>
              {visibleCols.map((col, i) => (
                <th
                  key={visStart + i}
                  onDoubleClick={() => onRenameCol(visStart + i)}
                  title="Double-click to rename"
                  style={thStyle({ cursor: 'pointer' })}
                >
                  {col} <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 400 }}>#{visStart + i + 1}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <StudentRow
                key={s.id}
                student={s}
                visibleCols={visibleCols}
                colStart={visStart}
                cols={cols}
                getG={getG}
                setG={setG}
                getAttendance={getAttendance}
                setAttendance={setAttendance}
                setAvatar={setAvatar}
                renameStudent={renameStudent}
                score={getStudentScore(s.id)}
                onDelete={onDeleteStudent}
                onToggleFreeze={onToggleFreeze}
                onAddToken={(sid, amount) => addToken(sid, amount)}
              />
            ))}
            {!filteredStudents.length && (
              <tr>
                <td colSpan={visibleCols.length + 2} style={{ padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  O'quvchilar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function thStyle(extra = {}) {
  return {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #f1f5f9',
    background: '#fafbfc',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    whiteSpace: 'nowrap',
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    ...extra,
  };
}
