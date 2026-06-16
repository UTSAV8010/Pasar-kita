import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Truck, Users, Heart, Leaf, Star, Bolt, CheckCircle } from 'lucide-react';

export default function About() {
  const features = [
    { title: 'Award Winning Chefs', desc: 'Our restaurants feature highly talented, award-winning culinary masterminds.', icon: <Award size={32} /> },
    { title: 'Fresh & Healthy Food', desc: 'We maintain strict quality control ensuring only fresh ingredients reach you.', icon: <ShieldCheck size={32} /> },
    { title: 'Lightning Fast Delivery', desc: 'Our dedicated riders deliver orders within minutes, steaming hot.', icon: <Truck size={32} /> },
    { title: '24/7 Premium Support', desc: 'Customer satisfaction is our motto. Our support team is here day and night.', icon: <Users size={32} /> },
  ];

  const milestones = [
    { year: '2017', title: 'Humble Start', desc: 'Launched with a small team focused on fast, flavorful street food.' },
    { year: '2019', title: 'Growing Community', desc: 'Expanded the menu and partnered with new chefs across the city.' },
    { year: '2022', title: 'Service Upgrade', desc: 'Introduced smarter delivery tracking and improved packaging quality.' },
    { year: '2025', title: 'Trusted Brand', desc: 'Reached new locations with consistent ratings and loyal customers.' },
  ];

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Intro Welcome Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem', margin: '2rem 0 5rem' }}>
        <div style={{ flex: '1 1 450px' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '8px' }}>About Us</h5>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Welcome to <span style={{ color: '#e69500' }}>Pasar-kita</span>
          </h2>
          <p style={{ color: '#475569', marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Pasar-kita began its journey from 2017 and has been one of the prominent food ordering networks in town ever since. Originally serving fast food, we only use the top-quality ingredients from verified partner restaurants to prepare dishes for our valued customers. Quality is never compromised.
          </p>
          <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            We serve our valued customers with premium quality food and to give the elite experience when it comes to fine dining, bringing the best local restaurants and delivery boy coordination right to your doorstep.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ borderLeft: '5px solid #e69500', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e69500' }}>15</span>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Years of Experience</p>
            </div>
            <div style={{ borderLeft: '5px solid #e69500', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e69500' }}>50</span>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Popular Master Chefs</p>
            </div>
          </div>

          <Link to="/menu/" style={{
            background: '#e69500',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '24px',
            fontWeight: 700,
            display: 'inline-block',
          }} className="hover-lift">Explore Menu</Link>
        </div>
        
        <div style={{ flex: '1 1 450px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <img src="/static/images/about-1.jpg" alt="Kitchen 1" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px' }} onError={(e) => e.target.src = 'https://placehold.co/250x200?text=Kitchen+1'} />
          <img src="/static/images/about-2.jpg" alt="Kitchen 2" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '150px', marginTop: '50px' }} onError={(e) => e.target.src = 'https://placehold.co/250x200?text=Kitchen+2'} />
          <img src="/static/images/about-3.jpg" alt="Kitchen 3" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '150px', marginTop: '-50px' }} onError={(e) => e.target.src = 'https://placehold.co/250x200?text=Kitchen+3'} />
          <img src="/static/images/about-4.jpg" alt="Kitchen 4" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '200px' }} onError={(e) => e.target.src = 'https://placehold.co/250x200?text=Kitchen+4'} />
        </div>
      </div>

      {/* Why Choose Us Cards */}
      <div style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <h3 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '3.5rem' }}>Why Choose Us?</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
        }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card-light hover-lift" style={{
              padding: '2.5rem 1.5rem',
              borderRadius: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(230,149,0,0.1)',
                color: '#e69500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}>{f.icon}</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>{f.title}</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Extended Story, Mission & Vision Section */}
      <div style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '8px' }}>Our Story</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Built With Care, Served With Pride</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>From a small kitchen in 2017 to a trusted food partner for families, students, and offices.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '3rem', alignItems: 'start' }} className="grid-mobile-1">
          {/* Mission & Vision Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Our Mission</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We make everyday meals feel special by delivering fresh ingredients, consistent flavors, and warm hospitality to every customer.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Curate menus that balance comfort food with healthy options.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Support local chefs and suppliers to keep quality high.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Deliver on time with care and clean, safe packaging.</span>
                </li>
              </ul>
            </div>

            <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Our Vision</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                To become the most loved restaurant platform in the region by building trust, improving convenience, and celebrating local flavors.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-mobile-1">
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                  <Heart size={16} color="#e69500" /> <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Community First</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                  <Leaf size={16} color="#e69500" /> <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Fresh Ingredients</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                  <Star size={16} color="#e69500" /> <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Quality Promise</span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                  <Bolt size={16} color="#e69500" /> <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Fast Service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones & FAQ Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {milestones.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: idx !== milestones.length - 1 ? '1.5rem' : '0', borderBottom: idx !== milestones.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ minWidth: '60px', height: '32px', borderRadius: '16px', background: 'rgba(230,149,0,0.15)', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                      {m.year}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>{m.title}</strong>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Why People Choose Us</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Reliable taste, friendly support, and a service that respects your time.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Daily kitchen checks and quality control.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Easy ordering with multiple payment options.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' }}>
                  <CheckCircle size={18} color="#e69500" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>Dedicated support for events and group orders.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
