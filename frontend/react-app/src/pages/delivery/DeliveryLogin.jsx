import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Eye, EyeOff } from 'lucide-react';

export default function DeliveryLogin() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Apply legacy body styles on mount
  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalMinHeight = document.body.style.minHeight;
    const originalFontFamily = document.body.style.fontFamily;
    const originalColor = document.body.style.color;
    const originalBackground = document.body.style.background;
    const originalDisplay = document.body.style.display;
    const originalPlaceItems = document.body.style.placeItems;
    const originalPadding = document.body.style.padding;

    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.fontFamily = '"Nunito", "Segoe UI", sans-serif';
    document.body.style.color = '#0f172f';
    document.body.style.background = `
      radial-gradient(850px 480px at -10% -20%, rgba(230, 149, 0, 0.18), transparent 70%),
      radial-gradient(900px 520px at 110% 120%, rgba(13, 110, 253, 0.2), transparent 70%),
      linear-gradient(135deg, rgba(15, 34, 74, 0.42), rgba(22, 47, 99, 0.42)),
      url('/static/images/login-page.jpg') center / cover no-repeat fixed
    `;
    document.body.style.display = 'grid';
    document.body.style.placeItems = 'center';
    document.body.style.padding = '18px';

    return () => {
      document.body.style.margin = originalMargin;
      document.body.style.minHeight = originalMinHeight;
      document.body.style.fontFamily = originalFontFamily;
      document.body.style.color = originalColor;
      document.body.style.background = originalBackground;
      document.body.style.display = originalDisplay;
      document.body.style.placeItems = originalPlaceItems;
      document.body.style.padding = originalPadding;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      addAlert('Username and password are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', username.trim());
      data.append('password', password);

      const response = await apiRequest('/delivery-boy/login', {
        method: 'POST',
        body: data,
      });

      if (response && response.status === 'redirect') {
        addAlert('Rider logged in successfully!', 'success');
        window.location.href = response.redirect;
      } else if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || 'Invalid credentials';
        addAlert(text, 'danger');
      } else {
        addAlert('Logged in successfully', 'success');
        window.location.href = '/delivery-boy/';
      }
    } catch (err) {
      console.error(err);
      addAlert('Invalid rider username or password.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --auth-bg-1: #0f224a;
          --auth-bg-2: #162f63;
          --auth-accent: #e69500;
          --auth-text: #0f172f;
          --auth-muted: #61708c;
          --auth-border: #d8e0ef;
          --auth-danger: #dc3545;
        }

        .auth-shell {
          width: 100%;
          max-width: 460px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.55);
          box-shadow: 0 24px 58px rgba(6, 16, 34, 0.35);
          padding: 28px 24px 22px;
          backdrop-filter: blur(8px);
          transition: transform .25s ease, box-shadow .25s ease;
          box-sizing: border-box;
        }

        .auth-shell:hover {
          transform: translateY(-3px);
          box-shadow: 0 30px 64px rgba(6, 16, 34, 0.38);
        }

        .auth-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .auth-brand img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .auth-title {
          margin: 0 0 4px;
          text-align: center;
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--auth-text);
        }

        .auth-subtitle {
          text-align: center;
          color: var(--auth-muted);
          margin-bottom: 18px;
          font-size: .95rem;
          margin-top: 0;
        }

        .field-group { margin-bottom: 12px; }

        .field-label {
          font-size: .84rem;
          color: #3e4b66;
          margin-bottom: 6px;
          font-weight: 700;
          display: block;
          text-align: left;
        }

        .field-input {
          width: 100%;
          border: 1px solid var(--auth-border);
          border-radius: 12px;
          padding: 11px 13px;
          outline: none;
          font-size: .95rem;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
          background: #fff;
          color: #0f172f;
          box-sizing: border-box;
        }

        .field-input:hover { border-color: #b8c6df; }

        .field-input:focus {
          border-color: #7aa4ea;
          box-shadow: 0 0 0 4px rgba(64, 124, 224, 0.14);
        }

        .auth-helpers {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .link-inline {
          color: #1f64d4;
          text-decoration: none;
          font-weight: 700;
        }

        .link-inline:hover { color: #0f4fb5; text-decoration: underline; }

        .auth-btn {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: .95rem;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #ffb325, #e69500);
          box-shadow: 0 14px 24px rgba(230, 149, 0, 0.28);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
          cursor: pointer;
        }

        .auth-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.04);
          box-shadow: 0 18px 30px rgba(230, 149, 0, 0.33);
        }

        .auth-btn:active { transform: translateY(0); }

        .auth-footer {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: .9rem;
          color: #53627f;
        }

        .password-field {
          position: relative;
        }

        .password-field .field-input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border: 0;
          padding: 0;
          margin: 0;
          background: transparent;
          color: var(--auth-muted, #61708c);
          display: grid;
          place-items: center;
          cursor: pointer;
        }
      `}</style>

      <div className="auth-shell">
        <div className="auth-brand">
          <img src="/static/images/logo2.png" alt="Logo" />
        </div>
        <h1 className="auth-title">Delivery Login</h1>
        <p className="auth-subtitle">Sign in to view and manage your assigned deliveries.</p>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="username">Username</label>
            <input 
              className="field-input" 
              type="text" 
              id="username" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="password-field">
              <input 
                className="field-input" 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <Link className="link-inline" to="/delivery-boy/forget">Forgot Password?</Link>
          <span>New here? <Link className="link-inline" to="/delivery-boy/signup">Create Account</Link></span>
        </div>
      </div>
    </>
  );
}
