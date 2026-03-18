import { useState, useEffect, useRef } from 'react';
import { Input } from './UI.jsx';

export function CellSelector({ cellKey, currentEmployeeId, activeEmployees, onAssign, onClose }) {
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

  const filtered = activeEmployees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

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
        width: 220,
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
          placeholder="Search employee…"
          style={{ fontSize: 11, padding: '6px 10px' }}
          autoFocus
        />
      </div>

      {/* Options */}
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {/* Unassigned option */}
        <button
          onClick={() => { onAssign(null); onClose(); }}
          style={{
            width: '100%',
            padding: '9px 14px',
            background: currentEmployeeId === null ? 'var(--bg-2)' : 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>—</span> Unassigned
        </button>

        {filtered.length === 0 && (
          <div style={{
            padding: '16px 14px',
            fontSize: 11,
            color: 'var(--ink-4)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
          }}>
            No results
          </div>
        )}

        {filtered.map((emp) => {
          const isSelected = emp.id === currentEmployeeId;
          return (
            <button
              key={emp.id}
              onClick={() => { onAssign(emp.id); onClose(); }}
              style={{
                width: '100%',
                padding: '9px 14px',
                background: isSelected ? 'var(--accent-bg)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? 'var(--accent)' : 'var(--ink-1)',
                display: 'block',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-2)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              {emp.name}
              {isSelected && (
                <span style={{
                  float: 'right',
                  fontSize: 10,
                  color: 'var(--accent)',
                }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
