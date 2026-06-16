import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { ShoppingCart, Utensils } from 'lucide-react';

export default function CategoryFoods() {
  const { categoryId } = useParams();
  const [data, setData] = useState({ category: null, foods: [] });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  useEffect(() => {
    async function loadCategoryFoods() {
      try {
        const response = await apiRequest(`/category-foods/${categoryId}/`);
        if (response) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load category foods:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryFoods();
  }, [categoryId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '5px solid #f3f3f3', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { category, foods } = data;

  return (
    <div className="content-wrapper fade-in-up">
      {category && (
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: '#e69500', fontFamily: 'Pacifico, cursive', fontSize: '1.1rem', marginBottom: '6px' }}>Category Catalog</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Explore {category.title}</h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem' }}>
            {foods.length} item{foods.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {foods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <Utensils size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1rem', marginBottom: '1.5rem' }}>No food items found in this category.</p>
          <Link to="/categories/" style={{ background: '#e69500', color: '#fff', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, textDecoration: 'none' }}>
            Back to Categories
          </Link>
        </div>
      ) : (
        /* FOOD CARD GRID — auto-fill keeps cards at fixed width, never stretches 1 card to full width */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.75rem',
          justifyItems: 'stretch',
        }}>
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} addToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

/* Shared food card component */
function FoodCard({ food, addToCart }) {
  return (
    <div className="food-card-item" style={{
      background: '#fff',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(15,33,74,0.08)',
      border: '1px solid #e6eaf4',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform .25s ease, box-shadow .25s ease',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
        <img
          src={`/images/food/${food.image_name}`}
          alt={food.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease' }}
          className="food-img-zoom"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback */}
        <div style={{
          display: 'none', position: 'absolute', inset: 0,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px',
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#94a3b8',
        }}>
          <Utensils size={32} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No Image</span>
        </div>

        {/* Price badge */}
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px',
          background: 'linear-gradient(135deg, #ffb325, #e69500)',
          color: '#fff', borderRadius: '20px', padding: '3px 10px',
          fontSize: '0.88rem', fontWeight: 800,
          boxShadow: '0 3px 10px rgba(230,149,0,0.38)',
        }}>
          ₹ {food.price}
        </div>

        {/* Out of stock */}
        {food.stock <= 0 && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, background: 'rgba(220,53,69,0.88)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '5px' }}>
          {food.title}
        </h4>
        <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '10px', flexGrow: 1 }}>
          {food.description?.slice(0, 80)}{food.description?.length > 80 ? '…' : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '12px' }}>
          <span style={{ background: '#f1f5f9', borderRadius: '20px', padding: '2px 8px', fontWeight: 700 }}>
            {food.stock > 0 ? `${food.stock} left` : 'Out of Stock'}
          </span>
          {food.restro_name && <><span>•</span><span>{food.restro_name}</span></>}
        </div>

        <button
          onClick={() => addToCart(food)}
          disabled={food.stock <= 0}
          style={{
            background: food.stock > 0 ? 'linear-gradient(135deg, #ffb325, #e69500)' : '#cbd5e1',
            border: 'none', color: '#fff',
            padding: '10px', borderRadius: '10px',
            fontWeight: 800, cursor: food.stock > 0 ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.5px',
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            boxShadow: food.stock > 0 ? '0 5px 14px rgba(230,149,0,0.3)' : 'none',
            transition: 'transform .15s, box-shadow .15s',
          }}
          className={food.stock > 0 ? 'food-btn-hover' : ''}
        >
          <ShoppingCart size={14} />
          {food.stock > 0 ? 'Order Now' : 'Out of Stock'}
        </button>
      </div>

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
          box-shadow: 0 10px 22px rgba(230,149,0,0.42) !important;
        }
      `}</style>
    </div>
  );
}
