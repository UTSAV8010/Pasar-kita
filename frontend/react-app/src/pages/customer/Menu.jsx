import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Search, ShoppingCart, Utensils, Package } from 'lucide-react';

export default function Menu() {
  const { addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async (query) => {
    setLoading(true);
    try {
      const url = query ? `/menu/?search=${encodeURIComponent(query)}` : '/menu/';
      const response = await apiRequest(url);
      if (response && response.foods) {
        setFoods(response.foods);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchInput.trim() ? { search: searchInput.trim() } : {});
  };

  return (
    <div className="content-wrapper fade-in-up">
      {/* Search Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        marginBottom: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(230,149,0,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', background: 'rgba(13,110,253,0.06)', borderRadius: '50%' }} />
        <p style={{ color: '#e69500', fontFamily: 'Pacifico, cursive', fontSize: '1rem', marginBottom: '6px', position: 'relative' }}>Explore Our</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: '0 0 1.5rem', position: 'relative' }}>
          What are you craving today?
        </h1>

        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search for pizzas, burgers, rolls, dhosa..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              height: '54px',
              padding: '0 64px 0 22px',
              borderRadius: '30px',
              border: '2px solid rgba(255,255,255,0.15)',
              outline: 'none',
              fontSize: '1rem',
              background: 'rgba(255,255,255,0.96)',
              color: '#0f172a',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            className="menu-search-input"
          />
          <button
            type="submit"
            style={{
              position: 'absolute', top: '5px', right: '5px',
              width: '44px', height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffb325, #e69500)',
              color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(230,149,0,0.35)',
              transition: 'transform .15s',
            }}
          >
            <Search size={18} />
          </button>
        </form>

        {searchQuery && (
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '1rem', position: 'relative' }}>
            Showing results for: <strong style={{ color: '#ffb325' }}>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '5px solid #f3f3f3', borderTopColor: '#e69500', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading menu items...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : foods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Package size={56} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>No items found</h3>
          <p style={{ color: '#64748b' }}>
            {searchQuery ? `No food items match "${searchQuery}". Try a different search.` : 'No menu items are available.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchInput(''); setSearchParams({}); }}
              style={{ marginTop: '1rem', background: '#e69500', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
              {foods.length} item{foods.length !== 1 ? 's' : ''} {searchQuery ? 'found' : 'available'}
            </p>
          </div>

          {/* Food Grid — auto-fill: cards stay at fixed width, never stretch to fill row */}
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
                    <span>•</span>
                    <span>{food.restro_name}</span>
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
                  >
                    <ShoppingCart size={15} />
                    {food.stock > 0 ? 'Order Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .menu-search-input:focus {
          border-color: #e69500 !important;
          box-shadow: 0 0 0 4px rgba(230,149,0,0.15) !important;
        }
        .food-card-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.11) !important;
        }
        .food-card-item:hover .food-img-zoom {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
}
