import { useState, useCallback } from 'react';
import { DAYS, currentWeekISO, addWeeks, formatWeekLabel, buildEmptySchedule, cellKey } from '../utils/helpers.js';
import { Button, PageHeader, EmptyState, Confirm } from '../components/UI.jsx';
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
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-3)',
          fontSize: 16,
          padding: '0 4px',
          lineHeight: 1,
        }}
      >
        ←
      </button>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ink-1)',
        minWidth: 160,
        textAlign: 'center',
      }}>
        Week of {formatWeekLabel(week)}
      </span>
      <button
        onClick={() => onChange(addWeeks(week, 1))}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-3)',
          fontSize: 16,
          padding: '0 4px',
          lineHeight: 1,
        }}
      >
        →
      </button>
      <button
        onClick={() => onChange(currentWeekISO())}
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--ink-3)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}
      >
        TODAY
      </button>
    </div>
  );
}

/* ─── SCHEDULE GRID ───────────────────────────────────────────────────────── */
function ScheduleGrid({ shifts, schedule, employees, onAssign }) {
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
              padding: '14px 20px',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              minWidth: 180,
              position: 'sticky',
              left: 0,
              background: 'var(--ink-1)',
              zIndex: 3,
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}>
              Shift / Position
            </th>
            {DAYS.map((day) => (
              <th key={day} style={{
                padding: '14px 8px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                minWidth: 108,
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
          {shifts.map((shift, si) => {
            const count = Number(shift.positionCount) || 1;
            return Array.from({ length: count }, (_, pi) => {
              const posLabel = shift.customPositions?.[pi]?.trim() || `Stand ${pi + 1}`;
              const isFirstPos = pi === 0;
              const isLastShift = si === shifts.length - 1;
              const isLastPos = pi === count - 1;

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
                    padding: '10px 20px',
                    position: 'sticky',
                    left: 0,
                    background: isFirstPos ? 'var(--surface-2)' : 'var(--surface)',
                    zIndex: 1,
                    borderRight: '1.5px solid var(--border)',
                    verticalAlign: 'middle',
                  }}>
                    {isFirstPos && (
                      <div style={{ marginBottom: 2 }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}>
                          {shift.shiftName}
                        </span>
                        <span style={{
                          marginLeft: 8,
                          fontSize: 10,
                          color: 'var(--ink-3)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {shift.startTime}–{shift.endTime}
                        </span>
                      </div>
                    )}
                    <div style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {posLabel}
                    </div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map((day) => {
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
                          padding: '6px 6px',
                          textAlign: 'center',
                          position: 'relative',
                          verticalAlign: 'middle',
                        }}
                      >
                        <button
                          onClick={() => handleOpen(key)}
                          style={{
                            width: '100%',
                            background: emp
                              ? 'var(--accent-bg)'
                              : 'transparent',
                            border: `1.5px solid ${isOpen
                              ? 'var(--accent)'
                              : emp
                                ? 'var(--accent-border)'
                                : 'var(--border)'}`,
                            borderRadius: 7,
                            padding: '7px 6px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: emp ? 700 : 400,
                            color: emp ? 'var(--accent)' : 'var(--ink-4)',
                            transition: 'all 0.12s',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 96,
                          }}
                          onMouseEnter={(e) => {
                            if (!isOpen) e.currentTarget.style.borderColor = 'var(--accent)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isOpen) e.currentTarget.style.borderColor = emp ? 'var(--accent-border)' : 'var(--border)';
                          }}
                        >
                          {emp ? emp.name : '—'}
                        </button>

                        {isOpen && (
                          <CellSelector
                            cellKey={key}
                            currentEmployeeId={cell?.employeeId ?? null}
                            activeEmployees={activeEmployees}
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
  const hasShifts = data.shifts.length > 0;

  const generate = useCallback((force = false) => {
    if (!hasShifts) { toast('Configure shifts in Settings first.', 'error'); return; }
    if (!force && schedule && Object.keys(schedule).length > 0) {
      setConfirmRegen(true);
      return;
    }
    setSchedule(week, buildEmptySchedule(data.shifts));
    toast('Schedule generated!');
  }, [hasShifts, schedule, week, data.shifts, setSchedule, toast]);

  const handleAssign = useCallback((key, empId) => {
    assignCell(week, key, empId);
  }, [week, assignCell]);

  const handleSave = () => {
    saveData(data);
    toast('Schedule saved.');
  };

  if (!hasShifts) {
    return (
      <div className="fade-up">
        <PageHeader title="Schedule" subtitle="Weekly assignment grid" />
        <EmptyState
          icon="⬛"
          title="No shift settings found"
          message="Go to Settings and configure your shift types before generating a schedule."
        />
      </div>
    );
  }

  return (
    <div className="fade-up">
      <PageHeader
        title="Schedule"
        subtitle={`${Object.values(data.schedules[week] || {}).filter((c) => c.employeeId).length} assigned · ${Object.keys(data.schedules[week] || {}).length} total cells`}
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <WeekNav week={week} onChange={setWeek} />
            {schedule ? (
              <Button variant="secondary" onClick={() => generate(false)}>↺ Regenerate</Button>
            ) : (
              <Button variant="accent" onClick={() => generate(false)}>Generate</Button>
            )}
            {schedule && (
              <Button variant="primary" onClick={handleSave}>💾 Save</Button>
            )}
          </div>
        }
      />

      {confirmRegen && (
        <Confirm
          danger
          message="This week already has a schedule. Regenerating will replace ALL current assignments with an empty template. Are you sure?"
          onConfirm={() => { setConfirmRegen(false); generate(true); }}
          onCancel={() => setConfirmRegen(false)}
        />
      )}

      {!schedule ? (
        <EmptyState
          icon="📅"
          title="No schedule for this week"
          message="Click Generate to create the weekly assignment grid based on your current shift settings."
          action={
            <Button variant="accent" onClick={() => generate(false)}>Generate Schedule</Button>
          }
        />
      ) : (
        <ScheduleGrid
          shifts={data.shifts}
          schedule={schedule}
          employees={data.employees}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
