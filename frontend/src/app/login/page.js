'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './auth.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      alert('Login functionality connected to Django backend API. Start the backend server to enable full auth.');
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <div className={styles.authPage}>
        <div className={styles.authLeft}>
          <div className={styles.authIllustration}>
            <div className={styles.illustrationContent}>
              <span className={styles.bigEmoji}>🌿</span>
              <h2 className={styles.illustTitle}>Welcome Back</h2>
              <p className={styles.illustSubtitle}>
                Your farm-fresh favorites are waiting for you.
              </p>
              <div className={styles.illustStats}>
                <div>🥬 45+ Vegetables</div>
                <div>🚜 12 Local Farms</div>
                <div>🌱 Always Fresh</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.authRight}>
          <div className={styles.authForm}>
            <div className={styles.formHeader}>
              <h1>Log In</h1>
              <p>Enter your credentials to access your account</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="input-field"
                  type="text"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="input-field"
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  '🌱 Log In'
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <p className={styles.switchAuth}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className={styles.switchLink}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
