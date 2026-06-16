import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { MapPin, Utensils, Star, ChefHat } from 'lucide-react';

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await apiRequest('/restaurant/');
        if (response && response.restaurants) {
          setRestaurants(response.restaurants);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '5px solid #f3f3f3', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="content-wrapper fade-in-up">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ color: '#e69500', fontFamily: 'Pacifico, cursive', fontSize: '1.1rem', marginBottom: '6px' }}>Top Partners</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Restaurants Near You</h1>
        <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1rem' }}>
          {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <ChefHat size={56} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>No restaurants registered yet.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))',
          gap: '2rem',
          justifyItems: 'stretch',
        }}>
          {restaurants.map((restro) => (
            <div key={restro.id} className="restro-card-item" style={{
              background: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(15,33,74,0.09)',
              border: '1px solid #e6eaf4',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform .28s ease, box-shadow .28s ease',
            }}>
              {/* Restaurant Image */}
              <div style={{ position: 'relative', height: '210px', overflow: 'hidden', background: '#f1f5f9' }}>
                <img
                  src={`/restro/${restro.restro_image}`}
                  alt={restro.restro_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease' }}
                  className="restro-img-zoom"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder */}
                <div style={{
                  display: 'none',
                  position: 'absolute', inset: 0,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '8px',
                  background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                  color: '#94a3b8',
                }}>
                  <ChefHat size={40} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No Image</span>
                </div>

                {/* Status badge */}
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'rgba(23,141,81,0.92)', color: '#fff',
                  borderRadius: '20px', padding: '4px 12px',
                  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px',
                  backdropFilter: 'blur(4px)',
                }}>
                  ● OPEN
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginBottom: '6px' }}>
                  {restro.restro_name}
                </h4>
                <p style={{
                  color: '#64748b', fontSize: '0.85rem', marginBottom: '18px',
                  display: 'flex', alignItems: 'flex-start', gap: '6px', flexGrow: 1, lineHeight: 1.5
                }}>
                  <MapPin size={14} color="#e69500" style={{ marginTop: '2px', flexShrink: 0 }} />
                  {restro.restro_address}
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/restro-menu/${encodeURIComponent(restro.restro_name)}/`}
                    style={{
                      flex: 1, background: '#e69500', color: '#fff',
                      textAlign: 'center', padding: '10px 8px',
                      borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem',
                      textTransform: 'uppercase', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      transition: 'transform .18s, box-shadow .18s',
                    }}
                    className="restro-btn-hover"
                  >
                    <Utensils size={13} /> Menu
                  </Link>
                  <Link
                    to={`/review-restro/${encodeURIComponent(restro.restro_name)}/`}
                    style={{
                      flex: 1, background: '#178d51', color: '#fff',
                      textAlign: 'center', padding: '10px 8px',
                      borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem',
                      textTransform: 'uppercase', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      transition: 'transform .18s, box-shadow .18s',
                    }}
                    className="restro-btn-hover"
                  >
                    <Star size={13} /> Review
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .restro-card-item:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.12) !important;
        }
        .restro-card-item:hover .restro-img-zoom {
          transform: scale(1.05);
        }
        .restro-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.18);
        }
      `}</style>
    </div>
  );
}
