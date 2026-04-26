'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    password: '', password_confirm: '', role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      alert('Registration connected to Django backend. Start the API server for full functionality.');
    }, 1000);
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  return (
    <>
      <Navbar />
      <div className={styles.authPage}>
        <div className={styles.authLeft}>
          <div className={styles.authIllustration}>
            <div className={styles.illustrationContent}>
              <span className={styles.bigEmoji}>🌱</span>
              <h2 className={styles.illustTitle}>Join Fresh Roots</h2>
              <p className={styles.illustSubtitle}>
                Start your journey to fresher, healthier food — straight from local farms.
              </p>
              <div className={styles.illustStats}>
                <div>✅ Free to join</div>
                <div>🚚 Fast delivery</div>
                <div>💚 Support farmers</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.authRight}>
          <div className={styles.authForm}>
            <div className={styles.formHeader}>
              <h1>Create Account</h1>
              <p>Join as a customer or farmer</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Role selector */}
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === 'customer' ? styles.roleActive : ''}`}
                onClick={() => updateField('role', 'customer')}
              >
                🛒 Customer
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === 'farmer' ? styles.roleActive : ''}`}
                onClick={() => updateField('role', 'farmer')}
              >
                🚜 Farmer
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.twoCol}>
                <div className="input-group">
                  <label htmlFor="signup-first">First Name</label>
                  <input id="signup-first" className="input-field" type="text" placeholder="John"
                    value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-last">Last Name</label>
                  <input id="signup-last" className="input-field" type="text" placeholder="Doe"
                    value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-username">Username</label>
                <input id="signup-username" className="input-field" type="text" placeholder="johndoe"
                  value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
              </div>

              <div className="input-group">
                <label htmlFor="signup-email">Email</label>
                <input id="signup-email" className="input-field" type="email" placeholder="john@example.com"
                  value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
              </div>

              <div className={styles.twoCol}>
                <div className="input-group">
                  <label htmlFor="signup-password">Password</label>
                  <input id="signup-password" className="input-field" type="password" placeholder="••••••••"
                    value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <input id="signup-confirm" className="input-field" type="password" placeholder="••••••••"
                    value={form.password_confirm} onChange={(e) => updateField('password_confirm', e.target.value)} required />
                </div>
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : '🌱 Create Account'}
              </button>
            </form>

            <div className={styles.divider}><span>or</span></div>

            <p className={styles.switchAuth}>
              Already have an account? <Link href="/login" className={styles.switchLink}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
