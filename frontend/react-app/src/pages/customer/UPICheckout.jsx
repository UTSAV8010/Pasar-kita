import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { QrCode, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UPICheckout() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const navigate = useNavigate();
  const { addAlert } = useApp();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadGatewayDetails() {
      if (!orderId || !amount) {
        setLoading(false);
        return;
      }
      try {
        const url = `/pg/checkout/?order_id=${orderId}&amount=${amount}`;
        const data = await apiRequest(url);
        if (data) {
          setCheckoutData(data);
        }
      } catch (err) {
        console.error('Failed to load gateway details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGatewayDetails();
  }, [orderId, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr) {
      addAlert('Please enter your 12-digit transaction UTR number', 'warning');
      return;
    }
    if (!/^\d{12}$/.test(utr.trim())) {
      addAlert('UTR must be exactly 12 digits', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('order_id', String(orderId));
      data.append('amount', String(amount));
      data.append('utr', utr.trim());

      // Submit UTR verification
      const response = await apiRequest('/pg/process/', {
        method: 'POST',
        body: data,
        skipRedirect: true,
      });

      if (response && response.status === 'redirect' && response.redirect) {
        addAlert('Payment UTR submitted. Verifying order...', 'success');
        navigate(response.redirect);
      } else {
        addAlert('Payment UTR submitted. Verifying order...', 'success');
        navigate('/view-orders/');
      }
    } catch (err) {
      addAlert('Failed to submit payment UTR. Please check details.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--site-muted)' }}>Loading Payment Gateway...</div>;
  }

  if (!orderId || !amount || !checkoutData) {
    return (
      <div className="content-wrapper fade-in-up" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="glass-card-light" style={{ padding: '3rem', borderRadius: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Invalid Payment Parameters</h3>
          <p style={{ color: '#64748b' }}>We could not find active order parameters. Please check your cart.</p>
        </div>
      </div>
    );
  }

  // Generate dynamic QR Code URL using QRServer API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkoutData.upi_uri)}`;

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '550px' }}>
      <div className="glass-card-light" style={{ padding: '2.5rem 2rem', borderRadius: '24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Scan and Pay</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Scan the QR code below using GPay, Paytm, PhonePe, or any UPI App to pay</p>
        
        {/* Billing details banner */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Order ID</span>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>#{orderId}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Amount Due</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e69500' }}>₹ {parseFloat(amount).toFixed(2)}</div>
          </div>
        </div>

        {/* QR Code Canvas */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '16px',
          width: '250px',
          height: '250px',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '1px solid #cbd5e1',
        }}>
          <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '220px', height: '220px' }} />
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
          UPI ID: <strong>{checkoutData.receive_upi_id}</strong><br />
          Merchant: <strong>{checkoutData.receive_upi_name}</strong>
        </p>

        {/* UTR entry form */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1.5rem', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b' }}>
              Enter 12-Digit UTR / Transaction ID
            </label>
            <input 
              type="text" 
              placeholder="e.g. 345678901234"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                outline: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textAlign: 'center',
              }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Confirm your transaction inside your payment app and copy/paste the 12-digit UTR ID here to verify.
            </span>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: submitting ? '#cbd5e1' : 'var(--site-primary)',
              border: 'none',
              color: '#fff',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: submitting ? 'default' : 'pointer',
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            className={submitting ? '' : 'hover-lift'}
          >
            {submitting ? 'Verifying payment...' : (
              <>Confirm Payment <CheckCircle size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
