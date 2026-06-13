import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';

const TAX_TYPES = [
  { value: 'income_tax', label: 'Income Tax', icon: '💼' },
  { value: 'gst', label: 'GST', icon: '🏬' },
  { value: 'property_tax', label: 'Property Tax', icon: '🏠' },
  { value: 'corporate_tax', label: 'Corporate Tax', icon: '🏢' },
  { value: 'customs_duty', label: 'Customs Duty', icon: '🚢' },
];

export default function PayTax() {
  const [form, setForm] = useState({ amount: '', taxType: 'income_tax', description: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const pay = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      const data = await apiCall('/payments', 'POST', {
        amount: parseFloat(form.amount),
        taxType: form.taxType,
        description: form.description
      });
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.9rem 1rem', borderRadius: '10px',
    border: '1px solid #2a3a52', background: '#0d1829', color: '#e8d5b0',
    fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif'
  };

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#111827', border: '1px solid #2a3a52', borderRadius: '20px',
          padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          {/* Success animation */}
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>✓</div>
          <h2 style={{ color: '#4ade80', fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Payment Successful!</h2>
          <p style={{ color: '#9ca3af', margin: '0 0 2rem' }}>Your tax has been received and your token is ready</p>

          {/* Token Card */}
          <div style={{ background: 'linear-gradient(135deg, #0d1829, #1a2642)', border: '1px solid #f5c51833',
            borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem',
            boxShadow: '0 0 40px rgba(245,197,24,0.1)' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Your Tax Token</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace',
              color: '#f5c518', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              #{result.payment.tokenCode}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
              {[
                { l: 'Amount', v: `₹${result.payment.amount.toLocaleString()}`, c: '#4ade80' },
                { l: 'Tax Type', v: result.payment.taxType.replace('_', ' ').toUpperCase(), c: '#60a5fa' },
                { l: 'Pool', v: result.pool.name, c: '#a78bfa' },
                { l: 'Date', v: new Date(result.payment.createdAt).toLocaleDateString('en-IN'), c: '#f97316' },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: '#0a0f1e', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{l}</div>
                  <div style={{ color: c, fontWeight: '700', fontSize: '0.9rem', marginTop: '0.2rem' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pool info */}
          <div style={{ background: '#0d1829', border: '1px solid #1f2937', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Accumulated in Pool</div>
            <div style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: '900' }}>₹{result.pool.balance.toLocaleString()}</div>
            <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>{result.pool.name} — {result.pool.allocations?.length || 0} active projects</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setResult(null)}
              style={{ flex: 1, background: '#1f2937', color: '#e8d5b0', border: 'none', borderRadius: '10px',
                padding: '0.9rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              Pay Again
            </button>
            <button onClick={() => navigate('/taxpayer/track')}
              style={{ flex: 1, background: 'linear-gradient(135deg, #f5c518, #e8a800)', color: '#0a0f1e',
                border: 'none', borderRadius: '10px', padding: '0.9rem', cursor: 'pointer',
                fontWeight: '700', fontFamily: 'Georgia, serif' }}>
              Track Money →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'Georgia, serif', color: '#e8d5b0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2937', padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span style={{ color: '#f5c518', fontWeight: '900', fontSize: '1.3rem' }}>TaxTrack</span>
        </div>
        <Link to="/taxpayer/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: '560px', margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ color: '#f5c518', fontSize: '2rem', marginBottom: '0.5rem' }}>Pay Your Tax</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Your payment enters a pool. You'll receive a unique token to track it.
        </p>

        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Tax Type
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TAX_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm({...form, taxType: t.value})}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid',
                    borderColor: form.taxType === t.value ? '#f5c518' : '#2a3a52',
                    background: form.taxType === t.value ? '#f5c51822' : '#0d1829',
                    color: form.taxType === t.value ? '#f5c518' : '#9ca3af',
                    cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Amount (₹)
            </label>
            <input style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: '700' }}
              type="number" placeholder="0.00" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Description (optional)
            </label>
            <input style={inputStyle} placeholder="e.g. FY 2024-25 income tax"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          {/* Preview */}
          {form.amount && parseFloat(form.amount) > 0 && (
            <div style={{ background: '#0d1829', border: '1px solid #f5c51833', borderRadius: '12px',
              padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Payment Preview</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#e8d5b0' }}>Tax Amount</span>
                <span style={{ color: '#f5c518', fontWeight: '700' }}>₹{parseFloat(form.amount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Processing Fee</span>
                <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>₹0 (Nil)</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

          <button onClick={pay} disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg, #f5c518, #e8a800)', color: '#0a0f1e',
              padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: '900',
              fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'Georgia, serif',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Processing...' : '💸 Pay & Get Token'}
          </button>
        </div>
      </div>
    </div>
  );
}
