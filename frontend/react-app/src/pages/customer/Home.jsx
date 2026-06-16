import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Utensils, Star, MapPin } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState({ categories: [], featured_foods: [], restaurants: [] });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiRequest('/');
        if (response) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--site-muted)' }}>
        Loading Pasar-kita.com...
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* Hero Header */}
      <div className="hero-header" style={{
        background: 'linear-gradient(rgba(15, 23, 43, .88), rgba(15, 23, 43, .88)), url("/static/images/bg_homepage.jpg")',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        padding: '7rem 3rem',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 500px', paddingRight: '2rem' }}>
            <h1 className="slide-in-left" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              Enjoy Our<br />Delicious Meal
            </h1>
            <p className="slide-in-left" style={{ color: '#cbd5e1', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Quick, fresh, and delicious meals delivered directly from local restaurants to your doorstep. Satisfy your cravings in just a few clicks!
            </p>
            <Link to="/menu/" style={{
              background: '#e69500',
              color: '#fff',
              padding: '14px 30px',
              borderRadius: '30px',
              fontWeight: 700,
              display: 'inline-block',
            }} className="hover-lift">Order Now</Link>
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/static/images/hero.png" 
              alt="Meal Hero" 
              className="animate-rotate"
              style={{ maxWidth: '85%', height: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Plate'; }}
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section style={{ padding: '5rem 1rem' }} className="content-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Food Categories</h5>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Our Popular Categories</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {data.categories && data.categories.map((cat) => (
              <div key={cat.id} className="glass-card-light hover-lift" style={{
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <img 
                  src={`/images/category/${cat.image_name}`}
                  alt={cat.title} 
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '5px solid #fff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                  }}
                  onError={(e) => { e.target.src = 'https://placehold.co/180?text=Category'; }}
                />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{cat.title}</h4>
                <Link to={`/category-foods/${cat.id}/`} style={{
                  background: '#1e293b',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }} className="hover-lift">View Menu</Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/categories/" style={{
              background: '#e69500',
              color: '#fff',
              padding: '12px 30px',
              borderRadius: '24px',
              fontWeight: 700,
            }} className="hover-lift">Explore All Categories</Link>
          </div>
        </div>
      </section>

      {/* Featured Foods Section */}
      <section style={{ padding: '5rem 1rem', background: '#f1f5f9' }} className="content-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Food Menu</h5>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Most Popular Items</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {data.featured_foods && data.featured_foods.map((food) => (
              <div key={food.id} className="hover-lift" style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`/images/food/${food.image_name}`}
                    alt={food.title}
                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/320x220?text=Food'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#fff',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}><Utensils size={18} color="#e69500" /></div>
                </div>
                <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>{food.title}</h4>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#e69500' }}>₹{food.price}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                    {food.description}
                  </p>
                  <button 
                    onClick={() => addToCart(food)}
                    style={{
                      background: '#e69500',
                      border: 'none',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      width: '100%',
                    }}
                    className="hover-lift"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/menu/" style={{
              background: '#e69500',
              color: '#fff',
              padding: '12px 30px',
              borderRadius: '24px',
              fontWeight: 700,
            }} className="hover-lift">Explore Full Menu</Link>
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section style={{ padding: '5rem 1rem' }} className="content-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Top Picks</h5>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Restaurants Near You</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
          }}>
            {data.restaurants && data.restaurants.map((restro) => (
              <div key={restro.id} className="hover-lift" style={{
                background: '#fff',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--site-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                <img 
                  src={`/restro/${restro.restro_image}`}
                  alt={restro.restro_name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Restaurant'; }}
                />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: '8px' }}>{restro.restro_name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#e69500" /> {restro.restro_address}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Link to={`/restro-menu/${encodeURIComponent(restro.restro_name)}/`} style={{
                      flex: 1,
                      background: '#e69500',
                      color: '#fff',
                      textAlign: 'center',
                      padding: '10px 0',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                    }} className="hover-lift">Menu</Link>
                    <Link to={`/review-restro/${encodeURIComponent(restro.restro_name)}/`} style={{
                      flex: 1,
                      background: '#178d51',
                      color: '#fff',
                      textAlign: 'center',
                      padding: '10px 0',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                    }} className="hover-lift">Review</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/restaurant/" style={{
              background: '#e69500',
              color: '#fff',
              padding: '12px 30px',
              borderRadius: '24px',
              fontWeight: 700,
            }} className="hover-lift">View All Restaurants</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
