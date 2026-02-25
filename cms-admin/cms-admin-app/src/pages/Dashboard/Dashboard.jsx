import React from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/Auth/LogoutButton';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.user}>Signed in as <strong>{user?.username}</strong></div>
        <LogoutButton />
      </header>

      <section className={styles.panel}>
        <p>Welcome to the admin area. Use the sidebar to manage properties, reviews, and content.</p>
      </section>
    </main>
  );
}

