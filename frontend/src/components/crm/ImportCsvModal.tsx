'use client';
import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useCrmStore } from '../../store/useCrmStore';
import styles from './ImportCsvModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCsvModal = ({ isOpen, onClose }: Props) => {
  const { importCsv, isLoading, importResult } = useCrmStore();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      setError('Apenas arquivos .CSV são suportados.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      await importCsv(file);
    } catch {
      setError('Erro ao importar. Verifique o formato do arquivo.');
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Importar Planilha de Contatos</h3>
          <button onClick={handleClose}><X size={20} /></button>
        </div>

        <div className={styles.body}>
          {importResult ? (
            <div className={styles.result}>
              <CheckCircle size={48} className={styles.successIcon} />
              <h3>Importação Concluída!</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{importResult.created}</span>
                  <span>Criados</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statNum}>{importResult.skipped}</span>
                  <span>Ignorados (duplicatas)</span>
                </div>
              </div>
              <button onClick={handleClose} className={styles.doneBtn}>Fechar</button>
            </div>
          ) : (
            <>
              <div className={styles.formatHint}>
                <FileText size={16} />
                <span>O CSV deve conter as colunas: <code>phone</code> (obrigatório), <code>name</code>, <code>email</code></span>
              </div>

              {error && (
                <div className={styles.error}><AlertCircle size={16} />{error}</div>
              )}

              <div
                className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className={styles.hiddenInput}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <>
                    <FileText size={40} className={styles.fileIcon} />
                    <p className={styles.fileName}>{file.name}</p>
                    <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                  </>
                ) : (
                  <>
                    <Upload size={40} className={styles.uploadIcon} />
                    <p>Arraste o arquivo CSV ou <span>clique aqui</span></p>
                    <span>Máximo: 10MB</span>
                  </>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={handleClose} className={styles.cancelBtn}>Cancelar</button>
                <button
                  onClick={handleImport}
                  className={styles.importBtn}
                  disabled={!file || isLoading}
                >
                  {isLoading ? <Loader2 className={styles.spin} size={18} /> : <Upload size={18} />}
                  {isLoading ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
