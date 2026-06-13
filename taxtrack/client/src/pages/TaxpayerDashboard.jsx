import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#111827', border: `1px solid ${color}33`, borderRadius: '16px',
      padding: '1.5rem', flex: 1, minWidth: '180px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: '900', color }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

export default function TaxpayerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, pl] = await Promise.all([
          apiCall('/payments/my'),
          apiCall('/pools')
        ]);
        setPayments(p);
        setPools(pl);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  const navStyle = {
    background: '#0d1829', border: '1px solid #2a3a52', borderRadius: '12px',
    padding: '0.75rem 1.25rem', color: '#e8d5b0', textDecoration: 'none',
    fontFamily: 'Georgia, serif', fontSize: '0.9rem', cursor: 'pointer',
    display: 'inline-block', transition: 'all 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif', color: '#e8d5b0' }}>
      {/* Top Nav */}
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span style={{ color: '#f5c518', fontWeight: '900', fontSize: '1.3rem' }}>TaxTrack</span>
          <span style={{ background: '#1f2937', color: '#9ca3af', padding: '0.2rem 0.6rem',
            borderRadius: '6px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>Taxpayer</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/taxpayer/pay" style={{ ...navStyle, background: '#f5c518', color: '#0a0f1e', fontWeight: '700', border: 'none' }}>
            + Pay Tax
          </Link>
          <Link to="/taxpayer/track" style={navStyle}>Track Payments</Link>
          <button onClick={logout} style={{ ...navStyle, background: 'transparent', color: '#ef4444', border: '1px solid #ef444433' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: '#f5c518' }}>
            Welcome, {user?.name || 'Taxpayer'} 👋
          </h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>
            PAN: {user?.pan || 'N/A'} | Your tax contributions are transparent and trackable
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <StatCard icon="💰" label="Total Tax Paid" value={`₹${totalPaid.toLocaleString()}`} color="#f5c518" />
          <StatCard icon="🎫" label="Payments Made" value={payments.length} color="#60a5fa" />
          <StatCard icon="🏗️" label="Active Pools" value={pools.length} color="#4ade80" />
          <StatCard icon="✅" label="Status" value="Compliant" color="#34d399" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Recent Payments */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ color: '#f5c518', margin: '0 0 1.25rem', fontSize: '1.2rem' }}>Recent Payments</h2>
            {loading ? (
              <p style={{ color: '#6b7280' }}>Loading...</p>
            ) : payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💸</div>
                <p style={{ color: '#6b7280' }}>No payments yet</p>
                <Link to="/taxpayer/pay" style={{ color: '#f5c518', fontSize: '0.9rem' }}>Make your first payment →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {payments.slice(0, 5).map(p => (
                  <div key={p._id} style={{ background: '#0d1829', borderRadius: '10px', padding: '0.9rem 1rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>₹{p.amount.toLocaleString()}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{p.taxType} • {new Date(p.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ background: '#1a3a52', color: '#60a5fa', padding: '0.2rem 0.6rem',
                        borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        #{p.tokenCode}
                      </div>
                      <div style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '0.25rem' }}>✓ Confirmed</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tax Pools */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ color: '#4ade80', margin: '0 0 1.25rem', fontSize: '1.2rem' }}>Tax Pool Overview</h2>
            {pools.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No pools available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pools.map(pool => (
                  <div key={pool._id} style={{ background: '#0d1829', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700' }}>{pool.name}</span>
                      <span style={{ color: '#4ade80', fontWeight: '700' }}>₹{pool.balance.toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      Total Collected: ₹{pool.totalCollected.toLocaleString()}
                    </div>
                    <div style={{ background: '#1f2937', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '6px',
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        width: `${Math.min((pool.balance / Math.max(pool.totalCollected, 1)) * 100, 100)}%` }}>
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                      {pool.allocations?.length || 0} project allocations
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px',
          padding: '1.5rem', marginTop: '1.5rem' }}>
          <h2 style={{ color: '#e8d5b0', margin: '0 0 1.25rem', fontSize: '1.2rem' }}>How Your Tax Money Flows</h2>
          <div style={{ display: 'flex', gap: '0', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '💸', label: 'You pay tax', color: '#f5c518' },
              { icon: '→', label: '', color: '#374151' },
              { icon: '🎫', label: 'Token generated', color: '#60a5fa' },
              { icon: '→', label: '', color: '#374151' },
              { icon: '🏦', label: 'Enters tax pool', color: '#a78bfa' },
              { icon: '→', label: '', color: '#374151' },
              { icon: '🏗️', label: 'Allocated to projects', color: '#4ade80' },
              { icon: '→', label: '', color: '#374151' },
              { icon: '👁️', label: 'You track it all', color: '#f97316' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>
                <div style={{ fontSize: step.icon === '→' ? '1.5rem' : '1.8rem', color: step.color }}>{step.icon}</div>
                {step.label && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>{step.label}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
