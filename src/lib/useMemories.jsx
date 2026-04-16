import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, supabaseReady } from './supabase.js';
import { SAMPLE_MEMORIES } from '../data/sampleMemories.js';

const Ctx = createContext(null);

export function MemoriesProvider({ children }) {
  const [memories, setMemories] = useState(SAMPLE_MEMORIES);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabaseReady) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data && data.length) setMemories(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function addMemory(payload) {
    if (!supabaseReady) {
      const m = { ...payload, id: crypto.randomUUID() };
      setMemories(prev => [m, ...prev]);
      return m;
    }
    const { data, error } = await supabase
      .from('memories').insert(payload).select().single();
    if (error) throw error;
    setMemories(prev => [data, ...prev]);
    return data;
  }

  async function updateMemory(id, payload) {
    if (!supabaseReady) {
      setMemories(prev => prev.map(m => m.id === id ? { ...m, ...payload } : m));
      return { id, ...payload };
    }
    const { data, error } = await supabase
      .from('memories').update(payload).eq('id', id).select().single();
    if (error) throw error;
    setMemories(prev => prev.map(m => m.id === id ? data : m));
    return data;
  }

  async function deleteMemory(id) {
    if (supabaseReady) {
      await supabase.from('memories').delete().eq('id', id);
    }
    setMemories(prev => prev.filter(m => m.id !== id));
  }

  async function uploadImage(file) {
    if (!supabaseReady) return URL.createObjectURL(file);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('memory-photos').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('memory-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <Ctx.Provider value={{ memories, loading, refresh, addMemory, updateMemory, deleteMemory, uploadImage }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMemories = () => useContext(Ctx);
