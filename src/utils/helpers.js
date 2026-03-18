// ─── ID GENERATION ────────────────────────────────────────────────────────
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── DAYS (Sunday-first week) ─────────────────────────────────────────────
export const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// ─── FIXED SHIFTS ─────────────────────────────────────────────────────────
export const FIXED_SHIFTS = [
  { id: 'morning', shiftName: 'Morning', startTime: '07:00', endTime: '15:00' },
  { id: 'noon',    shiftName: 'Noon',    startTime: '15:00', endTime: '23:00' },
  { id: 'night',   shiftName: 'Night',   startTime: '23:00', endTime: '07:00' },
];

// Shift order for chronological checks
const SHIFT_ORDER = { morning: 0, noon: 1, night: 2 };

// ─── DEFAULT STAFFING REQUIREMENTS ───────────────────────────────────────
export const DEFAULT_STAFFING = {
  Sunday:    { morning: 21, noon: 14, night: 11 },
  Monday:    { morning: 21, noon: 14, night: 11 },
  Tuesday:   { morning: 21, noon: 14, night: 11 },
  Wednesday: { morning: 21, noon: 14, night: 11 },
  Thursday:  { morning: 21, noon: 14, night: 11 },
  Friday:    { morning: 10, noon: 10, night: 10 },
  Saturday:  { morning: 10, noon: 10, night: 10 },
};

// ─── SHABBAT RESTRICTED SHIFTS ───────────────────────────────────────────
// Shabbat keepers cannot be assigned to these day+shift combos
export const SHABBAT_RESTRICTED = [
  { day: 'Friday',   shift: 'noon' },
  { day: 'Friday',   shift: 'night' },
  { day: 'Saturday', shift: 'morning' },
  { day: 'Saturday', shift: 'noon' },
];

export function isShabbatRestricted(day, shiftId) {
  return SHABBAT_RESTRICTED.some((r) => r.day === day && r.shift === shiftId);
}

// ─── WEEK HELPERS ─────────────────────────────────────────────────────────
export function getSunday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addWeeks(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n * 7);
  return toISO(getSunday(d));
}

export function toISO(date) {
  return date.toISOString().split('T')[0];
}

