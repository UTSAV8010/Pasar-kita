import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ShoppingBasket, User, MapPin, Mail, Phone, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import Chatbot from '../pages/customer/Chatbot';

export default function CustomerLayout() {
  const { cart, user, logout } = useLocation();
  const { cart: cartItems, user: currentUser, logout: handleLogout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Breadcrumb details
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/about/') return 'About Us';
    if (path === '/team/') return 'Our Team';
    if (path === '/testimonial/') return 'Testimonials';
    if (path === '/categories/') return 'Food Categories';
    if (path.startsWith('/category-foods/')) return 'Category Foods';
    if (path === '/menu/') return 'Food Menu';
    if (path === '/restaurant/') return 'Our Partner Restaurants';
    if (path.startsWith('/restro-category/')) return 'Restaurant Category';
    if (path.startsWith('/restro-menu/')) return 'Restaurant Menu';
    if (path === '/mycart/') return 'My Shopping Cart';
    if (path === '/login/') return 'Customer Login';
    if (path === '/signup/') return 'Create Account';
    if (path === '/forget/') return 'Recover Password';
    if (path === '/myaccount/') return 'My Account';
    if (path === '/view-orders/') return 'My Order History';
    if (path.startsWith('/review-restro/')) return 'Write Restaurant Review';
    if (path.startsWith('/review-rider/')) return 'Write Rider Review';
    if (path === '/contact/') return 'Contact Us';
    return '';
  };

  const breadcrumbTitle = getBreadcrumbTitle();
  const isHome = location.pathname === '/';

  return (
    <div className="layout-container">
      {/* Header / Navigation */}
      <header className="glass-navbar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1080,
        height: '86px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        color: '#fff',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/static/images/logo2.png" 
              alt="Logo" 
              style={{ height: '70px', objectFit: 'contain' }} 
              onError={(e) => { e.target.src = 'https://placehold.co/150x70?text=Pasar-Kita'; }}
            />
          </Link>

          {/* Desktop Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-only">
            <Link to="/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>Home</Link>
            
            <Link to="/restaurant/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/restaurant/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>Restro</Link>
            
            <Link to="/about/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/about/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>About</Link>
            
            <Link to="/categories/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/categories/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>Categories</Link>
            
            <Link to="/menu/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/menu/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>Menu</Link>

            {/* Dropdown Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: '700',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Pages <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className="glass-card-dark" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: '200px',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  zIndex: 2000,
                }}>
                  <Link to="/team/" style={{ padding: '10px 12px', borderRadius: '8px', color: '#dfe9ff', fontWeight: '600' }} className="dropdown-item">Team</Link>
                  <Link to="/testimonial/" style={{ padding: '10px 12px', borderRadius: '8px', color: '#dfe9ff', fontWeight: '600' }} className="dropdown-item">Testimonials</Link>
                  <Link to="/myaccount/" style={{ padding: '10px 12px', borderRadius: '8px', color: '#dfe9ff', fontWeight: '600' }} className="dropdown-item">My Account</Link>
                  <Link to="/view-orders/" style={{ padding: '10px 12px', borderRadius: '8px', color: '#dfe9ff', fontWeight: '600' }} className="dropdown-item">My Orders</Link>
                  {currentUser && (
                    <button 
                      onClick={() => handleLogout('customer')}
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        color: '#ef4444', 
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }} 
                      className="dropdown-item"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            <Link to="/contact/" style={{
              fontWeight: '700',
              padding: '10px 14px',
              color: isActive('/contact/') ? '#fea116' : '#fff',
              transition: 'color 0.2s',
            }}>Contact</Link>
          </nav>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/mycart/" style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e69500',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background 0.2s',
            }} className="hover-lift">
              <ShoppingBasket size={20} />
              {cartItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-7px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '999px',
                  background: '#ff3b30',
                  color: '#fff',
                  fontSize: '11px',
                  lineHeight: '18px',
                  textAlign: 'center',
                  fontWeight: '700',
                }}>{cartItems.length}</span>
              )}
            </Link>

            <Link to={currentUser ? "/myaccount/" : "/login/"} style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e69500',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }} className="hover-lift">
              <User size={20} />
            </Link>

            {/* Mobile Menu Toggler */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-only"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                width: '42px',
                height: '42px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '86px',
          left: 0,
          width: '280px',
          height: 'calc(100vh - 86px)',
          background: '#06133b',
          zIndex: 1095,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>Home</Link>
          <Link to="/restaurant/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>Restro</Link>
          <Link to="/about/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>About</Link>
          <Link to="/categories/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>Categories</Link>
          <Link to="/menu/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>Menu</Link>
          <Link to="/myaccount/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>My Account</Link>
          <Link to="/view-orders/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>My Orders</Link>
          <Link to="/contact/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', background: '#103c72', borderRadius: '12px', fontWeight: '700', color: '#fff' }}>Contact</Link>
        </div>
      )}

      {/* Main Layout Area */}
      <main className="layout-main" style={{
        paddingTop: isHome ? '86px' : '86px',
      }}>
        {/* Breadcrumb section for subpages */}
        {!isHome && breadcrumbTitle && (
          <div className="site-breadcrumb-wrap" style={{
            background: 'linear-gradient(90deg, rgba(13, 23, 48, 0.98), rgba(8, 18, 42, 0.98))',
            padding: '60px 0',
            textAlign: 'center',
            color: '#fff',
          }}>
            <h2 className="site-breadcrumb-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>{breadcrumbTitle}</h2>
            <p className="site-breadcrumb-path" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>
              <Link to="/" style={{ color: '#fea116' }}>Home</Link>
              <span style={{ padding: '0 8px' }}>/</span>
              <span style={{ color: '#fff' }}>{breadcrumbTitle}</span>
            </p>
          </div>
        )}

        <div className="page-enter-active">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer" style={{ background: '#0b1533', color: '#fff', padding: '56px 0 18px', marginTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '28px',
          }}>
            <div>
              <h4 style={{ color: '#fea116', fontFamily: 'Pacifico, cursive', fontSize: '1.5rem', marginBottom: '20px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="company-links">
                <Link to="/about/" style={{ fontWeight: 600 }}>About Us</Link>
                <Link to="/contact/" style={{ fontWeight: 600 }}>Contact Us</Link>
                <Link to="#" style={{ fontWeight: 600 }}>Reservation</Link>
                <Link to="#" style={{ fontWeight: 600 }}>Privacy Policy</Link>
                <Link to="#" style={{ fontWeight: 600 }}>Terms & Conditions</Link>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fea116', fontFamily: 'Pacifico, cursive', fontSize: '1.5rem', marginBottom: '20px' }}>Contact</h4>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><MapPin size={16} /> surat, ahmedabad, baroda</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><Phone size={16} /> +91 9978043407</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><Mail size={16} /> Pasar-kita@gmail.com</p>
            </div>

            <div>
              <h4 style={{ color: '#fea116', fontFamily: 'Pacifico, cursive', fontSize: '1.5rem', marginBottom: '20px' }}>Opening Hours</h4>
              <p style={{ marginBottom: '10px' }}>Monday - Saturday<br />09:00 AM - 09:00 PM</p>
              <p>Sunday<br />10:00 AM - 08:00 PM</p>
            </div>

            <div>
              <h4 style={{ color: '#fea116', fontFamily: 'Pacifico, cursive', fontSize: '1.5rem', marginBottom: '20px' }}>Newsletter</h4>
              <p style={{ marginBottom: '16px' }}>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
              <div style={{ position: 'relative', maxWidth: '300px' }}>
                <input 
                  type="email" 
                  placeholder="Your email" 
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 110px 0 16px',
                    borderRadius: '24px',
                    border: '1px solid #fea116',
                    outline: 'none',
                  }}
                />
                <button 
                  type="button"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '20px',
                    background: '#e69500',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  SIGNUP
                </button>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            mdDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
          }}>
            <div>&copy; <Link to="/" style={{ color: '#fea116', fontWeight: 600 }}>Pasar.kita.com</Link>, All Right Reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/">Home</Link>
              <Link to="#">Cookies</Link>
              <Link to="#">Help</Link>
              <Link to="#">FAQs</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Styles injector for responsive layout compatibility */}
      <style>{`
        @media (max-width: 991.98px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
      <Chatbot />
    </div>
  );
}
