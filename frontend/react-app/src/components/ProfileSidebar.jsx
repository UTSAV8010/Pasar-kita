import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';

export default function ProfileSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to log out?')) {
      logout('customer');
    }
  };

  const displayName = user?.name || user?.username || 'Guest';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const isActive = (paths) => paths.includes(location.pathname);

  const linkBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    borderRadius: '12px',
    padding: '12px 14px',
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.18s ease',
    background: '#fff',
    color: '#22345e',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const activeStyle = {
    background: 'linear-gradient(90deg, #fea116, #f57f17)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(230,149,0,0.28)',
  };

  const logoutStyle = {
    ...linkBase,
    background: '#fff7f7',
    color: '#a52626',
    border: '1px solid #f2c8c8',
  };

  return (
    <div style={{
      border: '1px solid #e6eaf4',
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 14px 36px rgba(15, 33, 74, 0.08)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Orange Banner Header */}
      <div style={{
        padding: '28px 24px 22px',
        textAlign: 'center',
        background: '#e69500',
      }}>
        {/* Avatar Circle */}
        <div style={{
          width: '86px',
          height: '86px',
          borderRadius: '50%',
          border: '4px solid rgba(255, 255, 255, 0.30)',
          margin: '0 auto 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#eef1f6',
          color: '#4a5568',
          fontSize: '2.1rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          lineHeight: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {avatarLetter}
        </div>
        {/* Display Name */}
        <h2 style={{
          fontSize: '1.3rem',
          margin: 0,
          fontWeight: 800,
          color: '#fff',
          wordBreak: 'break-word',
        }}>{displayName}</h2>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Edit Profile */}
        <button
          onClick={() => navigate('/update-account/')}
          style={{
            ...linkBase,
            ...(isActive(['/myaccount/', '/update-account/']) ? activeStyle : { border: '1px solid #e6eaf4' }),
          }}
          className="sb-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            <path d="M21 15l-2 2-1-1"/>
          </svg>
          Edit Profile
        </button>

        {/* View Orders */}
        <button
          onClick={() => navigate('/view-orders/')}
          style={{
            ...linkBase,
            ...(isActive(['/view-orders/']) ? activeStyle : { border: '1px solid #e6eaf4' }),
          }}
          className="sb-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          View Orders
        </button>

        {/* Change Password */}
        <button
          onClick={() => navigate('/update-password/')}
          style={{
            ...linkBase,
            ...(isActive(['/update-password/']) ? activeStyle : { border: '1px solid #e6eaf4' }),
          }}
          className="sb-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Change Password
        </button>

        {/* Logout */}
        <a
          href="/logout/"
          onClick={handleLogoutClick}
          style={logoutStyle}
          className="sb-logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </a>
      </div>

      <style>{`
        .sb-link:hover {
          background: linear-gradient(90deg, #fea116, #f57f17) !important;
          color: #fff !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(230,149,0,0.28) !important;
        }
        .sb-logout:hover {
          background: linear-gradient(90deg, #d94a4a, #b91c1c) !important;
          color: #fff !important;
          border-color: transparent !important;
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
}
