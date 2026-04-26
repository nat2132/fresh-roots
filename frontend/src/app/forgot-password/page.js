'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from '../login/auth.module.css';
import fpStyles from './forgot.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <div className={fpStyles.page}>
        <div className={fpStyles.card}>
          {!sent ? (
            <>
              <div className={fpStyles.icon}>🌿</div>
              <h1 className={fpStyles.title}>Forgot Password?</h1>
              <p className={fpStyles.subtitle}>
                No worries! Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="fp-email">Email Address</label>
                  <input
                    id="fp-email"
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                  {loading ? <span className={styles.spinner}></span> : 'Send Reset Link'}
                </button>
              </form>

              <Link href="/login" className={fpStyles.backLink}>← Back to Login</Link>
            </>
          ) : (
            <div className={fpStyles.success}>
              <div className={fpStyles.successIcon}>📬</div>
              <h2>Check Your Inbox!</h2>
              <p>
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Follow the instructions to create a new password.
              </p>
              <div className={fpStyles.steps}>
                <div className={fpStyles.step}>
                  <span className={fpStyles.stepNum}>1</span>
                  <span>Open the email</span>
                </div>
                <div className={fpStyles.step}>
                  <span className={fpStyles.stepNum}>2</span>
                  <span>Click the reset link</span>
                </div>
                <div className={fpStyles.step}>
                  <span className={fpStyles.stepNum}>3</span>
                  <span>Create new password</span>
                </div>
              </div>
              <Link href="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
