import { useState, useCallback } from 'react';
import { uid } from '../utils/helpers.js';
import {
  Button, Input, Field, Card, PageHeader, EmptyState,
} from '../components/UI.jsx';

function ShiftCard({ shift, errors, onChange, onRemove }) {
  const count = Math.min(Math.max(parseInt(shift.positionCount) || 0, 0), 20);

  const updatePos = (idx, val) => {
    const cp = [...(shift.customPositions || [])];
    cp[idx] = val;
    onChange(shift.id, 'customPositions', cp);
  };

  return (
    <Card style={{ padding: 24, animation: 'fadeUp 0.25s ease both' }}>
      {/* Card header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--ink-1)',
          }}>
            {shift.shiftName || 'Untitled Shift'}
          </span>
          {shift.startTime && shift.endTime && (
            <span style={{
              marginLeft: 10,
              fontSize: 11,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)',
            }}>
              {shift.startTime} – {shift.endTime}
            </span>
          )}
        </div>
        <Button size="sm" variant="danger" onClick={() => onRemove(shift.id)}>
          Remove
        </Button>
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Field label="Shift Name" error={errors[`${shift.id}_name`]}>
          <Input
            value={shift.shiftName}
            onChange={(e) => onChange(shift.id, 'shiftName', e.target.value)}
            placeholder="e.g. Morning"
          />
        </Field>
        <Field label="Start Time" error={errors[`${shift.id}_time`]}>
          <Input
            type="time"
            value={shift.startTime}
            onChange={(e) => onChange(shift.id, 'startTime', e.target.value)}
          />
        </Field>
        <Field label="End Time">
          <Input
            type="time"
            value={shift.endTime}
            onChange={(e) => onChange(shift.id, 'endTime', e.target.value)}
          />
        </Field>
        <Field label="Positions" error={errors[`${shift.id}_positions`]}>
          <Input
            type="number"
            min="1"
            max="20"
            value={shift.positionCount}
            onChange={(e) => onChange(shift.id, 'positionCount', e.target.value)}
          />
        </Field>
      </div>

      {/* Custom position labels */}
      {count > 0 && (
        <div>
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--ink-3)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Position Labels — <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              leave blank to auto-generate (Stand 1, Stand 2…)
            </span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: count }, (_, i) => (
              <Input
                key={i}
                value={shift.customPositions?.[i] || ''}
                onChange={(e) => updatePos(i, e.target.value)}
                placeholder={`Stand ${i + 1}`}
                style={{ width: 140 }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function SettingsPage({ data, saveShifts, toast }) {
  const [shifts, setShifts] = useState(() =>
    data.shifts.map((s) => ({ ...s, customPositions: s.customPositions || [] }))
  );
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState('');

  const addShift = () => {
    setShifts((p) => [
      ...p,
      {
        id: uid(),
        shiftName: '',
        startTime: '08:00',
        endTime: '16:00',
        positionCount: 1,
        customPositions: [],
      },
    ]);
  };

  const removeShift = (id) => setShifts((p) => p.filter((s) => s.id !== id));

  const onChange = useCallback((id, key, val) => {
    setShifts((p) => p.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
    setErrors((e) => {
      const n = { ...e };
      delete n[`${id}_${key.startsWith('start') || key.startsWith('end') ? 'time' : key === 'shiftName' ? 'name' : key}`];
      return n;
    });
    setGlobalErr('');
  }, []);

  const validate = () => {
    const errs = {};
    shifts.forEach((s) => {
      if (!s.shiftName.trim()) errs[`${s.id}_name`] = 'Shift name is required.';
      if (s.startTime >= s.endTime) errs[`${s.id}_time`] = 'End time must be after start time.';
      const cnt = parseInt(s.positionCount);
      if (isNaN(cnt) || cnt < 1) errs[`${s.id}_positions`] = 'At least 1 position required.';
    });
    return errs;
  };

  const handleSave = () => {
    setGlobalErr('');
    if (shifts.length === 0) { setGlobalErr('Add at least one shift type.'); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setGlobalErr('Fix the errors below before saving.'); return; }
    const cleaned = shifts.map((s) => ({ ...s, positionCount: parseInt(s.positionCount) }));
    saveShifts(cleaned);
    toast('Settings saved!');
  };

  const isDirty = JSON.stringify(shifts) !== JSON.stringify(data.shifts);

  return (
    <div className="fade-up">
      <PageHeader
        title="Settings"
        subtitle="Configure shift types, hours, and position structure"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={addShift}>+ Add Shift</Button>
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

      {globalErr && (
        <div style={{
          background: 'var(--red-bg)',
          border: '1.5px solid #F5C6C6',
          borderRadius: 8,
          padding: '12px 16px',
          color: 'var(--red)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          ⚠ {globalErr}
        </div>
      )}

      {shifts.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No shifts configured"
          message="Add shift types to define your scheduling structure — morning, afternoon, night, etc."
          action={<Button variant="accent" onClick={addShift}>+ Add Shift</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              errors={errors}
              onChange={onChange}
              onRemove={removeShift}
            />
          ))}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="secondary" onClick={addShift}>+ Add Another Shift</Button>
            <Button variant="accent" onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}
