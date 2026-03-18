import { useState, useCallback } from 'react';

let idSeq = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++idSeq;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, push, dismiss };
}
