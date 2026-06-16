import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Eye, EyeOff } from 'lucide-react';

export default function RestroForget() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  // Recovery steps: 1 = Email, 2 = Verify OTP, 3 = Reset Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

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

  const validateEmail = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateOtp = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      setOtpError('Reset key is required.');
      return false;
    }
    if (!/^[0-9]{6}$/.test(trimmed)) {
      setOtpError('OTP must be 6 digits.');
      return false;
    }
    setOtpError('');
    return true;
  };

  const validatePassword = (val) => {
    if (!val) {
      setPasswordError('Password is required.');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/.test(val)) {
      setPasswordError('Password strength is insufficient.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val) => {
    if (!val) {
      setConfirmError('Confirm password is required.');
      return false;
    }
    if (val !== newPassword) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('verify_email', '1');
      data.append('email', email.trim());

      const response = await apiRequest('/restro/forget', {
        method: 'POST',
        body: data,
      });

      if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.toLowerCase().includes('sent') || response.showResetKeyField) {
          addAlert(text || 'OTP sent successfully!', 'success');
          setStep(2);
        } else {
          addAlert(text || 'Failed to verify email.', 'danger');
        }
      } else if (response && response.showResetKeyField) {
        addAlert('Reset code sent to your registered email.', 'success');
        setStep(2);
      } else {
        addAlert('Verification code sent!', 'success');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      addAlert('Email address not found.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!validateOtp(otp)) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('verify_reset_key', '1');
      data.append('reset_key', otp.trim());

      const response = await apiRequest('/restro/forget', {
        method: 'POST',
        body: data,
      });

      if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.toLowerCase().includes('verified') || response.showPasswordField) {
          addAlert(text || 'Reset key verified successfully!', 'success');
          setStep(3);
        } else {
          addAlert(text || 'Invalid reset key.', 'danger');
        }
      } else if (response && response.showPasswordField) {
        addAlert('Reset key verified. Enter new password.', 'success');
        setStep(3);
      } else {
        addAlert('OTP verified!', 'success');
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      addAlert('Verification failed. Invalid or expired OTP.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword) || !validateConfirmPassword(confirmPassword)) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('update_password', '1');
      data.append('new_password', newPassword);
      data.append('confirm_password', confirmPassword);

      const response = await apiRequest('/restro/forget', {
        method: 'POST',
        body: data,
      });

      if (response && response.status === 'redirect') {
        addAlert('Password reset successful! Please login with your new password.', 'success');
        navigate(response.redirect);
      } else if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.toLowerCase().includes('successful') || text.toLowerCase().includes('login')) {
          addAlert(text || 'Password reset successful!', 'success');
          navigate('/restro/login');
        } else {
          addAlert(text || 'Failed to update password.', 'danger');
        }
      } else {
        addAlert('Password updated successfully!', 'success');
        navigate('/restro/login');
      }
    } catch (err) {
      console.error(err);
      addAlert('Password update failed. Make sure your password meets the complexity requirements.', 'danger');
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
          box-sizing: border-box;
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

        .field-error {
          display: block;
          min-height: 18px;
          font-size: .78rem;
          color: var(--auth-danger);
          margin-top: 4px;
          text-align: left;
        }

        .hint {
          font-size: .76rem;
          color: #6b7892;
          margin-top: 4px;
          text-align: left;
        }

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
          margin-top: 8px;
          cursor: pointer;
        }

        .auth-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.04);
          box-shadow: 0 18px 30px rgba(230, 149, 0, 0.33);
        }

        .auth-footer {
          margin-top: 14px;
          text-align: center;
          font-size: .9rem;
          color: #53627f;
        }

        .link-inline {
          color: #1f64d4;
          text-decoration: none;
          font-weight: 700;
        }

        .link-inline:hover { color: #0f4fb5; text-decoration: underline; }

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
          color: var(--auth-muted);
          display: grid;
          place-items: center;
          cursor: pointer;
        }
      `}</style>

      <div className="auth-shell">
        <div className="auth-brand">
          <img src="/static/images/logo2.png" alt="Logo" />
        </div>
        <h1 className="auth-title">Recover Password</h1>
        <p className="auth-subtitle">Verify your identity and update your restaurant password.</p>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Registered Email Address</label>
              <input 
                className="field-input" 
                type="email" 
                id="email" 
                placeholder="Enter your registered email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                required 
              />
              <span className="field-error">{emailError}</span>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="reset_key">6-Digit Reset Code (OTP)</label>
              <input 
                className="field-input" 
                type="text" 
                id="reset_key" 
                maxLength={6}
                placeholder="Enter 6-digit code" 
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (otpError) validateOtp(e.target.value);
                }}
                required 
              />
              <span className="field-error">{otpError}</span>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Verifying Code...' : 'Verify Code'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1f64d4',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                Back to Email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="new_password">New Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showPassword ? "text" : "password"} 
                  id="new_password" 
                  placeholder="Create new password" 
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
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
              <div className="hint">8+ chars with upper, lower, number & special char.</div>
              <span className="field-error">{passwordError}</span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="confirm_password">Confirm New Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirm_password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) validateConfirmPassword(e.target.value);
                  }}
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
              <span className="field-error">{confirmError}</span>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered password? <Link className="link-inline" to="/restro/login">Log in</Link>
        </div>
      </div>
    </>
  );
}
