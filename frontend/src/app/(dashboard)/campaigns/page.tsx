'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCampaignStore } from '@/store/useCampaignStore';
import {
  Plus, Rocket, Loader2, Play, Pause, Trash2,
  MessageSquare, Users, Clock, Smartphone,
} from 'lucide-react';
import styles from './Campaigns.module.css';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  PROCESSING: 'Enviando',
  PAUSED: 'Pausada',
  COMPLETED: 'Concluída',
  FAILED: 'Falha',
};

export default function CampaignsPage() {
  const { campaigns, isLoading, fetchCampaigns, startCampaign, pauseCampaign, deleteCampaign } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const active = campaigns.filter((c) => c.status === 'PROCESSING').length;

  return (
    <>
      <Header title="Campanhas" />
      <div className={styles.content}>

        <div className={styles.topBar}>
          <p className={styles.subtitle}>Crie e gerencie seus disparos em massa.</p>
          <Link href="/campaigns/new" className={styles.createBtn}>
            <Plus size={20} /> Nova Campanha
          </Link>
        </div>

        <div className={styles.statsRow}>
          <GlassCard className={styles.statCard}>
            <span className={styles.statNum}>{campaigns.length}</span>
            <span className={styles.statLabel}>Total de Campanhas</span>
          </GlassCard>
          <GlassCard className={styles.statCard}>
            <span className={styles.statNum}>{active}</span>
            <span className={styles.statLabel}>Ativas Agora</span>
          </GlassCard>
          <GlassCard className={styles.statCard}>
            <span className={styles.statNum}>{totalSent.toLocaleString()}</span>
            <span className={styles.statLabel}>Mensagens Enviadas</span>
          </GlassCard>
        </div>

        {isLoading && campaigns.length === 0 ? (
          <div className={styles.loading}>
            <Loader2 size={40} className={styles.spin} />
            <p>Carregando campanhas...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {campaigns.map((campaign) => {
              const progress = campaign.totalContacts > 0
                ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalContacts) * 100)
                : 0;

              return (
                <GlassCard key={campaign.id} className={styles.campaignCard}>
                  <div className={styles.cardIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                    <Rocket size={22} />
                  </div>

                  <div className={styles.cardInfo}>
                    <h3>{campaign.name}</h3>
                    <div className={styles.cardMeta}>
                      <span><Smartphone size={13} /> {campaign.instance.name}</span>
                      <span><Users size={13} /> {campaign.totalContacts} contatos</span>
                      <span><Clock size={13} /> {campaign.minDelay}-{campaign.maxDelay}s delay</span>
                    </div>
                    {campaign.tags.length > 0 && (
                      <div className={styles.cardTags}>
                        {campaign.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className={styles.tagChip}
                            style={{ background: `${tag.color}22`, color: tag.color, borderColor: `${tag.color}44` }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {campaign.status === 'PROCESSING' || campaign.status === 'COMPLETED' ? (
                    <div className={styles.cardProgress}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                      </div>
                      <span className={styles.progressText}>
                        {campaign.sentCount}/{campaign.totalContacts} ({progress}%)
                      </span>
                    </div>
                  ) : null}

                  <div className={styles.statusBadge} data-status={campaign.status}>
                    {STATUS_LABELS[campaign.status] || campaign.status}
                  </div>

                  <div className={styles.cardActions}>
                    {(campaign.status === 'DRAFT' || campaign.status === 'PAUSED') && (
                      <button className={`${styles.actionBtn} ${styles.playBtn}`} title="Iniciar" onClick={() => startCampaign(campaign.id)}>
                        <Play size={18} />
                      </button>
                    )}
                    {campaign.status === 'PROCESSING' && (
                      <button className={`${styles.actionBtn} ${styles.pauseBtn}`} title="Pausar" onClick={() => pauseCampaign(campaign.id)}>
                        <Pause size={18} />
                      </button>
                    )}
                    {campaign.status !== 'PROCESSING' && (
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Excluir" onClick={() => deleteCampaign(campaign.id)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}

            {campaigns.length === 0 && !isLoading && (
              <div className={styles.emptyState}>
                <MessageSquare size={48} className={styles.emptyIcon} />
                <h3>Nenhuma campanha criada</h3>
                <p>Clique em &quot;Nova Campanha&quot; para criar seu primeiro disparo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
