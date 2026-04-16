import { Link, useNavigate } from 'react-router-dom';
import { useMemories } from '../lib/useMemories.jsx';
import MemoryCard from '../components/MemoryCard.jsx';
import Calendar from '../components/Calendar.jsx';

export default function Home() {
  const { memories } = useMemories();
  const nav = useNavigate();
  const featured = [...memories].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const cover = featured[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Notes About Me</div>
            <h1>Not just places, but <span>moments</span> that mattered.</h1>
            <p className="lead">Laag — wandering through life, not just locations. A collection of memories — from ordinary days to milestones like graduation, Christmas, and the little things worth keeping.</p>
            <div className="hero-cta">
              <Link className="btn btn-primary" to="/calendar">Open the Calendar →</Link>
              <Link className="btn btn-ghost" to="/memories">Browse memories</Link>
            </div>
          </div>
          {cover && (
            <div className="hero-visual">
              <img src={cover.images[0]} alt={cover.caption} />
              <div className="hero-badge">
                <strong>{cover.location}</strong>
                <span>{new Date(cover.date + 'T00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Featured</div>
              <h2>Recent memories</h2>
              <p>Latest moments, still fresh in the camera roll.</p>
            </div>
            <Link className="btn btn-ghost" to="/memories">View all →</Link>
          </div>
          <div className="memory-grid">
            {featured.map((m, i) => (
              <MemoryCard key={m.id} memory={m} tall={i % 5 === 0}
                onClick={() => nav(`/memories?date=${m.date}`)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Timeline</div>
              <h2>Browse by date</h2>
              <p>Every dot is a day I wrote something down.</p>
            </div>
            <Link className="btn btn-ghost" to="/calendar">Full calendar →</Link>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Calendar onSelect={iso => nav(`/memories?date=${iso}`)} />
          </div>
        </div>
      </section>
    </>
  );
}
