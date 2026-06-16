import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminSignup() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    document.body.style.color = '#121d35';
    document.body.style.background = `
      radial-gradient(850px 520px at -10% 0%, rgba(230, 149, 0, .18), transparent 70%),
      radial-gradient(950px 560px at 115% 100%, rgba(13, 110, 253, .22), transparent 70%),
      linear-gradient(140deg, rgba(15, 34, 74, .42), rgba(23, 49, 103, .42)),
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
    if (!fullName || !username || !email || !password || !confirmPassword) {
      addAlert('Please fill in all fields', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      addAlert('Passwords do not match', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('full_name', fullName.trim());
      data.append('username', username.trim());
      data.append('email', email.trim());
      data.append('password', password);
      data.append('confirm_password', confirmPassword);

      const response = await apiRequest('/admin/signup', {
        method: 'POST',
        body: data,
      });

      if (response && response.status === 'redirect') {
        addAlert('Registration successful! Please log in.', 'success');
        window.location.href = response.redirect;
      } else if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || 'Registration failed';
        addAlert(text, 'danger');
      } else {
        addAlert('Registration successful! Please log in.', 'success');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error(err);
      addAlert('Registration failed. Username or email may already be taken.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg-1: #0f224a;
          --bg-2: #173167;
          --accent: #e69500;
          --text: #121d35;
          --muted: #60708d;
          --border: #d6dfef;
          --danger: #dc3545;
        }

        .auth-shell {
          width: 100%;
          max-width: 720px;
          background: rgba(255, 255, 255, .96);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: 22px;
          box-shadow: 0 24px 62px rgba(6, 16, 34, .38);
          padding: 28px 24px 22px;
          backdrop-filter: blur(8px);
          transition: transform .25s ease, box-shadow .25s ease;
          box-sizing: border-box;
        }

        .auth-shell:hover {
          transform: translateY(-3px);
          box-shadow: 0 32px 70px rgba(6, 16, 34, .4);
        }

        .auth-head {
          text-align: center;
          margin-bottom: 14px;
        }

        .auth-head img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .auth-title {
          margin: 0 0 4px;
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--text);
        }

        .auth-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: .95rem;
        }

        .field-group { margin-bottom: 10px; }

        .field-label {
          font-size: .82rem;
          font-weight: 700;
          color: #3f4f6e;
          margin-bottom: 6px;
          display: block;
          text-align: left;
        }

        .field-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 12px;
          outline: none;
          font-size: .95rem;
          background: #fff;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
          box-sizing: border-box;
          color: #121d35;
        }

        .field-input:hover { border-color: #b7c5df; }

        .field-input:focus {
          border-color: #7fa8ea;
          box-shadow: 0 0 0 4px rgba(64, 124, 224, .14);
        }

        .hint {
          font-size: .76rem;
          color: #6b7892;
          margin-top: 4px;
          margin-bottom: 4px;
          text-align: left;
        }

        .auth-btn {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: .96rem;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, #ffb326, #e69500);
          box-shadow: 0 14px 24px rgba(230, 149, 0, .28);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
          margin-top: 14px;
          cursor: pointer;
        }

        .auth-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(230, 149, 0, .33);
          filter: brightness(1.04);
        }

        .auth-footer {
          margin-top: 18px;
          text-align: center;
          font-size: .9rem;
          color: #53627f;
        }

        .auth-link {
          color: #1f64d4;
          text-decoration: none;
          font-weight: 700;
        }

        .auth-link:hover { text-decoration: underline; color: #0f4fb5; }

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
          color: var(--muted);
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        /* Responsive rows */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -10px;
          margin-left: -10px;
        }
        .col-md-6 {
          flex: 0 0 100%;
          max-width: 100%;
          padding-right: 10px;
          padding-left: 10px;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .col-md-6 {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }
      `}</style>

      <div className="auth-shell">
        <div className="auth-head">
          <img src="/static/images/logo2.png" alt="Pasar-kita" />
          <h1 className="auth-title">Create Admin Account</h1>
          <p className="auth-subtitle">Use a strong password and unique username for secure admin access.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 field-group">
              <label className="field-label" htmlFor="full_name">Full Name</label>
              <input 
                className="field-input" 
                type="text" 
                id="full_name" 
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
            <div className="col-md-6 field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input 
                className="field-input" 
                type="text" 
                id="username" 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input 
                className="field-input" 
                type="email" 
                id="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="col-md-6 field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="Password"
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
              <div className="hint">8+ chars with upper, lower, number and special char.</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 field-group">
              <label className="field-label" htmlFor="confirm_password">Confirm Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirm_password" 
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link className="auth-link" to="/admin/login">Log in</Link>
        </div>
      </div>
    </>
  );
}
