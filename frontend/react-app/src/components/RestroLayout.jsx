import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { apiRequest } from '../api';

export default function RestroLayout() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Notification and initials states
  const [notifs, setNotifs] = useState({
    online_order_notif: 0,
    stock_notif: 0,
    total_notif: 0,
    ei_order_notif: 0
  });
  const [restroInitial, setRestroInitial] = useState('R');
  const [notifMenuActive, setNotifMenuActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('admin-theme') || 'light';
  });

  useEffect(() => {
    const isDark = themeMode === 'dark';
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('admin-theme', themeMode);
    window.dispatchEvent(new CustomEvent('admin-theme-change', {
      detail: { theme: themeMode }
    }));
  }, [themeMode]);

  // Redirect to login if not authenticated or not restro
  useEffect(() => {
    if (!user) {
      navigate('/restro/login');
    } else if (user.role !== undefined && Number(user.role) !== 2 && user.role !== 'restro') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load stylesheet dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/restro/style-admin.css';
    link.id = 'restro-theme-css';
    document.head.appendChild(link);

    // Load Boxicons globally if not present
    const boxicons = document.createElement('link');
    boxicons.rel = 'stylesheet';
    boxicons.href = 'https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css';
    boxicons.id = 'boxicons-link';
    document.head.appendChild(boxicons);

    return () => {
      const el = document.getElementById('restro-theme-css');
      if (el) el.remove();
      const bx = document.getElementById('boxicons-link');
      if (bx) bx.remove();
    };
  }, []);

  // Fetch notifications and header context from live-data on route change
  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const data = await apiRequest('/restro/dashboard-live-data');
        if (data) {
          setNotifs({
            online_order_notif: data.online_order_notif || 0,
            stock_notif: data.stock_notif || 0,
            total_notif: data.total_notif || 0,
            ei_order_notif: data.ei_order_notif || 0
          });
          setRestroInitial(data.restro_initial || 'R');
        }
      } catch (err) {
        console.error('Failed to load portal notifications:', err);
      }
    }
    if (user) {
      fetchHeaderData();
    }
  }, [location.pathname, user]);

  if (!user) return null;

  const currentPath = location.pathname;

  const isTabActive = (tabPath) => {
    if (tabPath === '/restro/' && (currentPath === '/restro/' || currentPath === '/restro/index' || currentPath === '/restro/index.php')) {
      return true;
    }
    return tabPath !== '/restro/' && currentPath.startsWith(tabPath);
  };

  return (
    <div style={{ fontFamily: '"Nunito", "Segoe UI", sans-serif' }}>
      <style>{`
        /* Sidebar Link text overrides to prevent global styling collision */
        #sidebar .side-menu a {
          text-decoration: none !important;
        }
        #sidebar .brand {
          text-decoration: none !important;
          margin-bottom: 20px;
        }
        a.clickable {
          color: gray !important;
          pointer-events: auto !important;
          text-decoration: none !important;
        }
        a.clickable:hover {
          color: #007bff !important;
        }
        .admin-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e69500;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        #content nav .notification .notif_menu.active {
          display: block;
        }
        #sidebar.hide {
          width: 60px;
        }
        #sidebar.hide ~ #content {
          width: calc(100% - 60px);
          left: 60px;
        }
      `}</style>

      {/* SIDEBAR */}
      <section id="sidebar" className={sidebarCollapsed ? 'hide' : ''}>
        <Link to="/restro/" className="brand">
          <img src="/static/images/logo2.png" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} alt="Logo" />
        </Link>
        <ul className="side-menu top">
          <li className={isTabActive('/restro/') ? 'active' : ''}>
            <Link to="/restro/">
              <i className="bx bxs-dashboard"></i>
              <span className="text">Dashboard</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/manage-online-order') || isTabActive('/restro/update-online-order') ? 'active' : ''}>
            <Link to="/restro/manage-online-order">
              <i className="bx bxs-cart"></i>
              <span className="text">Online Orders&nbsp;</span>
              {notifs.online_order_notif > 0 && (
                <span className="num-ei">{notifs.online_order_notif}</span>
              )}
            </Link>
          </li>
          <li className={isTabActive('/restro/manage-category') || isTabActive('/restro/add-category') || isTabActive('/restro/update-category') ? 'active' : ''}>
            <Link to="/restro/manage-category">
              <i className="bx bxs-category"></i>
              <span className="text">Category</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/manage-food') || isTabActive('/restro/add-food') || isTabActive('/restro/update-food') ? 'active' : ''}>
            <Link to="/restro/manage-food">
              <i className="bx bxs-food-menu"></i>
              <span className="text">Food Menu</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/inventory') || isTabActive('/restro/update-inventory') ? 'active' : ''}>
            <Link to="/restro/inventory">
              <i className="bx bxs-box"></i>
              <span className="text">Inventory</span>
              {notifs.stock_notif > 0 && (
                <span className="num-ei">{notifs.stock_notif}</span>
              )}
            </Link>
          </li>
          <li className={isTabActive('/restro/monthly-revenue') ? 'active' : ''}>
            <Link to="/restro/monthly-revenue">
              <i className="bx bx-line-chart"></i>
              <span className="text">Monthly Revenue</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/manage-review') ? 'active' : ''}>
            <Link to="/restro/manage-review">
              <i className="bx bx-star"></i>
              <span className="text">Your Review</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/manage-repeat-rate') ? 'active' : ''}>
            <Link to="/restro/manage-repeat-rate">
              <i className="bx bx-bar-chart-alt-2"></i>
              <span className="text">Your Repeat Rate</span>
            </Link>
          </li>
          <li className={isTabActive('/restro/update-password') ? 'active' : ''}>
            <Link to="/restro/update-password">
              <i className="bx bx-lock"></i>
              <span className="text">Change Password</span>
            </Link>
          </li>
        </ul>
        <ul className="side-menu">
          <li className={isTabActive('/restro/settings') ? 'active' : ''}>
            <Link to="/restro/settings">
              <i className="bx bxs-cog"></i>
              <span className="text">Settings</span>
            </Link>
          </li>
          <li>
            <a href="#" className="logout" onClick={(e) => { e.preventDefault(); logout('restro'); }}>
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
          <i className="bx bx-menu" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ cursor: 'pointer' }}></i>
          <a href="#" className="nav-link"></a>
          <form action="#" style={{ visibility: 'hidden' }}>
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button type="submit" className="search-btn"><i className="bx bx-search"></i></button>
            </div>
          </form>
          <div className="nav-actions">
            <input 
              type="checkbox" 
              id="switch-mode" 
              hidden 
              checked={themeMode === 'dark'} 
              onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')} 
            />
            <label htmlFor="switch-mode" className="switch-mode"></label>
            <div className="notification" onClick={() => setNotifMenuActive(!notifMenuActive)} style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="action notif">
                <i className="bx bxs-bell"></i>
                <div className={`notif_menu ${notifMenuActive ? 'active' : ''}`} style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', zIndex: 1000, width: '250px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: '8px', textAlign: 'left' }}>
                    {notifs.stock_notif > 0 && (
                      <li style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <Link to="/restro/inventory?low=1" style={{ color: '#0f172f', fontSize: '0.85rem', textDecoration: 'none' }}>
                          {notifs.stock_notif} Item{notifs.stock_notif === 1 ? ' is' : 's are'} running out of stock
                        </Link>
                      </li>
                    )}
                    {notifs.online_order_notif > 0 && (
                      <li style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <Link to="/restro/manage-online-order?remaining=1" style={{ color: '#0f172f', fontSize: '0.85rem', textDecoration: 'none' }}>
                          {notifs.online_order_notif} New Online Order
                        </Link>
                      </li>
                    )}
                    {notifs.ei_order_notif > 0 && (
                      <li style={{ padding: '8px' }}>
                        <Link to="/restro/manage-online-order" style={{ color: '#0f172f', fontSize: '0.85rem', textDecoration: 'none' }}>
                          {notifs.ei_order_notif} New EI Order
                        </Link>
                      </li>
                    )}
                    {notifs.stock_notif === 0 && notifs.online_order_notif === 0 && notifs.ei_order_notif === 0 && (
                      <li style={{ padding: '8px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</li>
                    )}
                  </ul>
                </div>
                {notifs.total_notif > 0 && (
                  <span className="num">{notifs.total_notif}</span>
                )}
              </div>
            </div>
            
            <div className="admin-avatar" title={user.username}>{restroInitial}</div>
          </div>
        </nav>

        {/* MAIN */}
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
