import { NavLink } from 'react-router-dom';
import { useRef } from 'react';
import { Button } from './UI.jsx';

const NAV = [
  { to: '/schedule',  label: 'Schedule',   icon: '⬛' },
  { to: '/employees', label: 'Employees',  icon: '◈' },
  { to: '/settings',  label: 'Settings',   icon: '◎' },
  { to: '/exports',   label: 'Exports',    icon: '↗' },
];

export function Sidebar({ onExport, onImport }) {
  const fileRef = useRef();

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      background: 'var(--ink-1)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.01em',
          lineHeight: 1.25,
        }}>
          SHIFT<br />
          <span style={{ color: 'var(--accent-light)' }}>ORGANIZER</span>
        </div>
        <div style={{
          marginTop: 6,
          fontSize: 9,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Manager Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none',
              marginBottom: 2,
              transition: 'all 0.15s',
              borderLeft: isActive ? '2px solid var(--accent-light)' : '2px solid transparent',
            })}
          >
            <span style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}>
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Data controls */}
      <div style={{
        padding: '16px 12px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <p style={{
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
          marginBottom: 4,
          paddingLeft: 4,
        }}>
          Data
        </p>
        <button
          onClick={onExport}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 7,
            padding: '8px 12px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          ↓ Backup JSON
        </button>
        <button
          onClick={() => fileRef.current.click()}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7,
            padding: '8px 12px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          ↑ Restore JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => { onImport(e); e.target.value = ''; }}
        />
      </div>
    </aside>
  );
}
