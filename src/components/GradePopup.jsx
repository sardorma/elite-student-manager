import { useEffect, useRef } from 'react';

export default function GradePopup({ pos, onSelect, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="grade-popup"
      style={{ top: pos.top, left: pos.left }}
      onClick={e => e.stopPropagation()}
    >
      <button className="gp-btn gp-done" onClick={() => onSelect('done')} title="Done">✓</button>
      <button className="gp-btn gp-fail" onClick={() => onSelect('fail')} title="Failed">✗</button>
      <button className="gp-btn gp-warn" onClick={() => onSelect('warn')} title="Partial">⚠</button>
      <button className="gp-btn gp-empty" onClick={() => onSelect(null)} title="Clear">○</button>
    </div>
  );
}
