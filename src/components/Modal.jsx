import { useState, useEffect } from 'react';

export default function Modal({ modal, onClose, onConfirm }) {
  const [val, setVal] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (modal?.open) {
      setVal(modal.value || '');
      // small delay so CSS transition triggers
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [modal?.open, modal?.value]);

  useEffect(() => {
    if (!modal?.open) return;
    const handler = (e) => {
      if (e.key === 'Enter') onConfirm(val);
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal?.open, val, onConfirm, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  if (!modal?.open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position: 'fixed', inset: 0,
        background: visible ? 'rgba(15,23,42,0.35)' : 'rgba(15,23,42,0)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        transition: 'background 0.22s ease',
        backdropFilter: visible ? 'blur(3px)' : 'blur(0px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: '28px 32px',
        minWidth: 320, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(99,102,241,.18)',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s ease',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✏️ {modal.title}
        </h3>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{
            width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
            borderRadius: 9, fontSize: 13, color: '#0f172a', outline: 'none',
            fontFamily: 'inherit', transition: 'border-color .15s, box-shadow .15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={handleClose} style={{
            padding: '8px 18px', border: '1.5px solid #e2e8f0', borderRadius: 9,
            background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >Bekor</button>
          <button onClick={() => onConfirm(val)} style={{
            padding: '8px 20px', border: 'none', borderRadius: 9,
            background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
          >OK ✓</button>
        </div>
      </div>
    </div>
  );
}
