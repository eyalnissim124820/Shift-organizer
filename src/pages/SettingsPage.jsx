import { useState } from 'react';
import { DAYS, FIXED_SHIFTS, DEFAULT_STAFFING } from '../utils/helpers.js';
import {
  Button, Input, Field, Card, PageHeader,
} from '../components/UI.jsx';

export default function SettingsPage({ data, saveStaffing, toast }) {
  const [staffing, setStaffing] = useState(() => ({
    ...DEFAULT_STAFFING,
    ...data.staffing,
  }));

  const handleChange = (day, shiftId, value) => {
    const num = parseInt(value) || 0;
    setStaffing((prev) => ({
      ...prev,
      [day]: { ...prev[day], [shiftId]: Math.max(0, Math.min(99, num)) },
    }));
  };

  const handleSave = () => {
    saveStaffing(staffing);
    toast('Staffing settings saved!');
  };

  const handleReset = () => {
    setStaffing({ ...DEFAULT_STAFFING });
  };

  const isDirty = JSON.stringify(staffing) !== JSON.stringify(data.staffing);

  return (
    <div className="fade-up">
      <PageHeader
        title="Settings"
        subtitle="Configure required staff per shift and day"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={handleReset}>Reset Defaults</Button>
            <Button
              variant="accent"
              onClick={handleSave}
              style={isDirty ? { boxShadow: '0 0 0 3px var(--accent-bg)' } : {}}
            >
              Save Settings
            </Button>
          </div>
        }
      />

      {/* Shift info */}
      <Card style={{ padding: 20, marginBottom: 24 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Fixed Shift Types
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {FIXED_SHIFTS.map((shift) => (
            <div
              key={shift.id}
              style={{
                background: 'var(--bg-2)',
                borderRadius: 8,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                {shift.shiftName}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
              }}>
                {shift.startTime} - {shift.endTime}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Staffing requirements table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
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
                  minWidth: 100,
                }}>
                  Day
                </th>
                {FIXED_SHIFTS.map((shift) => (
                  <th key={shift.id} style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {shift.shiftName}
                    <span style={{
                      display: 'block',
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 2,
                    }}>
                      {shift.startTime}-{shift.endTime}
                    </span>
                  </th>
                ))}
                <th style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Daily Total
                </th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, i) => {
                const dayTotal = FIXED_SHIFTS.reduce(
                  (sum, shift) => sum + (staffing[day]?.[shift.id] ?? 0), 0
                );
                const isWeekend = day === 'Friday' || day === 'Saturday';

                return (
                  <tr
                    key={day}
                    style={{
                      borderBottom: i < DAYS.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isWeekend ? 'var(--surface-2)' : 'var(--surface)',
                    }}
                  >
                    <td style={{
                      padding: '12px 20px',
                      fontFamily: 'var(--font-display)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--ink-1)',
                    }}>
                      {day}
                      {isWeekend && (
                        <span style={{
                          marginLeft: 8,
                          fontSize: 9,
                          color: 'var(--accent)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Weekend
                        </span>
                      )}
                    </td>
                    {FIXED_SHIFTS.map((shift) => (
                      <td key={shift.id} style={{ padding: '8px 16px', textAlign: 'center' }}>
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={staffing[day]?.[shift.id] ?? 0}
                          onChange={(e) => handleChange(day, shift.id, e.target.value)}
                          style={{
                            width: 70,
                            textAlign: 'center',
                            margin: '0 auto',
                          }}
                        />
                      </td>
                    ))}
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}>
                      {dayTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg-2)' }}>
                <td style={{
                  padding: '12px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--ink-2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Weekly Total
                </td>
                {FIXED_SHIFTS.map((shift) => {
                  const shiftTotal = DAYS.reduce(
                    (sum, day) => sum + (staffing[day]?.[shift.id] ?? 0), 0
                  );
                  return (
                    <td key={shift.id} style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink-2)',
                    }}>
                      {shiftTotal}
                    </td>
                  );
                })}
                <td style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'var(--accent)',
                }}>
                  {DAYS.reduce(
                    (total, day) =>
                      total + FIXED_SHIFTS.reduce(
                        (sum, shift) => sum + (staffing[day]?.[shift.id] ?? 0), 0
                      ),
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Save button at bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16 }}>
        <Button
          variant="accent"
          onClick={handleSave}
          style={isDirty ? { boxShadow: '0 0 0 3px var(--accent-bg)' } : {}}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
