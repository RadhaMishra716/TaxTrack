import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

export default function GovLogin() {
  const [form, setForm] = useState({ officialId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiCall('/auth/gov/login', 'POST', form);
      localStorage.setItem('taxtrack_token', data.token);
      login(data.user);
      navigate('/gov/dashboard');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.9rem 1rem', borderRadius: '10px',
    border: '1px solid #1a3a2a', background: '#0a1a10', color: '#a7f3d0',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Georgia, serif',
  };
  const labelStyle = { display: 'block', color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '0.4rem' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1a10, #0f2318)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '2rem' }}>
      <div style={{ background: '#0f1f15', border: '1px solid #1a3a2a', borderRadius: '20px',
        padding: '3rem', width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🏛️</span>
          <h1 style={{ color: '#34d399', fontSize: '1.8rem', margin: '0.5rem 0 0' }}>Government Portal</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Authorised officers only</p>
        </div>

        {/* Demo hint */}
        <div style={{ background: '#0a2a18', border: '1px solid #1a5a30', borderRadius: '10px',
          padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#6ee7b7' }}>
          <strong>Demo credentials:</strong><br />
          Official ID: <code style={{ color: '#34d399' }}>GOV001</code> &nbsp;|&nbsp;
          Password: <code style={{ color: '#34d399' }}>12345678</code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Official ID</label>
            <input style={inputStyle} placeholder="GOV001" value={form.officialId}
              onChange={e => setForm({ ...form, officialId: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="12345678" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button onClick={handle} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', color: '#0a1a10',
              padding: '0.9rem', border: 'none', borderRadius: '10px', fontWeight: '700',
              fontSize: '1rem', cursor: 'pointer', fontFamily: 'Georgia, serif',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Verifying...' : 'Login'}
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
