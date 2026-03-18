import { useState, useCallback } from 'react';
import {
  DAYS, FIXED_SHIFTS, currentWeekISO, addWeeks, formatWeekLabel,
  buildEmptySchedule, autoAllocateSchedule, cellKey, employeeDisplayName,
  isShabbatRestricted,
} from '../utils/helpers.js';
import { Button, PageHeader, EmptyState, Confirm, Badge } from '../components/UI.jsx';
import { CellSelector } from '../components/CellSelector.jsx';

/* ─── WEEK NAVIGATOR ──────────────────────────────────────────────────────── */
function WeekNav({ week, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 10,
      padding: '8px 14px',
    }}>
      <button
        onClick={() => onChange(addWeeks(week, -1))}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-3)', fontSize: 16, padding: '0 4px', lineHeight: 1,
        }}
      >
        \u2190
      </button>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
        color: 'var(--ink-1)', minWidth: 160, textAlign: 'center',
      }}>
        Week of {formatWeekLabel(week)}
      </span>
      <button
        onClick={() => onChange(addWeeks(week, 1))}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-3)', fontSize: 16, padding: '0 4px', lineHeight: 1,
        }}
      >
        \u2192
      </button>
      <button
        onClick={() => onChange(currentWeekISO())}
        style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700,
          color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}
      >
        TODAY
      </button>
    </div>
  );
}

