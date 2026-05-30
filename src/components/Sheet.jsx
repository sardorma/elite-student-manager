import { useState, useCallback } from 'react';
import StudentRow from './StudentRow';
import GradePopup from './GradePopup';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sheet({
  students, columns, getGrade, setGrade,
  filter, statusFilter, perPage,
  onRenameCol, onRenameStudent, onAvatarChange,
}) {
  const [page, setPage] = useState(0);
  const [popup, setPopup] = useState(null); // { pos, sid, ci }

  const actualPerPage = parseInt(perPage) || 7;
  const totalPages = Math.max(1, Math.ceil(columns.length / actualPerPage));
  const safeP = Math.min(page, totalPages - 1);

  const visStart = safeP * actualPerPage;
  const visibleCols = columns.slice(visStart, visStart + actualPerPage);

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchName = !filter || s.name.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusFilter === 'all' || columns.some((_, ci) => getGrade(s.id, ci) === statusFilter);
    return matchName && matchStatus;
  });

  const handleGradeClick = useCallback((e, sid, ci) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup({
      pos: { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX },
      sid, ci,
    });
  }, []);

  const handleGradeSelect = useCallback((val) => {
    if (popup) { setGrade(popup.sid, popup.ci, val); setPopup(null); }
  }, [popup, setGrade]);

  return (
    <div className="sheet-container">
      <div className="sheet-pager">
        <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safeP === 0}>
          <ChevronLeft size={14} />
        </button>
        <span className="page-info">Page {safeP + 1} / {totalPages}</span>
        <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safeP >= totalPages - 1}>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="sheet-scroll">
        <table className="sheet-table">
          <thead>
            <tr>
              <th className="th-student">Student</th>
              {visibleCols.map((col, i) => (
                <th key={visStart + i} className="th-task" onDoubleClick={() => onRenameCol(visStart + i)}>
                  {col}
                  <span className="th-num">#{visStart + i + 1}</span>
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
                columns={columns}
                getGrade={getGrade}
                onGradeClick={handleGradeClick}
                onRename={onRenameStudent}
                onAvatarChange={onAvatarChange}
              />
            ))}
            {!filteredStudents.length && (
              <tr>
                <td colSpan={visibleCols.length + 1} className="empty-row">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {popup && (
        <GradePopup
          pos={popup.pos}
          onSelect={handleGradeSelect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
