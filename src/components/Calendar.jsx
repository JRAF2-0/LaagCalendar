import { useMemo, useState } from 'react';
import { useMemories } from '../lib/useMemories.jsx';
import { useAuth } from '../lib/useAuth.jsx';
import { useModal } from '../lib/useModal.jsx';

export default function Calendar({ onSelect, selected }) {
  const { memories } = useMemories();
  const { isAdmin } = useAuth();
  const { openModal } = useModal();
  const [view, setView] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const memSet = useMemo(() => new Set(memories.map(m => m.date)), [memories]);
  const today = new Date().toISOString().slice(0, 10);

  const year = view.getFullYear();
  const month = view.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ muted: true, day: daysInPrev - i });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, iso, has: memSet.has(iso), today: iso === today });
  }
  while (cells.length % 7 !== 0) cells.push({ muted: true, day: cells.length - daysInMonth - startDow + 1 });

  const shift = n => { const d = new Date(view); d.setMonth(d.getMonth() + n); setView(d); };

  return (
    <div className="cal-card">
      <div className="cal-header">
        <h2>{view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
        <div className="cal-nav">
          <button onClick={() => shift(-1)} aria-label="Previous">‹</button>
          <button onClick={() => shift(1)} aria-label="Next">›</button>
        </div>
      </div>
      <div className="cal-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="cal-days">
        {cells.map((c, i) => {
          if (c.muted) return <div key={i} className="cal-day muted">{c.day}</div>;
          const cls = ['cal-day'];
          if (c.has) cls.push('has-memory');
          if (c.today) cls.push('today');
          if (c.iso === selected) cls.push('selected');
          return (
            <div key={c.iso} className={cls.join(' ')} onClick={() => onSelect && onSelect(c.iso)}>
              {c.day}
              {isAdmin && (
                <span className="add-btn" title="Add memory"
                  onClick={e => { e.stopPropagation(); openModal(c.iso); }}>+</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
