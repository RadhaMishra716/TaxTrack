import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

export default function TaxpayerLogin() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', pan: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/taxpayer/login' : '/auth/taxpayer/register';
      const data = await apiCall(endpoint, 'POST', form);
      localStorage.setItem('taxtrack_token', data.token);
      login(data.user);
      navigate('/taxpayer/dashboard');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.9rem 1rem', borderRadius: '10px',
    border: '1px solid #2a3a52', background: '#0d1829', color: '#e8d5b0',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Georgia, serif'
  };
  const labelStyle = { display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.4rem' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e, #111827)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '2rem' }}>
      <div style={{ background: '#111827', border: '1px solid #2a3a52', borderRadius: '20px',
        padding: '3rem', width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>👤</span>
          <h1 style={{ color: '#f5c518', fontSize: '1.8rem', margin: '0.5rem 0 0' }}>Taxpayer Portal</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: '#0d1829', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === m ? '#f5c518' : 'transparent',
                color: mode === m ? '#0a0f1e' : '#9ca3af',
                fontWeight: mode === m ? '700' : '400', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Password hint */}
        <div style={{ background: '#0d1829', border: '1px solid #2a3a52', borderRadius: '10px',
          padding: '0.75rem 1rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#9ca3af' }}>
          🔑 Password for all accounts: <code style={{ color: '#f5c518' }}>12345678</code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} placeholder="Rahul Sharma" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input style={inputStyle} placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>PAN Number (optional)</label>
              <input style={inputStyle} placeholder="ABCDE1234F" value={form.pan}
                onChange={e => setForm({...form, pan: e.target.value.toUpperCase()})} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="12345678" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button onClick={handle} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #f5c518, #e8a800)', color: '#0a0f1e',
              padding: '0.9rem', border: 'none', borderRadius: '10px', fontWeight: '700',
              fontSize: '1rem', cursor: 'pointer', fontFamily: 'Georgia, serif',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to portal selection
          </Link>
        </div>
      </div>
    </div>
  );
}
