import { createContext, useContext, useRef, useState, useEffect } from 'react';

const Ctx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = opts => new Promise(resolve => {
    resolverRef.current = resolve;
    setState({
      title: 'Are you sure?',
      message: '',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      danger: false,
      ...opts
    });
  });

  const handle = result => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (r) r(result);
  };

  useEffect(() => {
    if (!state) return;
    function onKey(e) {
      if (e.key === 'Escape') handle(false);
      else if (e.key === 'Enter') handle(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && handle(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <h3>{state.title}</h3>
              <button className="icon-btn" onClick={() => handle(false)} aria-label="Close">✕</button>
            </div>
            {state.message && (
              <div className="modal-body">
                <p style={{ color: 'var(--ink-soft)' }}>{state.message}</p>
              </div>
            )}
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => handle(false)}>{state.cancelLabel}</button>
              <button
                className={'btn ' + (state.danger ? 'btn-danger' : 'btn-primary')}
                onClick={() => handle(true)}
                autoFocus
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx);
