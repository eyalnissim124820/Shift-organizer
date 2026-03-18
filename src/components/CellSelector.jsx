import { useState, useEffect, useRef } from 'react';
import { Input, Badge } from './UI.jsx';
import { isShabbatRestricted, employeeDisplayName } from '../utils/helpers.js';

export function CellSelector({ cellKey, currentEmployeeId, activeEmployees, shiftId, day, onAssign, onClose }) {
  const [search, setSearch] = useState('');
  const ref = useRef();
  const inputRef = useRef();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const shabbatRestricted = isShabbatRestricted(day, shiftId);

  const filtered = activeEmployees.filter((e) => {
    const name = employeeDisplayName(e);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Separate eligible and restricted employees
  const eligible = filtered.filter((e) => !(shabbatRestricted && e.shabbatKeeper));
  const restricted = filtered.filter((e) => shabbatRestricted && e.shabbatKeeper);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--surface)',
        border: '1.5px solid var(--accent)',
        borderRadius: 10,
        boxShadow: 'var(--shadow-lg)',
        zIndex: 200,
        width: 240,
        overflow: 'hidden',
        animation: 'scaleIn 0.15s ease both',
      }}
    >
      {/* Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee\u2026"
          style={{ fontSize: 11, padding: '6px 10px' }}
          autoFocus
        />
      </div>

      {/* Options */}
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {/* Unassigned option */}
        <button
          onClick={() => { onAssign(null); onClose(); }}
          style={{
            width: '100%', padding: '9px 14px',
            background: currentEmployeeId === null ? 'var(--bg-2)' : 'transparent',
            border: 'none', textAlign: 'left', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>—</span> Unassigned
        </button>

        {eligible.length === 0 && restricted.length === 0 && (
          <div style={{
            padding: '16px 14px', fontSize: 11, color: 'var(--ink-4)',
            textAlign: 'center', fontFamily: 'var(--font-mono)',
          }}>
            No results
          </div>
        )}

        {eligible.map((emp) => {
          const isSelected = emp.id === currentEmployeeId;
          const name = employeeDisplayName(emp);
          return (
            <button
              key={emp.id}
              onClick={() => { onAssign(emp.id); onClose(); }}
              style={{
                width: '100%', padding: '9px 14px',
                background: isSelected ? 'var(--accent-bg)' : 'transparent',
                border: 'none', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? 'var(--accent)' : 'var(--ink-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-2)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'var(--accent-bg)' : 'transparent'; }}
            >
              <span>
                {name}
                {emp.shabbatKeeper && (
                  <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--amber)', fontWeight: 600 }}>SH</span>
                )}
              </span>
              {isSelected && (
                <span style={{ fontSize: 10, color: 'var(--accent)' }}>✓</span>
              )}
            </button>
          );
        })}

        {/* Show restricted employees as disabled */}
        {restricted.length > 0 && (
          <>
            <div style={{
              padding: '6px 14px', fontSize: 9, color: 'var(--ink-4)',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              background: 'var(--bg-2)', borderTop: '1px solid var(--border)',
            }}>
              Shabbat restricted
            </div>
            {restricted.map((emp) => (
              <div
                key={emp.id}
                style={{
                  width: '100%', padding: '9px 14px',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--ink-4)', opacity: 0.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>{employeeDisplayName(emp)}</span>
                <Badge color="muted" style={{ fontSize: 8 }}>Shabbat</Badge>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
