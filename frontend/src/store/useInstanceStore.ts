import { create } from 'zustand';
import { api } from '../lib/api';

export interface WhatsAppInstance {
  id: string;
  name: string;
  evolutionInstanceName: string;
  status: string;
  createdAt: string;
}

interface InstanceState {
  instances: WhatsAppInstance[];
  isLoading: boolean;
  error: string | null;
  fetchInstances: () => Promise<void>;
  createInstance: (name: string) => Promise<{ instance: WhatsAppInstance, qrCodeBase64: string | null }>;
}

export const useInstanceStore = create<InstanceState>((set) => ({
  instances: [],
  isLoading: false,
  error: null,
  fetchInstances: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/evolution/instances');
      set({ instances: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  createInstance: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/evolution/create-instance', { name });
      const newInstance = response.data.instance;
      const qrCodeBase64 = response.data.evolutionResponse?.qrcode?.base64 || null;
      
      set((state) => ({
        instances: [...state.instances, newInstance],
        isLoading: false
      }));
      
      return { instance: newInstance, qrCodeBase64 };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  }
}));
