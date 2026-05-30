import { useState, useEffect } from 'react';
import { X, Monitor, Download } from 'lucide-react';

// Electron ichida ishlayaptimi?
const isElectron = () => typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');

// Foydalanuvchi avval yopganmi?
const DISMISSED_KEY = 'esm_banner_dismissed';

export default function DownloadBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Electron ichida — banner kerak emas
    if (isElectron()) return;
    // Avval yopilganmi — ko'rsatma
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
      borderRadius: 14,
      boxShadow: '0 8px 32px rgba(99,102,241,.35)',
      padding: '14px 16px',
      width: 300,
      color: '#fff',
      fontFamily: 'inherit',
      animation: 'slideUp .3s ease',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      {/* Yopish tugmasi */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(255,255,255,.15)', border: 'none',
          borderRadius: 6, width: 22, height: 22,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}
      >
        <X size={12} />
      </button>

      {/* Icon + sarlavha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Monitor size={18} color="#a5b4fc" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>Windows ilovasini yuklab oling</div>
          <div style={{ fontSize: 11, color: '#a5b4fc', marginTop: 2 }}>Internet shart emas, tezroq ishlaydi</div>
        </div>
      </div>

      {/* Afzalliklar */}
      <div style={{ fontSize: 11, color: '#c7d2fe', marginBottom: 12, lineHeight: 1.8 }}>
        ✅ Offline ishlaydi &nbsp;·&nbsp; ✅ Ma'lumot saqlanadi<br/>
        ✅ Tez va qulay &nbsp;·&nbsp; ✅ O'rnatish oson
      </div>

      {/* Yuklab olish tugmasi */}
      <a
        href="https://github.com/YOUR_USERNAME/elite-student-manager/releases/latest"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDismiss}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          background: '#6366f1',
          color: '#fff', textDecoration: 'none',
          borderRadius: 9, padding: '9px 14px',
          fontSize: 12, fontWeight: 700,
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
        onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
      >
        <Download size={14} />
        .exe yuklab olish
      </a>

      <div style={{ fontSize: 10, color: '#818cf8', textAlign: 'center', marginTop: 8 }}>
        Windows 10/11 · Bepul
      </div>
    </div>
  );
}
