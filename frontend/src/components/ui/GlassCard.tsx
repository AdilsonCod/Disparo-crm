import React from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className = '', glow = false }: GlassCardProps) => {
  return (
    <div className={`${styles.glassCard} ${glow ? styles.glow : ''} ${className}`}>
      {children}
    </div>
  );
};
