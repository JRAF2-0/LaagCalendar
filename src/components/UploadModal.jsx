import { useEffect, useMemo, useRef, useState } from 'react';
import { useModal } from '../lib/useModal.jsx';
import { useAuth } from '../lib/useAuth.jsx';
import { useMemories } from '../lib/useMemories.jsx';
import { useToast } from '../lib/useToast.jsx';

const BLANK = { caption: '', notes: '', location: '', region: 'Luzon', date: '', privacy: 'public' };

export default function UploadModal() {
  const { open, prefillDate, editing, closeModal } = useModal();
  const { isAdmin } = useAuth();
  const { addMemory, updateMemory, uploadImage } = useMemories();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          caption: editing.caption || '',
          notes: editing.notes || '',
          location: editing.location || '',
          region: editing.region || 'Luzon',
          date: editing.date || '',
          privacy: editing.privacy || 'public'
        });
        setExistingImages(editing.images || []);
      } else {
        setForm({ ...BLANK, date: prefillDate || '' });
        setExistingImages([]);
      }
      setFiles([]);
      setErrors({});
    }
  }, [open, prefillDate, editing]);

  const newPreviews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => newPreviews.forEach(URL.revokeObjectURL);
  }, [newPreviews]);

  if (!open || !isAdmin) return null;
  const update = k => e => {
    setForm(s => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };
  const pick = incoming => {
    setFiles([...incoming].slice(0, 8));
    if (errors.images) setErrors(er => ({ ...er, images: undefined }));
  };
  const removeExisting = src => setExistingImages(prev => prev.filter(s => s !== src));

  async function save() {
    const next = {};
    if (!form.caption.trim()) next.caption = 'Please add a caption.';
    if (!form.date) next.date = 'Please pick a date.';
    if (!form.location.trim()) next.location = 'Where was this?';
    const totalImages = existingImages.length + files.length;
    if (totalImages === 0) next.images = 'Add at least one photo.';
    if (editing && totalImages === 0) next.images = 'Please keep at least one photo.';

    if (Object.keys(next).length) { setErrors(next); return; }

    setSaving(true);
    try {
      const uploaded = await Promise.all(files.map(f => uploadImage(f)));
      const images = [...existingImages, ...uploaded];

      if (editing) {
        await updateMemory(editing.id, { ...form, images });
        toast.success('Changes saved');
      } else {
        await addMemory({ ...form, images });
        toast.success('Memory saved');
      }
      closeModal();
    } catch (e) {
      toast.error(e.message || 'Something went wrong.');
    } finally { setSaving(false); }
  }

  const fieldCls = key => 'field' + (errors[key] ? ' has-error' : '');

  return (
    <div className="modal-backdrop open">
      <div className="modal">
        <div className="modal-head">
          <h3>{editing ? 'Edit Memory' : 'New Memory'}</h3>
          <button className="icon-btn" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-body">
          <div
            className={'dropzone' + (drag ? ' drag' : '') + (errors.images ? ' has-error' : '')}
            onClick={() => inputRef.current.click()}
            onDragEnter={e => { e.preventDefault(); setDrag(true); }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>📷</div>
            <strong style={{ color: 'var(--ink)', display: 'block' }}>
              {editing ? 'Add more photos' : 'Drop photos here'}
            </strong>
            <span style={{ fontSize: '.85rem' }}>or click to browse — up to 8 images</span>
          </div>
          {errors.images && <span className="field-error" style={{ marginTop: 8 }}>{errors.images}</span>}
          <input ref={inputRef} type="file" multiple accept="image/*" className="sr"
            onChange={e => pick(e.target.files)} />

          {(existingImages.length > 0 || newPreviews.length > 0) && (
            <div className="preview-grid">
              {existingImages.map(src => (
                <div key={src} style={{ backgroundImage: `url(${src})`, position: 'relative' }}>
                  <button type="button" onClick={() => removeExisting(src)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 22, height: 22, borderRadius: '50%',
                      border: 'none', background: 'rgba(31,41,55,.85)', color: '#fff',
                      cursor: 'pointer', fontSize: 12, lineHeight: 1
                    }}>✕</button>
                </div>
              ))}
              {newPreviews.map((src, i) => <div key={'new'+i} style={{ backgroundImage: `url(${src})` }} />)}
            </div>
          )}

          <div className={fieldCls('caption')}><label>Caption</label>
            <input type="text" value={form.caption} onChange={update('caption')} placeholder="Give this memory a title…" />
            {errors.caption && <span className="field-error">{errors.caption}</span>}
          </div>
          <div className="field"><label>Notes</label>
            <textarea value={form.notes} onChange={update('notes')} placeholder="Write a little about this moment…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className={fieldCls('location')}><label>Location</label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="City, Province" />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>
            <div className={fieldCls('date')}><label>Date</label>
              <input type="date" value={form.date} onChange={update('date')} />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>
          <div className="field"><label>Region</label>
            <select value={form.region} onChange={update('region')}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--gray)', fontSize: '.95rem' }}>
              <option>Luzon</option><option>Visayas</option><option>Mindanao</option>
            </select>
          </div>
          <div className="toggle-row">
            <div>
              <div style={{ fontWeight: 500, color: 'var(--ink)' }}>Public memory</div>
              <p style={{ fontSize: '.85rem' }}>Visible to anyone visiting your journal.</p>
            </div>
            <div
              className={'toggle' + (form.privacy === 'public' ? ' on' : '')}
              onClick={() => setForm(s => ({ ...s, privacy: s.privacy === 'public' ? 'private' : 'public' }))}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : (editing ? 'Save changes' : 'Save memory')}
          </button>
        </div>
      </div>
    </div>
  );
}
