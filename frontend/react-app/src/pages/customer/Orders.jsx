import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, getCookie } from '../../api';
import { useApp } from '../../AppContext';
import { ClipboardList, Calendar, Receipt, XCircle, Star, MessageSquare } from 'lucide-react';
import ProfileSidebar from '../../components/ProfileSidebar';

export default function Orders() {
  const { addAlert } = useApp();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/view-orders/');
      if (data && data.orders_data) {
        setOrdersData(data.orders_data);
      }
    } catch (err) {
      addAlert('Failed to load your order history.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setCancellingId(orderId);
    try {
      const formData = new FormData();
      formData.append('cancel_order', '1');
      formData.append('order_id', String(orderId));

      const response = await apiRequest('/view-orders/', {
        method: 'POST',
        body: formData,
      });

      if (response && response.alert_message) {
        addAlert(response.alert_message, response.alert_type || 'success');
      } else {
        addAlert('Order cancelled successfully!', 'success');
      }
      await fetchOrders();
    } catch (err) {
      addAlert('Failed to cancel order.', 'danger');
    } finally {
      setCancellingId(null);
    }
  };

  // Receipt Download form trick
  const handleDownloadReceipt = (orderId) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/download-receipt/';
    form.target = '_blank';

    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCookie('csrftoken') || '';
    form.appendChild(csrfInput);

    const triggerInput = document.createElement('input');
    triggerInput.type = 'hidden';
    triggerInput.name = 'download_receipt';
    triggerInput.value = '1';
    form.appendChild(triggerInput);

    const orderIdInput = document.createElement('input');
    orderIdInput.type = 'hidden';
    orderIdInput.name = 'order_id';
    orderIdInput.value = String(orderId);
    form.appendChild(orderIdInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      display: 'inline-block'
    };

    switch (status?.toLowerCase()) {
      case 'delivered':
        return { ...base, background: 'rgba(25,135,84,0.1)', color: '#198754' };
      case 'cancelled':
        return { ...base, background: 'rgba(220,53,69,0.1)', color: '#dc3545' };
      case 'ready':
      case 'dispatched':
        return { ...base, background: 'rgba(13,110,253,0.1)', color: '#0d6efd' };
      case 'pending':
      default:
        return { ...base, background: 'rgba(230,149,0,0.1)', color: '#e69500' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ borderTopColor: '#e69500' }}></div>
      </div>
    );
  }

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch' }} className="profile-layout-row">
        
        {/* Left Sidebar */}
        <div style={{ flex: '0 0 280px', width: '280px' }} className="profile-sidebar-col">
          <ProfileSidebar />
        </div>

        {/* Right Content Column */}
        <div style={{ flex: '1 1 600px' }} className="profile-content-col">
          <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', minHeight: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <ClipboardList size={28} style={{ color: '#e69500' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Order History</h2>
      </div>

      {ordersData.length === 0 ? (
        <div className="glass-card-light" style={{ padding: '3rem', textAlign: 'center', borderRadius: '20px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
          <Link to="/menu/" className="btn-submit" style={{ textDecoration: 'none', display: 'inline-block' }}>Browse Food Menu</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {ordersData.map(({ order, items, upi_ref }) => (
            <div key={order.order_id} className="glass-card-light" style={{ borderRadius: '20px', padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Order Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Order #{order.order_id}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                    <Calendar size={14} />
                    <span>{new Date(order.order_date).toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={getStatusBadgeStyle(order.order_status)}>{order.order_status}</span>
                  <button 
                    onClick={() => handleDownloadReceipt(order.order_id)}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                    title="Download Invoice PDF"
                  >
                    <Receipt size={16} />
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: '#64748b' }}>
                      <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600 }}>Food Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>Restaurant</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                      <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px dotted var(--border)' }}>
                        <td style={{ padding: '10px 0', color: '#1e293b', fontWeight: 600 }}>{item.Item_Name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{item.restro_name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 700 }}>{item.Quantity}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', color: '#1e293b', fontWeight: 700 }}>₹{item.total_amount || (parseFloat(item.Price) * parseInt(item.Quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Payment mode: {order.payment_status?.toUpperCase()}</span>
                  {upi_ref && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontStyle: 'italic', marginTop: '2px' }}>UTR Ref: {upi_ref}</span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Location: {order.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginRight: '8px' }}>
                    Total Paid: <span style={{ color: '#e69500' }}>₹{order.total_amount}</span>
                  </span>

                  {order.order_status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.order_id)}
                      disabled={cancellingId === order.order_id}
                      style={{
                        background: 'rgba(220, 53, 69, 0.1)',
                        border: '1px solid rgba(220, 53, 69, 0.2)',
                        color: '#dc3545',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <XCircle size={14} /> {cancellingId === order.order_id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}

                  {order.order_status?.toLowerCase() === 'delivered' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Review Restaurant */}
                      {items[0] && (
                        <Link
                          to={`/review-restro/${encodeURIComponent(items[0].restro_name)}/`}
                          style={{
                            background: 'rgba(230,149,0,0.1)',
                            border: '1px solid rgba(230,149,0,0.2)',
                            color: '#e69500',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Star size={14} /> Review Restro
                        </Link>
                      )}
                      {/* Review Rider */}
                      <Link
                        to={`/review-rider/${order.order_id}/`}
                        style={{
                          background: 'rgba(25,135,84,0.1)',
                          border: '1px solid rgba(25,135,84,0.2)',
                          color: '#198754',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <MessageSquare size={14} /> Review Rider
                      </Link>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .profile-layout-row {
            flex-direction: column !important;
          }
          .profile-sidebar-col {
            flex: 1 1 100% !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
