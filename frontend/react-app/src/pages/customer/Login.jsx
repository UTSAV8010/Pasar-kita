import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';

export default function Login() {
  const { addAlert } = useApp();

  // Step states
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  // Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // OTP
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [otpEmail, setOtpEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  // Field validation errors state
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    otp: ''
  });

  // Ref array for the 6 digit inputs
  const digitRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (!otpStep || !expiresAt) return;

    const tick = () => {
      const rem = expiresAt - Math.floor(Date.now() / 1000);
      if (rem <= 0) {
        setRemainingTime(0);
        setOtpExpired(true);
      } else {
        setRemainingTime(rem);
        setOtpExpired(false);
      }
    };

    tick(); // run immediately
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [otpStep, expiresAt]);

  const formatTimer = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Get full 6-digit OTP string from digit boxes
  const getOtpValue = (d = digits) => d.join('');

  // Validation Patterns & Functions
  const usernamePattern = /^[a-zA-Z0-9._-]{3,30}$/;

  const validateUsername = (val) => {
    const value = val.trim();
    if (!value) {
      return 'Username is required.';
    }
    if (!usernamePattern.test(value)) {
      return 'Use 3-30 chars: letters, numbers, dot, underscore or hyphen.';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required.';
    }
    return '';
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

  // Change Handlers
  const handleUsernameChange = (val) => {
    setUsername(val);
    setErrors(prev => ({ ...prev, username: validateUsername(val) }));
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
  };

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);

    if (uErr || pErr) {
      setErrors({ username: uErr, password: pErr, otp: '' });
      addAlert('Please fix the errors in the form.', 'warning');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('send_login_otp', '1');
      data.append('username', username.trim());
      data.append('password', password);

      const response = await apiRequest('/login/', { method: 'POST', body: data });

      if (response) {
        if (response.otp_step) {
          setOtpStep(true);
          setOtpEmail(response.otp_email || 'your email');
          const exp = response.otp_expires_at || (Math.floor(Date.now() / 1000) + 60);
          setExpiresAt(exp);
          setRemainingTime(60);
          setOtpExpired(false);
          setDigits(['', '', '', '', '', '']);
          setErrors({ username: '', password: '', otp: '' });
          addAlert('Login OTP sent to your email!', 'success');
          setMessage('Login OTP sent to your registered email. It expires in 60 seconds.');
          setMessageClass('success');
          // Focus first digit after render
          setTimeout(() => digitRefs.current[0]?.focus(), 100);
        } else if (response.message) {
          addAlert(response.message, 'danger');
          setMessage(response.message);
          setMessageClass('error');
        }
      }
    } catch {
      addAlert('Credentials verification failed. Check username and password.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = getOtpValue();
    const oErr = validateOtp(otpValue);

    if (oErr) {
      setErrors(prev => ({ ...prev, otp: oErr }));
      addAlert(oErr, 'warning');
      return;
    }

    if (otpExpired) {
      addAlert('OTP expired. Click Resend to get a new code.', 'danger');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('verify_login_otp', '1');
      data.append('login_otp', otpValue);

      const response = await apiRequest('/login/', { method: 'POST', body: data });

      if (response && !response.otp_step) {
        addAlert('Login successful!', 'success');
        window.location.href = '/';
      } else if (response && response.message) {
        addAlert(response.message, 'danger');
        setMessage(response.message);
        setMessageClass('error');
      }
    } catch {
      addAlert('OTP verification failed. Check the code.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Resend OTP ─────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('resend_login_otp', '1');

      const response = await apiRequest('/login/', { method: 'POST', body: data });

      if (response && response.otp_step) {
        const exp = response.otp_expires_at || (Math.floor(Date.now() / 1000) + 60);
        setExpiresAt(exp);
        setRemainingTime(60);
        setOtpExpired(false);
        setDigits(['', '', '', '', '', '']);
        setErrors(prev => ({ ...prev, otp: '' }));
        addAlert('A new login OTP has been sent.', 'success');
        setMessage('A new login OTP has been sent. It expires in 60 seconds.');
        setMessageClass('success');
        setTimeout(() => digitRefs.current[0]?.focus(), 100);
      }
    } catch {
      addAlert('Failed to resend OTP', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnother = () => {
    setOtpStep(false);
    setDigits(['', '', '', '', '', '']);
    setMessage('');
    setOtpExpired(false);
    setErrors({ username: '', password: '', otp: '' });
  };

  // ─── OTP digit box handlers ─────────────────────────────────────────────────
  const handleDigitInput = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    // Auto-advance
    if (cleaned && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
    const otpValue = newDigits.join('');
    setErrors(prev => ({ ...prev, otp: validateOtp(otpValue) }));
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && digits[index] === '' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const focusIdx = pasted.length < 6 ? pasted.length : 5;
    digitRefs.current[focusIdx]?.focus();
    const otpValue = newDigits.join('');
    setErrors(prev => ({ ...prev, otp: validateOtp(otpValue) }));
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
      boxSizing: 'border-box',
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
        textAlign: 'left',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img src="/images/logo2.png" alt="Pasar-kita" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <h1 style={{ margin: '0 0 4px', textAlign: 'center', fontSize: '1.75rem', fontWeight: 900, color: '#0f172f' }}>
          {otpStep ? 'Verify Login OTP' : 'Welcome Back'}
        </h1>
        <p style={{ margin: '0 0 14px', textAlign: 'center', color: '#61708c', fontSize: '0.9rem', lineHeight: 1.4 }}>
          {otpStep
            ? 'Your password is correct. Finish login with the email OTP.'
            : 'Sign in with username and password, then verify the OTP sent to email.'}
        </p>

        {/* Step Chip */}
        <div style={{
          margin: '0 auto 14px',
          width: 'fit-content',
          borderRadius: '999px',
          padding: '7px 13px',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: '#355186',
          background: '#f3f7ff',
          border: '1px solid #dbe6fb',
        }}>
          {otpStep ? 'Step 2 of 2: OTP Verification' : 'Step 1 of 2: Credentials'}
        </div>

        {/* Server message */}
        {message && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textAlign: 'center',
            background: messageClass === 'success' ? 'rgba(25,135,84,0.11)' : 'rgba(220,53,69,0.1)',
            color: messageClass === 'success' ? '#0f5a36' : '#b42334',
            border: `1px solid ${messageClass === 'success' ? 'rgba(25,135,84,0.25)' : 'rgba(220,53,69,0.25)'}`,
          }}>
            {message}
          </div>
        )}

        {/* ── Step 1: Credentials Form ────────────────────────────────────── */}
        {!otpStep ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                autoComplete="username"
                style={inputStyle}
                className="auth-input-focus"
                required
              />
              <span style={errStyle}>{errors.username}</span>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                autoComplete="current-password"
                style={inputStyle}
                className="auth-input-focus"
                required
              />
              <span style={errStyle}>{errors.password}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <Link to="/forget/" style={{ color: '#1f64d4', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Validating credentials...' : 'Send Login OTP'}
            </button>
          </form>
        ) : (
          /* ── Step 2: OTP Verification Form ─────────────────────────────── */
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>6-digit OTP</label>

              {/* 6 individual digit boxes */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                margin: '8px 0 2px',
              }}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (digitRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    placeholder="0"
                    onChange={(e) => handleDigitInput(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={handleDigitPaste}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: '52px',
                      height: '56px',
                      border: '1px solid #cfdaf0',
                      borderRadius: '14px',
                      textAlign: 'center',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#142b5f',
                      background: '#fff',
                      outline: 'none',
                      transition: 'border-color .2s, box-shadow .2s, transform .15s',
                      boxSizing: 'border-box',
                    }}
                    className="otp-digit-box"
                  />
                ))}
              </div>
              <span style={{ ...errStyle, textAlign: 'center' }}>{errors.otp}</span>
            </div>

            {/* Timer + Resend row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#5e6d89' }}>
              <div style={{ fontWeight: 700 }}>
                Remaining time:{' '}
                <span style={{ fontWeight: 900, color: remainingTime > 10 ? '#173167' : '#b42334' }}>
                  {formatTimer(remainingTime)}
                </span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Didn't get code?</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!otpExpired || loading}
                  style={{
                    border: 0,
                    padding: 0,
                    background: 'transparent',
                    color: !otpExpired ? '#94a3b8' : '#1f64d4',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: !otpExpired ? 'not-allowed' : 'pointer',
                  }}
                >
                  Resend
                </button>
              </div>
            </div>

            {/* Expired notice */}
            {otpExpired && (
              <div style={{
                borderRadius: '12px',
                padding: '10px 12px',
                background: 'rgba(220,53,69,0.08)',
                border: '1px solid rgba(220,53,69,0.18)',
                color: '#b42334',
                fontSize: '0.84rem',
                fontWeight: 700,
                textAlign: 'center',
              }}>
                OTP expired. Click Resend to get a new code.
              </div>
            )}

            {/* Use another account */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={handleUseAnother}
                style={{ border: 0, padding: 0, background: 'transparent', color: '#1f64d4', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Use another account
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpExpired}
              style={btnStyle(loading || otpExpired)}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP and Login'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.9rem', color: '#53627f' }}>
          Don't have an account?{' '}
          <Link to="/signup/" style={{ color: '#1f64d4', textDecoration: 'none', fontWeight: 700 }}>Create one</Link>
        </div>
      </div>

      <style>{`
        .auth-input-focus:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64,124,224,0.14) !important;
        }
        .otp-digit-box::placeholder { color: #bcc8de; opacity: 1; }
        .otp-digit-box:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64,124,224,0.14) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 400px) {
          .otp-digit-box {
            width: calc((100% - 50px) / 6) !important;
            height: 48px !important;
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// Shared style helpers
const labelStyle = {
  fontSize: '0.84rem',
  color: '#3e4b66',
  marginBottom: '6px',
  fontWeight: 700,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  border: '1px solid #d8e0ef',
  borderRadius: '12px',
  padding: '11px 13px',
  outline: 'none',
  fontSize: '0.95rem',
  background: '#fff',
  boxSizing: 'border-box',
  transition: 'border-color .2s, box-shadow .2s',
};

const btnStyle = (disabled) => ({
  width: '100%',
  border: 0,
  borderRadius: '12px',
  padding: '11px 14px',
  fontSize: '0.96rem',
  fontWeight: 800,
  color: '#fff',
  background: disabled
    ? 'linear-gradient(135deg, #ccc, #bbb)'
    : 'linear-gradient(135deg, #ffb325, #e69500)',
  boxShadow: disabled ? 'none' : '0 14px 24px rgba(230,149,0,0.28)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.68 : 1,
  filter: disabled ? 'saturate(0.6)' : 'none',
  transition: 'all .2s',
});

const errStyle = {
  display: 'block',
  minHeight: '18px',
  fontSize: '0.78rem',
  color: '#dc3545',
  marginTop: '4px',
};
