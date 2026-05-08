'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCampaignStore, CreateCampaignPayload } from '@/store/useCampaignStore';
import { useInstanceStore } from '@/store/useInstanceStore';
import { useCrmStore, Tag } from '@/store/useCrmStore';
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  Settings, Users, MessageSquare, Clock,
} from 'lucide-react';
import styles from './CampaignNew.module.css';

const STEPS = [
  { icon: Settings, label: 'Configuração' },
  { icon: Users, label: 'Público' },
  { icon: MessageSquare, label: 'Mensagem' },
  { icon: Clock, label: 'Agendamento' },
];

export default function CampaignNewPage() {
  const router = useRouter();
  const { createCampaign } = useCampaignStore();
  const { instances, fetchInstances } = useInstanceStore();
  const { tags, fetchTags } = useCrmStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [useSpintax, setUseSpintax] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');
  const [minDelay, setMinDelay] = useState(15);
  const [maxDelay, setMaxDelay] = useState(35);
  const [pauseStart, setPauseStart] = useState('20:00');
  const [pauseEnd, setPauseEnd] = useState('08:00');

  useEffect(() => {
    fetchInstances();
    fetchTags();
  }, [fetchInstances, fetchTags]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 0: return name.trim().length > 0 && instanceId.length > 0;
      case 1: return selectedTagIds.length > 0;
      case 2: return message.trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: CreateCampaignPayload = {
        name,
        message,
        instanceId,
        tagIds: selectedTagIds,
        useSpintax,
        minDelay,
        maxDelay,
        pauseStart: pauseStart || undefined,
        pauseEnd: pauseEnd || undefined,
        scheduledAt: scheduledAt || undefined,
      };
      await createCampaign(payload);
      router.push('/campaigns');
    } catch (err) {
      console.error('Erro ao criar campanha:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstance = instances.find((i) => i.id === instanceId);

  return (
    <>
      <Header title="Nova Campanha" />
      <div className={styles.content}>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`${styles.step} ${idx === currentStep ? styles.stepActive : ''} ${idx < currentStep ? styles.stepDone : ''}`}
                onClick={() => { if (idx < currentStep) setCurrentStep(idx); }}
              >
                <div className={styles.stepCircle}>
                  {idx < currentStep ? <Check size={14} /> : idx + 1}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${idx < currentStep ? styles.stepLineDone : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Configuração */}
        {currentStep === 0 && (
          <GlassCard className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Nome da Campanha</label>
              <input
                type="text"
                placeholder="Ex: Black Friday 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Instância Remetente (WhatsApp)</label>
              <select value={instanceId} onChange={(e) => setInstanceId(e.target.value)}>
                <option value="">Selecione uma instância...</option>
                {instances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} — {inst.status === 'open' ? 'Conectado' : 'Desconectado'}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>
                Escolha o número que fará o disparo. Prefira chips já aquecidos.
              </span>
            </div>
          </GlassCard>
        )}

        {/* Step 2: Público (Tags) */}
        {currentStep === 1 && (
          <GlassCard className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Selecione as Tags de Público</label>
              <span className={styles.hint}>
                Os contatos que possuem essas tags receberão a campanha.
              </span>
              <div className={styles.tagGrid}>
                {tags.map((tag: Tag) => (
                  <div
                    key={tag.id}
                    className={`${styles.tagOption} ${selectedTagIds.includes(tag.id) ? styles.tagOptionSelected : ''}`}
                    style={{
                      background: `${tag.color}22`,
                      color: tag.color,
                      borderColor: `${tag.color}44`,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {selectedTagIds.includes(tag.id) && <Check size={14} />}
                    {tag.name}
                    {tag._count && <span>({tag._count.contacts})</span>}
                  </div>
                ))}
                {tags.length === 0 && (
                  <span className={styles.hint}>
                    Nenhuma tag encontrada. Crie tags no módulo CRM primeiro.
                  </span>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Mensagem */}
        {currentStep === 2 && (
          <GlassCard className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Mensagem</label>
              <textarea
                placeholder={`Ex: {Oi|Olá|Opa} {nome}! Tudo bem?\n\nAproveite nossa promoção especial...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <span className={styles.hint}>
                Use {'{'}<em>nome</em>{'}'} para inserir o nome do contato. Use {'{'}<em>telefone</em>{'}'} para o telefone.
              </span>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.toggleRow}>
                <div
                  className={`${styles.toggle} ${useSpintax ? styles.toggleActive : ''}`}
                  onClick={() => setUseSpintax(!useSpintax)}
                />
                <span className={styles.toggleLabel}>Ativar Spintax</span>
              </div>
              <span className={styles.hint}>
                {'Spintax randomiza trechos: {Oi|Olá|Opa} envia uma opção diferente a cada contato.'}
              </span>
            </div>
          </GlassCard>
        )}

        {/* Step 4: Agendamento e Humanização */}
        {currentStep === 3 && (
          <GlassCard className={styles.formCard}>
            <div className={styles.formGroup}>
              <label>Agendar Início (opcional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <span className={styles.hint}>
                Deixe vazio para salvar como rascunho e iniciar manualmente.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label>Delay Humanizado Entre Mensagens</label>
              <div className={styles.delayRow}>
                <div className={styles.formGroup}>
                  <label>Mínimo (seg)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={minDelay}
                    onChange={(e) => setMinDelay(Number(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Máximo (seg)</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={maxDelay}
                    onChange={(e) => setMaxDelay(Number(e.target.value))}
                  />
                </div>
              </div>
              <span className={styles.hint}>
                O sistema aguarda um tempo aleatório entre esses valores para cada envio.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label>Pausa Noturna</label>
              <div className={styles.delayRow}>
                <div className={styles.formGroup}>
                  <label>Pausar às</label>
                  <input
                    type="time"
                    value={pauseStart}
                    onChange={(e) => setPauseStart(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Retomar às</label>
                  <input
                    type="time"
                    value={pauseEnd}
                    onChange={(e) => setPauseEnd(e.target.value)}
                  />
                </div>
              </div>
              <span className={styles.hint}>
                O disparo pausa automaticamente neste horário para evitar envios de madrugada.
              </span>
            </div>

            {/* Resumo */}
            <div className={styles.preview}>
              <h4>Resumo da Campanha</h4>
              <div className={styles.previewRow}><span>Nome</span><span>{name}</span></div>
              <div className={styles.previewRow}><span>Instância</span><span>{selectedInstance?.name || '—'}</span></div>
              <div className={styles.previewRow}><span>Tags</span><span>{selectedTagIds.length} selecionada(s)</span></div>
              <div className={styles.previewRow}><span>Spintax</span><span>{useSpintax ? 'Ativo' : 'Desativado'}</span></div>
              <div className={styles.previewRow}><span>Delay</span><span>{minDelay}s – {maxDelay}s</span></div>
              <div className={styles.previewRow}><span>Pausa Noturna</span><span>{pauseStart} → {pauseEnd}</span></div>
            </div>
          </GlassCard>
        )}

        {/* Navigation buttons */}
        <div className={styles.footer}>
          {currentStep > 0 ? (
            <button className={styles.backBtn} onClick={() => setCurrentStep((s) => s - 1)}>
              <ArrowLeft size={18} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              className={styles.nextBtn}
              disabled={!canAdvance()}
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Próximo <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className={styles.nextBtn}
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? <Loader2 size={18} className={styles.spin} /> : <Check size={18} />}
              {isSubmitting ? 'Criando...' : 'Criar Campanha'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
