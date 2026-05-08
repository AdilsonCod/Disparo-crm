import { create } from 'zustand';
import { api } from '../lib/api';
import { Tag } from './useCrmStore';

export interface Campaign {
  id: string;
  name: string;
  status: string;
  message: string;
  useSpintax: boolean;
  mediaUrl?: string;
  mediaType?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  minDelay: number;
  maxDelay: number;
  pauseStart?: string;
  pauseEnd?: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  instance: { id: string; name: string; status: string };
  tags: Tag[];
  createdAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  message: string;
  instanceId: string;
  tagIds: string[];
  useSpintax?: boolean;
  scheduledAt?: string;
  minDelay?: number;
  maxDelay?: number;
  pauseStart?: string;
  pauseEnd?: string;
}

interface CampaignState {
  campaigns: Campaign[];
  isLoading: boolean;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: CreateCampaignPayload) => Promise<Campaign>;
  startCampaign: (id: string) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  isLoading: false,

  fetchCampaigns: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/campaigns');
      set({ campaigns: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCampaign: async (data) => {
    const res = await api.post('/campaigns', data);
    await get().fetchCampaigns();
    return res.data;
  },

  startCampaign: async (id: string) => {
    await api.post(`/campaigns/${id}/start`);
    await get().fetchCampaigns();
  },

  pauseCampaign: async (id: string) => {
    await api.post(`/campaigns/${id}/pause`);
    await get().fetchCampaigns();
  },

  deleteCampaign: async (id: string) => {
    await api.delete(`/campaigns/${id}`);
    set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) }));
  },
}));
