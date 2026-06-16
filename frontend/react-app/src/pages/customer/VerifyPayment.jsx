import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';

export default function VerifyPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addAlert } = useApp();
  const [statusText, setStatusText] = useState('Verifying your transaction, please wait...');

  const orderId = searchParams.get('order_id');
  const utr = searchParams.get('utr');
  const status = searchParams.get('status');

  useEffect(() => {
    async function performVerification() {
      if (!orderId || !utr || status !== 'success') {
        navigate('/payment-failed/?error=' + encodeURIComponent('Missing parameters or transaction cancelled.'));
        return;
      }

      try {
        const response = await apiRequest(`/verify-payment/?order_id=${orderId}&utr=${utr}&status=${status}`);
        
        if (response && response.error) {
          navigate(`/payment-failed/?error=${encodeURIComponent(response.error)}`);
        } else if (response && response.order_id) {
          addAlert('Payment verified and order finalized!', 'success');
          navigate(`/order-success/?order_id=${response.order_id}`);
        } else {
          navigate(`/payment-failed/?error=${encodeURIComponent('Could not verify transaction status.')}`);
        }
      } catch (err) {
        console.error('Verification error:', err);
        navigate(`/payment-failed/?error=${encodeURIComponent('Connection issue or server error during verification.')}`);
      }
    }
    
    performVerification();
  }, [orderId, utr, status]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div className="spinner" style={{ borderTopColor: '#e69500', width: '50px', height: '50px' }}></div>
      <h3 style={{ marginTop: '1.5rem', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>{statusText}</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Do not refresh the page or click back.</p>
    </div>
  );
}
