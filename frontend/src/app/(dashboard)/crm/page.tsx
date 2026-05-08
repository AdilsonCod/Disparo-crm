'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { ImportCsvModal } from '@/components/crm/ImportCsvModal';
import { useCrmStore } from '@/store/useCrmStore';
import { Upload, UserPlus, Phone, Mail, Trash2, Tag, Search, Loader2 } from 'lucide-react';
import styles from './Crm.module.css';

export default function CrmPage() {
  const { contacts, tags, isLoading, fetchContacts, fetchTags, deleteContact, createContact } = useCrmStore();
  const [isImportOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addForm, setAddForm] = useState({ phone: '', name: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchTags();
  }, [fetchContacts, fetchTags]);

  const filtered = contacts.filter(c =>
    c.phone.includes(search) || (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.phone) return;
    setIsAdding(true);
    await createContact(addForm);
    setAddForm({ phone: '', name: '' });
    setIsAdding(false);
  };

  return (
    <>
      <Header title="CRM — Contatos" />
      <div className={styles.content}>

        {/* Top Actions */}
        <div className={styles.topBar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.actions}>
            <button className={styles.importBtn} onClick={() => setImportOpen(true)}>
              <Upload size={18} /> Importar CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <GlassCard className={styles.statCard}>
            <span className={styles.statNum}>{contacts.length}</span>
            <span className={styles.statLabel}>Total de Contatos</span>
          </GlassCard>
          <GlassCard className={styles.statCard}>
            <span className={styles.statNum}>{tags.length}</span>
            <span className={styles.statLabel}>Tags Criadas</span>
          </GlassCard>
        </div>

        {/* Add Contact Form */}
        <GlassCard className={styles.addFormCard}>
          <h3><UserPlus size={18} /> Adicionar Contato Manualmente</h3>
          <form className={styles.addForm} onSubmit={handleAddContact}>
            <input
              type="text" placeholder="5511999999999"
              value={addForm.phone}
              onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
              required
            />
            <input
              type="text" placeholder="Nome (opcional)"
              value={addForm.name}
              onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
            />
            <button type="submit" disabled={isAdding}>
              {isAdding ? <Loader2 size={18} className={styles.spin} /> : 'Adicionar'}
            </button>
          </form>
        </GlassCard>

        {/* Table */}
        <GlassCard className={styles.tableCard}>
          {isLoading && contacts.length === 0 ? (
            <div className={styles.loading}>
              <Loader2 size={36} className={styles.spin} />
              <p>Carregando contatos...</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th><Phone size={14} /> Telefone</th>
                    <th><Mail size={14} /> Email</th>
                    <th><Tag size={14} /> Tags</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(contact => (
                    <tr key={contact.id}>
                      <td className={styles.nameCell}>{contact.name || <span className={styles.noData}>—</span>}</td>
                      <td><code className={styles.phone}>{contact.phone}</code></td>
                      <td>{contact.email || <span className={styles.noData}>—</span>}</td>
                      <td>
                        <div className={styles.tags}>
                          {contact.tags.map(tag => (
                            <span key={tag.id} className={styles.tag} style={{ background: `${tag.color}22`, color: tag.color, borderColor: `${tag.color}44` }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button className={styles.deleteBtn} onClick={() => deleteContact(contact.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className={styles.emptyState}>
                  <p>Nenhum contato encontrado. Importe uma planilha ou adicione manualmente.</p>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      <ImportCsvModal isOpen={isImportOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
