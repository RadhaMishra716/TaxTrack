import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../utils/api';

export default function TrackPayment() {
  const [payments, setPayments] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tokenSearch, setTokenSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, pl] = await Promise.all([apiCall('/payments/my'), apiCall('/pools')]);
        setPayments(p);
        setPools(pl);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = payments.filter(p =>
    tokenSearch ? p.tokenCode.includes(tokenSearch.toUpperCase()) : true
  );

  const getPoolForPayment = (payment) => pools.find(p => p._id === payment.pool);

  const STATUS_COLOR = { confirmed: '#4ade80', pending: '#f5c518', failed: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif', color: '#e8d5b0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span style={{ color: '#f5c518', fontWeight: '900', fontSize: '1.3rem' }}>TaxTrack</span>
          <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>/ Track Payments</span>
        </div>
        <Link to="/taxpayer/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#f5c518', margin: '0 0 0.5rem' }}>Track Your Tax Money</h1>
        <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>See exactly where every rupee of your tax goes</p>

        {/* Search */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px',
          padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input style={{ flex: 1, background: 'none', border: 'none', color: '#e8d5b0', fontSize: '1rem',
            outline: 'none', fontFamily: 'Georgia, serif' }}
            placeholder="Search by token code (e.g. TXN-ABC123)..."
            value={tokenSearch} onChange={e => setTokenSearch(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>
          {/* Payments List */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1f2937' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#e8d5b0' }}>
                Your Payments ({filtered.length})
              </h2>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <p>No payments found</p>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filtered.map(p => {
                  const pool = getPoolForPayment(p);
                  return (
                    <div key={p._id} onClick={() => setSelectedPayment(p)}
                      style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1f2937', cursor: 'pointer',
                        background: selectedPayment?._id === p._id ? '#1a2332' : 'transparent',
                        transition: 'background 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ fontWeight: '700', color: '#f5c518', fontFamily: 'monospace' }}>
                          #{p.tokenCode}
                        </div>
                        <div style={{ color: '#4ade80', fontWeight: '700' }}>₹{p.amount.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {p.taxType.replace('_', ' ')} • {new Date(p.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ background: STATUS_COLOR[p.status] + '22', color: STATUS_COLOR[p.status],
                          fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                          {p.status}
                        </div>
                      </div>
                      {pool && (
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          Pool: {pool.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div>
            {!selectedPayment ? (
              <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px',
                padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                <p>Select a payment to see where your money went</p>
              </div>
            ) : (() => {
              const pool = getPoolForPayment(selectedPayment);
              return (
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #0d1829, #1a2642)',
                    padding: '1.5rem', borderBottom: '1px solid #1f2937' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Token</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'monospace',
                      color: '#f5c518', marginTop: '0.25rem' }}>#{selectedPayment.tokenCode}</div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    {/* Payment Details */}
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Payment Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {[
                        { l: 'Amount', v: `₹${selectedPayment.amount.toLocaleString()}`, c: '#4ade80' },
                        { l: 'Tax Type', v: selectedPayment.taxType.replace('_', ' ').toUpperCase(), c: '#60a5fa' },
                        { l: 'Date', v: new Date(selectedPayment.createdAt).toLocaleDateString('en-IN'), c: '#e8d5b0' },
                        { l: 'Status', v: selectedPayment.status, c: STATUS_COLOR[selectedPayment.status] },
                      ].map(({ l, v, c }) => (
                        <div key={l} style={{ background: '#0d1829', borderRadius: '8px', padding: '0.75rem' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{l}</div>
                          <div style={{ color: c, fontWeight: '700', marginTop: '0.2rem', fontSize: '0.9rem' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Flow visualization */}
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Fund Flow</h3>

                    {/* Step 1: Payment */}
                    <div style={{ background: '#0d1829', border: '1px solid #f5c51833', borderRadius: '10px',
                      padding: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', background: '#f5c51822', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💸</div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Tax Payment Received</div>
                          <div style={{ color: '#f5c518', fontSize: '0.85rem' }}>₹{selectedPayment.amount.toLocaleString()}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.8rem' }}>✓ Done</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', color: '#374151', fontSize: '1.2rem', margin: '0.25rem 0' }}>↓</div>

                    {/* Step 2: Pool */}
                    {pool && (
                      <>
                        <div style={{ background: '#0d1829', border: '1px solid #a78bfa33', borderRadius: '10px',
                          padding: '1rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', background: '#a78bfa22', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏦</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Entered Tax Pool</div>
                              <div style={{ color: '#a78bfa', fontSize: '0.85rem' }}>{pool.name}</div>
                              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                Pool Balance: ₹{pool.balance.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ color: '#4ade80', fontSize: '0.8rem' }}>✓ Done</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', color: '#374151', fontSize: '1.2rem', margin: '0.25rem 0' }}>↓</div>

                        {/* Step 3: Allocations */}
                        <div style={{ background: '#0d1829', border: '1px solid #4ade8033', borderRadius: '10px', padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', background: '#4ade8022', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏗️</div>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Project Allocations from Pool</div>
                              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{pool.allocations?.length || 0} projects funded</div>
                            </div>
                          </div>
                          {pool.allocations?.length > 0 ? (
                            pool.allocations.map((a, i) => (
                              <div key={i} style={{ background: '#0a0f1e', borderRadius: '8px', padding: '0.6rem 0.75rem',
                                marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{a.projectName}</div>
                                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{a.department} • {new Date(a.allocatedAt).toLocaleDateString('en-IN')}</div>
                                </div>
                                <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '0.9rem' }}>₹{a.amount.toLocaleString()}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>
                              No allocations yet — funds accumulating in pool
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
