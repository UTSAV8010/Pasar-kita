import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, ChevronRight, HelpCircle } from 'lucide-react';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const errorMsg = searchParams.get('error') || 'Transaction verification declined by bank.';

  return (
    <div className="content-wrapper fade-in-up" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div className="glass-card-light" style={{ padding: '3.5rem 2rem', borderRadius: '24px', maxWidth: '550px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '1.5rem' }}>
          <XCircle size={40} />
        </div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Payment Verification Failed</h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>We could not verify your online transaction. Please check details or select a different payment option.</p>
        
        <div style={{
          background: '#fffcfc',
          borderRadius: '12px',
          padding: '16px 20px',
          fontWeight: 600,
          color: '#b91c1c',
          fontSize: '0.95rem',
          border: '1px solid #fee2e2',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <strong>Error:</strong> {errorMsg}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/mycart/" style={{
            flex: 1,
            background: '#ef4444',
            color: '#fff',
            padding: '12px 0',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }} className="hover-lift">Try Checkout Again</Link>
          <Link to="/contact/" style={{
            flex: 1,
            background: 'none',
            border: '1px solid #cbd5e1',
            color: '#475569',
            padding: '12px 0',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }} className="hover-lift">Contact Support <HelpCircle size={16} /></Link>
        </div>
      </div>
    </div>
  );
}
