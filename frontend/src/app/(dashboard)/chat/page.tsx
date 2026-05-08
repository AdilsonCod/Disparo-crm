'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { useChatStore } from '@/store/useChatStore';
import { MessageSquare, Send, Phone, User, Clock, Loader2 } from 'lucide-react';
import styles from './Chat.module.css';

export default function ChatPage() {
  const { tickets, selectedTicket, messages, isLoading, fetchTickets, selectTicket, sendMessage, updateTicketStatus } = useChatStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
    
    // Simple polling for MVP (every 10 seconds)
    const interval = setInterval(() => {
      fetchTickets();
      if (selectedTicket) {
        selectTicket(selectedTicket.id);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTicket) return;
    
    const text = inputText;
    setInputText(''); // optimistic clear
    await sendMessage(selectedTicket.id, text);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedTicket) {
      updateTicketStatus(selectedTicket.id, e.target.value);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Header title="Atendimento (Inbox)" />
      
      <div className={styles.container}>
        {/* Left Sidebar - Ticket List */}
        <GlassCard className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2><MessageSquare size={18} /> Conversas</h2>
          </div>
          <div className={styles.ticketList}>
            {isLoading && tickets.length === 0 ? (
              <div className={styles.emptyState}>
                <Loader2 size={24} className={styles.spin} />
              </div>
            ) : tickets.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma conversa ativa.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button 
                  key={ticket.id} 
                  className={`${styles.ticketItem} ${selectedTicket?.id === ticket.id ? styles.active : ''}`}
                  onClick={() => selectTicket(ticket.id)}
                >
                  <div className={styles.avatar}>
                    {ticket.contact.name ? ticket.contact.name.charAt(0).toUpperCase() : '#'}
                  </div>
                  <div className={styles.ticketInfo}>
                    <h3 className={styles.ticketName}>{ticket.contact.name || ticket.contact.phone}</h3>
                    <p className={styles.ticketPreview}>
                      {ticket.messages?.[0] ? ticket.messages[0].body : 'Nova conversa'}
                    </p>
                  </div>
                  <div className={styles.ticketTime}>
                    {formatTime(ticket.updatedAt)}
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        {/* Center - Main Chat Area */}
        <GlassCard className={styles.mainChat}>
          {selectedTicket ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                  <div className={styles.avatar}>
                    {selectedTicket.contact.name ? selectedTicket.contact.name.charAt(0).toUpperCase() : '#'}
                  </div>
                  <div>
                    <h2 className={styles.chatHeaderName}>{selectedTicket.contact.name || selectedTicket.contact.phone}</h2>
                    <p className={styles.chatHeaderPhone}>{selectedTicket.contact.phone}</p>
                  </div>
                </div>
                <select 
                  className={styles.kanbanSelect} 
                  value={selectedTicket.status}
                  onChange={handleStatusChange}
                >
                  <option value="OPEN">Novo Lead (Aberto)</option>
                  <option value="IN_PROGRESS">Em Negociação</option>
                  <option value="CLOSED">Fechado / Resolvido</option>
                </select>
              </div>

              <div className={styles.messagesArea}>
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`${styles.messageWrapper} ${msg.fromMe ? styles.fromMe : styles.fromThem}`}>
                    <div className={styles.messageBubble}>
                      {msg.body}
                      <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <form className={styles.inputForm} onSubmit={handleSend}>
                  <textarea
                    className={styles.chatInput}
                    placeholder="Digite uma mensagem..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <MessageSquare size={48} />
              <h3>Inbox Unificado</h3>
              <p>Selecione uma conversa ao lado para começar a atender.</p>
            </div>
          )}
        </GlassCard>

        {/* Right Panel - Info */}
        {selectedTicket && (
          <div className={styles.rightPanel}>
            <GlassCard className={styles.infoCard}>
              <div className={styles.infoSection}>
                <h4 className={styles.infoLabel}>Detalhes do Contato</h4>
                <p className={styles.infoValue}><User size={16} /> {selectedTicket.contact.name || 'Sem nome'}</p>
                <p className={styles.infoValue} style={{marginTop: '0.5rem'}}><Phone size={16} /> {selectedTicket.contact.phone}</p>
              </div>
              
              <div className={styles.infoSection}>
                <h4 className={styles.infoLabel}>Instância (Remetente)</h4>
                <p className={styles.infoValue}>
                  <span className={styles.badge}>{selectedTicket.instance.name}</span>
                </p>
              </div>

              <div className={styles.infoSection}>
                <h4 className={styles.infoLabel}>Atendente Responsável</h4>
                <p className={styles.infoValue}>
                  {selectedTicket.assignedUser ? selectedTicket.assignedUser.name : 'Não atribuído'}
                </p>
              </div>

              <div className={styles.infoSection}>
                <h4 className={styles.infoLabel}>Status no Funil</h4>
                <p className={styles.infoValue}>
                  <span className={styles.badge} style={{ background: selectedTicket.status === 'OPEN' ? '#3b82f6' : selectedTicket.status === 'IN_PROGRESS' ? '#f59e0b' : '#10b981' }}>
                    {selectedTicket.status}
                  </span>
                </p>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </>
  );
}
