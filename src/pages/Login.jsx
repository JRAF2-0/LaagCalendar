import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth.jsx';
import { supabaseReady } from '../lib/supabase.js';

export default function Login() {
  const { signIn, isAdmin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signIn(email, password);
      nav('/');
    } catch (e) {
      setErr(e.message || 'Sign in failed.');
    } finally { setBusy(false); }
  }

  if (isAdmin) {
    return (
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2>You're signed in as admin.</h2>
          <p style={{ marginTop: 8 }}>Edit controls are now visible.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 80 }}>
      <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--surface)', padding: 36, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="eyebrow" style={{ textAlign: 'center' }}>Admin</div>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Sign in</h2>

        {!supabaseReady && (
          <div style={{ padding: 12, background: 'var(--gray-2)', borderRadius: 12, fontSize: '.85rem', marginBottom: 16 }}>
            Supabase isn't configured yet. Copy <code>.env.example</code> to <code>.env</code> and set your project keys.
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field"><label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field"><label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {err && <p style={{ color: '#B91C1C', fontSize: '.85rem', marginTop: 12 }}>{err}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy || !supabaseReady}
            style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
