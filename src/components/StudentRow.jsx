import { useRef, useState, useEffect } from 'react';
import { Snowflake, Trash2 } from 'lucide-react';
import { getInitials, readFileAsDataURL, scoreColor, scoreBg } from '../utils/helpers';
import GradeCell from './GradeCell';
import AttendanceCell from './AttendanceCell';

export default function StudentRow({
  student, visibleCols, colStart, cols,
  getG, setG,
  getAttendance, setAttendance,
  setAvatar, renameStudent, score,
  onDelete, onToggleFreeze, onAddToken,
}) {
  const avatarRef = useRef();
  const [name, setName] = useState(student.name);
  const [editingTokens, setEditingTokens] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [hovering, setHovering] = useState(false);

  // sync name if student.name changes externally
  useEffect(() => { setName(student.name); }, [student.name]);

  const handleAvatarFile = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = await readFileAsDataURL(f);
    setAvatar(student.id, url);
    e.target.value = '';
  };

  const initials = getInitials(student.name);
  const tokens = student.tokens || 0;
  const frozen = student.frozen || false;

  const att = getAttendance(student.id);

  return (
    <tr
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        borderBottom: '1px solid #f8fafc',
        opacity: frozen ? 0.65 : 1,
        background: frozen ? '#f0f4ff' : (hovering ? '#fafbff' : undefined),
        transition: 'background .15s',
      }}
    >
      {/* ── Student cell ── */}
      <td style={{ padding: 0, borderRight: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px 7px 12px', minWidth: 260 }}>

          {/* Avatar */}
          <input type="file" ref={avatarRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
          <div
            onClick={() => !frozen && avatarRef.current.click()}
            title="Rasm yuklash"
            style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: student.avatar ? 'transparent' : '#f1f5f9',
              border: '1.5px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: '#94a3b8',
              cursor: frozen ? 'default' : 'pointer',
              overflow: 'hidden', transition: 'border-color .15s',
            }}
            onMouseEnter={e => { if (!frozen) e.currentTarget.style.borderColor = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            {student.avatar
              ? <img src={student.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials}
          </div>

          {/* Name + progress */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {frozen
              ? <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Snowflake size={11} style={{ color: '#93c5fd', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                </div>
              : <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={e => renameStudent(student.id, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', width: '100%' }}
                />
            }
            <div style={{ height: 2, background: '#f1f5f9', borderRadius: 2, marginTop: 3 }}>
              <div style={{ height: '100%', borderRadius: 2, background: scoreColor(score.pct), width: `${score.pct}%`, transition: 'width .4s' }} />
            </div>
          </div>

          {/* % badge */}
          <div style={{
            background: scoreBg(score.pct), color: scoreColor(score.pct),
            borderRadius: 20, padding: '2px 7px', fontSize: 10, fontWeight: 800, flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {score.pct}%
          </div>

          {/* ── Tokens ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <button
              onClick={() => !frozen && tokens > 0 && onAddToken(student.id, -1)}
              disabled={frozen || tokens === 0}
              title="Token olib qo'yish"
              style={{
                width: 17, height: 17, borderRadius: 4,
                border: '1px solid #e2e8f0', background: '#fff',
                cursor: frozen || tokens === 0 ? 'not-allowed' : 'pointer',
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#e11d48', padding: 0, fontWeight: 700, opacity: tokens === 0 ? 0.4 : 1,
              }}
            >−</button>

            <div
              onClick={() => { if (!frozen) { setEditingTokens(true); setTokenInput(String(tokens)); } }}
              title="Token soni — bosib tahrirlash"
              style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: frozen ? 'default' : 'pointer', minWidth: 36, justifyContent: 'center' }}
            >
              <span style={{ fontSize: 11 }}>🪙</span>
              {editingTokens
                ? <input
                    autoFocus
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => {
                      setEditingTokens(false);
                      const v = parseInt(tokenInput);
                      if (!isNaN(v) && v >= 0) onAddToken(student.id, v - tokens);
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingTokens(false); }}
                    style={{ width: 28, fontSize: 11, fontWeight: 700, color: '#f59e0b', border: '1px solid #fde68a', borderRadius: 3, padding: '1px 2px', outline: 'none', background: '#fffbeb', textAlign: 'center' }}
                  />
                : <span style={{ fontSize: 11, fontWeight: 700, color: tokens > 0 ? '#f59e0b' : '#94a3b8', minWidth: 16, textAlign: 'center' }}>{tokens}</span>
              }
            </div>

            <button
              onClick={() => !frozen && onAddToken(student.id, 1)}
              disabled={frozen}
              title="Token berish"
              style={{
                width: 17, height: 17, borderRadius: 4,
                border: '1px solid #d1fae5', background: '#f0fdf4',
                cursor: frozen ? 'not-allowed' : 'pointer',
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#16a34a', padding: 0, fontWeight: 700,
              }}
            >+</button>
          </div>

          {/* ── ❄️ Freeze button (always visible) ── */}
          <button
            onClick={() => onToggleFreeze(student.id)}
            title={frozen ? "Muzlatishni olib tashlash" : "O'quvchini muzlatish"}
            style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              border: frozen ? '1.5px solid #bfdbfe' : '1.5px solid #e2e8f0',
              background: frozen ? '#eff6ff' : (hovering ? '#f8fafc' : '#fff'),
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: frozen ? '#3b82f6' : '#94a3b8',
              transition: 'all .15s',
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = frozen ? '#bfdbfe' : '#e2e8f0';
              e.currentTarget.style.color = frozen ? '#3b82f6' : '#94a3b8';
              e.currentTarget.style.background = frozen ? '#eff6ff' : '#fff';
            }}
          >
            <Snowflake size={13} />
          </button>

          {/* ── 🗑 Delete button (always visible) ── */}
          <button
            onClick={() => {
              if (confirm(`"${student.name}" ni o'chirasizmi?`)) onDelete(student.id);
            }}
            title="O'quvchini o'chirish"
            style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              border: '1.5px solid #fecaca',
              background: hovering ? '#fff0f0' : '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f87171',
              transition: 'all .15s',
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.background = '#fee2e2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <Trash2 size={13} />
          </button>

        </div>
      </td>

      {/* ── Attendance ── */}
      <AttendanceCell
        value={att}
        onSet={(val) => setAttendance(student.id, val)}
        frozen={frozen}
      />

      {/* ── Grade cells ── */}
      {visibleCols.map((_, i) => {
        const ci = colStart + i;
        const grade = getG(student.id, ci);
        return (
          <GradeCell
            key={ci}
            grade={grade}
            onSet={(val) => setG(student.id, ci, val)}
            frozen={frozen}
          />
        );
      })}
    </tr>
  );
}
