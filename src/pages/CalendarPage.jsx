import { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from '../components/Calendar.jsx';
import { useMemories } from '../lib/useMemories.jsx';
import { fmtDate } from '../components/MemoryCard.jsx';
import Lightbox from '../components/Lightbox.jsx';

export default function CalendarPage() {
  const { memories } = useMemories();
  const [selected, setSelected] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const items = selected ? memories.filter(m => m.date === selected) : [];

  return (
    <section className="section" style={{ paddingTop: 50 }}>
      <div className="container">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <div>
            <div className="eyebrow">Timeline</div>
            <h2>The year, one day at a time</h2>
            <p>Click any dotted date to open its memory.</p>
          </div>
        </div>

        <div className="cal-layout">
          <Calendar onSelect={setSelected} selected={selected} />
          <aside className="preview-panel">
            {!selected || !items.length ? (
              <div className="preview-empty">
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🗓️</div>
                <p><strong style={{ color: 'var(--ink)' }}>
                  {selected ? 'No memory on this date' : 'Pick a date'}
                </strong><br />Select a dotted date to see its story.</p>
              </div>
            ) : items.map((m, i) => (
              <div key={m.id}>
                {i > 0 && <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--gray)' }} />}
                <div className="preview-date">{fmtDate(m.date)} · {m.location}</div>
                <h3 className="preview-title">{m.caption}</h3>
                <div className="preview-gallery">
                  {m.images.slice(0, 3).map((src, j) => (
                    <img key={j} src={src} alt="" style={{ cursor: 'zoom-in' }}
                      onClick={() => setLightbox({ memory: m, index: j })} />
                  ))}
                </div>
                <p className="notes">{m.notes}</p>
                <div style={{ marginTop: 18 }}>
                  <Link className="btn btn-ghost" to={`/memories?date=${m.date}`}>Open full memory →</Link>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.memory.images}
          index={lightbox.index}
          caption={lightbox.memory.caption}
          location={lightbox.memory.location}
          date={fmtDate(lightbox.memory.date)}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}
