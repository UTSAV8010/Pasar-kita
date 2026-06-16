import React, { useState } from 'react';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { addAlert } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      addAlert('Please fill in all fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('subject', formData.subject);
      data.append('message', formData.message);

      await apiRequest('/contact/', { method: 'POST', body: data });

      addAlert('Message sent! We will get back to you soon.', 'success');
      setFormData({ name: '', phone: '', subject: '', message: '' });
      setSubmitted(true);
    } catch {
      addAlert('Failed to send message. Please try again.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: <MapPin size={24} />,
      label: 'Our Location',
      value: 'Surat, Ahmedabad, Baroda, Gujarat, India',
      color: '#e69500',
      bg: 'rgba(230,149,0,0.08)',
    },
    {
      icon: <Phone size={24} />,
      label: 'Call Us',
      value: '+91 9978043407',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      icon: <Mail size={24} />,
      label: 'Email Us',
      value: 'Pasar-kita@gmail.com',
      color: '#178d51',
      bg: 'rgba(23,141,81,0.08)',
    },
    {
      icon: <Clock size={24} />,
      label: 'Working Hours',
      value: 'Mon–Sat: 9 AM – 10 PM',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
  ];

  return (
    <div className="content-wrapper fade-in-up">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ color: '#e69500', fontFamily: 'Pacifico, cursive', fontSize: '1.1rem', marginBottom: '6px' }}>Contact Us</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Get In Touch With Us</h1>
        <p style={{ color: '#64748b', marginTop: '10px', maxWidth: '560px', margin: '10px auto 0', lineHeight: 1.6 }}>
          Have a question about a restaurant, an order, or our delivery services? Our customer relations team is here to help!
        </p>
      </div>

      {/* Contact Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem',
      }}>
        {contactCards.map((card, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '16px', padding: '22px 20px',
            boxShadow: '0 4px 20px rgba(15,33,74,0.07)', border: '1px solid #e6eaf4',
            display: 'flex', alignItems: 'flex-start', gap: '14px',
            transition: 'transform .2s, box-shadow .2s',
          }} className="contact-info-card">
            <div style={{
              width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
              background: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {card.icon}
            </div>
            <div>
              <h5 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.label}
              </h5>
              <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form + Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

        {/* Contact Form */}
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(15,33,74,0.09)', border: '1px solid #e6eaf4',
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(23,141,81,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={36} color="#178d51" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Message Sent!</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{ background: '#e69500', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Send Us a Message</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Fill the form below and we'll respond promptly.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Your Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter name" required style={inputStyle} className="contact-input-focus" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone" required style={inputStyle} className="contact-input-focus" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" required style={inputStyle} className="contact-input-focus" />
                </div>

                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    required
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    className="contact-input-focus"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', border: 0, borderRadius: '12px', padding: '13px',
                    fontSize: '0.96rem', fontWeight: 800, color: '#fff',
                    background: submitting ? '#cbd5e1' : 'linear-gradient(135deg, #ffb325, #e69500)',
                    boxShadow: submitting ? 'none' : '0 12px 24px rgba(230,149,0,0.28)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all .2s',
                  }}
                >
                  <Send size={16} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Facts */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            borderRadius: '20px', padding: '2rem', color: '#fff',
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1.25rem' }}>Why Contact Us?</h3>
            {[
              'Track your order or report missing items',
              'Issues with a restaurant or food quality',
              'Payment and refund queries',
              'Become a restaurant or delivery partner',
              'General feedback & suggestions',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e69500', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', fontSize: '0.65rem', fontWeight: 900 }}>✓</div>
                <span style={{ color: 'rgba(255,255,255,0.82)' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Response time */}
          <div style={{
            background: 'rgba(230,149,0,0.06)', borderRadius: '16px', padding: '1.5rem',
            border: '1px solid rgba(230,149,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Clock size={18} color="#e69500" />
              <h5 style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Response Time</h5>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
              We typically respond within <strong style={{ color: '#e69500' }}>2-4 hours</strong> on business days. For urgent delivery issues, call us directly.
            </p>
          </div>
        </div>
      </div>

      {/* Google Map Embed */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e6eaf4', boxShadow: '0 8px 24px rgba(15,33,74,0.08)' }}>
        <div style={{ background: '#0f172a', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="#e69500" />
          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Our Location - Surat, Gujarat</h4>
        </div>
        <iframe
          title="Pasar-kita Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1d119066.52982230402!2d72.73989446219389!3d21.159142503259972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xfe4558290938b042!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          width="100%"
          height="360"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <style>{`
        .contact-info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(15,33,74,0.12) !important;
        }
        .contact-input-focus:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64,124,224,0.12) !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', marginBottom: '6px',
  fontWeight: 700, fontSize: '0.84rem', color: '#3e4b66',
};

const inputStyle = {
  width: '100%', border: '1.5px solid #dbe6fb',
  borderRadius: '12px', padding: '10px 13px',
  outline: 'none', fontSize: '0.9rem',
  background: '#fdfdff', boxSizing: 'border-box',
  color: '#0f172a', transition: 'border-color .2s, box-shadow .2s',
};
