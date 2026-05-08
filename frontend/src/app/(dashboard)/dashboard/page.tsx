import React from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, MessageSquare, PhoneCall, Users } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className={styles.content}>
        
        <div className={styles.statsGrid}>
          <GlassCard glow className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <p className={styles.statTitle}>Mensagens Hoje</p>
              <h3 className={styles.statValue}>1,284</h3>
            </div>
          </GlassCard>
          
          <GlassCard glow className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <div>
              <p className={styles.statTitle}>Contatos Ativos</p>
              <h3 className={styles.statValue}>8,421</h3>
            </div>
          </GlassCard>
          
          <GlassCard glow className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <p className={styles.statTitle}>Instâncias Conectadas</p>
              <h3 className={styles.statValue}>3 / 5</h3>
            </div>
          </GlassCard>

          <GlassCard glow className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
              <Activity size={24} />
            </div>
            <div>
              <p className={styles.statTitle}>Taxa de Entrega</p>
              <h3 className={styles.statValue}>98.2%</h3>
            </div>
          </GlassCard>
        </div>

        <div className={styles.mainGrid}>
          <GlassCard className={styles.chartCard}>
            <h3>Desempenho de Disparos</h3>
            <div className={styles.placeholderChart}>
              {/* Gráfico placeholder */}
              <div className={styles.bars}>
                <div className={styles.bar} style={{ height: '40%' }}></div>
                <div className={styles.bar} style={{ height: '70%' }}></div>
                <div className={styles.bar} style={{ height: '50%' }}></div>
                <div className={styles.bar} style={{ height: '90%' }}></div>
                <div className={styles.bar} style={{ height: '60%' }}></div>
                <div className={styles.bar} style={{ height: '80%' }}></div>
                <div className={styles.bar} style={{ height: '100%' }}></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className={styles.recentCard}>
            <h3>Campanhas Recentes</h3>
            <div className={styles.campaignList}>
              {[1,2,3].map((i) => (
                <div key={i} className={styles.campaignItem}>
                  <div className={styles.campaignInfo}>
                    <h4>Promoção Black Friday</h4>
                    <p>Enviado há 2 horas</p>
                  </div>
                  <div className={styles.campaignStatus}>Concluído</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
