import { useRef } from 'react';
import { readFileAsDataURL } from '../utils/helpers';

export default function Sidebar({
  logo, sheetDate, onDateChange,
  onLogoChange, onLogoClear,
  onAddStudent, onRemoveStudent,
  onAddColumn, onRemoveColumn,
  filter, onFilter,
  statusFilter, onStatusFilter,
  perPage, onPerPage,
  onExport, onImport,
  onClearCells, onClearAll,
  className = '',
}) {
  const logoFileRef = useRef();
  const importFileRef = useRef();

  const handleLogoFile = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = await readFileAsDataURL(f);
    onLogoChange(url);
    e.target.value = '';
  };

  const handleImport = (e) => {
    const f = e.target.files[0]; if (!f) return;
    onImport(f);
    e.target.value = '';
  };

  return (
    <aside className={`sidebar ${className}`} style={{
      width: 248, minWidth: 248, background: '#fff',
      borderRight: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', padding: '16px 14px', gap: 20,
    }}>
      <input type="file" ref={logoFileRef} accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
      <input type="file" ref={importFileRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />

      {/* Logo + Date */}
      <SbSection>
        <div
          onClick={() => logoFileRef.current.click()}
          style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: 12, textAlign: 'center', fontSize: 12, color: '#94a3b8', cursor: 'pointer', marginBottom: 8, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
        >{logo ? "✅ Logo o'rnatildi" : '📂 Drop logo or click'}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <Btn blue onClick={() => logoFileRef.current.click()}>Set Logo</Btn>
          <Btn gray onClick={onLogoClear}>🗑 Clear</Btn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>Sheet Date</span>
          <input type="date" value={sheetDate || ''} onChange={e => onDateChange(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
      </SbSection>

      {/* Students */}
      <SbSection title="Students & Avatars">
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn blue onClick={onAddStudent}>👤 Add</Btn>
          <Btn gray onClick={onRemoveStudent}>— Remove Last</Btn>
        </div>
        <Hint>Click name to edit · Avatar upload · 3 dots = settings</Hint>
      </SbSection>

      {/* Columns */}
      <SbSection title="Tasks / Columns">
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn blue onClick={onAddColumn}>＋ Column</Btn>
          <Btn gray onClick={onRemoveColumn}>— Column</Btn>
        </div>
        <Hint>Max 7 visible per page · Double-click header to rename</Hint>
      </SbSection>

      {/* Search & View */}
      <SbSection title="Search & View">
        <input value={filter} onChange={e => onFilter(e.target.value)} placeholder="Search students..." style={{ ...inputStyle, marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <select style={{ ...inputStyle, flex: 1, width: 'auto' }} value={perPage} onChange={e => onPerPage(e.target.value)}>
            <option value="7">7 per page</option>
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="50">All</option>
          </select>
          <select style={{ ...inputStyle, flex: 1, width: 'auto' }} value={statusFilter} onChange={e => onStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="done">✓ Done</option>
            <option value="fail">✗ Fail</option>
            <option value="warn">⚠ Partial</option>
          </select>
        </div>
      </SbSection>

      {/* Data */}
      <SbSection title="Data">
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <Btn gray onClick={onExport}>⬇ Export JSON</Btn>
          <Btn gray onClick={() => importFileRef.current.click()}>⬆ Import</Btn>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn gray onClick={onClearCells}>✏ Clear Cells</Btn>
          <Btn red onClick={onClearAll}>🗑 Clear All</Btn>
        </div>
      </SbSection>
    </aside>
  );
}

function SbSection({ title, children }) {
  return (
    <div>
      {title && <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}
function Btn({ children, onClick, blue, red, gray }) {
  const bg = blue ? '#6366f1' : red ? '#fff0f0' : '#f8fafc';
  const color = blue ? '#fff' : red ? '#dc2626' : '#475569';
  const border = blue ? 'none' : red ? '1.5px solid #fecaca' : '1.5px solid #e2e8f0';
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: bg, color, border }}>{children}</button>
  );
}
function Hint({ children }) {
  return <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, marginTop: 6 }}>{children}</div>;
}
const inputStyle = { padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#0f172a', outline: 'none', background: '#fff', fontFamily: 'inherit', width: '100%' };
