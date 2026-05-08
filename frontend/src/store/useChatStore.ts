import { create } from 'zustand';
import api from '@/lib/api';

export interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  type: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  status: string;
  contact: {
    id: string;
    name: string;
    phone: string;
  };
  instance: {
    id: string;
    name: string;
  };
  assignedUser?: {
    id: string;
    name: string;
  };
  messages: Message[];
  updatedAt: string;
}

interface ChatState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  messages: Message[];
  isLoading: boolean;
  fetchTickets: () => Promise<void>;
  selectTicket: (ticketId: string) => Promise<void>;
  sendMessage: (ticketId: string, body: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  messages: [],
  isLoading: false,

  fetchTickets: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/chat/tickets');
      set({ tickets: data });
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectTicket: async (ticketId: string) => {
    const ticket = get().tickets.find(t => t.id === ticketId) || null;
    set({ selectedTicket: ticket, isLoading: true });
    if (!ticket) return;

    try {
      const { data } = await api.get(`/chat/tickets/${ticketId}/messages`);
      set({ messages: data });
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (ticketId: string, body: string) => {
    try {
      const { data } = await api.post(`/chat/tickets/${ticketId}/send`, { body });
      set(state => ({
        messages: [...state.messages, data],
        tickets: state.tickets.map(t => 
          t.id === ticketId 
            ? { ...t, messages: [data], updatedAt: new Date().toISOString() } 
            : t
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      }));
    } catch (error) {
      console.error('Failed to send message', error);
    }
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    try {
      await api.post(`/chat/tickets/${ticketId}/status`, { status });
      set(state => ({
        tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status } : t),
        selectedTicket: state.selectedTicket?.id === ticketId 
          ? { ...state.selectedTicket, status } 
          : state.selectedTicket
      }));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  }
}));
