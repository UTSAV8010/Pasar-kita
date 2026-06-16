import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Quote, Smile, Utensils, Store, Star, ChevronLeft, ChevronRight, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';

export default function Testimonials() {
  const [activeAvatarIdx, setActiveAvatarIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const testimonials = [
    {
      quote: "This platform made my experience seamless and enjoyable. The quality of service exceeded my expectations!",
      author: "Rasel Hossain",
      role: "Student",
      avatarIdx: 0
    },
    {
      quote: "Ordering was quick and the support team was super helpful. Everything arrived fresh and on time.",
      author: "Ashraf Alam",
      role: "Businessman",
      avatarIdx: 1
    },
    {
      quote: "Great variety, clean packaging, and friendly service. I recommend it to my classmates.",
      author: "Labony Haque",
      role: "Student",
      avatarIdx: 2
    },
    {
      quote: "Reliable catering for meetings and events. The team was professional from start to finish.",
      author: "Sumon Mollah",
      role: "Teacher",
      avatarIdx: 3
    },
    {
      quote: "Consistent quality and excellent hygiene. It is my go-to choice for daily meals.",
      author: "Sarah Connor",
      role: "Daily Customer",
      avatarIdx: 4
    }
  ];

  // Auto transition for testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAvatarIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: '1500+', label: 'Happy Customers', icon: <Smile size={24} /> },
    { value: '320+', label: 'Daily Orders', icon: <Utensils size={24} /> },
    { value: '45+', label: 'Partner Restaurants', icon: <Store size={24} /> },
    { value: '98%', label: 'Satisfaction Rate', icon: <Star size={24} /> },
  ];

  const galleryItems = [
    { name: 'Signature Meals', img: '/images/food/Bengali.png', fallback: 'https://placehold.co/300x230?text=Signature+Meals' },
    { name: 'Chef Specials', img: '/images/food/Food-Name-1499.jpg', fallback: 'https://placehold.co/300x230?text=Chef+Specials' },
    { name: 'Healthy Plates', img: '/images/food/Food-Name-2913.jpeg', fallback: 'https://placehold.co/300x230?text=Healthy+Plates' },
    { name: 'Fresh Bowls', img: '/images/food/Food-Name-3562.jpg', fallback: 'https://placehold.co/300x230?text=Fresh+Bowls' },
    { name: 'Comfort Food', img: '/images/food/Food-Name-5049.jpg', fallback: 'https://placehold.co/300x230?text=Comfort+Food' },
    { name: 'Seasonal Picks', img: '/images/food/Food-Name-5500.jpg', fallback: 'https://placehold.co/300x230?text=Seasonal+Picks' },
  ];

  const customerReviews = [
    { author: 'Rasel Hossain', role: 'Student', text: 'First of all, I love their interior design.Their services was so nice & amazing .And also i like their food so much' },
    { author: 'Ashraf Alam', role: 'Businessman', text: 'I was quite amazed by their unique concept. Hats off to Pasar-kita.com and their whole team.' },
    { author: 'Sumon Mollah', role: 'Teacher', text: 'Nice environment also provide healthy and tasty food.Like it very much' },
    { author: 'Labony Haque', role: 'Student', text: 'WOW!! Exceptional concept of Pasar-kita.com.Food quality is good, keep it up.' },
  ];

  const faqs = [
    { q: 'How do I place an order?', a: 'Choose a restaurant, pick your dishes, and confirm delivery details. You will receive updates by SMS or email.' },
    { q: 'Can I schedule orders in advance?', a: 'Yes, schedule deliveries for lunch meetings, events, or daily meal plans from your favorite partners.' },
    { q: 'What payment methods are accepted?', a: 'We accept online payments, UPI, and cash on delivery depending on the restaurant and location.' },
    { q: 'How do I contact support?', a: 'Reach out anytime via the contact form, email, or phone. Our support team responds quickly.' },
  ];

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Testimonials Intro Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Testimonials</h5>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Our Clients Say!!!</h2>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        <div className="testimonial-feature glass-card-light hover-lift" style={{ padding: '2rem', textAlign: 'center', borderRadius: '18px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(230,149,0,0.12)', color: '#e69500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '16px' }}>
            <User size={24} />
          </div>
          <h5 style={{ fontWeight: 800, color: '#0f224a', fontSize: '1.15rem', marginBottom: '12px' }}>Students</h5>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Students love the quick ordering, affordable combos, and the taste they can count on between classes.
          </p>
        </div>

        <div className="testimonial-feature glass-card-light hover-lift" style={{ padding: '2rem', textAlign: 'center', borderRadius: '18px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(230,149,0,0.12)', color: '#e69500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '16px' }}>
            <Briefcase size={24} />
          </div>
          <h5 style={{ fontWeight: 800, color: '#0f224a', fontSize: '1.15rem', marginBottom: '12px' }}>Business</h5>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Teams appreciate the reliable catering, clean packaging, and on-time delivery for busy workdays.
          </p>
        </div>

        <div className="testimonial-feature glass-card-light hover-lift" style={{ padding: '2rem', textAlign: 'center', borderRadius: '18px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(230,149,0,0.12)', color: '#e69500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '16px' }}>
            <GraduationCap size={24} />
          </div>
          <h5 style={{ fontWeight: 800, color: '#0f224a', fontSize: '1.15rem', marginBottom: '12px' }}>Teachers</h5>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Educators highlight the consistent quality, hygienic preparation, and friendly support from staff.
          </p>
        </div>
      </div>

      {/* Interactive Avatar Slider Section */}
      <section style={{ marginBottom: '5rem' }}>
        <div className="glass-card-light" style={{ borderRadius: '24px', border: '1px solid #eef2f7', padding: '3rem', boxShadow: '0 16px 36px rgba(15,23,43,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="grid-mobile-1">
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontWeight: 800, color: '#0f224a', fontSize: '2.15rem', marginBottom: '12px' }}>What Our Customers Say</h2>
              <p style={{ color: '#6b7280', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '24px' }}>
                Real stories from happy people! See how our services and support create memorable experiences.
              </p>
              <Link className="hover-lift" to="/contact/" style={{ background: '#e69500', color: '#fff', border: 'none', borderRadius: '999px', padding: '12px 30px', fontWeight: 700, display: 'inline-block', textDecoration: 'none' }}>Get in Touch</Link>
            </div>

            {/* Avatars Ring / Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              {testimonials.map((t, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveAvatarIdx(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: activeAvatarIdx === idx ? '4px solid #e69500' : '4px solid #fff',
                    boxShadow: activeAvatarIdx === idx ? '0 10px 24px rgba(230,149,0,0.35)' : '0 8px 20px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transform: activeAvatarIdx === idx ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    margin: '0 auto',
                  }}
                >
                  <img src="/static/images/avatar1.jpeg" alt="Customer Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Quote display */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f9fd', borderRadius: '18px', padding: '24px', gap: '16px', marginTop: '2rem' }}>
            <button 
              onClick={() => setActiveAvatarIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              style={{ background: '#fff', border: '1px solid #dcdfe6', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              className="hover-lift"
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ flexGrow: 1, textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', fontStyle: 'italic' }}>
                "{testimonials[activeAvatarIdx].quote}"
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e69500', textTransform: 'uppercase' }}>
                {testimonials[activeAvatarIdx].author} &mdash; {testimonials[activeAvatarIdx].role}
              </span>
            </div>
            <button 
              onClick={() => setActiveAvatarIdx((prev) => (prev + 1) % testimonials.length)}
              style={{ background: '#fff', border: '1px solid #dcdfe6', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              className="hover-lift"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Highlights</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Numbers That Matter</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {stats.map((s, idx) => (
            <div key={idx} className="stat-card glass-card-light hover-lift" style={{ padding: '2rem 1.5rem', borderRadius: '18px', textAlign: 'center', border: '1px solid #eef2f7' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(230,149,0,0.12)', color: '#e69500', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 12px' }}>
                {s.icon}
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f224a', margin: '0 0 6px' }}>{s.value}</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Food Gallery Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Gallery</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Fresh From The Kitchen</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {galleryItems.map((item, idx) => (
            <div key={idx} className="gallery-item hover-lift" style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '230px', boxShadow: '0 12px 26px rgba(15,23,43,0.08)' }}>
              <img 
                src={item.img} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = item.fallback; }} 
              />
              <span style={{ position: 'absolute', left: '16px', bottom: '16px', background: 'rgba(15, 23, 43, 0.82)', color: '#ffffff', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, zIndex: 2 }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Full Customer Reviews Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Customer</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Customer Reviews</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {customerReviews.map((rev, idx) => (
            <div key={idx} className="glass-card-light" style={{ padding: '2rem', borderRadius: '18px', textAlign: 'left', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ color: 'rgba(230,149,0,0.15)', position: 'absolute', top: '20px', right: '20px' }}><Quote size={40} /></div>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.5rem', flexGrow: 1 }}>
                "{rev.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--site-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                <img src="/static/images/avatar1.jpeg" alt="Reviewer" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{rev.author}</h5>
                  <small style={{ color: 'var(--site-muted)' }}>{rev.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Ready section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div className="glass-card-light hover-lift" style={{ padding: '2.5rem', borderRadius: '24px', background: 'linear-gradient(120deg, rgba(230,149,0,0.12), rgba(255,255,255,0.95))', boxShadow: '0 18px 34px rgba(15,23,43,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', textAlign: 'left' }}>
          <div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f224a', margin: '0 0 8px' }}>Ready for your next meal?</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Order now or plan a group catering with our trusted partners.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/menu/" style={{ background: '#e69500', color: '#fff', border: 'none', borderRadius: '999px', padding: '12px 26px', fontWeight: 700, textDecoration: 'none' }} className="hover-lift">Order Now</Link>
            <Link to="/contact/" style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '999px', padding: '12px 26px', fontWeight: 700, textDecoration: 'none' }} className="hover-lift">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Testimonials FAQs */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>FAQ</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eef2f7' }}>
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: 'none',
                  outline: 'none',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#17253f',
                  textAlign: 'left',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#8b8f97' }} />
              </button>
              
              {openFaq === idx && (
                <div style={{ padding: '0 24px 20px', color: '#5b6980', fontSize: '0.95rem', lineHeight: 1.65, borderTop: '1px solid #f8fafc' }} className="fade-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Strip Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem' }}>
        <div style={{ background: 'linear-gradient(120deg, #0f172f, #1a2a4a)', borderRadius: '24px', padding: '2.5rem 2rem', color: '#fff', boxShadow: '0 18px 34px rgba(15,23,43,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e69500' }}>
                <Phone size={20} />
              </div>
              <div>
                <h6 style={{ margin: '0 0 4px', fontWeight: 700, color: '#fff' }}>Call Us</h6>
                <a href="tel:9978043407" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', fontSize: '0.95rem' }} className="hover-lift">+91 9978043407</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e69500' }}>
                <Mail size={20} />
              </div>
              <div>
                <h6 style={{ margin: '0 0 4px', fontWeight: 700, color: '#fff' }}>Email</h6>
                <a href="mailto:Pasar-kita@gmail.com" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', fontSize: '0.95rem' }} className="hover-lift">Pasar-kita@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e69500' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h6 style={{ margin: '0 0 4px', fontWeight: 700, color: '#fff' }}>Location</h6>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem' }}>Surat, Ahmedabad, Baroda</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
