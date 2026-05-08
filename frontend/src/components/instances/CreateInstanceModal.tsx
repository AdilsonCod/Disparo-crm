import React, { useState } from 'react';
import { X, QrCode, RefreshCw } from 'lucide-react';
import styles from './Modal.module.css';

interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<{ instance: any, qrCodeBase64: string | null }>;
}

export const CreateInstanceModal = ({ isOpen, onClose, onCreate }: CreateInstanceModalProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const result = await onCreate(name);
      if (result.qrCodeBase64) {
        setQrCode(result.qrCodeBase64);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar instância');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setQrCode(null);
    setError('');
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{qrCode ? 'Escaneie o QR Code' : 'Nova Conexão WhatsApp'}</h3>
          <button onClick={handleClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          {!qrCode ? (
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Nome da Conexão (Ex: Suporte, Vendas)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Meu WhatsApp..."
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isLoading || !name.trim()}>
                {isLoading ? <RefreshCw className={styles.spin} size={20} /> : 'Gerar QR Code'}
              </button>
            </form>
          ) : (
            <div className={styles.qrCodeContainer}>
              <div className={styles.qrCodeWrapper}>
                <img src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" />
              </div>
              <p className={styles.instruction}>
                1. Abra o WhatsApp no seu celular.<br/>
                2. Toque em <b>Mais opções</b> ou <b>Configurações</b>.<br/>
                3. Toque em <b>Aparelhos conectados</b> {'>'} <b>Conectar um aparelho</b>.<br/>
                4. Aponte a câmera para esta tela.
              </p>
              <button onClick={handleClose} className={styles.doneBtn}>
                Pronto, já escaneei!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
