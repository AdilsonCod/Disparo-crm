import React from 'react';
import styles from './Login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          Z<span>aapp</span>
        </div>
        <h2 className={styles.title}>Bem-vindo de volta</h2>
        <p className={styles.subtitle}>Faça login para acessar o painel</p>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="seu@email.com" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" placeholder="••••••••" />
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Entrar
          </button>
        </form>
        
        <div className={styles.footer}>
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </div>
      </div>
    </div>
  );
}
