import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../AppContext';
import { apiRequest } from '../../api';
import { ShoppingCart, Trash2, MapPin, Wallet, CreditCard, QrCode } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQty, user, addAlert } = useApp();
  const navigate = useNavigate();
  
  // Checkout form fields
  const [form, setForm] = useState({
    coupon_code: '',
    pay_mode: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    location: '',
    location_address: '',
  });

  const [checkoutData, setCheckoutData] = useState({
    base_total: 0,
    total_amount: 0,
    coupon_message: '',
    coupon_class: '',
    discount: 0,
    google_maps_api_key: '',
    cus_name: '',
    cus_email: '',
    cus_add1: '',
    cus_city: '',
    cus_phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef(null);

  const fetchCartDetails = async () => {
    try {
      const data = await apiRequest('/mycart/');
      if (data) {
        setCheckoutData(data);
        // Pre-fill location address if available
        setForm((prev) => ({
          ...prev,
          location_address: data.cus_add1 ? `${data.cus_add1}, ${data.cus_city}` : '',
        }));
      }
    } catch (err) {
      console.error('Failed to load cart details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cart.length > 0) {
      fetchCartDetails();
    } else {
      setLoading(false);
    }
  }, [cart]);

  // Apply Coupon Action
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!form.coupon_code) return;
    
    try {
      const data = new FormData();
      data.append('apply_coupon', '1');
      data.append('coupon_code', form.coupon_code);
      
      const response = await apiRequest('/mycart/', {
        method: 'POST',
        body: data,
      });
      
      if (response) {
        setCheckoutData(response);
        if (response.coupon_message) {
          const type = response.coupon_class.includes('success') ? 'success' : 'danger';
          addAlert(response.coupon_message, type);
        }
      }
    } catch (err) {
      addAlert('Failed to apply coupon', 'danger');
    }
  };

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!form.pay_mode) {
      addAlert('Please select a payment method', 'warning');
      return;
    }

    if (!form.location) {
      addAlert('Please select a delivery location coordinates on the map', 'warning');
      return;
    }

    if (form.pay_mode === 'card') {
      if (!/^\d{16}$/.test(form.card_number)) {
        addAlert('Card number must be exactly 16 digits.', 'warning');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.card_expiry)) {
        addAlert('Expiry must be in MM/YY format.', 'warning');
        return;
      }
      if (!/^\d{3}$/.test(form.card_cvv)) {
        addAlert('CVV must be exactly 3 digits.', 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('purchase', '1');
      data.append('amount', String(checkoutData.total_amount));
      data.append('pay_mode', form.pay_mode);
      data.append('location', form.location);
      data.append('location_address', form.location_address);
      data.append('cus_name', checkoutData.cus_name);
      data.append('cus_email', checkoutData.cus_email);
      data.append('cus_add1', checkoutData.cus_add1);
      data.append('cus_city', checkoutData.cus_city);
      data.append('cus_phone', String(checkoutData.cus_phone));
      
      if (form.pay_mode === 'card') {
        data.append('card_number', form.card_number);
        data.append('card_expiry', form.card_expiry);
        data.append('card_cvv', form.card_cvv);
      }

      // Submit checkout form
      const response = await apiRequest('/mycart/', {
        method: 'POST',
        body: data,
      });

      // If COD/Card order succeeds, Django view returns order-success page context or redirects
      if (response && response.order_id) {
        addAlert('Order placed successfully!', 'success');
        navigate(`/order-success/?order_id=${response.order_id}`);
      }
    } catch (err) {
      addAlert('Order checkout failed. Please check payment details.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Geolocation integration
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addAlert('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setForm((prev) => ({
          ...prev,
          location: `${lat},${lng}`,
        }));
        addAlert('Location coordinates set successfully!', 'success');
      },
      () => {
        addAlert('Unable to retrieve your live coordinates.', 'danger');
      }
    );
  };

  const handleSimulateMapClick = () => {
    // Simulate picking a point in Surat (center)
    const lat = (21.1702 + (Math.random() - 0.5) * 0.05).toFixed(6);
    const lng = (72.8311 + (Math.random() - 0.5) * 0.05).toFixed(6);
    setForm((prev) => ({
      ...prev,
      location: `${lat},${lng}`,
    }));
    addAlert('Simulated map pin coordinates selected!', 'success');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--site-muted)' }}>Loading Cart details...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="content-wrapper fade-in-up" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="glass-card-light" style={{ padding: '3rem', borderRadius: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <ShoppingCart size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your shopping cart is empty</h3>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Add delicious items from the menu to continue.</p>
          <Link to="/menu/" style={{ background: '#e69500', color: '#fff', padding: '12px 28px', borderRadius: '24px', fontWeight: 700 }} className="hover-lift">Browse Foods</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper fade-in-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Cart items list */}
        <div style={{ flexGrow: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card-light" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--site-border)', paddingBottom: '12px' }}>
              Your Selected Items ({cart.length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                }}>
                  <div style={{ flexGrow: 1 }}>
                    <h5 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{item.Item_Name}</h5>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Restro: {item.Restro_Name}</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e69500', marginTop: '4px' }}>₹ {item.Price}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max="20"
                      value={item.Quantity}
                      onChange={(e) => updateQty(item.Item_Name, parseInt(e.target.value) || 1)}
                      style={{
                        width: '64px',
                        padding: '6px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    />
                    
                    <button 
                      onClick={() => removeFromCart(item.Item_Name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                      className="hover-lift"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout Summary panel */}
        <div className="glass-card-light" style={{ padding: '2rem', borderRadius: '20px' }}>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--site-border)', paddingBottom: '12px' }}>
            Checkout Summary
          </h4>
          
          <div className="total-pill" style={{
            background: 'linear-gradient(135deg, #ffb833, #f2a208)',
            color: '#fff',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 20px rgba(242, 162, 8, 0.2)',
          }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Billing Amount</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '4px' }}>₹ {checkoutData.total_amount.toFixed(2)}</div>
          </div>

          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <div className="badge badge-warning" style={{ display: 'block', padding: '12px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Please login to place your order.
              </div>
              <Link to="/login/" style={{ display: 'block', background: '#e69500', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700 }} className="hover-lift">Login to Continue</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Apply Coupon Form */}
              <div className="info-box" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #eab308' }}>
                <h6 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Apply Coupon</h6>
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    value={form.coupon_code}
                    onChange={(e) => setForm((prev) => ({ ...prev, coupon_code: e.target.value }))}
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                    }}
                  />
                  <button type="submit" style={{ background: '#e69500', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} className="hover-lift">Apply</button>
                </form>
                {checkoutData.coupon_message && (
                  <p style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginTop: '8px',
                    color: checkoutData.coupon_class.includes('success') ? '#22c55e' : '#ef4444',
                  }}>{checkoutData.coupon_message}</p>
                )}
              </div>

              {/* Delivery Details */}
              <div className="info-box" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                <h6 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Delivery Information</h6>
                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Name:</strong> {checkoutData.cus_name}</div>
                  <div><strong>Email:</strong> {checkoutData.cus_email}</div>
                  <div><strong>Address:</strong> {checkoutData.cus_add1}, {checkoutData.cus_city}</div>
                  <div><strong>Phone:</strong> {checkoutData.cus_phone}</div>
                </div>
                <Link to="/myaccount/" style={{ display: 'inline-block', background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}>Change Details</Link>
              </div>

              {/* Map Coordinates Picker */}
              <div className="info-box" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <h6 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Pin Delivery Location</h6>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button type="button" onClick={handleUseMyLocation} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><MapPin size={12} /> Use GPS</button>
                  <button type="button" onClick={handleSimulateMapClick} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><MapPin size={12} /> Click Map</button>
                </div>
                
                {/* Real OpenStreetMap embed */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <iframe
                    title="Delivery Location Map"
                    src={form.location
                      ? `https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(form.location.split(',')[1]) - 0.02).toFixed(4)},${(parseFloat(form.location.split(',')[0]) - 0.02).toFixed(4)},${(parseFloat(form.location.split(',')[1]) + 0.02).toFixed(4)},${(parseFloat(form.location.split(',')[0]) + 0.02).toFixed(4)}&layer=mapnik&marker=${form.location.split(',')[0]},${form.location.split(',')[1]}`
                      : `https://www.openstreetmap.org/export/embed.html?bbox=72.7899,21.1502,72.8711,21.1902&layer=mapnik`}
                    width="100%"
                    height="180"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                  />
                  {/* Coordinates display */}
                  {form.location ? (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '8px',
                      background: 'rgba(255,255,255,0.95)', borderRadius: '8px',
                      padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '0.72rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      color: '#0f172a',
                    }}>
                      <MapPin size={11} color="#ef4444" />
                      📍 {form.location}
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '8px',
                      background: 'rgba(255,255,255,0.9)', borderRadius: '8px',
                      padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700,
                      color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}>
                      Use GPS or Click Map to pin your location
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="info-box" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #e69500' }}>
                <h6 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Payment Mode</h6>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pay_mode" 
                      value="cod" 
                      checked={form.pay_mode === 'cod'}
                      onChange={(e) => setForm((prev) => ({ ...prev, pay_mode: e.target.value }))}
                    />
                    <Wallet size={16} /> Cash on Delivery (COD)
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pay_mode" 
                      value="card"
                      checked={form.pay_mode === 'card'}
                      onChange={(e) => setForm((prev) => ({ ...prev, pay_mode: e.target.value }))}
                    />
                    <CreditCard size={16} /> Pay with Credit / Debit Card
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pay_mode" 
                      value="upi"
                      checked={form.pay_mode === 'upi'}
                      onChange={(e) => setForm((prev) => ({ ...prev, pay_mode: e.target.value }))}
                    />
                    <QrCode size={16} /> Scan UPI QR Code (GPay, Paytm, etc.)
                  </label>
                </div>

                {/* Card Fields */}
                {form.pay_mode === 'card' && (
                  <div style={{ marginTop: '12px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="16-Digit Card Number" 
                      value={form.card_number}
                      onChange={(e) => setForm((prev) => ({ ...prev, card_number: e.target.value }))}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={form.card_expiry}
                        onChange={(e) => setForm((prev) => ({ ...prev, card_expiry: e.target.value }))}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                      />
                      <input 
                        type="password" 
                        placeholder="CVV" 
                        value={form.card_cvv}
                        onChange={(e) => setForm((prev) => ({ ...prev, card_cvv: e.target.value }))}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Action Button */}
              <button 
                onClick={handleCheckoutSubmit}
                disabled={submitting}
                style={{
                  background: submitting ? '#cbd5e1' : 'linear-gradient(135deg, #ffb833, #f2a208)',
                  border: 'none',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'default' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 10px 20px rgba(242, 162, 8, 0.2)',
                }}
                className={submitting ? '' : 'hover-lift'}
              >
                {submitting ? 'Processing Order...' : 'Complete Checkout'}
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
