import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { apiRequest } from '../api';

export default function DeliveryLayout() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsed states, theme and notifications
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifMenuActive, setNotifMenuActive] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('admin-theme') || 'light';
  });

  const [notifs, setNotifs] = useState({
    online_order_notif: 0,
    ei_order_notif: 0,
    total_notif: 0,
    delivery_initial: 'D'
  });

  // Sync theme
  useEffect(() => {
    const isDark = themeMode === 'dark';
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('admin-theme', themeMode);
    window.dispatchEvent(new CustomEvent('admin-theme-change', {
      detail: { theme: themeMode }
    }));
  }, [themeMode]);

  // Load stylesheet dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/delivery/style-admin.css';
    link.id = 'delivery-theme-css';
    document.head.appendChild(link);

    const boxicons = document.createElement('link');
    boxicons.rel = 'stylesheet';
    boxicons.href = 'https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css';
    boxicons.id = 'boxicons-link';
    document.head.appendChild(boxicons);

    return () => {
      const el = document.getElementById('delivery-theme-css');
      if (el) el.remove();
      const bx = document.getElementById('boxicons-link');
      if (bx) bx.remove();
    };
  }, []);

  // Sync notifications on location change
  useEffect(() => {
    async function fetchNotifs() {
      try {
        const data = await apiRequest('/delivery-boy/dashboard-live-data');
        if (data) {
          setNotifs({
            online_order_notif: data.online_order_notif || 0,
            ei_order_notif: data.ei_order_notif || 0,
            total_notif: data.total_notif || 0,
            delivery_initial: data.delivery_initial || 'D'
          });
        }
      } catch (err) {
        console.error('Failed to fetch delivery notifications:', err);
      }
    }
    if (user) {
      fetchNotifs();
    }
  }, [location.pathname, user]);

  // Check auth
  useEffect(() => {
    if (!user) {
      navigate('/delivery-boy/login');
    } else if (user.role !== undefined && Number(user.role) !== 3 && user.role !== 'delivery') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const currentPath = location.pathname;
  const isTabActive = (tabPath) => {
    if (tabPath === '/delivery-boy/' && (currentPath === '/delivery-boy/' || currentPath === '/delivery-boy/index' || currentPath === '/delivery-boy/index.php')) {
      return true;
    }
    return tabPath !== '/delivery-boy/' && currentPath.startsWith(tabPath);
  };

  return (
    <div style={{ fontFamily: '"Outfit", sans-serif' }}>
      <style>{`
        /* Avoid global link style overrides clashing with dashboard styling */
        #sidebar .side-menu a {
          text-decoration: none !important;
        }
        #sidebar .brand {
          text-decoration: none !important;
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
        #sidebar.hide ~ #content {
          width: calc(100% - 78px);
          margin-left: 78px;
        }
        #sidebar.hide {
          width: 78px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .action.notif .notif_menu ul {
          padding: 0;
          margin: 0;
          list-style: none;
        }
      `}</style>

      {/* SIDEBAR */}
      <section id="sidebar" className={sidebarCollapsed ? 'hide' : ''}>
        <Link to="/delivery-boy/" className="brand">
          <img src="/static/images/logo2.png" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} alt="Logo" />
        </Link>
        
        <ul className="side-menu top">
          <li className={isTabActive('/delivery-boy/') ? 'active' : ''}>
            <Link to="/delivery-boy/">
              <i className="bx bxs-dashboard"></i>
              <span className="text">Dashboard</span>
            </Link>
          </li>
          
          <li className={isTabActive('/delivery-boy/manage-online-order') ? 'active' : ''}>
            <Link to="/delivery-boy/manage-online-order">
              <i className="bx bxs-cart"></i>
              <span className="text">Online Orders&nbsp;</span>
              {notifs.online_order_notif > 0 && (
                <span className="num-ei">{notifs.online_order_notif}</span>
              )}
            </Link>
          </li>

          <li className={isTabActive('/delivery-boy/manage-delivery-payment') ? 'active' : ''}>
            <Link to="/delivery-boy/manage-delivery-payment">
              <i className="bx bx-rupee"></i>
              <span className="text">Payment History</span>
            </Link>
          </li>

          <li className={isTabActive('/delivery-boy/monthly-revenue') ? 'active' : ''}>
            <Link to="/delivery-boy/monthly-revenue">
              <i className="bx bx-line-chart"></i>
              <span className="text">Monthly Revenue</span>
            </Link>
          </li>

          <li className={isTabActive('/delivery-boy/manage-review') ? 'active' : ''}>
            <Link to="/delivery-boy/manage-review">
              <i className="bx bx-star"></i>
              <span className="text">Your Review</span>
            </Link>
          </li>

          <li className={isTabActive('/delivery-boy/update-password') ? 'active' : ''}>
            <Link to="/delivery-boy/update-password">
              <i className="bx bx-lock"></i>
              <span className="text">Change Password</span>
            </Link>
          </li>
        </ul>

        <ul className="side-menu">
          <li className={isTabActive('/delivery-boy/settings') ? 'active' : ''}>
            <Link to="/delivery-boy/settings">
              <i className="bx bxs-cog"></i>
              <span className="text">Settings</span>
            </Link>
          </li>
          <li>
            <a href="#" className="logout" onClick={(e) => { e.preventDefault(); logout('delivery-boy'); }}>
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
                <div className={`notif_menu ${notifMenuActive ? 'active' : ''}`} style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000 }}>
                  <ul style={{ textAlign: 'left' }}>
                    {notifs.online_order_notif > 0 && (
                      <li>
                        <Link to="/delivery-boy/manage-online-order?remaining=1" style={{ color: 'var(--text-main)' }}>
                          {notifs.online_order_notif}&nbsp;New Online Order
                        </Link>
                      </li>
                    )}
                    {notifs.ei_order_notif > 0 && (
                      <li>
                        <Link to="/delivery-boy/manage-online-order" style={{ color: 'var(--text-main)' }}>
                          {notifs.ei_order_notif}&nbsp;New EI Order
                        </Link>
                      </li>
                    )}
                    {notifs.online_order_notif === 0 && notifs.ei_order_notif === 0 && (
                      <li style={{ color: 'var(--text-muted)' }}>No new notifications</li>
                    )}
                  </ul>
                </div>
                {notifs.total_notif > 0 && (
                  <span className="num">{notifs.total_notif}</span>
                )}
              </div>
            </div>
            
            <div className="admin-avatar" title={user.username}>{notifs.delivery_initial}</div>
          </div>
        </nav>

        {/* MAIN BODY */}
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
