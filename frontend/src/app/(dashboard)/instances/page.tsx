'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreateInstanceModal } from '@/components/instances/CreateInstanceModal';
import { useInstanceStore } from '@/store/useInstanceStore';
import { Plus, Smartphone, Signal, SignalZero, Loader2 } from 'lucide-react';
import styles from './Instances.module.css';

export default function InstancesPage() {
  const { instances, isLoading, fetchInstances, createInstance } = useInstanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return (
    <>
      <Header title="Conexões de WhatsApp" />
      <div className={styles.content}>
        <div className={styles.topBar}>
          <p className={styles.subtitle}>Gerencie os aparelhos que farão o disparo de mensagens.</p>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Nova Conexão
          </button>
        </div>

        {isLoading && instances.length === 0 ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spin} size={40} />
            <p>Carregando instâncias...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {instances.map((instance) => (
              <GlassCard key={instance.id} className={styles.instanceCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Smartphone size={24} />
                  </div>
                  <div className={styles.statusBadge} data-status={instance.status}>
                    {instance.status === 'open' ? (
                      <><Signal size={14} /> Conectado</>
                    ) : (
                      <><SignalZero size={14} /> Desconectado</>
                    )}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3>{instance.name}</h3>
                  <p>ID: {instance.evolutionInstanceName}</p>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.actionBtn}>Verificar Status</button>
                  <button className={`${styles.actionBtn} ${styles.dangerBtn}`}>Remover</button>
                </div>
              </GlassCard>
            ))}

            {instances.length === 0 && !isLoading && (
              <div className={styles.emptyState}>
                <Smartphone size={48} className={styles.emptyIcon} />
                <h3>Nenhuma conexão encontrada</h3>
                <p>Clique no botão acima para adicionar um novo aparelho.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateInstanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={createInstance} 
      />
    </>
  );
}
