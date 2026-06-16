import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { User, Edit3, Key, MapPin, Mail, Phone, Home } from 'lucide-react';

import ProfileSidebar from '../../components/ProfileSidebar';

export default function Account({ initialTab = 'view' }) {
  const { user, setUser, addAlert } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync tab with props
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load account details
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/myaccount/');
      if (data && data.user) {
        setProfile(data.user);
        setName(data.user.name || '');
        setEmail(data.user.email || '');
        setPhone(data.user.phone || '');
        setCity(data.user.city || '');
        setAddress(data.user.add1 || '');
      } else {
        // If not logged in, apiRequest JSONResponse redirect middleware will send us to /login/
        navigate('/login/');
      }
    } catch (err) {
      addAlert('Failed to load profile details.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update account submission
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !city || !address) {
      addAlert('All fields are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('city', city);
      formData.append('address', address);

      const response = await apiRequest('/update-account/', {
        method: 'POST',
        body: formData,
      });

      // Django redirect to /myaccount/ or returns JSON response
      addAlert('Profile updated successfully!', 'success');
      // Sync local user context with new name
      if (user) {
        setUser({ ...user, name: name });
      }
      // Refresh state
      await fetchProfile();
      navigate('/myaccount/');
    } catch (err) {
      addAlert('Failed to update profile.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Change password submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addAlert('All fields are required', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      addAlert('New passwords do not match', 'warning');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
      formData.append('confirm_password', confirmPassword);

      const response = await apiRequest('/update-password/', {
        method: 'POST',
        body: formData,
      });

      if (response && response.message) {
        if (response.message_class === 'success' || response.message.includes('success')) {
          addAlert('Password updated successfully!', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          navigate('/myaccount/');
        } else {
          addAlert(response.message, 'danger');
        }
      }
    } catch (err) {
      addAlert('Failed to change password. Double check current password.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ borderTopColor: '#e69500' }}></div>
      </div>
    );
  }

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch' }} className="profile-layout-row">
        
        {/* Left Sidebar */}
        <div style={{ flex: '0 0 280px', width: '280px' }} className="profile-sidebar-col">
          <ProfileSidebar />
        </div>

        {/* Right Content Column */}
        <div style={{ flex: '1 1 600px' }} className="profile-content-col">
          <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', minHeight: '100%' }}>
        
        {/* Tab 1: Profile View */}
        {activeTab === 'view' && profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e69500', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 800 }}>
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{profile.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>@{profile.username}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#e69500', padding: '6px', background: 'rgba(230,149,0,0.1)', borderRadius: '8px' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Email Address</h4>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{profile.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#e69500', padding: '6px', background: 'rgba(230,149,0,0.1)', borderRadius: '8px' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Phone Number</h4>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{profile.phone}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#e69500', padding: '6px', background: 'rgba(230,149,0,0.1)', borderRadius: '8px' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>City</h4>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{profile.city}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#e69500', padding: '6px', background: 'rgba(230,149,0,0.1)', borderRadius: '8px' }}>
                  <Home size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Delivery Address</h4>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{profile.add1}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('update')}
              className="btn-submit" 
              style={{ marginTop: '1.5rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit3 size={16} /> Edit Profile Details
            </button>
          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === 'update' && (
          <form onSubmit={handleUpdateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-mobile-1">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-mobile-1">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <textarea 
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-control glass-input"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <button type="submit" disabled={saving} className="btn-submit">
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('view')} 
                style={{ background: 'none', border: '1px solid var(--border)', color: '#64748b', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-control glass-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-mobile-1">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control glass-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <button type="submit" disabled={saving} className="btn-submit">
                {saving ? 'Updating password...' : 'Update Password'}
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('view')} 
                style={{ background: 'none', border: '1px solid var(--border)', color: '#64748b', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .profile-layout-row {
            flex-direction: column !important;
          }
          .profile-sidebar-col {
            flex: 1 1 100% !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