export function formatWeekLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function currentWeekISO() {
  return toISO(getSunday(new Date()));
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────
export function cellKey(shiftId, posIndex, day) {
  return `${shiftId}__${posIndex}__${day}`;
}

export function buildEmptySchedule(staffing) {
  const schedule = {};
  FIXED_SHIFTS.forEach((shift) => {
    DAYS.forEach((day) => {
      const count = staffing?.[day]?.[shift.id] ?? 0;
      for (let p = 0; p < count; p++) {
        const key = cellKey(shift.id, p, day);
        schedule[key] = { employeeId: null, positionLabel: `Stand ${p + 1}` };
      }
    });
  });
  return schedule;
}

// ─── AUTO-ALLOCATION ─────────────────────────────────────────────────────
/**
 * Generates a schedule with employees auto-allocated.
 * Rules:
 * - Random assignment among equally loaded employees
 * - 16h minimum rest between shifts; only noon→morning(next day) exception allowed
 * - No two shifts on the same day
 * - Shabbat keepers can't work restricted shifts
 * - Min 2 days off per week; 3 if 2+ weekend shifts (Friday/Saturday)
 * - Respects employee preferences; falls back to forced random if needed
 */
export function autoAllocateSchedule(staffing, employees, weekPreferences = {}) {
  const schedule = buildEmptySchedule(staffing);
  const activeEmployees = employees.filter((e) => e.status === 'active');

  if (activeEmployees.length === 0) return schedule;

  // Track assignments per employee: { empId: Set of "dayIndex__shiftId" }
  const empAssignments = {};
  const empShiftCount = {};
  const empDaysWorked = {};
  activeEmployees.forEach((e) => {
    empAssignments[e.id] = new Set();
    empShiftCount[e.id] = 0;
    empDaysWorked[e.id] = new Set();
  });

  // Process each day+shift in chronological order
  DAYS.forEach((day, dayIndex) => {
    FIXED_SHIFTS.forEach((shift) => {
      const count = staffing?.[day]?.[shift.id] ?? 0;
      const shabbatRestricted = isShabbatRestricted(day, shift.id);

      for (let p = 0; p < count; p++) {
        const key = cellKey(shift.id, p, day);

        // Find eligible employees
        const eligible = activeEmployees.filter((emp) => {
          if (shabbatRestricted && emp.shabbatKeeper) return false;
          const dayShiftKey = `${dayIndex}__${shift.id}`;
          if (empAssignments[emp.id].has(dayShiftKey)) return false;
          if (!canAssignWithRestRules(empAssignments[emp.id], dayIndex, shift.id)) return false;
          if (wouldViolateDaysOff(empDaysWorked[emp.id], dayIndex, empAssignments[emp.id])) return false;
          return true;
        });

        if (eligible.length === 0) continue;

        // Split by preferences: prefer employees who haven't requested this slot off
        const prefKey = `${day}__${shift.id}`;
        const preferred = eligible.filter((emp) => {
          const prefs = weekPreferences[emp.id];
          return !prefs || !prefs.includes(prefKey);
        });
        const nonPreferred = eligible.filter((emp) => {
          const prefs = weekPreferences[emp.id];
          return prefs && prefs.includes(prefKey);
        });

        // Use preferred pool first, fallback to forced random from non-preferred
        let pool = preferred.length > 0 ? preferred : nonPreferred;

        // Shuffle then sort by fewest shifts (random among equal counts)
        pool = shuffle(pool).sort((a, b) => empShiftCount[a.id] - empShiftCount[b.id]);

        const chosen = pool[0];
        schedule[key] = { employeeId: chosen.id, positionLabel: `Stand ${p + 1}` };
        empAssignments[chosen.id].add(`${dayIndex}__${shift.id}`);
        empShiftCount[chosen.id]++;
        empDaysWorked[chosen.id].add(dayIndex);
      }
    });
  });

  return schedule;
}

/**
 * 16h minimum rest rule. No two shifts on the same day.
 * Cross-day blocks: night → morning(next), night → noon(next).
 * Exception: noon → morning(next day) is allowed (8h rest permitted).
 */
function canAssignWithRestRules(assignments, dayIndex, shiftId) {
  // No two shifts on the same day
  for (const s of FIXED_SHIFTS) {
    if (s.id !== shiftId && assignments.has(`${dayIndex}__${s.id}`)) {
      return false;
    }
  }

  // Cross-day: after night (ends 07:00), next day morning (0h) and noon (8h) are blocked
  if (dayIndex > 0) {
    if ((shiftId === 'morning' || shiftId === 'noon') && assignments.has(`${dayIndex - 1}__night`)) {
      return false;
    }
  }

  // Cross-day: if assigning night, next day morning and noon are blocked
  if (dayIndex < 6 && shiftId === 'night') {
    if (assignments.has(`${dayIndex + 1}__morning`)) return false;
    if (assignments.has(`${dayIndex + 1}__noon`)) return false;
  }

  // noon → morning(next day) is the allowed exception — not blocked
  return true;
}

/**
 * Check if assigning this day would violate days-off constraints:
 * - Min 2 days off per week
 * - Min 3 days off if 2+ weekend shifts (Friday/Saturday)
 */
function wouldViolateDaysOff(daysWorked, dayIndex, assignments) {
  if (daysWorked.has(dayIndex)) return false; // already working this day

  const projectedDaysOff = 7 - (daysWorked.size + 1);

  // Count weekend shifts including the projected one
  let weekendShifts = 0;
  for (const key of assignments) {
    const di = parseInt(key.split('__')[0]);
    if (di === 5 || di === 6) weekendShifts++;
  }
  if (dayIndex === 5 || dayIndex === 6) weekendShifts++;

  const minDaysOff = weekendShifts >= 2 ? 3 : 2;
  return projectedDaysOff < minDaysOff;
}

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── DAYS OFF STATS ──────────────────────────────────────────────────────
export function computeEmployeeDaysOff(schedule, employees) {
  if (!schedule) return {};

  // Build: empId -> Set of day names where they work
  const empDays = {};
  for (const [key, cell] of Object.entries(schedule)) {
    if (!cell?.employeeId) continue;
    const [, , day] = key.split('__');
    if (!empDays[cell.employeeId]) empDays[cell.employeeId] = new Set();
    empDays[cell.employeeId].add(day);
  }

  const result = {};
  for (const emp of employees) {
    const daysWorked = empDays[emp.id] || new Set();
    const daysOff = 7 - daysWorked.size;
    const weekendShifts = (daysWorked.has('Friday') ? 1 : 0) + (daysWorked.has('Saturday') ? 1 : 0);
    result[emp.id] = { daysOff, daysWorked: daysWorked.size, weekendShifts };
  }
  return result;
}

// ─── EMPLOYEE DISPLAY NAME ───────────────────────────────────────────────
export function employeeDisplayName(emp) {
  return `${emp.firstName} ${emp.lastName}`.trim();
}

// ─── CSV EXPORT ──────────────────────────────────────────────────────────
const HEBREW_DAYS = {
  Sunday: "\u05D9\u05D5\u05DD \u05D0'",
  Monday: "\u05D9\u05D5\u05DD \u05D1'",
  Tuesday: "\u05D9\u05D5\u05DD \u05D2'",
  Wednesday: "\u05D9\u05D5\u05DD \u05D3'",
  Thursday: "\u05D9\u05D5\u05DD \u05D4'",
  Friday: "\u05D9\u05D5\u05DD \u05D5'",
  Saturday: "\u05D9\u05D5\u05DD \u05E9\u05D1\u05EA",
};

const HEBREW_SHIFTS = {
  morning: '\u05D1\u05D5\u05E7\u05E8',
  noon: '\u05E6\u05D4\u05E8\u05D9\u05D9\u05DD',
  night: '\u05DC\u05D9\u05DC\u05D4',
};

const HEBREW_OFF = '\u05D7\u05D5\u05E4\u05E9';

export function buildCSV(weekStart, staffing, schedule, employees) {
  const startDate = new Date(weekStart + 'T00:00:00');

  // Build day headers with dates: "יום א' - DD.M"
  const dayHeaders = DAYS.map((day, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getDate()}.${d.getMonth() + 1}`;
    return `${HEBREW_DAYS[day]} - ${dateStr}`;
  });

  const header = [
    '\u05DE\u05E1\u05E4\u05E8 \u05D0\u05D9\u05E9\u05D9',
    '\u05E9\u05DD \u05E4\u05E8\u05D8\u05D9',
    '\u05E9\u05DD \u05DE\u05E9\u05E4\u05D7\u05D4',
    '\u05D8\u05DC\u05E4\u05D5\u05DF',
    ...dayHeaders,
  ];

  // Build a lookup: empInternalId -> { day -> [shiftIds] }
  const empShifts = {};
  if (schedule) {
    for (const [key, cell] of Object.entries(schedule)) {
      if (!cell?.employeeId) continue;
      const [shiftId, , day] = key.split('__');
      if (!empShifts[cell.employeeId]) empShifts[cell.employeeId] = {};
      if (!empShifts[cell.employeeId][day]) empShifts[cell.employeeId][day] = new Set();
      empShifts[cell.employeeId][day].add(shiftId);
    }
  }

  const rows = [header];
  for (const emp of employees) {
    const shifts = empShifts[emp.id] || {};
    const dayCols = DAYS.map((day) => {
      const dayShifts = shifts[day];
      if (!dayShifts || dayShifts.size === 0) return HEBREW_OFF;
      return [...dayShifts].map((s) => HEBREW_SHIFTS[s] || s).join(' + ');
    });
    rows.push([emp.employeeId, emp.firstName, emp.lastName, emp.phone || '', ...dayCols]);
  }

  // BOM for Excel Hebrew support + CSV content
  return '\uFEFF' + rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CSV EMPLOYEE IMPORT ─────────────────────────────────────────────────
export function parseEmployeeCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('first') || header.includes('last') || header.includes('phone') || header.includes('id');
  const start = hasHeader ? 1 : 0;

  const results = [];
  for (let i = start; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    const emp = {
      firstName: (cols[0] || '').trim(),
      lastName: (cols[1] || '').trim(),
      employeeId: (cols[2] || '').trim(),
      phone: (cols[3] || '').trim(),
      shabbatKeeper: (cols[4] || '').trim().toLowerCase() === 'true' || (cols[4] || '').trim() === '1',
    };

    if (emp.firstName || emp.lastName) {
      results.push(emp);
    }
  }
  return results;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ─── PNG EXPORT ───────────────────────────────────────────────────────────
export function exportSchedulePNG(weekStart, staffing, schedule, employees) {
  const LABEL_W  = 210;
  const COL_W    = 118;
  const ROW_H    = 44;
  const HEADER_H = 56;
  const SHIFT_H  = 38;
  const TITLE_H  = 52;
  const PAD      = 24;

  const totalPositions = FIXED_SHIFTS.reduce((a, shift) =>
    a + DAYS.reduce((b, day) => b + (staffing?.[day]?.[shift.id] ?? 0), 0), 0
  );
  const W = LABEL_W + COL_W * 7 + PAD * 2;
  const H = TITLE_H + HEADER_H + FIXED_SHIFTS.length * SHIFT_H + totalPositions * ROW_H + PAD * 2;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#F5F3EE';
  ctx.fillRect(0, 0, W, H);

  // Title bar
  ctx.fillStyle = '#1A1714';
  ctx.fillRect(0, 0, W, TITLE_H);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Syne, sans-serif';
  ctx.fillText('SHIFT SCHEDULE', PAD, 22);
  ctx.font = '500 13px JetBrains Mono, monospace';
  ctx.fillStyle = '#B8B0A0';
  ctx.fillText(`Week of ${formatWeekLabel(weekStart)}`, PAD, 40);

  // Day headers
  const headerY = TITLE_H;
  ctx.fillStyle = '#EDEAE3';
  ctx.fillRect(0, headerY, W, HEADER_H);
  ctx.strokeStyle = '#D8D3C8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, headerY + HEADER_H);
  ctx.lineTo(W, headerY + HEADER_H);
  ctx.stroke();

  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillStyle = '#8C857A';
  DAYS.forEach((day, i) => {
    const x = PAD + LABEL_W + i * COL_W + COL_W / 2;
    ctx.textAlign = 'center';
    ctx.fillText(day.slice(0, 3).toUpperCase(), x, headerY + 22);
    ctx.font = '400 10px JetBrains Mono, monospace';
    ctx.fillText(day.slice(3).toUpperCase(), x, headerY + 36);
    ctx.font = 'bold 11px JetBrains Mono, monospace';
  });
  ctx.textAlign = 'left';

  let y = TITLE_H + HEADER_H;

  FIXED_SHIFTS.forEach((shift, si) => {
    // Shift header
    ctx.fillStyle = si % 2 === 0 ? '#1A1714' : '#2E2A26';
    ctx.fillRect(0, y, W, SHIFT_H);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Syne, sans-serif';
    ctx.fillText(shift.shiftName.toUpperCase(), PAD, y + 15);
    ctx.fillStyle = '#C4622D';
    ctx.font = '500 11px JetBrains Mono, monospace';
    ctx.fillText(`${shift.startTime} - ${shift.endTime}`, PAD, y + 30);
    y += SHIFT_H;

    // We need max positions across all days for this shift
    const maxCount = Math.max(...DAYS.map((day) => staffing?.[day]?.[shift.id] ?? 0));
    for (let pi = 0; pi < maxCount; pi++) {
      const posLabel = `Stand ${pi + 1}`;

      ctx.fillStyle = pi % 2 === 0 ? '#FFFFFF' : '#F9F7F4';
      ctx.fillRect(0, y, W, ROW_H);

      ctx.fillStyle = '#C4622D';
      ctx.fillRect(0, y, 3, ROW_H);

      ctx.fillStyle = '#8C857A';
      ctx.font = '500 11px JetBrains Mono, monospace';
      ctx.fillText(posLabel, PAD + 8, y + ROW_H / 2 + 4);

      ctx.strokeStyle = '#D8D3C8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD + LABEL_W, y);
      ctx.lineTo(PAD + LABEL_W, y + ROW_H);
      ctx.stroke();

      DAYS.forEach((day, di) => {
        const dayCount = staffing?.[day]?.[shift.id] ?? 0;
        const cx = PAD + LABEL_W + di * COL_W;

        if (di > 0) {
          ctx.strokeStyle = '#E8E3D8';
          ctx.beginPath();
          ctx.moveTo(cx, y + 6);
          ctx.lineTo(cx, y + ROW_H - 6);
          ctx.stroke();
        }

        if (pi >= dayCount) {
          // N/A cell
          ctx.fillStyle = '#E8E3D8';
          ctx.font = '400 10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('-', cx + COL_W / 2, y + ROW_H / 2 + 4);
        } else {
          const k = cellKey(shift.id, pi, day);
          const cell = schedule?.[k];
          const emp = cell?.employeeId
            ? employees.find((e) => e.id === cell.employeeId)
            : null;

          if (emp) {
            ctx.fillStyle = '#FDF0EB';
            roundRect(ctx, cx + 6, y + 8, COL_W - 12, ROW_H - 16, 5);
            ctx.fill();
            ctx.strokeStyle = '#F0C4B0';
            ctx.lineWidth = 1;
            roundRect(ctx, cx + 6, y + 8, COL_W - 12, ROW_H - 16, 5);
            ctx.stroke();
            ctx.fillStyle = '#C4622D';
            ctx.font = '600 10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            const name = employeeDisplayName(emp);
            const displayName = name.length > 12 ? name.slice(0, 11) + '...' : name;
            ctx.fillText(displayName, cx + COL_W / 2, y + ROW_H / 2 + 4);
          } else {
            ctx.fillStyle = '#C8C0B4';
            ctx.font = '400 10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('-', cx + COL_W / 2, y + ROW_H / 2 + 4);
          }
        }
        ctx.textAlign = 'left';
      });

      ctx.strokeStyle = '#E8E3D8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + ROW_H);
      ctx.lineTo(W, y + ROW_H);
      ctx.stroke();

      y += ROW_H;
    }
  });

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
