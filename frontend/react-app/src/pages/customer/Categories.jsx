import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiRequest('/categories/');
        if (response && response.categories) {
          setCategories(response.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--site-muted)' }}>Loading Categories...</div>;
  }

  return (
    <div className="content-wrapper fade-in-up">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem',
        margin: '2rem 0',
      }}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card-light hover-lift" style={{
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <img 
              src={`/images/category/${cat.image_name}`}
              alt={cat.title} 
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '6px solid #fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                marginBottom: '1.5rem',
              }}
              onError={(e) => { e.target.src = 'https://placehold.co/200?text=Category'; }}
            />
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>{cat.title}</h4>
            <Link to={`/category-foods/${cat.id}/`} style={{
              background: '#e69500',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              width: '100%',
              display: 'inline-block',
            }} className="hover-lift">View Products</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
