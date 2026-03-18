import { useEffect, useRef } from 'react';

/* ─── BUTTON ─────────────────────────────────────────────────────────────── */
const BTN_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
};

const BTN_VARIANTS = {
  primary: {
    background: 'var(--ink-1)',
    color: '#fff',
    ':hover': { background: 'var(--ink-2)' },
  },
  accent: {
    background: 'var(--accent)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--ink-2)',
    border: '1.5px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--ink-3)',
    border: '1.5px solid var(--border)',
  },
  danger: {
    background: 'var(--red-bg)',
    color: 'var(--red)',
    border: '1.5px solid #F5C6C6',
  },
  'danger-solid': {
    background: 'var(--red)',
    color: '#fff',
  },
};

const BTN_SIZES = {
  sm: { fontSize: 11, padding: '5px 12px', letterSpacing: '0.03em' },
  md: { fontSize: 12, padding: '8px 16px', letterSpacing: '0.03em' },
  lg: { fontSize: 13, padding: '10px 20px', letterSpacing: '0.02em' },
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style: sx,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...BTN_BASE,
        ...BTN_VARIANTS[variant],
        ...BTN_SIZES[size],
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ─── INPUT ──────────────────────────────────────────────────────────────── */
export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  autoFocus,
  onKeyDown,
  min,
  max,
  style: sx,
}) {
  const ref = useRef();
  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 50);
  }, [autoFocus]);

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      min={min}
      max={max}
      style={{
        width: '100%',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-1)',
        background: 'var(--surface)',
        border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '8px 12px',
        outline: 'none',
        transition: 'border-color 0.15s',
        ...sx,
      }}
      onFocus={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'; }}
      onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; }}
    />
  );
}

/* ─── FIELD ──────────────────────────────────────────────────────────────── */
export function Field({ label, error, children, style: sx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...sx }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--ink-3)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <span style={{
          fontSize: 11,
          color: 'var(--red)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

/* ─── BADGE ──────────────────────────────────────────────────────────────── */
const BADGE_COLORS = {
  green:  { bg: 'var(--green-bg)',  color: 'var(--green)' },
  red:    { bg: 'var(--red-bg)',    color: 'var(--red)' },
  amber:  { bg: 'var(--amber-bg)', color: 'var(--amber)' },
  accent: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  muted:  { bg: 'var(--bg-2)',      color: 'var(--ink-3)' },
};

export function Badge({ children, color = 'muted', style: sx }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.muted;
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg,
      color: c.color,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '3px 9px',
      borderRadius: 20,
      ...sx,
    }}>
      {children}
    </span>
  );
}

/* ─── CARD ───────────────────────────────────────────────────────────────── */
export function Card({ children, style: sx, className }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 28,
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 800,
          color: 'var(--ink-1)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            marginTop: 4,
            fontSize: 12,
            color: 'var(--ink-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '72px 24px',
      background: 'var(--surface)',
      border: '2px dashed var(--border)',
      borderRadius: 'var(--radius-lg)',
      gap: 12,
    }}>
      <span style={{ fontSize: 44, lineHeight: 1 }}>{icon}</span>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--ink-1)',
        letterSpacing: '-0.01em',
      }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 320, lineHeight: 1.6 }}>{message}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

/* ─── DIVIDER ────────────────────────────────────────────────────────────── */
export function Divider({ style: sx }) {
  return (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--border)',
      ...sx,
    }} />
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, width = 440 }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,23,20,0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="scale-in"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: width,
          padding: '28px 32px',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 22,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--ink-1)',
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--ink-4)',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── CONFIRM DIALOG ─────────────────────────────────────────────────────── */
export function Confirm({ message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal title={danger ? '⚠ Confirm Action' : 'Confirm'} onClose={onCancel} width={380}>
      <p style={{
        fontSize: 13,
        color: 'var(--ink-2)',
        lineHeight: 1.65,
        marginBottom: 24,
      }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger-solid' : 'primary'} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

/* ─── MODAL FOOTER ───────────────────────────────────────────────────────── */
export function ModalFooter({ children }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 24,
      paddingTop: 20,
      borderTop: '1px solid var(--border)',
    }}>
      {children}
    </div>
  );
}
