// ─── ID GENERATION ────────────────────────────────────────────────────────
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── WEEK HELPERS ─────────────────────────────────────────────────────────
export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addWeeks(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n * 7);
  return toISO(getMonday(d));
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
  return toISO(getMonday(new Date()));
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────
export function buildEmptySchedule(shifts) {
  const schedule = {};
  shifts.forEach((shift) => {
    const count = Number(shift.positionCount) || 1;
    for (let p = 0; p < count; p++) {
      const posLabel = shift.customPositions?.[p]?.trim() || `Stand ${p + 1}`;
      DAYS.forEach((day) => {
        const key = `${shift.id}__${p}__${day}`;
        schedule[key] = { employeeId: null, positionLabel: posLabel };
      });
    }
  });
  return schedule;
}

export function cellKey(shiftId, posIndex, day) {
  return `${shiftId}__${posIndex}__${day}`;
}

// ─── CSV ──────────────────────────────────────────────────────────────────
export function buildCSV(weekStart, shifts, schedule, employees) {
  const rows = [
    ['Week Start Date', 'Day', 'Shift Name', 'Shift Hours', 'Position', 'Employee Name', 'Assignment Status'],
  ];
  shifts.forEach((shift) => {
    const count = Number(shift.positionCount) || 1;
    for (let pi = 0; pi < count; pi++) {
      const posLabel = shift.customPositions?.[pi]?.trim() || `Stand ${pi + 1}`;
      DAYS.forEach((day) => {
        const k = cellKey(shift.id, pi, day);
        const cell = schedule?.[k];
        const emp = cell?.employeeId
          ? employees.find((e) => e.id === cell.employeeId)
          : null;
        rows.push([
          weekStart,
          day,
          shift.shiftName,
          `${shift.startTime}–${shift.endTime}`,
          posLabel,
          emp ? emp.name : '',
          emp ? 'Assigned' : 'Unassigned',
        ]);
      });
    }
  });
  return rows
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

// ─── PNG EXPORT ───────────────────────────────────────────────────────────
export function exportSchedulePNG(weekStart, shifts, schedule, employees) {
  const LABEL_W  = 210;
  const COL_W    = 118;
  const ROW_H    = 44;
  const HEADER_H = 56;
  const SHIFT_H  = 38;
  const TITLE_H  = 52;
  const PAD      = 24;

  const totalPositions = shifts.reduce((a, s) => a + (Number(s.positionCount) || 1), 0);
  const W = LABEL_W + COL_W * 7 + PAD * 2;
  const H = TITLE_H + HEADER_H + shifts.length * SHIFT_H + totalPositions * ROW_H + PAD * 2;

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

  shifts.forEach((shift, si) => {
    // Shift header
    ctx.fillStyle = si % 2 === 0 ? '#1A1714' : '#2E2A26';
    ctx.fillRect(0, y, W, SHIFT_H);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Syne, sans-serif';
    ctx.fillText(shift.shiftName.toUpperCase(), PAD, y + 15);
    ctx.fillStyle = '#C4622D';
    ctx.font = '500 11px JetBrains Mono, monospace';
    ctx.fillText(`${shift.startTime} – ${shift.endTime}`, PAD, y + 30);
    y += SHIFT_H;

    const count = Number(shift.positionCount) || 1;
    for (let pi = 0; pi < count; pi++) {
      const posLabel = shift.customPositions?.[pi]?.trim() || `Stand ${pi + 1}`;

      // Row bg
      ctx.fillStyle = pi % 2 === 0 ? '#FFFFFF' : '#F9F7F4';
      ctx.fillRect(0, y, W, ROW_H);

      // Left border accent
      ctx.fillStyle = '#C4622D';
      ctx.fillRect(0, y, 3, ROW_H);

      // Position label
      ctx.fillStyle = '#8C857A';
      ctx.font = '500 11px JetBrains Mono, monospace';
      ctx.fillText(posLabel, PAD + 8, y + ROW_H / 2 + 4);

      // Vertical separator
      ctx.strokeStyle = '#D8D3C8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD + LABEL_W, y);
      ctx.lineTo(PAD + LABEL_W, y + ROW_H);
      ctx.stroke();

      // Cells
      DAYS.forEach((day, di) => {
        const k = cellKey(shift.id, pi, day);
        const cell = schedule?.[k];
        const emp = cell?.employeeId
          ? employees.find((e) => e.id === cell.employeeId)
          : null;
        const cx = PAD + LABEL_W + di * COL_W;

        // Cell vertical separator
        if (di > 0) {
          ctx.strokeStyle = '#E8E3D8';
          ctx.beginPath();
          ctx.moveTo(cx, y + 6);
          ctx.lineTo(cx, y + ROW_H - 6);
          ctx.stroke();
        }

        if (emp) {
          // Assigned chip
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
          const name = emp.name.length > 12 ? emp.name.slice(0, 11) + '…' : emp.name;
          ctx.fillText(name, cx + COL_W / 2, y + ROW_H / 2 + 4);
        } else {
          ctx.fillStyle = '#C8C0B4';
          ctx.font = '400 10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('—', cx + COL_W / 2, y + ROW_H / 2 + 4);
        }
        ctx.textAlign = 'left';
      });

      // Row bottom border
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
