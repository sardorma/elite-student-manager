export default function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 999,
      background: '#1e293b', color: '#fff', borderRadius: 10,
      padding: '10px 18px', fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,.18)',
      transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  );
}
