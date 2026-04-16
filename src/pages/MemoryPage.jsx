import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMemories } from '../lib/useMemories.jsx';
import { useAuth } from '../lib/useAuth.jsx';
import { useModal } from '../lib/useModal.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';
import { useToast } from '../lib/useToast.jsx';
import { fmtDate } from '../components/MemoryCard.jsx';
import Lightbox from '../components/Lightbox.jsx';

const REGIONS = ['All', 'Luzon', 'Visayas', 'Mindanao'];

export default function MemoryPage() {
  const [params] = useSearchParams();
  const dateFilter = params.get('date');
  const { memories, deleteMemory } = useMemories();
  const { isAdmin } = useAuth();
  const { openEdit } = useModal();
  const confirm = useConfirm();
  const toast = useToast();

  async function handleDelete(m) {
    const ok = await confirm({
      title: 'Delete this memory?',
      message: 'This cannot be undone. The photos and notes will be gone for good.',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    try {
      await deleteMemory(m.id);
      toast.success('Memory deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  }
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [lightbox, setLightbox] = useState(null); // { memory, index }

  const filtered = useMemo(() => {
    let out = memories;
    if (dateFilter) out = out.filter(m => m.date === dateFilter);
    if (region !== 'All') out = out.filter(m => m.region === region);
    const q = query.trim().toLowerCase();
    if (q) out = out.filter(m =>
      m.caption.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      (m.notes || '').toLowerCase().includes(q) ||
      m.date.includes(q)
    );
    return [...out].sort((a, b) => b.date.localeCompare(a.date));
  }, [memories, dateFilter, region, query]);

  return (
    <section className="section" style={{ paddingTop: 50 }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="eyebrow">Journal</div>
          <h2>{dateFilter ? fmtDate(dateFilter) : 'All Memories'}</h2>
          <p style={{ maxWidth: 520, margin: '8px auto 0' }}>
            Search by place, keyword, or date. Every entry is a small moment worth keeping.
          </p>
        </div>

        <div className="search-bar">
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search places, captions, notes…" />
        </div>

        <div className="search-chips">
          {REGIONS.map(r => (
            <div key={r} className={'chip' + (region === r ? ' active' : '')} onClick={() => setRegion(r)}>
              {r}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div className="preview-empty" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '60px 20px' }}>
              No memories match.
            </div>
          ) : filtered.map(m => (
            <article key={m.id} className="memory-entry">
              <header>
                <div>
                  <div className="preview-date">{fmtDate(m.date)}</div>
                  <h3>{m.caption}</h3>
                  <div className="loc-pill">📍 {m.location}{m.region ? ` · ${m.region}` : ''}</div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="icon-btn" title="Edit" onClick={() => openEdit(m)}>✎</button>
                    <button className="icon-btn danger" title="Delete"
                      onClick={() => handleDelete(m)}>🗑</button>
                  </div>
                )}
              </header>
              <div className="gallery-grid">
                {m.images.map((src, j) => (
                  <img key={j} src={src} alt={m.caption}
                    onClick={() => setLightbox({ memory: m, index: j })} />
                ))}
              </div>
              <p className="caption">{m.caption}</p>
              <p className="notes">{m.notes}</p>
            </article>
          ))}
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
