import { useState, useCallback } from 'react';

const STORAGE_KEY = 'shift_organizer_v1';

const DEFAULT = {
  employees: [],
  shifts: [],
  schedules: {}, // { [weekISO]: { [cellKey]: { employeeId, positionLabel } } }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT };
}

function persist(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function useStore() {
  const [data, setDataRaw] = useState(load);

  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      persist(next);
      return next;
    });
  }, []);

  // ── EMPLOYEES ────────────────────────────────────────────────────────────
  const addEmployee = useCallback((name) => {
    const emp = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      name: name.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, employees: [...d.employees, emp] }));
    return emp;
  }, [setData]);

  const updateEmployee = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      employees: d.employees.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
      ),
    }));
  }, [setData]);

  const deleteEmployee = useCallback((id) => {
    setData((d) => {
      // Clear from all schedules
      const schedules = Object.fromEntries(
        Object.entries(d.schedules).map(([wk, sched]) => [
          wk,
          Object.fromEntries(
            Object.entries(sched).map(([k, v]) => [
              k,
              v.employeeId === id ? { ...v, employeeId: null } : v,
            ])
          ),
        ])
      );
      return { ...d, employees: d.employees.filter((e) => e.id !== id), schedules };
    });
  }, [setData]);

  // ── SHIFTS ───────────────────────────────────────────────────────────────
  const saveShifts = useCallback((shifts) => {
    setData((d) => ({ ...d, shifts }));
  }, [setData]);

  // ── SCHEDULES ────────────────────────────────────────────────────────────
  const setSchedule = useCallback((weekISO, sched) => {
    setData((d) => ({ ...d, schedules: { ...d.schedules, [weekISO]: sched } }));
  }, [setData]);

  const assignCell = useCallback((weekISO, key, employeeId) => {
    setData((d) => ({
      ...d,
      schedules: {
        ...d.schedules,
        [weekISO]: {
          ...d.schedules[weekISO],
          [key]: { ...d.schedules[weekISO][key], employeeId },
        },
      },
    }));
  }, [setData]);

  // ── BACKUP / RESTORE ─────────────────────────────────────────────────────
  const exportJSON = useCallback((data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.employees || !parsed.shifts || !parsed.schedules)
            throw new Error('Invalid format');
          setData(parsed);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, [setData]);

  return {
    data,
    setData,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    saveShifts,
    setSchedule,
    assignCell,
    exportJSON,
    importJSON,
  };
}
