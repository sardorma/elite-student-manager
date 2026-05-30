import { useMemo, useState } from 'react';
import { scoreColor, scoreBg } from '../utils/helpers';

const MONTHS_UZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

export default function Analytics({ S, onClose }) {
  const [tab, setTab] = useState('monthly'); // 'monthly' | 'students' | 'groups'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGroup, setSelectedGroup] = useState(S.groups[0]?.id || '');

  // Barcha sana kalitlarini yig'ish
  const allDates = useMemo(() => Object.keys(S.grades || {}).sort(), [S.grades]);

  // Mavjud yillar
  const years = useMemo(() => {
    const ys = new Set(allDates.map(d => d.slice(0, 4)));
    if (!ys.size) ys.add(String(new Date().getFullYear()));
    return [...ys].sort().reverse();
  }, [allDates]);

  // Tanlangan yil + guruh uchun oylik statistika
  const monthlyData = useMemo(() => {
    const group = S.groups.find(g => g.id === selectedGroup);
    if (!group) return [];
    const students = S.students[selectedGroup] || [];
    const cols = S.columns[selectedGroup] || [];

    return MONTHS_UZ.map((name, mi) => {
      const monthStr = `${selectedYear}-${String(mi + 1).padStart(2, '0')}`;
      const datesInMonth = allDates.filter(d => d.startsWith(monthStr));

      let totalDone = 0, totalFail = 0, totalWarn = 0, presentCount = 0, absentCount = 0;
      let activeDays = datesInMonth.length;

      datesInMonth.forEach(date => {
        const dayGrades = S.grades[date] || {};
        const dayAtt = S.attendance?.[date] || {};
        students.forEach(s => {
          cols.forEach((_, ci) => {
            const g = dayGrades[`${selectedGroup}_${s.id}_${ci}`];
            if (g === 'done') totalDone++;
            else if (g === 'fail') totalFail++;
            else if (g === 'warn') totalWarn++;
          });
          const a = dayAtt[`${selectedGroup}_${s.id}`];
          if (a === 'present') presentCount++;
          else if (a === 'absent') absentCount++;
        });
      });

      const total = totalDone + totalFail + totalWarn;
      const pct = total ? Math.round((totalDone / total) * 100) : null;
      const attTotal = presentCount + absentCount;
      const attPct = attTotal ? Math.round((presentCount / attTotal) * 100) : null;

      return { name, mi, pct, attPct, totalDone, totalFail, totalWarn, activeDays, presentCount, absentCount };
    });
  }, [S, selectedGroup, selectedYear, allDates]);

  // O'quvchilar kesimidagi yillik statistika
  const studentData = useMemo(() => {
    const students = S.students[selectedGroup] || [];
    const cols = S.columns[selectedGroup] || [];
    const yearStr = String(selectedYear);
    const datesInYear = allDates.filter(d => d.startsWith(yearStr));

    return students.map(s => {
      let done = 0, fail = 0, warn = 0, present = 0, absent = 0;
      datesInYear.forEach(date => {
        const dayGrades = S.grades[date] || {};
        const dayAtt = S.attendance?.[date] || {};
        cols.forEach((_, ci) => {
          const g = dayGrades[`${selectedGroup}_${s.id}_${ci}`];
          if (g === 'done') done++;
          else if (g === 'fail') fail++;
          else if (g === 'warn') warn++;
        });
        const a = dayAtt[`${selectedGroup}_${s.id}`];
        if (a === 'present') present++;
        else if (a === 'absent') absent++;
      });
      const total = done + fail + warn;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const attTotal = present + absent;
      const attPct = attTotal ? Math.round((present / attTotal) * 100) : 0;
      return { ...s, done, fail, warn, pct, present, absent, attPct };
    }).sort((a, b) => b.pct - a.pct);
  }, [S, selectedGroup, selectedYear, allDates]);

  // Guruhlar taqqoslash
  const groupsData = useMemo(() => {
    const yearStr = String(selectedYear);
    const datesInYear = allDates.filter(d => d.startsWith(yearStr));
    return S.groups.map(g => {
      const students = S.students[g.id] || [];
      const cols = S.columns[g.id] || [];
      let done = 0, fail = 0, warn = 0;
      datesInYear.forEach(date => {
        const dayGrades = S.grades[date] || {};
        students.forEach(s => {
          cols.forEach((_, ci) => {
            const gr = dayGrades[`${g.id}_${s.id}_${ci}`];
            if (gr === 'done') done++;
            else if (gr === 'fail') fail++;
            else if (gr === 'warn') warn++;
          });
        });
      });
      const total = done + fail + warn;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return { ...g, done, fail, warn, pct, studentCount: students.length };
    }).sort((a, b) => b.pct - a.pct);
  }, [S, selectedYear, allDates]);

  const maxPct = Math.max(1, ...monthlyData.map(m => m.pct || 0));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 16px', overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#f8fafc', borderRadius: 16, width: '100%', maxWidth: 820,
        boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: '#fff', padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Statistika va Tahlil</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Oylik va yillik ko'rsatkichlar</div>
          </div>
          {/* Yil tanlash */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: '5px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, background: '#f8fafc', fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
          >
            {years.map(y => <option key={y} value={y}>{y}-yil</option>)}
          </select>
          {/* Guruh tanlash */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ padding: '5px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, background: '#f8fafc', fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
          >
            {S.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: '4px 8px' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
          {[['monthly','📅 Oylik'], ['students','👤 O\'quvchilar'], ['groups','🏫 Guruhlar']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '10px 16px', border: 'none', background: 'none', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              color: tab === key ? '#6366f1' : '#64748b',
              borderBottom: tab === key ? '2px solid #6366f1' : '2px solid transparent',
              transition: 'all .15s',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: 20 }}>

          {/* ── OYLIK TAB ── */}
          {tab === 'monthly' && (
            <>
              {/* Yillik umumiy kartlar */}
              <YearSummaryCards monthlyData={monthlyData} />

              {/* Bar chart */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 14 }}>📈 Oylik baho foizi</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                  {monthlyData.map((m) => {
                    const h = m.pct != null ? Math.round((m.pct / maxPct) * 100) : 0;
                    const color = m.pct != null ? scoreColor(m.pct) : '#e2e8f0';
                    return (
                      <div key={m.mi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                          {m.pct != null ? `${m.pct}%` : ''}
                        </div>
                        <div style={{
                          width: '100%', background: color, borderRadius: '4px 4px 0 0',
                          height: `${h}px`, minHeight: m.pct != null ? 4 : 0,
                          transition: 'height .4s',
                        }} title={`${m.name}: ${m.pct ?? '—'}%`} />
                        <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>{m.name.slice(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Oylik jadval */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Oy', 'Darslar', 'Bajargan', 'Bajarmagan', 'Baho %', 'Davomat %'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m, i) => (
                      <tr key={m.mi} style={{ background: i % 2 ? '#f8fafc' : '#fff' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                        <td style={{ padding: '9px 12px', color: '#475569' }}>{m.activeDays || '—'}</td>
                        <td style={{ padding: '9px 12px', color: '#16a34a', fontWeight: 600 }}>{m.totalDone || '—'}</td>
                        <td style={{ padding: '9px 12px', color: '#dc2626', fontWeight: 600 }}>{m.totalFail || '—'}</td>
                        <td style={{ padding: '9px 12px' }}>
                          {m.pct != null ? (
                            <span style={{ background: scoreBg(m.pct), color: scoreColor(m.pct), padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{m.pct}%</span>
                          ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          {m.attPct != null ? (
                            <span style={{ background: scoreBg(m.attPct), color: scoreColor(m.attPct), padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{m.attPct}%</span>
                          ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── O'QUVCHILAR TAB ── */}
          {tab === 'students' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {!studentData.length ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Bu guruhda o'quvchilar yo'q</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['#', 'O\'quvchi', 'Bajargan', 'Bajarmagan', 'Yillik %', 'Davomat %', 'Token'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((s, i) => (
                      <tr key={s.id} style={{ background: i % 2 ? '#f8fafc' : '#fff' }}>
                        <td style={{ padding: '9px 12px', color: '#94a3b8', fontWeight: 600 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f172a' }}>{s.name}</td>
                        <td style={{ padding: '9px 12px', color: '#16a34a', fontWeight: 600 }}>{s.done}</td>
                        <td style={{ padding: '9px 12px', color: '#dc2626', fontWeight: 600 }}>{s.fail}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, minWidth: 60 }}>
                              <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 3, background: scoreColor(s.pct) }} />
                            </div>
                            <span style={{ fontWeight: 700, color: scoreColor(s.pct), minWidth: 32 }}>{s.pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{ background: scoreBg(s.attPct), color: scoreColor(s.attPct), padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{s.attPct}%</span>
                        </td>
                        <td style={{ padding: '9px 12px', color: '#f59e0b', fontWeight: 700 }}>🪙{s.tokens || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── GURUHLAR TAB ── */}
          {tab === 'groups' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
              {groupsData.map((g, i) => (
                <div key={g.id} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '16px 18px',
                  borderTop: `3px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#6366f1'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{g.studentCount} o'quvchi</div>
                    </div>
                    <span style={{ fontSize: 20 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏫'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, textAlign: 'center', background: '#f0fdf4', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{g.done}</div>
                      <div style={{ fontSize: 10, color: '#86efac' }}>Bajargan</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: '#fff1f2', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626' }}>{g.fail}</div>
                      <div style={{ fontSize: 10, color: '#fca5a5' }}>Bajarmagan</div>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${g.pct}%`, height: '100%', background: scoreColor(g.pct), borderRadius: 4, transition: 'width .5s' }} />
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 4, fontSize: 13, fontWeight: 800, color: scoreColor(g.pct) }}>{g.pct}%</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function YearSummaryCards({ monthlyData }) {
  const total = monthlyData.reduce((a, m) => ({
    done: a.done + m.totalDone,
    fail: a.fail + m.totalFail,
    warn: a.warn + m.totalWarn,
    present: a.present + m.presentCount,
    absent: a.absent + m.absentCount,
    days: a.days + m.activeDays,
  }), { done: 0, fail: 0, warn: 0, present: 0, absent: 0, days: 0 });

  const gradePct = (total.done + total.fail + total.warn)
    ? Math.round((total.done / (total.done + total.fail + total.warn)) * 100) : 0;
  const attPct = (total.present + total.absent)
    ? Math.round((total.present / (total.present + total.absent)) * 100) : 0;

  const cards = [
    { label: 'Faol kunlar', val: total.days, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Yillik baho', val: `${gradePct}%`, color: scoreColor(gradePct), bg: scoreBg(gradePct) },
    { label: 'Bajargan', val: total.done, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Bajarmagan', val: total.fail, color: '#dc2626', bg: '#fff1f2' },
    { label: 'Davomat', val: `${attPct}%`, color: scoreColor(attPct), bg: scoreBg(attPct) },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      {cards.map(c => (
        <div key={c.label} style={{ flex: '1 1 100px', background: c.bg, borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.val}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
