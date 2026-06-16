import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { ShoppingCart, Utensils, Star, ChevronLeft } from 'lucide-react';

export default function RestroMenu() {
  const { restroName } = useParams();
  const [data, setData] = useState({ restro_name: '', foods: [] });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  useEffect(() => {
    async function loadRestroMenu() {
      try {
        const response = await apiRequest(`/restro-menu/${encodeURIComponent(restroName)}/`);
        if (response) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load restro menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestroMenu();
  }, [restroName]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '5px solid #f3f3f3', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading menu...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { foods } = data;

  return (
    <div className="content-wrapper fade-in-up">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/restaurant/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Back to Restaurants
        </Link>
      </div>

      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ color: '#e69500', fontFamily: 'Pacifico, cursive', fontSize: '1.1rem', marginBottom: '6px' }}>Restaurant Menu</p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>{restroName} Selection</h1>
        <Link
          to={`/review-restro/${encodeURIComponent(restroName)}/`}
          style={{
            background: '#178d51', color: '#fff',
            padding: '9px 22px', borderRadius: '22px',
            fontWeight: 700, fontSize: '0.85rem',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(23,141,81,0.25)',
            transition: 'transform .18s',
          }}
          className="hover-lift"
        >
          <Star size={14} /> Review this Restaurant
        </Link>
      </div>

      {foods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <Utensils size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>No Menu Items Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>This restaurant hasn't added any menu items yet.</p>
          <Link to="/restaurant/" style={{ background: '#e69500', color: '#fff', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, textDecoration: 'none' }}>
            Back to Restaurants
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.75rem',
          justifyItems: 'stretch',
        }}>
          {foods.map((food) => (
            <div key={food.id} className="food-card-item" style={{
              background: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(15,33,74,0.08)',
              border: '1px solid #e6eaf4',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform .25s ease, box-shadow .25s ease',
            }}>
              {/* Food Image */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#f1f5f9' }}>
                <img
                  src={`/restro/uploads/food/${food.image_name}`}
                  alt={food.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease' }}
                  className="food-img-zoom"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder */}
                <div style={{
                  display: 'none', position: 'absolute', inset: 0,
                  alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px',
                  background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#94a3b8',
                }}>
                  <Utensils size={36} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Food Image</span>
                </div>

                {/* Price badge */}
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: 'linear-gradient(135deg, #ffb325, #e69500)',
                  color: '#fff', borderRadius: '20px', padding: '4px 12px',
                  fontSize: '0.9rem', fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(230,149,0,0.35)',
                }}>
                  ₹ {food.price}
                </div>

                {/* Out of stock overlay */}
                {food.stock <= 0 && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', background: 'rgba(220,53,69,0.85)', padding: '6px 16px', borderRadius: '20px' }}>
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '6px' }}>
                  {food.title}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '10px', flexGrow: 1 }}>
                  {food.description?.slice(0, 90)}{food.description?.length > 90 ? '...' : ''}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '14px' }}>
                  <span style={{ background: '#f1f5f9', borderRadius: '20px', padding: '2px 8px', fontWeight: 600 }}>
                    {food.stock > 0 ? `${food.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(food)}
                  disabled={food.stock <= 0}
                  style={{
                    background: food.stock > 0 ? 'linear-gradient(135deg, #ffb325, #e69500)' : '#cbd5e1',
                    border: 'none', color: '#fff',
                    padding: '11px', borderRadius: '10px',
                    fontWeight: 800, cursor: food.stock > 0 ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.5px',
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: food.stock > 0 ? '0 6px 16px rgba(230,149,0,0.3)' : 'none',
                    transition: 'transform .15s, box-shadow .15s',
                  }}
                  className={food.stock > 0 ? 'food-btn-hover' : ''}
                >
                  <ShoppingCart size={15} />
                  {food.stock > 0 ? 'Order Now' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .food-card-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.11) !important;
        }
        .food-card-item:hover .food-img-zoom {
          transform: scale(1.06);
        }
        .food-btn-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(230,149,0,0.4) !important;
        }
      `}</style>
    </div>
  );
}
