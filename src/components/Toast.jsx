const ICONS = { success: '✓', error: '✕', warn: '!' };
const COLORS = {
  success: { bg: 'var(--ink-1)', accent: 'var(--green)' },
  error:   { bg: '#3B1212', accent: 'var(--red)' },
  warn:    { bg: '#2E2408', accent: 'var(--amber)' },
};

export function ToastContainer({ toasts, dismiss }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.success;
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: c.bg,
              color: '#fff',
              padding: '12px 18px',
              borderRadius: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              pointerEvents: 'auto',
              maxWidth: 340,
              animation: 'toastIn 0.25s ease both',
              borderLeft: `3px solid ${c.accent}`,
            }}
          >
            <span style={{
              background: c.accent,
              color: '#fff',
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {ICONS[t.type] || '✓'}
            </span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
