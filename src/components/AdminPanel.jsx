import { useState, useEffect, useCallback } from 'react';
import {
  getAllProfiles, updateProfileRole, updateProfileName,
  getAllTeacherGroups, setTeacherGroups,
} from '../lib/firebase';

const ROLE_COLORS = { admin: '#ea580c', teacher: '#0891b2', viewer: '#64748b' };
const ROLE_BG     = { admin: '#fff7ed', teacher: '#e0f2fe', viewer: '#f8fafc' };
const ROLE_LABELS = { admin: '👑 Admin', teacher: '👨‍🏫 O\'qituvchi', viewer: '👁 Kuzatuvchi' };

export default function AdminPanel({ auth, S, onClose }) {
  const [tab, setTab]           = useState('users');
  const [profiles, setProfiles] = useState([]);
  const [tgMap, setTgMap]       = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast]       = useState('');
  const [editRole, setEditRole] = useState({});
  const [editName, setEditName] = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [profs, tgs] = await Promise.all([getAllProfiles(), getAllTeacherGroups()]);
      setProfiles(profs);
      const map = {};
      tgs.forEach(r => {
        if (!map[r.teacher_id]) map[r.teacher_id] = [];
        map[r.teacher_id].push(r.group_id);
      });
      setTgMap(map);
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally { setLoadingData(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveRole = async (uid) => {
    const role = editRole[uid];
    if (!role) return;
    setSavingId(uid + '_role');
    try {
      await updateProfileRole(uid, role);
      setProfiles(ps => ps.map(p => p.uid === uid ? { ...p, role } : p));
      setEditRole(e => { const n = { ...e }; delete n[uid]; return n; });
      if (uid === auth.user?.uid) await auth.refreshProfile();
      showToast('✅ Rol yangilandi');
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setSavingId(null); }
  };

  const saveName = async (uid) => {
    const full_name = editName[uid]?.trim();
    if (!full_name) return;
    setSavingId(uid + '_name');
    try {
      await updateProfileName(uid, full_name);
      setProfiles(ps => ps.map(p => p.uid === uid ? { ...p, full_name } : p));
      setEditName(e => { const n = { ...e }; delete n[uid]; return n; });
      showToast('✅ Ism yangilandi');
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setSavingId(null); }
  };

  const toggleGroup = async (teacherUid, groupId) => {
    const current = tgMap[teacherUid] || [];
    const next = current.includes(groupId)
      ? current.filter(g => g !== groupId)
      : [...current, groupId];
    setTgMap(m => ({ ...m, [teacherUid]: next }));
    setSavingId(teacherUid + '_grp');
    try {
      await setTeacherGroups(teacherUid, next);
    } catch (e) {
      setTgMap(m => ({ ...m, [teacherUid]: current }));
      showToast('❌ ' + e.message);
    } finally { setSavingId(null); }
  };

  const teachers = profiles.filter(p => p.role === 'teacher');
  const stats = {
    total:    profiles.length,
    admins:   profiles.filter(p => p.role === 'admin').length,
    teachers: teachers.length,
    viewers:  profiles.filter(p => p.role === 'viewer').length,
  };

  if (!auth.user) return (
    <Overlay onClose={onClose}>
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Kirish talab qilinadi</div>
        <button onClick={onClose} style={closeBtnStyle}>Yopish</button>
      </div>
    </Overlay>
  );

  if (!auth.isAdmin) return (
    <Overlay onClose={onClose}>
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Ruxsat yo'q</div>
        <button onClick={onClose} style={closeBtnStyle}>Yopish</button>
      </div>
    </Overlay>
  );

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>👥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Admin Panel</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Firebase · Google OAuth</div>
        </div>
        {auth.user?.photoURL && (
          <img src={auth.user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fed7aa' }} />
        )}
        <button onClick={loadAll} style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>
          {loadingData ? '⏳' : '🔄'}
        </button>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 20px 0', flexWrap: 'wrap' }}>
        {[
          { label: 'Jami', val: stats.total, color: '#ea580c', bg: '#fff7ed' },
          { label: 'Adminlar', val: stats.admins, color: '#7c3aed', bg: '#f5f3ff' },
          { label: "O'qituvchilar", val: stats.teachers, color: '#0891b2', bg: '#e0f2fe' },
          { label: 'Kuzatuvchilar', val: stats.viewers, color: '#64748b', bg: '#f8fafc' },
          { label: 'Guruhlar', val: S.groups.length, color: '#d97706', bg: '#fffbeb' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: '10px 14px', flex: '1 1 80px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.val}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 20px 0', marginTop: 12 }}>
        {[['users', '👨‍💼 Foydalanuvchilar'], ['groups', '🏫 Guruh ruxsatlari']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 14px', border: 'none', background: 'none', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            color: tab === k ? '#ea580c' : '#64748b',
            borderBottom: tab === k ? '2px solid #ea580c' : '2px solid transparent',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(90vh - 260px)' }}>

        {/* ── FOYDALANUVCHILAR ── */}
        {tab === 'users' && (
          <>
            {loadingData ? <Loading /> : !profiles.length ? (
              <Empty text="Hali foydalanuvchilar yo'q. Google bilan kirganlar bu yerda paydo bo'ladi." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profiles.map(p => {
                  const isMe = p.uid === auth.user?.uid;
                  const roleVal = editRole[p.uid] ?? p.role;
                  const nameVal = editName[p.uid] ?? (p.full_name || '');
                  const nameDirty = editName[p.uid] !== undefined && editName[p.uid] !== (p.full_name || '');
                  const roleDirty = editRole[p.uid] !== undefined && editRole[p.uid] !== p.role;
                  const saving = savingId?.startsWith(p.uid);

                  return (
                    <div key={p.uid} style={{
                      background: '#fff',
                      border: isMe ? '1.5px solid #fb923c' : '1px solid #e2e8f0',
                      borderRadius: 10, padding: '12px 16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid #fed7aa', flexShrink: 0 }}>
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: ROLE_BG[p.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ROLE_COLORS[p.role] }}>
                              {(p.full_name || p.email).slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                            <input
                              value={nameVal}
                              onChange={e => setEditName(n => ({ ...n, [p.uid]: e.target.value }))}
                              placeholder={p.email}
                              style={{ fontSize: 13, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', width: 180, fontFamily: 'inherit' }}
                              onKeyDown={e => e.key === 'Enter' && saveName(p.uid)}
                            />
                            {nameDirty && (
                              <button onClick={() => saveName(p.uid)} disabled={saving} style={smallBtn('#16a34a')}>
                                {saving ? '⏳' : '✓ Saqlash'}
                              </button>
                            )}
                            {isMe && <span style={{ fontSize: 10, background: '#fff7ed', color: '#ea580c', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>Siz</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.email}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>🔥 Firebase · Google</div>
                        </div>

                        {/* Rol */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <select
                            value={roleVal}
                            onChange={e => setEditRole(r => ({ ...r, [p.uid]: e.target.value }))}
                            disabled={isMe}
                            style={{
                              padding: '5px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                              fontSize: 12, background: isMe ? '#f8fafc' : '#fff',
                              fontFamily: 'inherit', color: '#0f172a', outline: 'none',
                              cursor: isMe ? 'not-allowed' : 'pointer', opacity: isMe ? 0.6 : 1,
                            }}
                          >
                            <option value="admin">👑 Admin</option>
                            <option value="teacher">👨‍🏫 O'qituvchi</option>
                            <option value="viewer">👁 Kuzatuvchi</option>
                          </select>
                          {roleDirty && !isMe && (
                            <button onClick={() => saveRole(p.uid)} disabled={saving} style={smallBtn('#ea580c')}>
                              {saving ? '⏳' : '✓ Saqlash'}
                            </button>
                          )}
                          {!roleDirty && (
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600, background: ROLE_BG[p.role], color: ROLE_COLORS[p.role] }}>
                              {ROLE_LABELS[p.role]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 14, padding: '12px 14px', background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa', fontSize: 12, color: '#9a3412' }}>
              💡 Yangi o'qituvchi qo'shish uchun ular <b>Google bilan kirsin</b> — profili bu yerda avtomatik paydo bo'ladi. Keyin rol bering.
            </div>
          </>
        )}

        {/* ── GURUH RUXSATLARI ── */}
        {tab === 'groups' && (
          loadingData ? <Loading /> : !teachers.length ? (
            <Empty text="O'qituvchi rolidagi foydalanuvchilar yo'q." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {teachers.map(t => {
                const assigned = tgMap[t.uid] || [];
                const saving = savingId === t.uid + '_grp';
                return (
                  <div key={t.uid} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e0f2fe' }}>
                        {t.avatar_url
                          ? <img src={t.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0891b2' }}>
                              {(t.full_name || t.email).slice(0, 2).toUpperCase()}
                            </div>
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.full_name || t.email}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{assigned.length} ta guruh {saving ? '⏳' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {S.groups.map(g => {
                        const active = assigned.includes(g.id);
                        return (
                          <button key={g.id} onClick={() => toggleGroup(t.uid, g.id)} disabled={saving} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                            border: active ? 'none' : '1.5px solid #e2e8f0',
                            background: active ? '#ea580c' : '#f8fafc',
                            color: active ? '#fff' : '#64748b',
                          }}>
                            {g.name} {active ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {toast && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, zIndex: 10, whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#f8fafc', borderRadius: 16, width: '100%', maxWidth: 780, boxShadow: '0 8px 40px rgba(0,0,0,.18)', overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

const Loading = () => <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>⏳ Yuklanmoqda...</div>;
const Empty = ({ text }) => <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{text}</div>;
const smallBtn = bg => ({ padding: '3px 10px', border: 'none', borderRadius: 6, background: bg, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' });
const closeBtnStyle = { display: 'block', margin: '16px auto 0', padding: '8px 24px', border: 'none', borderRadius: 8, background: '#ea580c', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
