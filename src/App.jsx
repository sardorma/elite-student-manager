import { useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { useToast } from './hooks/useToast';
import { useModal } from './hooks/useModal';
import { useAuth } from './hooks/useAuth';
import { cloudSave, cloudLoad } from './lib/firebase';
import { exportPDF } from './lib/exportPDF';
import { exportExcel } from './lib/exportExcel';
import { readFileAsDataURL, printReport } from './utils/helpers';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SheetTable from './components/SheetTable';
import Report from './components/Report';
import Modal from './components/Modal';
import Toast from './components/Toast';
import AuthPanel from './components/AuthPanel';
import DownloadBanner from './components/DownloadBanner';
import Analytics from './components/Analytics';
import AdminPanel from './components/AdminPanel';

import './App.css';

export default function App() {
  const store = useStore();
  const { toast, showToast } = useToast();
  const { modal, openModal, closeModal, confirmModal } = useModal();
  const auth = useAuth();

  const [filter, setFilter] = useState('');
  const [perPage, setPerPage] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReport, setShowReport] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

  const activeGroupObj = store.S.groups.find(g => g.id === store.gid);
  const sheetDate = store.S.sheetDate;

  // ── Handlers ───────────────────────────────────────────────
  const handleLogoChange = useCallback(async (fileOrUrl) => {
    if (typeof fileOrUrl === 'string') store.setLogo(fileOrUrl);
    else { const data = await readFileAsDataURL(fileOrUrl); store.setLogo(data); }
    showToast('✅ Logo yangilandi');
  }, [store, showToast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'elite_student_manager.html'; a.click();
    showToast('📁 HTML yuklab olindi');
  }, [showToast]);

  const handleExportPDF = useCallback(() => {
    try {
      exportPDF({
        groupName: activeGroupObj?.name,
        date: sheetDate,
        students: store.sts,
        cols: store.cols,
        getG: store.getG,
        getAttendance: store.getAttendance,
      });
      showToast('🔴 PDF tayyor!');
    } catch (e) { showToast('❌ PDF xatoligi: ' + e.message); }
  }, [activeGroupObj, sheetDate, store, showToast]);

  const handleExportExcel = useCallback(() => {
    try {
      exportExcel({
        groupName: activeGroupObj?.name,
        date: sheetDate,
        students: store.sts,
        cols: store.cols,
        getG: store.getG,
        getAttendance: store.getAttendance,
      });
      showToast('🟢 Excel tayyor!');
    } catch (e) { showToast('❌ Excel xatoligi: ' + e.message); }
  }, [activeGroupObj, sheetDate, store, showToast]);

  const handleCloudSave = useCallback(async () => {
    if (!auth.user) { showToast('⚠️ Avval login qiling'); return; }
    setCloudSyncing(true);
    try { await cloudSave(auth.user.uid, store.S); showToast('☁️ Bulutga saqlandi!'); }
    catch (e) { showToast('❌ ' + e.message); }
    finally { setCloudSyncing(false); }
  }, [auth.user, store.S, showToast]);

  const handleCloudLoad = useCallback(async () => {
    if (!auth.user) { showToast('⚠️ Avval login qiling'); return; }
    setCloudSyncing(true);
    try {
      const payload = await cloudLoad(auth.user.uid);
      if (payload) { store.loadState(payload); showToast('☁️ Bulutdan yuklandi!'); }
      else showToast('ℹ️ Bulutda ma\'lumot yo\'q');
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setCloudSyncing(false); }
  }, [auth.user, store, showToast]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="app">
      <Header
        logo={store.S.logo}
        onLogoChange={handleLogoChange}
        onSave={() => { store.save(); showToast('💾 Saqlandi!'); }}
        onCloudSave={handleCloudSave}
        onCloudLoad={handleCloudLoad}
        onToggleReport={() => setShowReport(v => !v)}
        onDownload={handleDownload}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onOpenAuth={() => setShowAuth(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        user={auth.user}
        cloudSyncing={cloudSyncing}
        canEdit={auth.canEdit !== false}
      />

      <div className="app-body">
        {/* Mobile sidebar toggle */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>

        <div className={`sidebar-wrap ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Sidebar
            logo={store.S.logo}
            onLogoChange={handleLogoChange}
            onLogoClear={() => { store.setLogo(null); showToast('🗑 Logo tozalandi'); }}
            sheetDate={sheetDate}
            onDateChange={store.setSheetDate}
            onAddStudent={() => { store.addStudent(); showToast("👤 O'quvchi qo'shildi"); }}
            onRemoveStudent={() => { store.removeStudentById(store.sts[store.sts.length - 1]?.id); showToast('👤 Olib tashlandi'); }}
            onAddColumn={() => { store.addColumn(); showToast("＋ Ustun qo'shildi"); }}
            onRemoveColumn={() => { store.removeColumn(); showToast('— Ustun olib tashlandi'); }}
            filter={filter}
            onFilter={setFilter}
            perPage={perPage}
            onPerPage={v => setPerPage(v)}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onExport={() => { store.exportJSON(); showToast('⬇ JSON exported'); }}
            onImport={(file) => {
              const r = new FileReader(); r.onload = ev => {
                store.importJSON(ev.target.result) ? showToast('✅ Import muvaffaqiyatli') : showToast('❌ Import xato');
              }; r.readAsText(file);
            }}
            onClearCells={() => { if (confirm("Bugungi baholarni tozalash?")) { store.clearCells(); showToast('✏ Tozalandi'); } }}
            onClearAll={() => { if (confirm("Barcha ma'lumotlarni tozalash?")) { store.clearAll(); showToast('🗑 Tozalandi'); } }}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="main-panel">
          <Topbar
            groups={store.S.groups}
            activeGroup={store.gid}
            onSwitch={store.switchGroup}
            onRename={() => openModal('Guruh nomini o\'zgartir', activeGroupObj?.name, (val) => { store.renameGroup(val); showToast("✏ Nom o'zgartirildi"); })}
            onAddGroup={(name) => { store.addGroup(name); showToast("＋ Yangi guruh yaratildi"); }}
            filter={filter}
            onFilter={setFilter}
          />

          <div className="main-content">
            <SheetTable
              students={store.sts}
              cols={store.cols}
              getG={store.getG}
              setG={store.setG}
              getAttendance={store.getAttendance}
              setAttendance={store.setAttendance}
              setAvatar={store.setAvatar}
              renameStudent={store.renameStudent}
              getStudentScore={store.getStudentScore}
              onDeleteStudent={store.removeStudentById}
              onToggleFreeze={store.toggleFreeze}
              addToken={store.addToken}
              setTokens={store.setTokens}
              filter={filter}
              statusF={statusFilter}
              perPage={perPage}
              sheetDate={sheetDate}
              allGrades={store.S.grades}
              gid={store.gid}
              onRenameCol={(ci) => openModal("Ustun nomini o'zgartir", store.cols[ci], (val) => { store.renameColumn(ci, val); showToast("✏ Ustun nomi o'zgartirildi"); })}
            />

            <Report
              students={store.sts}
              cols={store.cols}
              getG={store.getG}
              allGrades={store.S.grades}
              attendance={store.S.attendance}
              gid={store.gid}
              groupName={activeGroupObj?.name}
              date={sheetDate}
              show={showReport}
              onPrint={() => printReport(activeGroupObj, store.cols, store.sts, store.getG, sheetDate)}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
            />
          </div>
        </div>
      </div>

      <Modal modal={modal} onClose={closeModal} onConfirm={confirmModal} />
      <Toast msg={toast.msg} visible={toast.visible} />
      {showAuth && <AuthPanel auth={auth} onClose={() => setShowAuth(false)} />}
      {showAnalytics && <Analytics S={store.S} onClose={() => setShowAnalytics(false)} />}
      {showAdmin && <AdminPanel auth={auth} S={store.S} onClose={() => setShowAdmin(false)} />}
      <DownloadBanner />
    </div>
  );
}
