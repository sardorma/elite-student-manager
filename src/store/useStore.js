import { useState, useCallback } from 'react';

const STORAGE_KEY = 'esm_v3';

const COL_DEFAULTS = ['Vocabulary', 'Reading', 'Grammar', 'Writing', 'Speaking', 'Listening', 'Task'];

const defaultState = {
  logo: null,
  groups: [{ id: 'g1', name: 'Group 1' }],
  activeGroup: 'g1',
  students: {
    g1: [
      { id: 's1', name: 'Student 1', avatar: null, frozen: false, tokens: 0 },
      { id: 's2', name: 'Student 2', avatar: null, frozen: false, tokens: 0 },
      { id: 's3', name: 'Student 3', avatar: null, frozen: false, tokens: 0 },
    ],
  },
  columns: {
    g1: ['Vocabulary', 'Reading', 'Grammar', 'Task 4', 'Task 5', 'Task 6', 'Task 7'],
  },
  grades: {},
  attendance: {},
  sheetDate: new Date().toISOString().split('T')[0],
};

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      // migrate old flat grades to date-based
      if (parsed.grades && !Object.keys(parsed.grades).some(k => /^\d{4}-\d{2}-\d{2}$/.test(k))) {
        const today = new Date().toISOString().split('T')[0];
        parsed.grades = { [today]: parsed.grades };
      }
      // Always reset sheetDate to today on app load
      parsed.sheetDate = new Date().toISOString().split('T')[0];
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return defaultState;
}

