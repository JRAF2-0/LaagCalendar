import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth.jsx';

export default function Nav() {
  const { isAdmin, user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand"><span className="brand-dot" />JRAF's Laag</Link>
        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/memories">Memories</NavLink>
          {isAdmin ? (
            <>
              <span className="admin-pill">Admin</span>
              <a onClick={async () => { await signOut(); nav('/'); }} style={{ cursor: 'pointer' }}>Sign out</a>
            </>
          ) : (
            <NavLink to="/login" style={{ opacity: .45, fontSize: '.85rem' }}>·</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
