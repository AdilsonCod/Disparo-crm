import { create } from 'zustand';
import { api } from '../lib/api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: { contacts: number };
}

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: Tag[];
  createdAt: string;
}

interface CrmState {
  contacts: Contact[];
  tags: Tag[];
  isLoading: boolean;
  importResult: { created: number; skipped: number } | null;
  fetchContacts: () => Promise<void>;
  fetchTags: () => Promise<void>;
  importCsv: (file: File) => Promise<void>;
  createContact: (data: { phone: string; name?: string }) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  createTag: (data: { name: string; color: string }) => Promise<void>;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  contacts: [],
  tags: [],
  isLoading: false,
  importResult: null,

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/contacts');
      set({ contacts: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTags: async () => {
    const res = await api.get('/tags');
    set({ tags: res.data });
  },

  importCsv: async (file: File) => {
    set({ isLoading: true, importResult: null });
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ importResult: res.data, isLoading: false });
      await get().fetchContacts();
    } catch {
      set({ isLoading: false });
      throw new Error('Erro ao importar CSV');
    }
  },

  createContact: async (data) => {
    await api.post('/contacts', data);
    await get().fetchContacts();
  },

  deleteContact: async (id: string) => {
    await api.delete(`/contacts/${id}`);
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) }));
  },

  createTag: async (data) => {
    await api.post('/tags', data);
    await get().fetchTags();
  },
}));
