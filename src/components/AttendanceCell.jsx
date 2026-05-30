import { useState } from 'react';

const CONFIGS = {
  present: { bg: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', label: '✓', title: 'Keldi' },
  absent:  { bg: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48', label: '✗', title: 'Kelmadi' },
};

export default function AttendanceCell({ value, onSet, frozen }) {
  const cycle = () => {
    if (frozen) return;
    if (!value) onSet('present');
    else if (value === 'present') onSet('absent');
    else onSet(null);
  };

  const cfg = value ? CONFIGS[value] : null;

  return (
    <td style={{ padding: 0, borderRight: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
      <div
        onClick={cycle}
        title={cfg?.title || 'Belgilanmagan — bosing'}
        style={{
          width: 56, height: 46,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: frozen ? 'not-allowed' : 'pointer',
          background: cfg ? cfg.bg : '#fff',
          border: cfg ? `1px solid ${cfg.borderColor}` : 'none',
          transition: 'background .12s',
          opacity: frozen ? 0.5 : 1,
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!frozen) e.currentTarget.style.background = cfg ? cfg.bg : '#f8fafc'; }}
        onMouseLeave={e => { e.currentTarget.style.background = cfg ? cfg.bg : '#fff'; }}
      >
        {cfg
          ? <span style={{ fontSize: 16, fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{cfg.label}</span>
          : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e2e8f0', display: 'block' }} />
        }
      </div>
    </td>
  );
}
