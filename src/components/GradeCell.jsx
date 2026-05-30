import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CONFIGS = {
  done: { bg: '#f0fdf4', dot: '#16a34a', label: '✓', textColor: '#15803d', borderColor: '#bbf7d0' },
  fail: { bg: '#fff1f2', dot: '#e11d48', label: '✗', textColor: '#be123c', borderColor: '#fecdd3' },
  warn: { bg: '#fffbeb', dot: '#d97706', label: '⚠', textColor: '#b45309', borderColor: '#fde68a' },
};

export default function GradeCell({ grade, histGrade, onSet, frozen }) {
  const [popupPos, setPopupPos] = useState(null); // { x, y, flipUp }
  const ref = useRef();

  // Close on outside click or scroll
  useEffect(() => {
    if (!popupPos) return;
    const close = () => setPopupPos(null);
    const id = setTimeout(() => {
      document.addEventListener('mousedown', close);
      document.addEventListener('scroll', close, true);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [popupPos]);

  const handleClick = (e) => {
    if (frozen) return;
    e.stopPropagation();
    if (popupPos) { setPopupPos(null); return; }
    const rect = ref.current.getBoundingClientRect();
    const popupH = 46;
    const flipUp = window.innerHeight - rect.bottom < popupH + 8;
    const x = rect.left + rect.width / 2; // center of cell
    const y = flipUp ? rect.top - 4 : rect.bottom + 4;
    setPopupPos({ x, y, flipUp });
  };

  const cfg = grade ? CONFIGS[grade] : null;

  return (
    <td style={{ padding: 0, borderRight: '1px solid #f1f5f9', verticalAlign: 'middle', position: 'relative' }}>
      <div
        ref={ref}
        style={{ position: 'relative' }}
        onClick={handleClick}
      >
        {/* Cell body */}
        <div style={{
          width: 110, height: 46,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          cursor: frozen ? 'not-allowed' : 'pointer',
          background: cfg ? cfg.bg : '#fff',
          border: cfg ? `1px solid ${cfg.borderColor}` : 'none',
          transition: 'background .12s',
          opacity: frozen ? 0.5 : 1,
          boxSizing: 'border-box',
          userSelect: 'none',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: cfg ? cfg.dot : '#e2e8f0',
            transition: 'background .15s',
          }} />
          {cfg && (
            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.textColor, lineHeight: 1 }}>
              {cfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Popup rendered via portal — escapes overflow containers */}
      {popupPos && !frozen && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: popupPos.x,
            ...(popupPos.flipUp
              ? { bottom: window.innerHeight - popupPos.y }
              : { top: popupPos.y }),
            transform: 'translateX(-50%)',
            background: '#1e293b',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 7px',
            zIndex: 99999,
            boxShadow: '0 8px 32px rgba(0,0,0,.35)',
            whiteSpace: 'nowrap',
          }}
        >
          <PopBtn color="#22c55e" hoverBg="#22c55e" bg="#052e16" onClick={() => { onSet('done'); setPopupPos(null); }}>✓</PopBtn>
          <PopBtn color="#f87171" hoverBg="#ef4444" bg="#3f0d18" onClick={() => { onSet('fail'); setPopupPos(null); }}>✗</PopBtn>
          <PopBtn color="#fbbf24" hoverBg="#f59e0b" bg="#451a03" onClick={() => { onSet('warn'); setPopupPos(null); }}>⚠</PopBtn>
          <PopBtn color="#94a3b8" hoverBg="#475569" bg="#2a3347" onClick={() => { onSet(null); setPopupPos(null); }}>○</PopBtn>
        </div>,
        document.body
      )}
    </td>
  );
}

function PopBtn({ children, onClick, color, hoverBg, bg }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, cursor: 'pointer', transition: 'all .1s',
        background: h ? hoverBg : bg,
        color: h ? '#fff' : color,
        fontFamily: 'inherit',
      }}
    >{children}</button>
  );
}