export function useStore() {
  const [S, setS] = useState(load);

  const save = useCallback((state) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, []);

  const update = useCallback((fn) => {
    setS(prev => { const next = fn(prev); save(next); return next; });
  }, [save]);

  const gid = S.activeGroup;
  const sts = S.students[gid] || [];
  const cols = S.columns[gid] || [];

  // Date-keyed grade helpers
  const getG = useCallback((sid, ci, date) => {
    const d = date || S.sheetDate;
    return S.grades?.[d]?.[`${gid}_${sid}_${ci}`] || null;
  }, [S.grades, S.sheetDate, gid]);

  const setG = useCallback((sid, ci, val, date) => {
    update(prev => {
      const d = date || prev.sheetDate;
      const dayGrades = { ...(prev.grades[d] || {}) };
      const key = `${prev.activeGroup}_${sid}_${ci}`;
      if (val === null) delete dayGrades[key];
      else dayGrades[key] = val;
      return { ...prev, grades: { ...prev.grades, [d]: dayGrades } };
    });
  }, [update]);

  // Attendance helpers
  const getAttendance = useCallback((sid, date) => {
    const d = date || S.sheetDate;
    return S.attendance?.[d]?.[`${gid}_${sid}`] || null;
  }, [S.attendance, S.sheetDate, gid]);

  const setAttendance = useCallback((sid, val, date) => {
    update(prev => {
      const d = date || prev.sheetDate;
      const dayAtt = { ...(prev.attendance?.[d] || {}) };
      const key = `${prev.activeGroup}_${sid}`;
      if (val === null) delete dayAtt[key];
      else dayAtt[key] = val;
      return { ...prev, attendance: { ...prev.attendance, [d]: dayAtt } };
    });
  }, [update]);

  // Tokens
  const addToken = useCallback((sid, amount = 1) => {
    update(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [prev.activeGroup]: prev.students[prev.activeGroup].map(s =>
          s.id === sid ? { ...s, tokens: Math.max(0, (s.tokens || 0) + amount) } : s
        ),
      },
    }));
  }, [update]);

  const setTokens = useCallback((sid, tokens) => {
    update(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [prev.activeGroup]: prev.students[prev.activeGroup].map(s =>
          s.id === sid ? { ...s, tokens: Math.max(0, tokens) } : s
        ),
      },
    }));
  }, [update]);

  // Students
  const addStudent = useCallback(() => {
    update(prev => {
      const g = prev.activeGroup;
      const list = prev.students[g] || [];
      return {
        ...prev,
        students: {
          ...prev.students,
          [g]: [...list, { id: 's' + Date.now() + Math.random().toString(36).slice(2), name: 'Student ' + (list.length + 1), avatar: null, frozen: false, tokens: 0 }],
        },
      };
    });
  }, [update]);

  // BUG FIX: also remove student's grades/attendance from all dates
  const removeStudentById = useCallback((sid) => {
    update(prev => {
      const g = prev.activeGroup;

      // Remove from students list
      const students = { ...prev.students, [g]: prev.students[g].filter(s => s.id !== sid) };

      // Remove grades for this student across all dates
      const grades = {};
      for (const [date, dayGrades] of Object.entries(prev.grades || {})) {
        const cleaned = {};
        for (const [key, val] of Object.entries(dayGrades)) {
          if (!key.startsWith(`${g}_${sid}_`)) cleaned[key] = val;
        }
        if (Object.keys(cleaned).length > 0) grades[date] = cleaned;
      }

      // Remove attendance for this student across all dates
      const attendance = {};
      for (const [date, dayAtt] of Object.entries(prev.attendance || {})) {
        const cleaned = {};
        for (const [key, val] of Object.entries(dayAtt)) {
          if (key !== `${g}_${sid}`) cleaned[key] = val;
        }
        if (Object.keys(cleaned).length > 0) attendance[date] = cleaned;
      }

      return { ...prev, students, grades, attendance };
    });
  }, [update]);

  const renameStudent = useCallback((sid, name) => {
    if (!name.trim()) return;
    update(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [prev.activeGroup]: prev.students[prev.activeGroup].map(s =>
          s.id === sid ? { ...s, name: name.trim() } : s
        ),
      },
    }));
  }, [update]);

  const setAvatar = useCallback((sid, avatar) => {
    update(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [prev.activeGroup]: prev.students[prev.activeGroup].map(s =>
          s.id === sid ? { ...s, avatar } : s
        ),
      },
    }));
  }, [update]);

  const toggleFreeze = useCallback((sid) => {
    update(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [prev.activeGroup]: prev.students[prev.activeGroup].map(s =>
          s.id === sid ? { ...s, frozen: !s.frozen } : s
        ),
      },
    }));
  }, [update]);

  // Columns
  const addColumn = useCallback(() => {
    update(prev => {
      const g = prev.activeGroup;
      const columns = prev.columns[g] || [];
      const n = columns.length;
      const base = COL_DEFAULTS[n % COL_DEFAULTS.length];
      return { ...prev, columns: { ...prev.columns, [g]: [...columns, n < COL_DEFAULTS.length ? base : base + ' ' + (n + 1)] } };
    });
  }, [update]);

  const removeColumn = useCallback(() => {
    update(prev => {
      const g = prev.activeGroup;
      const columns = prev.columns[g] || [];
      if (!columns.length) return prev;
      return { ...prev, columns: { ...prev.columns, [g]: columns.slice(0, -1) } };
    });
  }, [update]);

  const renameColumn = useCallback((ci, name) => {
    if (!name.trim()) return;
    update(prev => {
      const g = prev.activeGroup;
      const columns = [...(prev.columns[g] || [])];
      columns[ci] = name.trim();
      return { ...prev, columns: { ...prev.columns, [g]: columns } };
    });
  }, [update]);

  // Groups
  const addGroup = useCallback((name) => {
    const id = 'g' + Date.now();
    update(prev => ({
      ...prev,
      groups: [...prev.groups, { id, name: name?.trim() || 'Group ' + (prev.groups.length + 1) }],
      students: { ...prev.students, [id]: [] },
      columns: { ...prev.columns, [id]: [...COL_DEFAULTS] },
      activeGroup: id,
    }));
  }, [update]);

  const switchGroup = useCallback((id) => {
    update(prev => ({ ...prev, activeGroup: id }));
  }, [update]);

  const renameGroup = useCallback((name) => {
    if (!name.trim()) return;
    update(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === prev.activeGroup ? { ...g, name: name.trim() } : g),
    }));
  }, [update]);

  const setLogo = useCallback((logo) => update(prev => ({ ...prev, logo })), [update]);
  const setSheetDate = useCallback((date) => update(prev => ({ ...prev, sheetDate: date })), [update]);

  // BUG FIX: clearCells now clears both grades AND attendance for the current date
  const clearCells = useCallback(() => {
    update(prev => {
      const grades = { ...prev.grades };
      delete grades[prev.sheetDate];
      const attendance = { ...prev.attendance };
      delete attendance[prev.sheetDate];
      return { ...prev, grades, attendance };
    });
  }, [update]);

  const clearAll = useCallback(() => {
    update(prev => ({
      ...prev,
      students: { ...prev.students, [prev.activeGroup]: [] },
      grades: {},
      attendance: {},
    }));
  }, [update]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'student_manager.json';
    a.click();
  }, [S]);

  const importJSON = useCallback((data) => {
    try {
      const parsed = JSON.parse(data);
      // Basic structure validation
      if (typeof parsed !== 'object' || !parsed.students || !parsed.groups) return false;
      const next = { ...defaultState, ...parsed };
      setS(next); save(next); return true;
    } catch { return false; }
  }, [save]);

  const loadState = useCallback((payload) => {
    const next = { ...defaultState, ...payload };
    setS(next); save(next);
  }, [save]);

  // Score for current sheetDate only
  const getStudentScore = useCallback((sid) => {
    let done = 0, fail = 0, warn = 0;
    const dayGrades = S.grades?.[S.sheetDate] || {};
    cols.forEach((_, ci) => {
      const g = dayGrades[`${gid}_${sid}_${ci}`];
      if (g === 'done') done++;
      else if (g === 'fail') fail++;
      else if (g === 'warn') warn++;
    });
    const totalSlots = cols.length;
    const pct = totalSlots ? Math.round(((done * 3 + warn) / (totalSlots * 3)) * 100) : 0;
    return { done, fail, warn, pct };
  }, [S.grades, S.sheetDate, cols, gid]);

  return {
    S, gid, sts, cols,
    getG, setG,
    getAttendance, setAttendance,
    addToken, setTokens,
    addStudent, removeStudentById, renameStudent, setAvatar, toggleFreeze,
    addColumn, removeColumn, renameColumn,
    addGroup, switchGroup, renameGroup,
    setLogo, setSheetDate,
    clearCells, clearAll,
    exportJSON, importJSON, loadState,
    getStudentScore,
    save: () => save(S),
  };
}
