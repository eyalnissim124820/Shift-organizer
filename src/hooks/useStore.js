import { useState, useCallback } from 'react';
import { DEFAULT_STAFFING, uid } from '../utils/helpers.js';

const STORAGE_KEY = 'shift_organizer_v2';

const DEFAULT = {
  employees: [],
  staffing: { ...DEFAULT_STAFFING },
  schedules: {}, // { [weekISO]: { [cellKey]: { employeeId, positionLabel } } }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT,
        ...parsed,
        staffing: parsed.staffing || { ...DEFAULT_STAFFING },
      };
    }
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
  const addEmployee = useCallback((empData) => {
    const emp = {
      id: uid(),
      firstName: empData.firstName.trim(),
      lastName: empData.lastName.trim(),
      employeeId: empData.employeeId.trim(),
      phone: empData.phone.trim(),
      shabbatKeeper: empData.shabbatKeeper || false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, employees: [...d.employees, emp] }));
    return emp;
  }, [setData]);

  const addEmployeesBatch = useCallback((empList) => {
    const newEmps = empList.map((empData) => ({
      id: uid(),
      firstName: (empData.firstName || '').trim(),
      lastName: (empData.lastName || '').trim(),
      employeeId: (empData.employeeId || '').trim(),
      phone: (empData.phone || '').trim(),
      shabbatKeeper: empData.shabbatKeeper || false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setData((d) => ({ ...d, employees: [...d.employees, ...newEmps] }));
    return newEmps;
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

  const deleteAllEmployees = useCallback(() => {
    setData((d) => {
      const schedules = Object.fromEntries(
        Object.entries(d.schedules).map(([wk, sched]) => [
          wk,
          Object.fromEntries(
            Object.entries(sched).map(([k, v]) => [k, { ...v, employeeId: null }])
          ),
        ])
      );
      return { ...d, employees: [], schedules };
    });
  }, [setData]);

  // ── STAFFING ───────────────────────────────────────────────────────────
  const saveStaffing = useCallback((staffing) => {
    setData((d) => ({ ...d, staffing }));
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
          if (!parsed.employees || !parsed.schedules)
            throw new Error('Invalid format');
          // Ensure staffing exists
          if (!parsed.staffing) parsed.staffing = { ...DEFAULT_STAFFING };
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
    addEmployeesBatch,
    updateEmployee,
    deleteEmployee,
    deleteAllEmployees,
    saveStaffing,
    setSchedule,
    assignCell,
    exportJSON,
    importJSON,
  };
}
