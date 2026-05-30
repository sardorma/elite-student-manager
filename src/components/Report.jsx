import { useMemo } from 'react';
import { getInitials, scoreColor } from '../utils/helpers';
import { Trophy, Printer } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Report({ students, cols, getG, allGrades, attendance, gid, groupName, date, onPrint, show, onExportPDF, onExportExcel }) {
  const scored = useMemo(() => {
    // Only count grades and attendance for the currently viewed date
    const dayGrades = allGrades?.[date] || {};
    const dayAtt = attendance?.[date] || {};

    return students.map(s => {
      let done = 0, fail = 0, warn = 0;
      cols.forEach((_, ci) => {
        const g = dayGrades[`${gid}_${s.id}_${ci}`];
        if (g === 'done') done++;
        else if (g === 'fail') fail++;
        else if (g === 'warn') warn++;
      });
      const totalSlots = cols.length;
      const pct = totalSlots ? Math.round(((done * 3 + warn) / (totalSlots * 3)) * 100) : 0;

      // attendance for current date only
      const a = dayAtt[`${gid}_${s.id}`];
      const present = a === 'present' ? 1 : 0;
      const absent = a === 'absent' ? 1 : 0;

      const tokens = s.tokens || 0;
      return { ...s, done, fail, warn, pct, present, absent, tokens };
    }).sort((a, b) => b.pct - a.pct);
  }, [students, cols, allGrades, attendance, gid, date]);

  const avg = scored.length ? Math.round(scored.reduce((s, x) => s + x.pct, 0) / scored.length) : 0;
  const totalDone = scored.reduce((s, x) => s + x.done, 0);
  const totalFail = scored.reduce((s, x) => s + x.fail, 0);
  const totalAbsent = scored.reduce((s, x) => s + x.absent, 0);
  const totalTokens = scored.reduce((s, x) => s + x.tokens, 0);
  const maxPct = Math.max(1, ...scored.map(s => s.pct));

  if (!show) return null;

  return (
    <div style={{ margin: '0 12px 12px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Trophy size={15} /> Reports &amp; Leaderboard
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={onPrint} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#7c3aed', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, cursor: 'pointer' }}>
            <Printer size={12} /> Print
          </button>
          <button onClick={onExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#dc2626', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, cursor: 'pointer' }}>
            🔴 PDF
          </button>
          <button onClick={onExportExcel} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#16a34a', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, cursor: 'pointer' }}>
            🟢 Excel
          </button>
        </div>
      </div>

      {!students.length ? (
        <p style={{ fontSize: 12, color: '#94a3b8' }}>O'quvchilar yo'q</p>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: "O'quvchilar", val: students.length, color: '#4f6ef7' },
              { label: "O'rtacha", val: `${avg}%`, color: avg >= 70 ? '#16a34a' : avg >= 40 ? '#d97706' : '#dc2626' },
              { label: "Bajargan", val: totalDone, color: '#16a34a' },
              { label: "Bajarmagan", val: totalFail, color: '#dc2626' },
              { label: "Kelmagan", val: totalAbsent, color: '#e11d48' },
              { label: "Jami 🪙", val: totalTokens, color: '#f59e0b' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', minWidth: 80 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'DM Mono, monospace' }}>{val}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>🏆 Leaderboard</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
            {scored.map((s, i) => {
              const barColor = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#4f6ef7';
              const bar = Math.round((s.pct / maxPct) * 100);
              const pctC = scoreColor(s.pct);
              return (
                <div key={s.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{MEDALS[i] ?? i + 1}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#64748b', overflow: 'hidden', flexShrink: 0 }}>
                    {s.avatar ? <img src={s.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(s.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>✓{s.done} ✗{s.fail} ⚠{s.warn} 🪙{s.tokens}</div>
                    <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginTop: 4 }}>
                      <div style={{ width: `${bar}%`, height: '100%', borderRadius: 2, background: barColor, transition: 'width .4s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: pctC, flexShrink: 0, fontFamily: 'DM Mono, monospace' }}>{s.pct}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
