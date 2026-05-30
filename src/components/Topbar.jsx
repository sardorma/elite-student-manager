import { useState } from 'react';

export default function Topbar({
  groups, activeGroup,
  onSwitch, onRename, onAddGroup,
  filter, onFilter,
}) {
  const currentGroup = groups.find(g => g.id === activeGroup);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const openAddModal = () => {
    setNewGroupName('');
    setShowAddModal(true);
    requestAnimationFrame(() => setModalVisible(true));
  };

  const closeAddModal = () => {
    setModalVisible(false);
    setTimeout(() => { setShowAddModal(false); setNewGroupName(''); }, 220);
  };

  const handleAddGroupConfirm = () => {
    const name = newGroupName.trim();
    onAddGroup(name || null);
    setModalVisible(false);
    setTimeout(() => { setShowAddModal(false); setNewGroupName(''); }, 220);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddGroupConfirm();
    if (e.key === 'Escape') closeAddModal();
  };

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>Group:</span>
        <select
          value={activeGroup}
          onChange={e => onSwitch(e.target.value)}
          style={{
            padding: '5px 9px', background: '#f8fafc', border: '1.5px solid #e2e8f0',
            borderRadius: 8, color: '#0f172a', fontSize: 12, outline: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button
          onClick={() => onRename(currentGroup?.name)}
          style={{
            padding: '4px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7,
            background: '#fff', color: '#64748b', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
        >
          Rename
        </button>

        <button
          onClick={openAddModal}
          style={{
            padding: '4px 10px', border: 'none', borderRadius: 7,
            background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + New Group
        </button>

        <div style={{ flex: 1, position: 'relative', maxWidth: 380 }}>
          <span style={{
            position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
            color: '#94a3b8', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            value={filter}
            onChange={e => onFilter(e.target.value)}
            placeholder="Search students, tasks..."
            style={{
              width: '100%', padding: '5px 10px 5px 30px', border: '1.5px solid #e2e8f0',
              borderRadius: 8, fontSize: 12, outline: 'none', background: '#f8fafc',
              fontFamily: 'inherit', color: '#0f172a', transition: 'all .15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
          />
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeAddModal()}
          style={{
            position: 'fixed', inset: 0,
            background: modalVisible ? 'rgba(15,23,42,0.35)' : 'rgba(15,23,42,0)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: modalVisible ? 'blur(3px)' : 'blur(0px)',
            transition: 'background 0.22s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: '28px 32px', width: 380,
              boxShadow: '0 8px 32px rgba(99,102,241,.18)', display: 'flex', flexDirection: 'column', gap: 16,
              transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(16px)',
              opacity: modalVisible ? 1 : 0,
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s ease',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              ➕ Yangi guruh qo'shish
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Guruh uchun nom kiriting:
            </div>
            <input
              autoFocus
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Masalan: 7-A sinf, Frontend kurs..."
              style={{
                padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0f172a',
                transition: 'border .15s, box-shadow .15s',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={closeAddModal}
                style={{
                  padding: '8px 18px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                  background: '#f8fafc', color: '#64748b', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                Bekor
              </button>
              <button
                onClick={handleAddGroupConfirm}
                style={{
                  padding: '8px 20px', border: 'none', borderRadius: 9,
                  background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
              >
                Yaratish ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
