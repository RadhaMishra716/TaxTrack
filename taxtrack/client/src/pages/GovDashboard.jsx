import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

const DEPARTMENTS = [
  'Ministry of Infrastructure', 'Ministry of Health', 'Ministry of Education',
  'Ministry of Defence', 'Ministry of Agriculture', 'Ministry of Technology', 'Ministry of Environment'
];

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#111827', border: '1px solid #2a3a52', borderRadius: '20px',
        width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem', borderBottom: '1px solid #1f2937' }}>
          <h2 style={{ margin: 0, color: '#4ade80', fontSize: '1.2rem' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280',
            fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default function GovDashboard() {
  const { user, logout } = useAuth();
  const [pools, setPools] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(null); // pool object
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [allocForm, setAllocForm] = useState({ projectName: '', amount: '', department: DEPARTMENTS[0], description: '' });
  const [poolForm, setPoolForm] = useState({ name: '', taxCategory: '', description: '' });
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const load = async () => {
    try {
      const [pl, pay] = await Promise.all([apiCall('/pools'), apiCall('/payments/all')]);
      setPools(pl);
      setAllPayments(pay);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const allocate = async () => {
    try {
      await apiCall(`/pools/${showAllocate._id}/allocate`, 'POST', {
        ...allocForm, amount: parseFloat(allocForm.amount)
      });
      setMsg('✓ Funds allocated successfully!');
      setShowAllocate(null);
      setAllocForm({ projectName: '', amount: '', department: DEPARTMENTS[0], description: '' });
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch(e) { setMsg('✗ ' + e.message); }
  };

  const createPool = async () => {
    try {
      await apiCall('/pools', 'POST', poolForm);
      setShowCreatePool(false);
      setPoolForm({ name: '', taxCategory: '', description: '' });
      load();
    } catch(e) { alert(e.message); }
  };

  const totalCollected = allPayments.reduce((s, p) => s + p.amount, 0);
  const totalAllocated = pools.reduce((s, p) => s + (p.totalCollected - p.balance), 0);
  const totalInPools = pools.reduce((s, p) => s + p.balance, 0);

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
    border: '1px solid #2a3a52', background: '#0d1829', color: '#e8d5b0',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif'
  };
  const labelStyle = { display: 'block', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '0.4rem', marginTop: '0.75rem' };
  const tabStyle = (active) => ({
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#4ade80' : '#1f2937', color: active ? '#0a0f1e' : '#9ca3af',
    fontWeight: active ? '700' : '400', fontFamily: 'Georgia, serif', fontSize: '0.9rem'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a120d', fontFamily: 'Georgia, serif', color: '#e8d5b0' }}>
      {/* Nav */}
      <nav style={{ background: '#0f1f15', borderBottom: '1px solid #1a3a2a', padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '1.3rem' }}>TaxTrack</span>
          <span style={{ background: '#1a3a2a', color: '#86efac', padding: '0.2rem 0.6rem',
            borderRadius: '6px', fontSize: '0.75rem' }}>Government Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            {user?.name || 'Official'} ({user?.officialId || 'GOV'})
          </span>
          <button onClick={logout} style={{ background: '#1a3a2a', color: '#ef4444', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            Logout
          </button>
        </div>
      </nav>

      {msg && (
        <div style={{ background: msg.startsWith('✓') ? '#14532d' : '#450a0a', color: msg.startsWith('✓') ? '#4ade80' : '#ef4444',
          padding: '0.75rem 2rem', textAlign: 'center', fontSize: '0.9rem' }}>{msg}</div>
      )}

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#4ade80', fontSize: '2rem', margin: '0 0 0.25rem' }}>Government Finance Dashboard</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Manage public funds, allocate to projects, maintain fiscal transparency</p>
          </div>
          <button onClick={() => setShowCreatePool(true)}
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a0f1e',
              border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.95rem' }}>
            + Create Pool
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '💰', color: '#f5c518' },
            { label: 'In Pools (Unallocated)', value: `₹${totalInPools.toLocaleString()}`, icon: '🏦', color: '#60a5fa' },
            { label: 'Allocated to Projects', value: `₹${totalAllocated.toLocaleString()}`, icon: '🏗️', color: '#4ade80' },
            { label: 'Total Taxpayers', value: new Set(allPayments.map(p => p.taxpayer)).size, icon: '👥', color: '#a78bfa' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: '#0f1f15', border: `1px solid ${color}33`,
              borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '900', color }}>{value}</div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['overview', 'payments', 'allocations'].map(t => (
            <button key={t} style={tabStyle(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t === 'overview' ? '🏦 Tax Pools' : t === 'payments' ? '💸 All Payments' : '🏗️ Allocations'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {loading ? (
              <p style={{ color: '#6b7280' }}>Loading pools...</p>
            ) : pools.length === 0 ? (
              <div style={{ background: '#0f1f15', border: '1px solid #1a3a2a', borderRadius: '16px',
                padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p>No pools yet. Create one to start collecting taxes.</p>
              </div>
            ) : pools.map(pool => {
              const allocated = pool.totalCollected - pool.balance;
              const pct = pool.totalCollected > 0 ? (allocated / pool.totalCollected) * 100 : 0;
              return (
                <div key={pool._id} style={{ background: '#0f1f15', border: '1px solid #1a3a2a',
                  borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #0a1a12, #112211)', padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #1a3a2a' }}>
                    <h3 style={{ margin: '0 0 0.25rem', color: '#4ade80', fontSize: '1.1rem' }}>{pool.name}</h3>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{pool.taxCategory}</div>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Available Balance</div>
                        <div style={{ color: '#4ade80', fontWeight: '900', fontSize: '1.3rem' }}>
                          ₹{pool.balance.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Total Collected</div>
                        <div style={{ color: '#f5c518', fontWeight: '700', fontSize: '1rem' }}>
                          ₹{pool.totalCollected.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {/* Allocation bar */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                        <span>Allocated</span><span>{pct.toFixed(1)}%</span>
                      </div>
                      <div style={{ background: '#1a3a2a', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                          width: `${pct}%`, borderRadius: '6px', transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '1rem' }}>
                      {pool.allocations?.length || 0} project allocations • ₹{allocated.toLocaleString()} allocated
                    </div>
                    {/* Allocations list */}
                    {pool.allocations?.slice(0, 2).map((a, i) => (
                      <div key={i} style={{ background: '#0a1a12', borderRadius: '8px', padding: '0.5rem 0.75rem',
                        marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{a.projectName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{a.department}</div>
                        </div>
                        <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.85rem' }}>₹{a.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {(pool.allocations?.length || 0) > 2 && (
                      <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        +{pool.allocations.length - 2} more...
                      </div>
                    )}
                    <button onClick={() => setShowAllocate(pool)}
                      style={{ width: '100%', background: pool.balance > 0 ? 'linear-gradient(135deg, #4ade80, #22c55e)' : '#1a3a2a',
                        color: pool.balance > 0 ? '#0a0f1e' : '#6b7280', border: 'none', padding: '0.7rem',
                        borderRadius: '8px', fontWeight: '700', cursor: pool.balance > 0 ? 'pointer' : 'not-allowed',
                        fontFamily: 'Georgia, serif', fontSize: '0.9rem', marginTop: '0.25rem' }}
                      disabled={pool.balance <= 0}>
                      {pool.balance > 0 ? '🏗️ Allocate to Project' : 'Pool Empty'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'payments' && (
          <div style={{ background: '#0f1f15', border: '1px solid #1a3a2a', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1a3a2a', color: '#9ca3af', fontSize: '0.85rem' }}>
              All tax payments received ({allPayments.length})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0a1a12' }}>
                  {['Token', 'Taxpayer', 'Amount', 'Type', 'Pool', 'Date'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280',
                      fontWeight: '600', fontSize: '0.8rem', borderBottom: '1px solid #1a3a2a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p, i) => {
                  const pool = pools.find(pl => pl._id === p.pool);
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #1a3a2a',
                      background: i % 2 === 0 ? 'transparent' : '#0a1a12' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#f5c518', fontSize: '0.85rem' }}>
                        #{p.tokenCode}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e8d5b0' }}>{p.taxpayerName || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4ade80', fontWeight: '700' }}>₹{p.amount.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.82rem' }}>{p.taxType?.replace('_', ' ')}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#a78bfa', fontSize: '0.82rem' }}>{pool?.name || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.82rem' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'allocations' && (
          <div style={{ background: '#0f1f15', border: '1px solid #1a3a2a', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1a3a2a' }}>
              <span style={{ color: '#4ade80', fontWeight: '700' }}>All Project Allocations</span>
            </div>
            {pools.flatMap(pool =>
              (pool.allocations || []).map((a, i) => ({ ...a, poolName: pool.name, poolId: pool._id }))
            ).length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No allocations yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0a1a12' }}>
                    {['Project', 'Department', 'Amount', 'Pool', 'Date', 'Description'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b7280',
                        fontWeight: '600', fontSize: '0.8rem', borderBottom: '1px solid #1a3a2a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pools.flatMap(pool =>
                    (pool.allocations || []).map((a, i) => (
                      <tr key={`${pool._id}-${i}`} style={{ borderBottom: '1px solid #1a3a2a' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#e8d5b0' }}>{a.projectName}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.82rem' }}>{a.department}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#4ade80', fontWeight: '700' }}>₹{a.amount.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#a78bfa', fontSize: '0.82rem' }}>{pool.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.82rem' }}>
                          {new Date(a.allocatedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.8rem' }}>{a.description || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Allocate Modal */}
      {showAllocate && (
        <Modal title={`Allocate from: ${showAllocate.name}`} onClose={() => setShowAllocate(null)}>
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Available: <span style={{ color: '#4ade80', fontWeight: '700' }}>₹{showAllocate.balance.toLocaleString()}</span>
          </div>
          <label style={labelStyle}>Project Name</label>
          <input style={inputStyle} placeholder="e.g. National Highway NH-48 Expansion"
            value={allocForm.projectName} onChange={e => setAllocForm({...allocForm, projectName: e.target.value})} />
          <label style={labelStyle}>Amount (₹)</label>
          <input style={inputStyle} type="number" placeholder="0"
            value={allocForm.amount} onChange={e => setAllocForm({...allocForm, amount: e.target.value})} />
          <label style={labelStyle}>Department</label>
          <select style={{ ...inputStyle }} value={allocForm.department}
            onChange={e => setAllocForm({...allocForm, department: e.target.value})}>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <label style={labelStyle}>Description (optional)</label>
          <input style={inputStyle} placeholder="Brief project description..."
            value={allocForm.description} onChange={e => setAllocForm({...allocForm, description: e.target.value})} />
          <button onClick={allocate}
            style={{ width: '100%', background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a0f1e',
              border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1rem', marginTop: '1.25rem' }}>
            Allocate Funds
          </button>
        </Modal>
      )}

      {/* Create Pool Modal */}
      {showCreatePool && (
        <Modal title="Create New Tax Pool" onClose={() => setShowCreatePool(false)}>
          <label style={labelStyle}>Pool Name</label>
          <input style={inputStyle} placeholder="e.g. Infrastructure Development Pool"
            value={poolForm.name} onChange={e => setPoolForm({...poolForm, name: e.target.value})} />
          <label style={labelStyle}>Tax Category</label>
          <input style={inputStyle} placeholder="e.g. Income Tax, GST, Corporate Tax"
            value={poolForm.taxCategory} onChange={e => setPoolForm({...poolForm, taxCategory: e.target.value})} />
          <label style={labelStyle}>Description</label>
          <input style={inputStyle} placeholder="Purpose of this pool..."
            value={poolForm.description} onChange={e => setPoolForm({...poolForm, description: e.target.value})} />
          <button onClick={createPool}
            style={{ width: '100%', background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a0f1e',
              border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1rem', marginTop: '1.25rem' }}>
            Create Pool
          </button>
        </Modal>
      )}
    </div>
  );
}
