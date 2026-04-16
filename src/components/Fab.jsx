import { useAuth } from '../lib/useAuth.jsx';
import { useModal } from '../lib/useModal.jsx';

export default function Fab() {
  const { isAdmin } = useAuth();
  const { openModal } = useModal();
  if (!isAdmin) return null;
  return (
    <button className="fab" onClick={() => openModal()} style={{ display: 'inline-flex' }}>
      <span style={{ fontSize: '1.1rem' }}>+</span> Add Memory
    </button>
  );
}
