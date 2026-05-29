'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/studio');
      } else {
        setError('Invalid password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050505',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '1rem',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(225,29,72,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          padding: '3rem 2.5rem',
          background: 'rgba(20,20,20,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          animation: shake ? 'shake 0.5s ease' : 'none',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontStyle: 'italic',
            fontSize: '1.75rem',
            color: '#f5f5f5',
            fontWeight: 400,
            margin: 0,
          }}>
            loves<span style={{ color: '#E11D48' }}>·</span>studio
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            admin panel
          </p>
        </div>

        {/* Password field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#888',
            marginBottom: '0.5rem',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter studio password"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#0a0a0a',
              border: '1px solid #262626',
              borderRadius: '8px',
              color: '#f5f5f5',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = '#E11D48'}
            onBlur={(e) => e.target.style.borderColor = '#262626'}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? '#333' : 'linear-gradient(135deg, #E11D48, #9D174D)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
            letterSpacing: '0.05em',
          }}
        >
          {loading ? 'Authenticating...' : 'Enter Studio'}
        </button>
      </form>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
