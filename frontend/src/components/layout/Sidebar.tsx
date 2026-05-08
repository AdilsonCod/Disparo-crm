import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, PhoneCall, Settings, Users } from 'lucide-react';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          Z<span>aapp</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.navItem}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/instances" className={styles.navItem}>
          <PhoneCall size={20} />
          <span>Conexões</span>
        </Link>
        <Link href="/crm" className={styles.navItem}>
          <Users size={20} />
          <span>CRM</span>
        </Link>
        <Link href="/campaigns" className={styles.navItem}>
          <MessageSquare size={20} />
          <span>Campanhas</span>
        </Link>
        <Link href="/chat" className={styles.navItem}>
          <MessageSquare size={20} />
          <span>Atendimento</span>
        </Link>
        <Link href="/settings" className={styles.navItem}>
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>Admin</p>
            <p className={styles.userRole}>Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
