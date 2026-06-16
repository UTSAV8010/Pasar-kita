import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';

export default function Signup() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  // Form step states
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  // Step 1: Account Details Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: OTP Form States
  const [otpInput, setOtpInput] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Field validation errors state
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  // Timer countdown hook
  useEffect(() => {
    if (!otpStep || !otpExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = otpExpiresAt - Math.floor(Date.now() / 1000);
      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpStep, otpExpiresAt]);

  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Validation Patterns & Functions
  const patterns = {
    name: /^[A-Za-z][A-Za-z\s]{1,59}$/,
    username: /^[a-zA-Z0-9._-]{3,30}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9]{10,15}$/,
    city: /^[A-Za-z\s]{2,50}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
  };

  const validateField = (field, val) => {
    const value = (val || '').trim();
    if (!value) {
      if (field === 'name') return 'Enter valid full name (letters and spaces).';
      if (field === 'username') return '3-30 chars: letters, numbers, dot, underscore, hyphen.';
      if (field === 'email') return 'Enter valid email address.';
      if (field === 'phone') return 'Phone must be 10 to 15 digits.';
      if (field === 'city') return 'Enter valid city name.';
      if (field === 'address') return 'Address must be 6 to 120 characters.';
      if (field === 'password') return 'Use 8+ chars with upper, lower, number and special char.';
      if (field === 'confirmPassword') return 'Confirm password is required.';
      if (field === 'otp') return 'OTP is required.';
      return '';
    }

    if (field === 'address') {
      if (value.length < 6 || value.length > 120) {
        return 'Address must be 6 to 120 characters.';
      }
    } else if (patterns[field] && !patterns[field].test(value)) {
      if (field === 'name') return 'Enter valid full name (letters and spaces).';
      if (field === 'username') return '3-30 chars: letters, numbers, dot, underscore, hyphen.';
      if (field === 'email') return 'Enter valid email address.';
      if (field === 'phone') return 'Phone must be 10 to 15 digits.';
      if (field === 'city') return 'Enter valid city name.';
      if (field === 'password') return 'Use 8+ chars with upper, lower, number and special char.';
    }

    if (field === 'confirmPassword') {
      if (val !== password) {
        return 'Password and confirm password do not match.';
      }
    }

    return '';
  };

  const handleFieldChange = (field, val) => {
    if (field === 'name') setName(val);
    else if (field === 'username') setUsername(val);
    else if (field === 'email') setEmail(val);
    else if (field === 'phone') setPhone(val);
    else if (field === 'city') setCity(val);
    else if (field === 'address') setAddress(val);
    else if (field === 'password') setPassword(val);
    else if (field === 'confirmPassword') setConfirmPassword(val);

    setErrors(prev => {
      const nextErrors = { ...prev, [field]: validateField(field, val) };
      if (field === 'password' && confirmPassword) {
        nextErrors.confirmPassword = val === confirmPassword ? '' : 'Password and confirm password do not match.';
      }
      return nextErrors;
    });
  };

  const validateOtp = (val) => {
    const value = val.trim();
    if (!value) {
      return 'OTP is required.';
    }
    if (!/^[0-9]{6}$/.test(value)) {
      return 'OTP must be exactly 6 digits.';
    }
    return '';
  };

  const handleOtpChange = (val) => {
    const cleaned = val.replace(/\D/g, '');
    setOtpInput(cleaned);
    setErrors(prev => ({ ...prev, otp: validateOtp(cleaned) }));
  };

  // Submit Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateField('name', name),
      username: validateField('username', username),
      email: validateField('email', email),
      phone: validateField('phone', phone),
      city: validateField('city', city),
      address: validateField('address', address),
      password: validateField('password', password),
      confirmPassword: password === confirmPassword ? '' : 'Password and confirm password do not match.',
      otp: ''
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(err => err !== '');
    if (hasErrors) {
      addAlert('Please fix the errors in the form.', 'warning');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('send_signup_otp', '1');
      data.append('name', name);
      data.append('username', username);
      data.append('email', email);
      data.append('phone', phone);
      data.append('city', city);
      data.append('address', address);
      data.append('password', password);
      data.append('confirm_password', confirmPassword);

      const response = await apiRequest('/signup/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        if (response.otp_step) {
          setOtpStep(true);
          setOtpEmail(response.otp_email || email);
          setOtpExpiresAt(response.otp_expires_at || (Math.floor(Date.now() / 1000) + 60));
          setRemainingTime(60);
          setErrors({
            name: '',
            username: '',
            email: '',
            phone: '',
            city: '',
            address: '',
            password: '',
            confirmPassword: '',
            otp: ''
          });
          addAlert('Signup OTP sent to your email!', 'success');
        } else if (response.message) {
          addAlert(response.message, 'danger');
          setMessage(response.message);
          setMessageClass('error');
        }
      }
    } catch (err) {
      addAlert('Failed to submit registration form. Check entries.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const oErr = validateOtp(otpInput);

    if (oErr) {
      setErrors(prev => ({ ...prev, otp: oErr }));
      addAlert(oErr, 'warning');
      return;
    }

    if (remainingTime <= 0) {
      addAlert('OTP has expired. Please request a new code.', 'danger');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('verify_signup_otp', '1');
      data.append('signup_otp', otpInput);

      const response = await apiRequest('/signup/', {
        method: 'POST',
        body: data,
      });

      if (response) {
        if (response.message) {
          addAlert(response.message, 'danger');
          setMessage(response.message);
          setMessageClass('error');
        }
      }
    } catch (err) {
      addAlert('Failed to verify OTP. Check code.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('resend_signup_otp', '1');

      const response = await apiRequest('/signup/', {
        method: 'POST',
        body: data,
      });

      if (response && response.otp_step) {
        setOtpExpiresAt(response.otp_expires_at || (Math.floor(Date.now() / 1000) + 60));
        setRemainingTime(60);
        setErrors(prev => ({ ...prev, otp: '' }));
        addAlert('A new signup OTP has been sent!', 'success');
      }
    } catch (err) {
      addAlert('Failed to resend OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setOtpStep(false);
    setOtpInput('');
    setMessage('');
    setErrors({
      name: '',
      username: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
  };

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
        maxWidth: '640px',
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
          {otpStep ? 'Verify OTP' : 'Create Account'}
        </h1>

        <p style={{
          margin: '0 0 14px',
          textAlign: 'center',
          color: '#61708c',
          fontSize: '0.9rem',
          lineHeight: 1.4
        }}>
          {otpStep ? `Verification code sent to ${otpEmail}` : 'Sign up to place online food orders'}
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
          {otpStep ? 'Step 2 of 2: OTP Verification' : 'Step 1 of 2: Credentials'}
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

        {!otpStep ? (
          /* Step 1 Form */
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-mobile-1">
              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
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
                <span style={errStyle}>{errors.name}</span>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Username</label>
                <input 
                  type="text" 
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => handleFieldChange('username', e.target.value)}
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
                <span style={errStyle}>{errors.username}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-mobile-1">
              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
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

              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Phone</label>
                <input 
                  type="tel" 
                  placeholder="99780XXXXX"
                  value={phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
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
                <span style={errStyle}>{errors.phone}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-mobile-1">
              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>City</label>
                <input 
                  type="text" 
                  placeholder="Surat"
                  value={city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
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
                <span style={errStyle}>{errors.city}</span>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Address</label>
                <input 
                  type="text" 
                  placeholder="123 Street Name"
                  value={address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
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
                <span style={errStyle}>{errors.address}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-mobile-1">
              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Password</label>
                <input 
                  type="password" 
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
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
                <div style={{ fontSize: '0.76rem', color: '#6b7892', marginTop: '4px', marginBottom: '4px' }}>8+ chars with upper, lower, number and special char.</div>
                <span style={errStyle}>{errors.password}</span>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter password"
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
                marginTop: '12px'
              }}
            >
              {loading ? 'Submitting details...' : 'Send Signup OTP'}
            </button>
          </form>
        ) : (
          /* Step 2 Form (OTP verification) */
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.84rem', color: '#3e4b66', marginBottom: '6px', fontWeight: 700, display: 'block' }}>6-digit OTP</label>
              <input 
                type="text" 
                placeholder="000000" 
                maxLength="6"
                value={otpInput}
                onChange={(e) => handleOtpChange(e.target.value)}
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
              <span style={{ ...errStyle, textAlign: 'center' }}>{errors.otp}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#5e6d89', marginBottom: '14px' }}>
              <div>
                Remaining Time: <span style={{ fontWeight: 900, color: remainingTime > 10 ? '#173167' : '#b42334' }}>{formatTimer(remainingTime)}</span>
              </div>
              <div>
                <button 
                  type="button" 
                  onClick={handleResendOTP} 
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
                  Resend OTP
                </button>
              </div>
            </div>

            {remainingTime <= 0 && (
              <div style={{ color: '#b42334', fontSize: '0.84rem', textAlign: 'center', fontWeight: 700 }}>
                OTP expired. Click Resend to get a new code.
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
              Need to change details?{' '}
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
                background: 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: '0 14px 24px rgba(230, 149, 0, 0.28)',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP and Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.9rem', color: '#53627f' }}>
          Already have an account? <Link to="/login/" style={{ color: '#1f64d4', textDecoration: 'none', fontWeight: 700 }}>Log In</Link>
        </div>
      </div>

      <style>{`
        .auth-input-focus:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64, 124, 224, 0.14) !important;
        }
        @media (max-width: 575.98px) {
          .grid-mobile-1 {
            grid-template-columns: 1fr !important;
          }
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
