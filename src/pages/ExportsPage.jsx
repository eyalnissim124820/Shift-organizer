import { useState } from 'react';
import {
  currentWeekISO, addWeeks, formatWeekLabel, FIXED_SHIFTS, DAYS,
  buildCSV, downloadBlob, exportSchedulePNG,
} from '../utils/helpers.js';
import { Button, Card, PageHeader, Badge } from '../components/UI.jsx';

function WeekPicker({ week, onChange, schedules }) {
  const savedWeeks = Object.keys(schedules).sort().reverse();

  return (
    <Card style={{ padding: 24, marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--ink-3)',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Select Week
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => onChange(addWeeks(week, -1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18 }}
        >←</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', minWidth: 180 }}>
          Week of {formatWeekLabel(week)}
        </span>
        <button
          onClick={() => onChange(addWeeks(week, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18 }}
        >→</button>
        {schedules[week]
          ? <Badge color="green">✓ Schedule exists</Badge>
          : <Badge color="muted">No schedule</Badge>
        }
      </div>

      {savedWeeks.length > 0 && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Saved weeks
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {savedWeeks.map((wk) => (
              <button
                key={wk}
                onClick={() => onChange(wk)}
                style={{
                  background: wk === week ? 'var(--ink-1)' : 'var(--bg-2)',
                  color: wk === week ? '#fff' : 'var(--ink-2)',
                  border: `1.5px solid ${wk === week ? 'var(--ink-1)' : 'var(--border)'}`,
                  borderRadius: 7, padding: '6px 14px',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {formatWeekLabel(wk)}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default function ExportsPage({ data, toast }) {
  const [week, setWeek] = useState(currentWeekISO);
  const [loading, setLoading] = useState(null);

  const schedule = data.schedules[week];
  const staffing = data.staffing;
  const disabled = !schedule;

  const handleCSV = () => {
    try {
      setLoading('csv');
      const csv = buildCSV(week, staffing, schedule, data.employees);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `schedule_${week}.csv`);
      toast('CSV exported!');
    } catch {
      toast('Unable to export schedule. Please try again.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handlePNG = () => {
    try {
      setLoading('png');
      const canvas = exportSchedulePNG(week, staffing, schedule, data.employees);
      canvas.toBlob((blob) => {
        downloadBlob(blob, `schedule_${week}.png`);
        toast('Image exported!');
        setLoading(null);
      }, 'image/png');
    } catch {
      toast('Unable to export schedule. Please try again.', 'error');
      setLoading(null);
    }
  };

  return (
    <div className="fade-up">
      <PageHeader
        title="Exports"
        subtitle="Download schedules as CSV or PNG image"
      />

      <WeekPicker week={week} onChange={setWeek} schedules={data.schedules} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* CSV */}
        <Card style={{ padding: 28 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--green-bg)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16,
          }}>
            📊
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
            color: 'var(--ink-1)', marginBottom: 8, letterSpacing: '-0.01em',
          }}>
            CSV Export
          </h3>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 20 }}>
            Downloads a structured <code style={{ background: 'var(--bg-2)', padding: '1px 5px', borderRadius: 4 }}>.csv</code> file
            containing all assignments for the selected week.
          </p>
          <Button variant="accent" onClick={handleCSV} disabled={disabled || loading === 'csv'}>
            {loading === 'csv' ? '\u2026Exporting' : '\u2193 Export CSV'}
          </Button>
          {disabled && (
            <p style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-4)' }}>
              Generate a schedule for this week first.
            </p>
          )}
        </Card>

        {/* PNG */}
        <Card style={{ padding: 28 }}>
          <div style={{
            width: 48, height: 48, background: 'var(--accent-bg)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16,
          }}>
            🖼️
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
            color: 'var(--ink-1)', marginBottom: 8, letterSpacing: '-0.01em',
          }}>
            Image Export
          </h3>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 20 }}>
            Downloads a <code style={{ background: 'var(--bg-2)', padding: '1px 5px', borderRadius: 4 }}>.png</code> snapshot
            of the full schedule grid, styled and ready to share.
          </p>
          <Button variant="secondary" onClick={handlePNG} disabled={disabled || loading === 'png'}>
            {loading === 'png' ? '\u2026Generating' : '\u2193 Export PNG'}
          </Button>
          {disabled && (
            <p style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-4)' }}>
              Generate a schedule for this week first.
            </p>
          )}
        </Card>
      </div>

      <Card style={{ padding: 20, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--ink-2)' }}>CSV columns:</strong> Week Start Date · Day · Shift Name · Shift Hours · Position · Employee Name · Employee ID · Assignment Status
          <br />
          <strong style={{ color: 'var(--ink-2)' }}>PNG:</strong> Full schedule grid with shift headers, position labels, and employee names.
          <br />
          <strong style={{ color: 'var(--ink-2)' }}>Backup:</strong> Use the sidebar buttons to download or restore the full application data as a JSON file.
        </p>
      </Card>
    </div>
  );
}
