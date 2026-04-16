import { useAuth } from '../lib/useAuth.jsx';
import { useMemories } from '../lib/useMemories.jsx';
import { useModal } from '../lib/useModal.jsx';
import { useConfirm } from './ConfirmDialog.jsx';
import { useToast } from '../lib/useToast.jsx';

export const fmtDate = iso =>
  new Date(iso + 'T00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

export default function MemoryCard({ memory, tall = false, onClick }) {
  const { isAdmin } = useAuth();
  const { deleteMemory } = useMemories();
  const { openEdit } = useModal();
  const confirm = useConfirm();
  const toast = useToast();
  const priv = memory.privacy === 'private';

  async function handleDelete(e) {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Delete this memory?',
      message: 'This cannot be undone. The photos and notes will be gone for good.',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    try {
      await deleteMemory(memory.id);
      toast.success('Memory deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  }

  function handleEdit(e) {
    e.stopPropagation();
    openEdit(memory);
  }

  return (
    <article className={'memory-card' + (tall ? ' tall' : '')} onClick={onClick}>
      <div className="thumb"><img src={memory.images[0]} alt={memory.caption} /></div>
      <div className={'privacy-tag' + (priv ? ' private' : '')}>
        {priv ? '🔒 Private' : '🌿 Public'}
      </div>
      {isAdmin && (
        <div className="admin-overlay">
          <button className="icon-btn" title="Edit" onClick={handleEdit}>✎</button>
          <button className="icon-btn danger" title="Delete" onClick={handleDelete}>🗑</button>
        </div>
      )}
      <div className="meta">
        <div className="loc">{memory.location}</div>
        <h3>{memory.caption}</h3>
        <div className="date">{fmtDate(memory.date)}</div>
      </div>
    </article>
  );
}
