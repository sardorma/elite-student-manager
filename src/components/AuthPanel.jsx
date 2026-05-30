import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';

export default function AuthPanel({ auth, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const handleGoogle = async () => {
    setErr(''); setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) {
      setErr(e.message || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    setLoading(true);
    try { await auth.logout(); onClose(); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360,
        boxShadow: '0 24px 64px rgba(0,0,0,.22)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#f97316,#ea580c)',
          padding: '28px 28px 24px',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔥</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Cloud Sync</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 4 }}>
            Firebase orqali bulutda saqlash
          </div>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {auth.user ? (
            /* ── Kirgan holat ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 12, padding: '12px 14px',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
                  flexShrink: 0, border: '2px solid #dcfce7',
                }}>
                  {auth.user.photoURL ? (
                    <img src={auth.user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', background: '#f97316',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: '#fff',
                    }}>
                      {(auth.user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {auth.user.displayName || auth.user.email}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {auth.user.email}
                  </div>
                </div>
                {auth.profile?.role && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                    background: auth.profile.role === 'admin' ? '#fff7ed' : auth.profile.role === 'teacher' ? '#e0f2fe' : '#f8fafc',
                    color:      auth.profile.role === 'admin' ? '#ea580c' : auth.profile.role === 'teacher' ? '#0891b2' : '#64748b',
                  }}>
                    {auth.profile.role === 'admin' ? '👑 Admin' : auth.profile.role === 'teacher' ? '👨‍🏫 O\'qituvchi' : '👁 Kuzatuvchi'}
                  </span>
                )}
              </div>

              <button onClick={handleLogout} disabled={loading} style={{
                padding: '11px 0', borderRadius: 10, border: '1.5px solid #fecdd3',
                background: '#fff', color: '#be123c', fontSize: 13, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.6 : 1, transition: 'all .15s',
              }}>
                {loading ? '⏳ Chiqilmoqda...' : '🚪 Chiqish'}
              </button>
            </div>
          ) : (
            /* ── Kirmagan holat ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!auth.configured && (
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 10, padding: '11px 14px', fontSize: 12, color: '#9a3412', lineHeight: 1.6,
                }}>
                  ⚠️ <b>.env</b> faylida Firebase sozlamalari yo'q.
                </div>
              )}

              <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
                Google hisobingiz bilan kiring — ma'lumotlar Firebase'da saqlanadi.
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading || !auth.configured}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '13px 0', borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  background: loading || !auth.configured ? '#f8fafc' : '#fff',
                  cursor: loading || !auth.configured ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  color: !auth.configured ? '#94a3b8' : '#1e293b',
                  opacity: !auth.configured ? 0.5 : 1,
                  boxShadow: auth.configured && !loading ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {loading ? '⏳ Kirилmoqda...' : <><GoogleIcon /> Google bilan kirish</>}
              </button>
            </div>
          )}

          {err && (
            <div style={{
              marginTop: 12, background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#be123c',
            }}>❌ {err}</div>
          )}

          <button onClick={onClose} style={{
            marginTop: 16, width: '100%', padding: '9px',
            border: '1.5px solid #e2e8f0', borderRadius: 8,
            background: '#fff', color: '#94a3b8', fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Yopish</button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
