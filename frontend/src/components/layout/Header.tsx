import React from 'react';
import { Bell, Search } from 'lucide-react';
import styles from './Header.module.css';

export const Header = ({ title }: { title: string }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      
      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Buscar..." className={styles.searchInput} />
        </div>
        
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}></span>
        </button>
      </div>
    </header>
  );
};