/* ─── SCHEDULE GRID ───────────────────────────────────────────────────────── */
function ScheduleGrid({ staffing, schedule, employees, onAssign }) {
  const [openCell, setOpenCell] = useState(null);
  const activeEmployees = employees.filter((e) => e.status === 'active');

  const handleOpen = (key) => setOpenCell(key === openCell ? null : key);
  const handleClose = () => setOpenCell(null);

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860, background: 'var(--surface)' }}>
        <thead>
          <tr style={{ background: 'var(--ink-1)' }}>
            <th style={{
              padding: '14px 20px', textAlign: 'left',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em',
              textTransform: 'uppercase', minWidth: 180,
              position: 'sticky', left: 0, background: 'var(--ink-1)',
              zIndex: 3, borderRight: '1px solid rgba(255,255,255,0.08)',
            }}>
              Shift / Stand
            </th>
            {DAYS.map((day) => (
              <th key={day} style={{
                padding: '14px 8px', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em',
                textTransform: 'uppercase', minWidth: 108,
              }}>
                {day.slice(0, 3)}
                <span style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                  {day.slice(3).toUpperCase()}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FIXED_SHIFTS.map((shift, si) => {
            // Max positions for this shift across all days
            const maxCount = Math.max(...DAYS.map((day) => staffing?.[day]?.[shift.id] ?? 0));

            return Array.from({ length: maxCount }, (_, pi) => {
              const posLabel = `Stand ${pi + 1}`;
              const isFirstPos = pi === 0;
              const isLastShift = si === FIXED_SHIFTS.length - 1;
              const isLastPos = pi === maxCount - 1;

              return (
                <tr
                  key={`${shift.id}_${pi}`}
                  style={{
                    borderBottom: (!isLastShift || !isLastPos) ? '1px solid var(--border)' : 'none',
                    borderTop: isFirstPos && si > 0 ? '2px solid var(--border)' : 'none',
                  }}
                >
                  {/* Label cell */}
                  <td style={{
                    padding: '10px 20px', position: 'sticky', left: 0,
                    background: isFirstPos ? 'var(--surface-2)' : 'var(--surface)',
                    zIndex: 1, borderRight: '1.5px solid var(--border)', verticalAlign: 'middle',
                  }}>
                    {isFirstPos && (
                      <div style={{ marginBottom: 2 }}>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 12,
                          fontWeight: 700, color: 'var(--accent)',
                        }}>
                          {shift.shiftName}
                        </span>
                        <span style={{
                          marginLeft: 8, fontSize: 10, color: 'var(--ink-3)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {shift.startTime}-{shift.endTime}
                        </span>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {posLabel}
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const dayCount = staffing?.[day]?.[shift.id] ?? 0;
                    const isNA = pi >= dayCount;

                    if (isNA) {
                      return (
                        <td key={day} style={{
                          padding: '6px 6px', textAlign: 'center',
                          verticalAlign: 'middle', background: 'var(--bg-2)',
                        }}>
                          <span style={{
                            fontSize: 11, color: 'var(--ink-4)',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            -
                          </span>
                        </td>
                      );
                    }

                    const key = cellKey(shift.id, pi, day);
                    const cell = schedule[key];
                    const emp = cell?.employeeId
                      ? employees.find((e) => e.id === cell.employeeId)
                      : null;
                    const isOpen = openCell === key;

                    return (
                      <td
                        key={day}
                        style={{
                          padding: '6px 6px', textAlign: 'center',
                          position: 'relative', verticalAlign: 'middle',
                        }}
                      >
                        <button
                          onClick={() => handleOpen(key)}
                          style={{
                            width: '100%',
                            background: emp ? 'var(--accent-bg)' : 'transparent',
                            border: `1.5px solid ${isOpen ? 'var(--accent)' : emp ? 'var(--accent-border)' : 'var(--border)'}`,
                            borderRadius: 7, padding: '7px 6px', cursor: 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: 11,
                            fontWeight: emp ? 700 : 400,
                            color: emp ? 'var(--accent)' : 'var(--ink-4)',
                            transition: 'all 0.12s', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 96,
                          }}
                          onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                          onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.borderColor = emp ? 'var(--accent-border)' : 'var(--border)'; }}
                        >
                          {emp ? employeeDisplayName(emp) : '\u2014'}
                        </button>

                        {isOpen && (
                          <CellSelector
                            cellKey={key}
                            currentEmployeeId={cell?.employeeId ?? null}
                            activeEmployees={activeEmployees}
                            shiftId={shift.id}
                            day={day}
                            onAssign={(empId) => onAssign(key, empId)}
                            onClose={handleClose}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── SCHEDULE PAGE ───────────────────────────────────────────────────────── */
export default function SchedulePage({ data, setSchedule, assignCell, saveData, toast }) {
  const [week, setWeek] = useState(currentWeekISO);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const schedule = data.schedules[week] || null;
  const staffing = data.staffing;
  const hasStaffing = staffing && Object.keys(staffing).length > 0;

  const totalPositions = hasStaffing
    ? DAYS.reduce((total, day) =>
        total + FIXED_SHIFTS.reduce((sum, shift) => sum + (staffing[day]?.[shift.id] ?? 0), 0), 0)
    : 0;

  const generate = useCallback((force = false) => {
    if (!hasStaffing || totalPositions === 0) {
      toast('Configure staffing requirements in Settings first.', 'error');
      return;
    }
    if (!force && schedule && Object.keys(schedule).length > 0) {
      setConfirmRegen(true);
      return;
    }
    const activeCount = data.employees.filter((e) => e.status === 'active').length;
    let newSchedule;
    if (activeCount > 0) {
      newSchedule = autoAllocateSchedule(staffing, data.employees);
      toast('Schedule generated with auto-allocation!');
    } else {
      newSchedule = buildEmptySchedule(staffing);
      toast('Empty schedule generated. Add employees to enable auto-allocation.');
    }
    setSchedule(week, newSchedule);
  }, [hasStaffing, totalPositions, schedule, week, staffing, data.employees, setSchedule, toast]);

  const handleAssign = useCallback((key, empId) => {
    assignCell(week, key, empId);
  }, [week, assignCell]);

  const handleSave = () => {
    saveData(data);
    toast('Schedule saved.');
  };

  if (!hasStaffing || totalPositions === 0) {
    return (
      <div className="fade-up">
        <PageHeader title="Schedule" subtitle="Weekly assignment grid" />
        <EmptyState
          icon="\u2B1B"
          title="No staffing configured"
          message="Go to Settings and configure your staffing requirements before generating a schedule."
        />
      </div>
    );
  }

  const assignedCount = schedule
    ? Object.values(schedule).filter((c) => c.employeeId).length
    : 0;
  const totalCells = schedule ? Object.keys(schedule).length : 0;

  return (
    <div className="fade-up">
      <PageHeader
        title="Schedule"
        subtitle={`${assignedCount} assigned \u00b7 ${totalCells} total cells`}
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <WeekNav week={week} onChange={setWeek} />
            {schedule ? (
              <Button variant="secondary" onClick={() => generate(false)}>\u21BA Regenerate</Button>
            ) : (
              <Button variant="accent" onClick={() => generate(false)}>Generate</Button>
            )}
            {schedule && (
              <Button variant="primary" onClick={handleSave}>Save</Button>
            )}
          </div>
        }
      />

      {confirmRegen && (
        <Confirm
          danger
          message="This week already has a schedule. Regenerating will replace ALL current assignments. Are you sure?"
          onConfirm={() => { setConfirmRegen(false); generate(true); }}
          onCancel={() => setConfirmRegen(false)}
        />
      )}

      {!schedule ? (
        <EmptyState
          icon="\uD83D\uDCC5"
          title="No schedule for this week"
          message="Click Generate to create the weekly schedule with auto-allocation based on your staffing settings."
          action={
            <Button variant="accent" onClick={() => generate(false)}>Generate Schedule</Button>
          }
        />
      ) : (
        <ScheduleGrid
          staffing={staffing}
          schedule={schedule}
          employees={data.employees}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
