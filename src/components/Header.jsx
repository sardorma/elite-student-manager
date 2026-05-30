import { useRef, useState, useEffect } from 'react';
import { readFileAsDataURL } from '../utils/helpers';

const TITLE_KEY = 'esm_app_title';

export default function Header({
  logo, onLogoChange,
  onSave, onCloudSave, onCloudLoad,
  onToggleReport, onDownload,
  onExportPDF, onExportExcel,
  onOpenAuth, onOpenAnalytics, onOpenAdmin,
  user, cloudSyncing, canEdit = true,
}) {
  const fileRef = useRef();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef();
  const [editingTitle, setEditingTitle] = useState(false);
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem(TITLE_KEY) || 'Elite Student Manager');
  const [titleDraft, setTitleDraft] = useState('');
  const titleInputRef = useRef();

  const handleLogoFile = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = await readFileAsDataURL(f);
    onLogoChange(url);
    e.target.value = '';
  };

  const startEditTitle = () => {
    setTitleDraft(appTitle);
    setEditingTitle(true);
    setTimeout(() => { titleInputRef.current?.select(); }, 30);
  };

  const confirmTitle = () => {
    const val = titleDraft.trim() || 'Elite Student Manager';
    setAppTitle(val);
    localStorage.setItem(TITLE_KEY, val);
    setEditingTitle(false);
  };

  const handleTitleKey = (e) => {
    if (e.key === 'Enter') confirmTitle();
    if (e.key === 'Escape') setEditingTitle(false);
  };

  // BUG FIX: close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
      height: 52, background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
      zIndex: 10, boxShadow: '0 1px 0 #f1f5f9',
    }}>
      <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />

      {/* Logo */}
      <div onClick={() => fileRef.current.click()} title="Logo yuklash"
        style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: logo ? 'transparent' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 12, color: '#fff', cursor: 'pointer',
          overflow: 'hidden', border: '2px solid #e0e7ff', transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'SM'}
      </div>

      {/* Title — click to edit */}
      <div className="header-title-block" style={{ cursor: 'pointer' }} title="Nom o'zgartirish uchun bosing">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            autoFocus
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onKeyDown={handleTitleKey}
            onBlur={confirmTitle}
            style={{
              fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-.4px',
              border: 'none', borderBottom: '2px solid #6366f1', outline: 'none',
              background: 'transparent', fontFamily: 'inherit', width: 220, padding: '2px 0',
            }}
          />
        ) : (
          <div
            onClick={startEditTitle}
            style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-.4px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {appTitle}
            <span style={{ fontSize: 10, color: '#c7d2fe', fontWeight: 400 }}>✎</span>
          </div>
        )}
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Premium grade sheet</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Cloud button */}
        <HeaderBtn
          onClick={onOpenAuth}
          secondary
          title={user ? `Kirgan: ${user.email}` : 'Cloud Sync'}
        >
          {cloudSyncing ? '⏳' : user ? '☁️✅' : '☁️'}{' '}
          <span className="hide-xs">{user ? 'Cloud' : 'Cloud'}</span>
        </HeaderBtn>

        {user && (
          <>
            <HeaderBtn onClick={onCloudSave} secondary title="Bulutga saqlash">
              ⬆ <span className="hide-xs">Saqlash</span>
            </HeaderBtn>
            <HeaderBtn onClick={onCloudLoad} secondary title="Bulutdan yuklash">
              ⬇ <span className="hide-xs">Yuklash</span>
            </HeaderBtn>
          </>
        )}

        {/* Export dropdown — BUG FIX: ref added, closes on outside click */}
        <div ref={exportRef} style={{ position: 'relative' }}>
          <HeaderBtn secondary onClick={() => setExportOpen(o => !o)}>
            📤 <span className="hide-xs">Export</span> ▾
          </HeaderBtn>
          {exportOpen && (
            <div
              style={{
                position: 'absolute', right: 0, top: 34,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                boxShadow: '0 6px 24px rgba(0,0,0,.12)', zIndex: 50,
                minWidth: 160, overflow: 'hidden',
              }}
            >
              <DropItem onClick={() => { onDownload(); setExportOpen(false); }}>📄 HTML download</DropItem>
              <DropItem onClick={() => { onExportPDF(); setExportOpen(false); }}>🔴 PDF export</DropItem>
              <DropItem onClick={() => { onExportExcel(); setExportOpen(false); }}>🟢 Excel export</DropItem>
            </div>
          )}
        </div>

        {canEdit && <HeaderBtn onClick={onSave}>💾 <span className="hide-xs">Saqlash</span></HeaderBtn>}
        <HeaderBtn onClick={onToggleReport} secondary>📊 <span className="hide-xs">Hisobot</span></HeaderBtn>
        <HeaderBtn onClick={onOpenAnalytics} secondary>📈 <span className="hide-xs">Tahlil</span></HeaderBtn>
        <HeaderBtn onClick={onOpenAdmin} secondary>👥 <span className="hide-xs">Admin</span></HeaderBtn>
      </div>
    </header>
  );
}

function HeaderBtn({ children, onClick, secondary, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 11px', borderRadius: 8, cursor: 'pointer',
        border: secondary ? '1.5px solid #e2e8f0' : 'none',
        background: secondary ? '#fff' : '#6366f1',
        color: secondary ? '#475569' : '#fff',
        fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
        whiteSpace: 'nowrap', transition: 'all .12s',
      }}
      onMouseEnter={e => { if (secondary) { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; } else e.currentTarget.style.background = '#4f46e5'; }}
      onMouseLeave={e => { if (secondary) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; } else e.currentTarget.style.background = '#6366f1'; }}
    >{children}</button>
  );
}

function DropItem({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '10px 14px', border: 'none', background: 'none',
        fontSize: 12, color: '#334155', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background .1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{children}</button>
  );
}
