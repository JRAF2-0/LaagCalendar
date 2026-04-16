import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback(id => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  const push = useCallback((kind, message, opts = {}) => {
    const id = nextId++;
    const duration = opts.duration ?? 3500;
    setToasts(prev => [...prev, { id, kind, message }]);
    const handle = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, handle);
    return id;
  }, [dismiss]);

  const api = {
    success: (m, o) => push('success', m, o),
    error:   (m, o) => push('error', m, o),
    info:    (m, o) => push('info', m, o),
    dismiss
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <div className="toast-msg">{t.message}</div>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
