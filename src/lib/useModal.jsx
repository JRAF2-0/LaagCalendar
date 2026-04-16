import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

export function ModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [editing, setEditing] = useState(null);

  return (
    <Ctx.Provider value={{
      open,
      prefillDate,
      editing,
      openModal: (date = null) => { setEditing(null); setPrefillDate(date); setOpen(true); },
      openEdit: (memory) => { setPrefillDate(null); setEditing(memory); setOpen(true); },
      closeModal: () => { setOpen(false); setEditing(null); setPrefillDate(null); }
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useModal = () => useContext(Ctx);
