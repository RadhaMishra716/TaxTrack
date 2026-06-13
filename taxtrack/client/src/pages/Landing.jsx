import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'taxpayer') navigate('/taxpayer/dashboard');
    if (user?.role === 'government') navigate('/gov/dashboard');
  }, [user]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0d1b2a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", color: '#e8d5b0', padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏛️</div>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '0.05em', margin: 0,
          background: 'linear-gradient(135deg, #f5c518, #e8a800)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent' }}>TaxTrack</h1>
        <p style={{ fontSize: '1.1rem', color: '#9ca3af', marginTop: '0.5rem', fontStyle: 'italic' }}>
          Transparent Tax. Accountable Governance.
        </p>
        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #f5c518, transparent)',
          margin: '1rem auto' }}></div>
      </div>

      {/* Portal Cards */}
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Taxpayer Portal */}
        <div onClick={() => navigate('/taxpayer/login')}
          style={{
            background: 'linear-gradient(145deg, #1a2332, #1e2d42)', border: '1px solid #2a3a52',
            borderRadius: '20px', padding: '3rem 2.5rem', width: '280px', cursor: 'pointer',
            transition: 'all 0.3s ease', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = '#f5c518';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(245,197,24,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#2a3a52';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
          }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>👤</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f5c518', margin: '0 0 0.75rem' }}>
            Taxpayer Portal
          </h2>
          <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: '0 0 2rem', fontSize: '0.95rem' }}>
            Pay taxes, get your token, and track exactly where your money goes — project by project.
          </p>
          <div style={{ background: 'linear-gradient(135deg, #f5c518, #e8a800)', color: '#0a0f1e',
            padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.95rem',
            display: 'inline-block' }}>
            Enter Portal →
          </div>
        </div>

        {/* Government Portal */}
        <div onClick={() => navigate('/gov/login')}
          style={{
            background: 'linear-gradient(145deg, #1a2332, #1e2d42)', border: '1px solid #2a3a52',
            borderRadius: '20px', padding: '3rem 2.5rem', width: '280px', cursor: 'pointer',
            transition: 'all 0.3s ease', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = '#4ade80';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(74,222,128,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#2a3a52';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
          }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🏛️</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#4ade80', margin: '0 0 0.75rem' }}>
            Government Portal
          </h2>
          <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: '0 0 2rem', fontSize: '0.95rem' }}>
            Manage tax pools, allocate funds to public projects, and maintain fiscal transparency.
          </p>
          <div style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a0f1e',
            padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.95rem',
            display: 'inline-block' }}>
            Enter Portal →
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '4rem', color: '#374151', fontSize: '0.85rem' }}>
        TaxTrack — Powered by Blockchain-Inspired Transparency
      </p>
    </div>
  );
}
