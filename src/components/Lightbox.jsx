import { useEffect, useState, useCallback } from 'react';

export default function Lightbox({ images, index, onClose, caption, location, date }) {
  const [current, setCurrent] = useState(index ?? 0);
  const [loaded, setLoaded] = useState(false);

  const prev = useCallback(() => {
    setLoaded(false);
    setCurrent(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setLoaded(false);
    setCurrent(i => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    setCurrent(index ?? 0);
    setLoaded(false);
  }, [index]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  if (images == null || images.length === 0) return null;

  return (
    <div className="lb-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>

      <div className="lb-counter">{current + 1} / {images.length}</div>

      {images.length > 1 && (
        <>
          <button className="lb-arrow left" onClick={prev} aria-label="Previous">‹</button>
          <button className="lb-arrow right" onClick={next} aria-label="Next">›</button>
        </>
      )}

      <figure className="lb-stage" onClick={e => e.stopPropagation()}>
        <img
          key={current}
          src={images[current]}
          alt={caption || ''}
          className={'lb-img' + (loaded ? ' loaded' : '')}
          onLoad={() => setLoaded(true)}
        />
        {(caption || location || date) && (
          <figcaption className="lb-caption">
            {caption && <strong>{caption}</strong>}
            <span>{[location, date].filter(Boolean).join(' · ')}</span>
          </figcaption>
        )}
      </figure>

      {images.length > 1 && (
        <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
          {images.map((src, i) => (
            <button key={i}
              className={'lb-thumb' + (i === current ? ' active' : '')}
              onClick={() => { setLoaded(false); setCurrent(i); }}
              style={{ backgroundImage: `url(${src})` }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
