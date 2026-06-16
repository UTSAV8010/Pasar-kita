import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="content-wrapper fade-in-up" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div className="glass-card-light" style={{ padding: '3.5rem 2rem', borderRadius: '24px', maxWidth: '550px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={40} />
        </div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Order Placed!</h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>Your order has been received and is currently being processed by the restaurant.</p>
        
        {orderId && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'inline-block',
            fontWeight: 800,
            color: '#e69500',
            fontSize: '1.15rem',
            border: '1px solid #cbd5e1',
            marginBottom: '2rem',
          }}>
            Order ID: #{orderId}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/view-orders/" style={{
            flex: 1,
            background: '#0f172a',
            color: '#fff',
            padding: '12px 0',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
          }} className="hover-lift">View My Orders</Link>
          <Link to="/menu/" style={{
            flex: 1,
            background: '#e69500',
            color: '#fff',
            padding: '12px 0',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }} className="hover-lift">Order More <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}
