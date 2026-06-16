import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Eye, EyeOff } from 'lucide-react';

export default function RestroSignup() {
  const { addAlert } = useApp();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    address: ''
  });

  const [files, setFiles] = useState({
    restro_image: null,
    licence_image: null
  });

  const [errors, setErrors] = useState({});
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
      url('/static/images/login-page.jpg') center/cover no-repeat fixed
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

  // Validation patterns
  const patterns = {
    name: /^[A-Za-z0-9][A-Za-z0-9\s&().,'-]{1,79}$/,
    username: /^[a-zA-Z0-9._-]{3,30}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mobile_number: /^[0-9]{10,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
  };

  const validateField = (name, value) => {
    let errorMsg = '';
    const trimmed = (value || '').trim();

    if (!trimmed) {
      errorMsg = 'This field is required.';
    } else if (name === 'address') {
      if (trimmed.length < 6 || trimmed.length > 150) {
        errorMsg = 'Address must be 6 to 150 characters.';
      }
    } else if (patterns[name] && !patterns[name].test(trimmed)) {
      if (name === 'name') errorMsg = 'Restaurant name format is invalid.';
      else if (name === 'username') errorMsg = '3-30 chars: letters, numbers, dot, underscore, hyphen.';
      else if (name === 'email') errorMsg = 'Enter valid email address.';
      else if (name === 'mobile_number') errorMsg = 'Mobile number must be 10 to 15 digits.';
      else if (name === 'password') errorMsg = 'Use 8+ chars with upper, lower, number and special char.';
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, confirm_password: val }));
    setErrors(prev => ({
      ...prev,
      confirm_password: val !== formData.password ? 'Passwords do not match.' : ''
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) {
      setErrors(prev => ({ ...prev, [fileType]: 'Please upload file.' }));
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fileType]: 'File format must be JPG, JPEG, PNG, or WEBP.' }));
      return;
    }
    setFiles(prev => ({ ...prev, [fileType]: file }));
    setErrors(prev => ({ ...prev, [fileType]: '' }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const trimmed = (formData[key] || '').trim();
      if (!trimmed) {
        newErrors[key] = 'This field is required.';
        isValid = false;
      } else if (key === 'address') {
        if (trimmed.length < 6 || trimmed.length > 150) {
          newErrors[key] = 'Address must be 6 to 150 characters.';
          isValid = false;
        }
      } else if (patterns[key] && !patterns[key].test(trimmed)) {
        isValid = false;
        if (key === 'name') newErrors[key] = 'Restaurant name format is invalid.';
        else if (key === 'username') newErrors[key] = '3-30 chars: letters, numbers, dot, underscore, hyphen.';
        else if (key === 'email') newErrors[key] = 'Enter valid email address.';
        else if (key === 'mobile_number') newErrors[key] = 'Mobile number must be 10 to 15 digits.';
        else if (key === 'password') newErrors[key] = 'Use 8+ chars with upper, lower, number and special char.';
      }
    });

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
      isValid = false;
    }

    if (!files.restro_image) {
      newErrors.restro_image = 'Please upload restaurant image.';
      isValid = false;
    }
    if (!files.licence_image) {
      newErrors.licence_image = 'Please upload license image.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      addAlert('Please fix errors in form.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('username', formData.username.trim());
      data.append('email', formData.email.trim());
      data.append('mobile_number', formData.mobile_number.trim());
      data.append('password', formData.password);
      data.append('confirm_password', formData.confirm_password);
      data.append('address', formData.address.trim());
      data.append('restro_image', files.restro_image);
      data.append('licence_image', files.licence_image);

      const response = await apiRequest('/restro/signup', {
        method: 'POST',
        body: data,
      });

      if (response && response.status === 'redirect') {
        addAlert('Registration successful! Awaiting admin approval.', 'success');
        navigate(response.redirect);
      } else if (response && response.message) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.message;
        const text = tempDiv.textContent || tempDiv.innerText || 'Registration failed.';
        addAlert(text, 'danger');
      } else {
        addAlert('Registration successful! Awaiting admin approval.', 'success');
        navigate('/restro/login');
      }
    } catch (err) {
      console.error(err);
      addAlert('Failed to register restaurant. Username or Email may already exist.', 'danger');
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
          max-width: 780px;
          background: rgba(255, 255, 255, .96);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: 22px;
          box-shadow: 0 24px 62px rgba(6, 16, 34, .38);
          padding: 28px 24px 22px;
          backdrop-filter: blur(8px);
          box-sizing: border-box;
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
          font-size: clamp(1.4rem, 3.5vw, 2rem);
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
          color: #121d35;
          box-sizing: border-box;
        }

        textarea.field-input { min-height: 84px; resize: vertical; }

        .field-error {
          min-height: 17px;
          margin-top: 3px;
          color: var(--danger);
          font-size: .76rem;
          display: block;
          text-align: left;
        }

        .hint {
          font-size: .76rem;
          color: #6b7892;
          margin-top: -2px;
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
          margin-top: 4px;
          cursor: pointer;
        }

        .auth-footer {
          margin-top: 12px;
          text-align: center;
          font-size: .9rem;
          color: #53627f;
        }

        .auth-link {
          color: #1f64d4;
          text-decoration: none;
          font-weight: 700;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
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
          color: var(--muted);
          display: grid;
          place-items: center;
          cursor: pointer;
        }
      `}</style>

      <div className="auth-shell">
        <div className="auth-head">
          <img src="/static/images/logo2.png" alt="Pasar-kita" />
          <h1 className="auth-title">Register Your Restaurant</h1>
          <p className="auth-subtitle">Create your restaurant account to manage orders and menu online.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field-group">
              <label className="field-label" htmlFor="name">Restaurant Name</label>
              <input 
                className="field-input" 
                type="text" 
                id="name" 
                name="name"
                maxLength={80} 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
              <span className="field-error">{errors.name}</span>
            </div>
            
            <div className="field-group">
              <label className="field-label" htmlFor="username">Username</label>
              <input 
                className="field-input" 
                type="text" 
                id="username" 
                name="username"
                maxLength={30} 
                value={formData.username}
                onChange={handleInputChange}
                required 
              />
              <span className="field-error">{errors.username}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input 
                className="field-input" 
                type="email" 
                id="email" 
                name="email"
                maxLength={120} 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
              <span className="field-error">{errors.email}</span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="mobile_number">Mobile Number</label>
              <input 
                className="field-input" 
                type="tel" 
                id="mobile_number" 
                name="mobile_number"
                maxLength={15} 
                value={formData.mobile_number}
                onChange={handleInputChange}
                required 
              />
              <span className="field-error">{errors.mobile_number}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  maxLength={64} 
                  value={formData.password}
                  onChange={handleInputChange}
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
              <span className="field-error">{errors.password}</span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="confirm_password">Confirm Password</label>
              <div className="password-field">
                <input 
                  className="field-input" 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirm_password" 
                  name="confirm_password"
                  maxLength={64} 
                  value={formData.confirm_password}
                  onChange={handleConfirmPasswordChange}
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
              <span className="field-error">{errors.confirm_password}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="field-label" htmlFor="address">Address</label>
              <textarea 
                className="field-input" 
                id="address" 
                name="address"
                maxLength={150} 
                value={formData.address}
                onChange={handleInputChange}
                required 
              />
              <span className="field-error">{errors.address}</span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="restro_image">Restaurant Image</label>
              <input 
                className="field-input" 
                type="file" 
                id="restro_image" 
                onChange={(e) => handleFileChange(e, 'restro_image')}
                accept="image/*" 
                required 
              />
              <span className="field-error">{errors.restro_image}</span>
              
              <label className="field-label" style={{ marginTop: '8px' }} htmlFor="licence_image">License Image</label>
              <input 
                className="field-input" 
                type="file" 
                id="licence_image" 
                onChange={(e) => handleFileChange(e, 'licence_image')}
                accept="image/*" 
                required 
              />
              <span className="field-error">{errors.licence_image}</span>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link className="auth-link" to="/restro/login">Log in</Link></div>
      </div>
    </>
  );
}
