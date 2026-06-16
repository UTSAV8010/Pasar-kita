import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { ShoppingCart, Utensils } from 'lucide-react';

export default function RestroCategory() {
  const { categoryId } = useParams();
  const [data, setData] = useState({ category_title: '', foods: [], error: '' });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  useEffect(() => {
    async function loadRestroCategory() {
      try {
        const response = await apiRequest(`/restro-category/${categoryId}/`);
        if (response) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load restro category:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestroCategory();
  }, [categoryId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--site-muted)' }}>Loading Restaurant Category...</div>;
  }

  const { category_title, foods, error } = data;

  return (
    <div className="content-wrapper fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Restaurant Catalog</h5>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{category_title || 'Restaurant Category'}</h2>
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.2rem', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/restaurant/" style={{ background: '#e69500', color: '#fff', padding: '10px 24px', borderRadius: '20px', fontWeight: 700 }} className="hover-lift">Back to Restaurants</Link>
        </div>
      ) : foods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.2rem', marginBottom: '1.5rem' }}>No Food Items Found in this Category.</p>
          <Link to="/restaurant/" style={{ background: '#e69500', color: '#fff', padding: '10px 24px', borderRadius: '20px', fontWeight: 700 }} className="hover-lift">Back to Restaurants</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
        }}>
          {foods.map((food) => (
            <div key={food.id} className="hover-lift" style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'var(--site-shadow)',
              border: '1px solid var(--site-border)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={`/restro/uploads/food/${food.image_name}`}
                  alt={food.title}
                  style={{ width: '100%', height: '230px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/320x230?text=Food'; }}
                />
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#fff',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}><Utensils size={18} color="#e69500" /></div>
              </div>
              
              <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{food.title}</h4>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#e69500', whiteSpace: 'nowrap' }}>₹ {food.price}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', flexGrow: 1 }}>
                  {food.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  <span>Stock: {food.stock > 0 ? `${food.stock} left` : 'Out of Stock'}</span>
                </div>
                <button 
                  onClick={() => addToCart(food)}
                  disabled={food.stock <= 0}
                  style={{
                    background: food.stock > 0 ? '#e69500' : '#cbd5e1',
                    border: 'none',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: food.stock > 0 ? 'pointer' : 'default',
                    textTransform: 'uppercase',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  className={food.stock > 0 ? 'hover-lift' : ''}
                >
                  {food.stock > 0 ? (
                    <>Order Now <ShoppingCart size={16} /></>
                  ) : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
