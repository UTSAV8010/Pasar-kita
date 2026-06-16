import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { CheckCircle2 } from 'lucide-react';

export default function ForgetPassword() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  // Reset steps: 1 = Email Input, 2 = Key Verification, 3 = Password Input, 4 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [resetKeyInput, setResetKeyInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field validation errors state
  const [errors, setErrors] = useState({
    email: '',
    resetKey: '',
    newPassword: '',
    confirmPassword: ''
  });

  // OTP Timer
  const [expiresAt, setExpiresAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (step !== 2 || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = expiresAt - Math.floor(Date.now() / 1000);
      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, expiresAt]);

  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Validation Patterns & Functions
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    resetKey: /^[0-9]{6}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
  };

  const validateField = (field, val) => {
    const value = (val || '').trim();
    if (!value) {
      if (field === 'email') return 'Email is required.';
      if (field === 'resetKey') return 'Reset key is required.';
      if (field === 'newPassword') return 'New password is required.';
      if (field === 'confirmPassword') return 'Confirm password is required.';
      return '';
    }

    if (field === 'email' && !patterns.email.test(value)) {
      return 'Please enter a valid email address.';
    }

    if (field === 'resetKey' && !patterns.resetKey.test(value)) {
      return 'Reset key must be exactly 6 digits.';
    }

    if (field === 'newPassword' && !patterns.password.test(val)) {
      return 'Must be 8+ chars with upper, lower, number, and special character.';
    }

    if (field === 'confirmPassword') {
      if (val !== newPassword) {
        return 'Passwords do not match.';
      }
    }

    return '';
  };

  const handleFieldChange = (field, val) => {
    if (field === 'email') setEmail(val);
    else if (field === 'resetKey') setResetKeyInput(val);
    else if (field === 'newPassword') setNewPassword(val);
    else if (field === 'confirmPassword') setConfirmPassword(val);

    setErrors(prev => {
      const nextErrors = { ...prev, [field]: validateField(field, val) };
      if (field === 'newPassword' && confirmPassword) {
        nextErrors.confirmPassword = val === confirmPassword ? '' : 'Passwords do not match.';
      }
      return nextErrors;
    });
  };

  // Step 1: Submit Email
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    const eErr = validateField('email', email);
    if (eErr) {
      setErrors(prev => ({ ...prev, email: eErr }));
      addAlert(eErr, 'warning');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('verify_email', '1');
      data.append('email', email);

      const response = await apiRequest('/forget/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        if (response.show_reset_key) {
          setStep(2);
          setExpiresAt(response.reset_expires_at || (Math.floor(Date.now() / 1000) + 60));
          setRemainingTime(60);
          setErrors({
            email: '',
            resetKey: '',
            newPassword: '',
            confirmPassword: ''
          });
          addAlert('Reset key sent to your registered email!', 'success');
        } else if (response.message) {
          const cleanMessage = response.message.replace(/<[^>]*>/g, '');
          if (response.message.includes('success-box')) {
            setStep(2);
            setExpiresAt(response.reset_expires_at || (Math.floor(Date.now() / 1000) + 60));
            setRemainingTime(60);
            setErrors({
              email: '',
              resetKey: '',
              newPassword: '',
              confirmPassword: ''
            });
            addAlert(cleanMessage, 'success');
          } else {
            addAlert(cleanMessage, 'danger');
            setMessage(cleanMessage);
            setMessageClass('error');
          }
        }
      }
    } catch (err) {
      addAlert('Failed to submit email. Please check your spelling.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Key
  const handleVerifyKey = async (e) => {
    e.preventDefault();
    const kErr = validateField('resetKey', resetKeyInput);
    if (kErr) {
      setErrors(prev => ({ ...prev, resetKey: kErr }));
      addAlert(kErr, 'warning');
      return;
    }

    if (remainingTime <= 0) {
      addAlert('Reset key expired. Click Resend to get a new code.', 'danger');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('verify_reset_key', '1');
      data.append('reset_key', resetKeyInput);

      const response = await apiRequest('/forget/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        if (response.show_password) {
          setStep(3);
          setErrors({
            email: '',
            resetKey: '',
            newPassword: '',
            confirmPassword: ''
          });
          addAlert('Reset key verified. Enter your new password.', 'success');
        } else if (response.message) {
          const cleanMessage = response.message.replace(/<[^>]*>/g, '');
          if (response.message.includes('success-box')) {
            setStep(3);
            setErrors({
              email: '',
              resetKey: '',
              newPassword: '',
              confirmPassword: ''
            });
            addAlert(cleanMessage, 'success');
          } else {
            addAlert(cleanMessage, 'danger');
            setMessage(cleanMessage);
            setMessageClass('error');
          }
        }
      }
    } catch (err) {
      addAlert('Failed to verify reset key.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend Key
  const handleResendKey = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('resend_reset_key', '1');

      const response = await apiRequest('/forget/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        setExpiresAt(response.reset_expires_at || (Math.floor(Date.now() / 1000) + 60));
        setRemainingTime(60);
        setErrors(prev => ({ ...prev, resetKey: '' }));
        addAlert('A new password reset key has been sent!', 'success');
      }
    } catch (err) {
      addAlert('Failed to resend reset key', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const pErr = validateField('newPassword', newPassword);
    const cpErr = validateField('confirmPassword', confirmPassword);
    if (pErr || cpErr) {
      setErrors(prev => ({ ...prev, newPassword: pErr, confirmPassword: cpErr }));
      addAlert('Please fix the errors in the form.', 'warning');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('update_password', '1');
      data.append('new_password', newPassword);
      data.append('confirm_password', confirmPassword);

      const response = await apiRequest('/forget/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        const cleanMessage = (response.message || '').replace(/<[^>]*>/g, '');
        if (response.message && response.message.includes('success-box')) {
          setStep(4);
          addAlert('Password updated successfully!', 'success');
        } else {
          addAlert(cleanMessage || 'Failed to update password', 'danger');
          setMessage(cleanMessage || 'Failed to update password');
          setMessageClass('error');
        }
      }
    } catch (err) {
      addAlert('Failed to change password.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setEmail('');
    setResetKeyInput('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setErrors({
      email: '',
      resetKey: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const stepLabels = ['Verify Email', 'Enter Code', 'New Password', 'Done'];

  return (
    <div style={{
      margin: 0,
      minHeight: '100vh',
      fontFamily: '"Nunito", "Segoe UI", sans-serif',
      background: 'radial-gradient(850px 480px at -10% -20%, rgba(230, 149, 0, 0.18), transparent 70%), radial-gradient(900px 520px at 110% 120%, rgba(13, 110, 253, 0.2), transparent 70%), linear-gradient(135deg, rgba(15, 34, 74, 0.42), rgba(22, 47, 99, 0.42)), url("/images/login-page.jpg") center / cover no-repeat fixed',
      display: 'grid',
      placeItems: 'center',
      padding: '18px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '470px',
        borderRadius: '22px',
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.55)',
        boxShadow: '0 24px 58px rgba(6, 16, 34, 0.35)',
        padding: '28px 24px 22px',
        backdropFilter: 'blur(8px)',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}>
        {/* Brand logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img src="/images/logo2.png" alt="Pasar-kita" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
        </div>

        <h1 style={{
          margin: '0 0 4px',
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 900,
          color: '#0f172f'
        }}>
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Verify Reset Code'}
          {step === 3 && 'New Password'}
          {step === 4 && 'All Done!'}
        </h1>

        <p style={{
          margin: '0 0 14px',
          textAlign: 'center',
          color: '#61708c',
          fontSize: '0.9rem',
          lineHeight: 1.4
        }}>
          {step === 1 && 'Enter your email to receive a 6-digit reset code'}
          {step === 2 && 'Enter the 6-digit code sent to your email'}
          {step === 3 && 'Create a strong new password for your account'}
          {step === 4 && 'Your password has been successfully updated'}
        </p>

        {/* Step chips */}
        <div style={{
          margin: '0 auto 14px',
          width: 'fit-content',
          borderRadius: '999px',
          padding: '7px 13px',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: '#355186',
          background: '#f3f7ff',
          border: '1px solid #dbe6fb'
        }}>
          {step === 4 ? 'Complete ✓' : `Step ${step} of 3: ${stepLabels[step - 1]}`}
        </div>

        {/* Step progress bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '4px',
              borderRadius: '4px',
              background: s <= step ? 'linear-gradient(90deg, #ffb325, #e69500)' : '#e2e8f0',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        {message && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textAlign: 'center',
            background: messageClass === 'success' ? 'rgba(25, 135, 84, 0.11)' : 'rgba(220, 53, 69, 0.1)',
            color: messageClass === 'success' ? '#0f5a36' : '#b42334',
            border: `1px solid ${messageClass === 'success' ? 'rgba(25, 135, 84, 0.25)' : 'rgba(220, 53, 69, 0.25)'}`
          }}>
            {message}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSubmitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d8e0ef',
                  borderRadius: '12px',
                  padding: '11px 13px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
                className="auth-input-focus"
                required
              />
              <span style={errStyle}>{errors.email}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                border: 0,
                borderRadius: '12px',
                padding: '11px 14px',
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#fff',
                background: 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: '0 14px 24px rgba(230, 149, 0, 0.28)',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verify Reset Key */}
        {step === 2 && (
          <form onSubmit={handleVerifyKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>6-Digit Reset Code</label>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={resetKeyInput}
                onChange={(e) => handleFieldChange('resetKey', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d8e0ef',
                  borderRadius: '12px',
                  padding: '11px 13px',
                  outline: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
                className="auth-input-focus"
                required
              />
              <span style={errStyle}>{errors.resetKey}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#5e6d89' }}>
              <div>
                Remaining: <span style={{ fontWeight: 900, color: remainingTime > 10 ? '#173167' : '#b42334' }}>{formatTimer(remainingTime)}</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResendKey}
                  disabled={remainingTime > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: remainingTime > 0 ? '#94a3b8' : '#1f64d4',
                    fontWeight: 800,
                    cursor: remainingTime > 0 ? 'not-allowed' : 'pointer',
                    padding: 0
                  }}
                >
                  Resend Code
                </button>
              </div>
            </div>

            {remainingTime <= 0 && (
              <div style={{ color: '#b42334', fontSize: '0.84rem', textAlign: 'center', fontWeight: 700 }}>
                Code expired. Click Resend to get a new code.
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
              Need to restart?{' '}
              <button
                type="button"
                onClick={handleRestart}
                style={{ background: 'none', border: 'none', color: '#1f64d4', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                Start again
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || remainingTime <= 0}
              style={{
                width: '100%',
                border: 0,
                borderRadius: '12px',
                padding: '11px 14px',
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#fff',
                background: loading || remainingTime <= 0
                  ? 'linear-gradient(135deg, #ccc, #bbb)'
                  : 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: '0 14px 24px rgba(230, 149, 0, 0.28)',
                cursor: loading || remainingTime <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify Reset Code'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>New Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => handleFieldChange('newPassword', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d8e0ef',
                  borderRadius: '12px',
                  padding: '11px 13px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
                className="auth-input-focus"
                required
              />
              <div style={{ fontSize: '0.76rem', color: '#6b7892', marginTop: '4px', marginBottom: '4px' }}>Must be 8+ chars with upper, lower, number, and special character.</div>
              <span style={errStyle}>{errors.newPassword}</span>
            </div>
            <div>
              <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d8e0ef',
                  borderRadius: '12px',
                  padding: '11px 13px',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
                className="auth-input-focus"
                required
              />
              <span style={errStyle}>{errors.confirmPassword}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                border: 0,
                borderRadius: '12px',
                padding: '11px 14px',
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#fff',
                background: 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: '0 14px 24px rgba(230, 149, 0, 0.28)',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              {loading ? 'Saving password...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(25, 135, 84, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#198754'
            }}>
              <CheckCircle2 size={42} />
            </div>
            <p style={{ color: '#61708c', fontSize: '0.95rem', margin: 0 }}>
              Your password has been successfully reset! You can now log in with your new credentials.
            </p>
            <Link
              to="/login/"
              style={{
                display: 'block',
                width: '100%',
                border: 0,
                borderRadius: '12px',
                padding: '11px 14px',
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#fff',
                background: 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: '0 14px 24px rgba(230, 149, 0, 0.28)',
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            >
              Log In Now
            </Link>
          </div>
        )}

        {step !== 4 && (
          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.9rem', color: '#53627f' }}>
            Remembered your password?{' '}
            <Link to="/login/" style={{ color: '#1f64d4', textDecoration: 'none', fontWeight: 700 }}>Log In</Link>
          </div>
        )}
      </div>

      <style>{`
        .auth-input-focus:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64, 124, 224, 0.14) !important;
        }
      `}</style>
    </div>
  );
}

const errStyle = {
  display: 'block',
  minHeight: '18px',
  fontSize: '0.78rem',
  color: '#dc3545',
  marginTop: '4px',
};
