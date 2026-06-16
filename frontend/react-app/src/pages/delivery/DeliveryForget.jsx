import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Eye, EyeOff } from 'lucide-react';

export default function DeliveryForget() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      radial-gradient(800px 500px at -10% 0%, rgba(230, 149, 0, .18), transparent 70%),
      radial-gradient(900px 540px at 110% 100%, rgba(13, 110, 253, .2), transparent 70%),
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

  const parseDjangoMessage = (html) => {
    if (!html) return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || html;
    } catch (e) {
      return html;
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      addAlert('Email is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/delivery-boy/forget', {
        method: 'POST',
        body: { action: 'verify_email', email: email.trim() }
      });

      if (response && response.success) {
        const text = parseDjangoMessage(response.message);
        addAlert(text || 'OTP sent successfully!', 'success');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      const text = parseDjangoMessage(err.message || 'Verification failed. Email may not exist.');
      addAlert(text, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      addAlert('OTP is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/delivery-boy/forget', {
        method: 'POST',
        body: { action: 'verify_reset_key', reset_key: otp.trim() }
      });

      if (response && response.success) {
        const text = parseDjangoMessage(response.message);
        addAlert(text || 'OTP verified successfully!', 'success');
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      const text = parseDjangoMessage(err.message || 'Verification failed. Invalid OTP.');
      addAlert(text, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      addAlert('All password fields are required', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addAlert('Passwords do not match', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/delivery-boy/forget', {
        method: 'POST',
        body: {
          action: 'update_password',
          new_password: newPassword,
          confirm_password: confirmPassword
        }
      });

      if (response && response.status === 'redirect') {
        addAlert('Password reset successful. Please login.', 'success');
        window.location.href = response.redirect;
      } else if (response && response.success) {
        addAlert('Password updated successfully.', 'success');
        navigate('/delivery-boy/login');
      }
    } catch (err) {
      console.error(err);
      const text = parseDjangoMessage(err.message || 'Failed to reset password.');
      addAlert(text, 'danger');
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
          --success: #198754;
        }

        .auth-shell {
          width: 100%;
          max-width: 480px;
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
          box-shadow: 0 30px 68px rgba(6, 16, 34, .4);
        }

        .auth-head { text-align: center; margin-bottom: 14px; }

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
          font-size: .94rem;
        }

        .step-chip {
          margin: 12px auto 14px;
          background: #f3f7ff;
          border: 1px solid #dbe6fb;
          color: #355186;
          border-radius: 999px;
          width: fit-content;
          padding: 6px 11px;
          font-size: .8rem;
          font-weight: 800;
          text-align: center;
        }

        .field-group { margin-bottom: 10px; }

        .field-label {
          font-size: .83rem;
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

        .footer-link {
          margin-top: 18px;
          text-align: center;
          font-size: .9rem;
          color: #53627f;
        }

        .footer-link a {
          color: #1f64d4;
          text-decoration: none;
          font-weight: 700;
        }

        .footer-link a:hover { text-decoration: underline; color: #0f4fb5; }

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
      `}</style>

      <div className="auth-shell">
        <div className="auth-head">
          <img src="/static/images/logo2.png" alt="Pasar-kita" />
          <h1 className="auth-title">Reset Delivery Password</h1>
          <p className="auth-subtitle">Secure 3-step flow to recover access to your account.</p>
        </div>

        {step === 1 && (
          <>
            <div className="step-chip">Step 1 of 3: Verify Email</div>
            <form onSubmit={handleSendOTP}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email Address</label>
                <input 
                  className="field-input" 
                  type="email" 
                  id="email" 
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Sending key...' : 'Send Reset Key'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="step-chip">Step 2 of 3: Verify Reset Key</div>
            <form onSubmit={handleVerifyOTP}>
              <div className="field-group">
                <label className="field-label" htmlFor="reset_key">6-digit Reset Key</label>
                <input 
                  className="field-input" 
                  type="text" 
                  id="reset_key" 
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required 
                />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Reset Key'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="step-chip">Step 3 of 3: Set New Password</div>
            <form onSubmit={handleUpdatePassword}>
              <div className="field-group">
                <label className="field-label" htmlFor="new_password">New Password</label>
                <div className="password-field">
                  <input 
                    className="field-input" 
                    type={showPassword ? "text" : "password"} 
                    id="new_password" 
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              <div className="field-group">
                <label className="field-label" htmlFor="confirm_password">Confirm Password</label>
                <div className="password-field">
                  <input 
                    className="field-input" 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirm_password" 
                    placeholder="Confirm password"
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
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </>
        )}

        <div className="footer-link">
          Back to <Link to="/delivery-boy/login">Login</Link>
        </div>
      </div>
    </>
  );
}
