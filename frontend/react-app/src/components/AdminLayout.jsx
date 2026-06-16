import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { apiRequest } from '../api';

export default function AdminLayout() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar hidden state (defaults to hidden on mobile viewports)
  const [sidebarHidden, setSidebarHidden] = useState(window.innerWidth <= 1200);
  
  // Theme dark mode state
  const [darkMode, setDarkMode] = useState(localStorage.getItem('admin-theme') === 'dark');

  // Notifications toggle and data
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState({
    ei_order_notif: 0,
    online_order_notif: 0,
    stock_notif: 0,
    message_notif: 0,
    total_notif: 0
  });

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (user.role !== undefined && Number(user.role) !== 1 && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Sync window size for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1200) {
        setSidebarHidden(true);
      } else {
        setSidebarHidden(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme dark mode with document body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Poll for notification counts
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await apiRequest('/admin/dashboard-live-data');
        if (res && res.success && res.notifications) {
          setNotifs(res.notifications);
        }
      } catch (err) {
        console.error("Failed to load header notifications:", err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 12000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const isTabActive = (path) => {
    if (path === '/admin/' && location.pathname === '/admin/') return true;
    return path !== '/admin/' && location.pathname.startsWith(path);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/', icon: <i className="bx bxs-dashboard"></i> },
    { name: 'Admin Panel', path: '/admin/manage-admin/', icon: <i className="bx bxs-group"></i> },
    { 
      name: 'Online Orders', 
      path: '/admin/manage-online-order/', 
      icon: <i className="bx bxs-cart"></i>, 
      badge: notifs.online_order_notif > 0 ? <span className="num-ei">{notifs.online_order_notif}</span> : null 
    },
    { name: 'Your Repeat Rate', path: '/admin/manage-repeat-rate/', icon: <i className="bx bx-bar-chart-alt-2"></i> },
    { 
      name: 'Users', 
      path: '/admin/manage-ei-order/', 
      icon: <i className="bx bxs-user"></i>, 
      badge: notifs.ei_order_notif > 0 ? <span className="num-ei">{notifs.ei_order_notif}</span> : null 
    },
    { name: 'Category', path: '/admin/manage-category/', icon: <i className="bx bxs-category"></i> },
    { name: 'Food Menu', path: '/admin/manage-food/', icon: <i className="bx bxs-food-menu"></i> },
    { 
      name: 'Inventory', 
      path: '/admin/inventory/', 
      icon: <i className="bx bxs-box"></i>, 
      badge: notifs.stock_notif > 0 ? <span className="num-ei">{notifs.stock_notif}</span> : null 
    },
    { name: 'All Restro', path: '/admin/manage-restro/', icon: <i className="bx bx-restaurant"></i> },
    { name: 'All Restro Category', path: '/admin/manage-restro-category/', icon: <i className="bx bx-food-menu"></i> },
    { name: 'All Restro Food Item', path: '/admin/manage-restro-food/', icon: <i className="bx bx-dish"></i> },
    { name: 'All Restro Review', path: '/admin/manage-restro-review/', icon: <i className="bx bx-comment-detail"></i> },
    { name: 'Delivery Boy', path: '/admin/manage-delivery-boy/', icon: <i className="bx bxs-truck"></i> },
    { name: 'Discount Coupons', path: '/admin/manage-coupons/', icon: <i className="bx bxs-discount"></i> },
    { name: 'Festival Coupons', path: '/admin/manage-fest-coupon/', icon: <i className="bx bxs-gift"></i> },
    { name: 'Monthly Revenue', path: '/admin/monthly-revenue/', icon: <i className="bx bx-line-chart"></i> },
    { name: 'Payment History', path: '/admin/manage-delivery-payment/', icon: <i className="bx bx-rupee"></i> },
    { name: 'Customer Review', path: '/admin/manage-review/', icon: <i className="bx bx-star"></i> },
  ];

  return (
    <>
      {/* SIDEBAR */}
      <section id="sidebar" className={sidebarHidden ? 'hide' : ''}>
        <Link to="/admin/" className="brand">
          <img src="/static/images/logo2.png" alt="Logo" style={{ maxHeight: '62px', width: 'auto' }} onError={(e) => e.target.src = 'https://placehold.co/120x50'} />
        </Link>
        <ul className="side-menu top">
          {menuItems.map(item => (
            <li key={item.name} className={isTabActive(item.path) ? 'active' : ''}>
              <Link to={item.path}>
                {item.icon}
                <span className="text">{item.name}</span>
                {item.badge}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="side-menu">
          <li>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bx bxs-cog"></i>
              <span className="text">Settings</span>
            </a>
          </li>
          <li>
            <a href="#" className="logout" onClick={(e) => { e.preventDefault(); logout('admin'); }}>
              <i className="bx bxs-log-out-circle"></i>
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      {/* CONTENT */}
      <section id="content">
        {/* NAVBAR */}
        <nav>
          <i className="bx bx-menu" onClick={() => setSidebarHidden(!sidebarHidden)} style={{ cursor: 'pointer' }}></i>
          <a href="#" className="nav-link"></a>
          {/* <form action="#" onClick={(e) => e.preventDefault()}>
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button type="submit" className="search-btn"><i className="bx bx-search"></i></button>
            </div>
          </form> */}
          <div className="nav-actions">
            <input 
              type="checkbox" 
              id="switch-mode" 
              hidden 
              checked={darkMode} 
              onChange={(e) => {
                const isDark = e.target.checked;
                setDarkMode(isDark);
                localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
              }} 
            />
            <label htmlFor="switch-mode" className="switch-mode"></label>
            
            <div className="fetch_message">
              <div className="action_message notfi_message">
                <Link to="/admin/messages"><i className="bx bxs-envelope"></i></Link>
                {notifs.message_notif > 0 && <span className="num">{notifs.message_notif}</span>}
              </div>
            </div>

            <div className="notification" style={{ position: 'relative' }}>
              <div className="action notif" onClick={() => setNotifOpen(!notifOpen)} style={{ cursor: 'pointer' }}>
                <i className="bx bxs-bell"></i>
                {notifs.total_notif > 0 && <span className="num">{notifs.total_notif}</span>}
                
                {notifOpen && (
                  <div className="notif_menu active" style={{ display: 'block', position: 'absolute', top: '100%', right: 0, background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '8px', zIndex: 1000, width: '260px', boxShadow: 'var(--shadow-soft)' }}>
                    <ul style={{ padding: '8px', margin: 0 }}>
                      {notifs.stock_notif > 0 && (
                        <li style={{ borderBottom: '1px solid var(--line)', padding: '8px 10px', fontSize: '0.85rem' }}>
                          <Link to="/admin/inventory?low=1" style={{ color: 'var(--text-main)' }}>
                            {notifs.stock_notif} Item{notifs.stock_notif === 1 ? ' is' : 's are'} running out of stock
                          </Link>
                        </li>
                      )}
                      {notifs.online_order_notif > 0 && (
                        <li style={{ borderBottom: '1px solid var(--line)', padding: '8px 10px', fontSize: '0.85rem' }}>
                          <Link to="/admin/manage-online-order?remaining=1" style={{ color: 'var(--text-main)' }}>
                            {notifs.online_order_notif} New Online Order
                          </Link>
                        </li>
                      )}
                      {notifs.ei_order_notif > 0 && (
                        <li style={{ padding: '8px 10px', fontSize: '0.85rem' }}>
                          <Link to="/admin/manage-online-order" style={{ color: 'var(--text-main)' }}>
                            {notifs.ei_order_notif} New EI Order
                          </Link>
                        </li>
                      )}
                      {notifs.total_notif === 0 && (
                        <li style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="admin-avatar" title={`Logged in as ${user?.username || 'Admin'}`}>
              {(user?.username || 'A')[0].toUpperCase()}
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main>
          <Outlet />
        </main>
      </section>
    </>
  );
}
