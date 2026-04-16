import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseReady, ADMIN_EMAIL } from './supabase.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!supabaseReady);

  useEffect(() => {
    if (!supabaseReady) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin =
    Boolean(user) && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL);

  async function signIn(email, password) {
    if (!supabaseReady) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function signOut() {
    if (!supabaseReady) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthCtx.Provider value={{ user, isAdmin, ready, signIn, signOut }}>
      <div className={isAdmin ? 'is-admin' : ''}>{children}</div>
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
