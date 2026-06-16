import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Bolt, CheckCircle, ChevronDown } from 'lucide-react';

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Team() {
  const [openFaq, setOpenFaq] = useState(0);

  const chefs = [
    {
      name: 'Ravi Kumar',
      role: 'Master Chef',
      image: '/static/img/chefs-1.jpg',
      desc: 'Ravi is known for his culinary mastery in traditional Indian cuisines. He combines classic techniques with modern flair, offering an unforgettable dining experience.',
    },
    {
      name: 'Anjali Patel',
      role: 'Patissier',
      image: '/static/img/chefs-2.jpg',
      desc: 'Anjali specializes in creating delicate and flavorful pastries that embody the richness of Indian flavors. Her desserts are not only beautiful but a true culinary delight.',
    },
    {
      name: 'Arjun Singh',
      role: 'Cook',
      image: '/static/img/chefs-3.jpg',
      desc: 'Arjun is a passionate cook who blends authentic Indian spices with fresh ingredients. His diverse approach to cooking brings out the true essence of every dish.',
    },
  ];

  const workSteps = [
    { step: '01', title: 'Fresh Sourcing', desc: 'We select top-quality ingredients daily and verify freshness before kitchen prep begins.' },
    { step: '02', title: 'Expert Preparation', desc: 'Recipes are executed by skilled chefs using measured portions and controlled cook times.' },
    { step: '03', title: 'Quick Dispatch', desc: 'Orders are packed securely and handed off immediately for faster and hotter delivery.' },
  ];

  const values = [
    { title: 'Passion In Every Plate', desc: 'Each chef focuses on flavor balance, consistency, and presentation so every dish feels premium.', icon: <Heart size={24} /> },
    { title: 'Strict Hygiene Standard', desc: 'From prep to packaging, we follow clean-station routines and quality checks for safe food handling.', icon: <Shield size={24} /> },
    { title: 'Fast Kitchen Workflow', desc: 'Our stations are optimized for speed, helping us serve fresh orders quickly during peak hours.', icon: <Bolt size={24} /> },
  ];

  const faqs = [
    { q: 'What are the qualifications of your chefs?', a: 'Our team consists of certified master chefs, pastry specialists, and operations leads with over 10+ years of active experience in top restaurants.' },
    { q: 'How do you maintain food hygiene standards?', a: 'Our chefs follow a strict clean-station routine, undergo daily health and sanitization checks, and prepare food in fully compliant kitchen facilities.' },
    { q: 'Do you accommodate special dietary needs?', a: 'Yes. We have dedicated stations for vegetarian meals, allergy control procedures, and customizable item prep instructions.' },
  ];

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Master Chefs Section */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Team Members</h5>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Our Master Chefs</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
        }}>
          {chefs.map((chef, idx) => (
            <div key={idx} className="hover-lift" style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'var(--site-shadow)',
              border: '1px solid var(--site-border)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}>
              <div style={{ position: 'relative', overflow: 'hidden', height: '280px' }}>
                <img 
                  src={chef.image} 
                  alt={chef.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://placehold.co/350x280?text=${chef.name}`; }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 34, 74, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
                className="hover-overlay"
                >
                  {/* Overlay will show icons on hover via pure CSS animations/classes */}
                  <a href="#" style={{ color: '#fff', background: '#e69500', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TwitterIcon size={16} /></a>
                  <a href="#" style={{ color: '#fff', background: '#e69500', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FacebookIcon size={16} /></a>
                  <a href="#" style={{ color: '#fff', background: '#e69500', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><InstagramIcon size={16} /></a>
                  <a href="#" style={{ color: '#fff', background: '#e69500', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkedinIcon size={16} /></a>
                </div>
              </div>

              <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontWeight: 800, color: '#0f224a', fontSize: '1.35rem', marginBottom: '6px' }}>{chef.name}</h4>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e69500', textTransform: 'uppercase', marginBottom: '12px' }}>{chef.role}</span>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6 }}>{chef.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CSS style injector for overlay hovers */}
      <style>{`
        .hover-lift:hover .hover-overlay { opacity: 1 !important; }
      `}</style>

      {/* How We Work Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>How We Work</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>From Ingredients To Delivery</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {workSteps.map((ws, idx) => (
            <div key={idx} className="glass-card-light" style={{ padding: '2.5rem 2rem', borderRadius: '20px', textAlign: 'left', position: 'relative' }}>
              <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e69500', color: '#fff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {ws.step}
              </span>
              <h5 style={{ color: '#0f224a', fontSize: '1.15rem', fontWeight: 800, marginBottom: '10px' }}>{ws.title}</h5>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{ws.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Our Team Values Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h5 style={{ color: 'var(--site-primary)', fontFamily: 'Pacifico, cursive', fontSize: '1.25rem', marginBottom: '6px' }}>Why Our Team</h5>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Kitchen Values We Follow Daily</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {values.map((v, idx) => (
            <div key={idx} className="glass-card-light hover-lift" style={{ padding: '2.5rem 2rem', borderRadius: '20px', textAlign: 'left' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #ffbf24, #e69500)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {v.icon}
              </div>
              <h5 style={{ fontWeight: 800, color: '#0f224a', marginBottom: '10px' }}>{v.title}</h5>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem', lineHeight: 1.65 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kitchen Culture - Text & Media blocks */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        
        {/* Culture block 1 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem', marginBottom: '5rem' }}>
          <div style={{ flex: '1 1 450px', borderRadius: '22px', overflow: 'hidden', height: '300px', boxShadow: '0 16px 38px rgba(12,26,56,0.1)' }}>
            <img src="/static/img/chefs-2.jpg" alt="Kitchen Culture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/500x300?text=Kitchen+Culture'; }} />
          </div>
          <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h3 style={{ color: '#0f224a', fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Inside Our Kitchen Culture</h3>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '16px', fontSize: '0.98rem' }}>
              Our kitchen operates on discipline, creativity, and consistency. Every chef follows a structured prep flow, but still has space to innovate and improve flavors using seasonal ingredients and customer feedback.
            </p>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '20px', fontSize: '0.98rem' }}>
              From morning mise en place to final dish pass, the team coordinates with clear communication and timing standards. This keeps service fast while preserving presentation quality and taste balance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Daily tasting rounds for quality consistency.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Smart station planning to reduce order delays.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Strong hygiene + food safety checks every shift.</div>
            </div>
          </div>
        </div>

        {/* Culture block 2 */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '3rem', marginBottom: '5rem' }}>
          <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h3 style={{ color: '#0f224a', fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Training, Growth, And Standards</h3>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '16px', fontSize: '0.98rem' }}>
              We invest in ongoing chef development through monthly workshops, menu simulation sessions, and peer review tasting. Junior chefs train directly under seniors to build speed, accuracy, and confidence under pressure.
            </p>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '20px', fontSize: '0.98rem' }}>
              Every new menu cycle includes recipe standardization, plating benchmarks, and service-time targets. This ensures each dish is reproducible across teams and shifts without compromising freshness or guest experience.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Mentor-based growth path for every kitchen role.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Practical performance reviews tied to real service quality.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Continuous upgrades in plating, prep, and consistency.</div>
            </div>
          </div>
          <div style={{ flex: '1 1 450px', borderRadius: '22px', overflow: 'hidden', height: '300px', boxShadow: '0 16px 38px rgba(12,26,56,0.1)' }}>
            <img src="/static/img/chefs-1.jpg" alt="Training & Growth" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/500x300?text=Training'; }} />
          </div>
        </div>

        {/* Culture block 3 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem' }}>
          <div style={{ flex: '1 1 450px', borderRadius: '22px', overflow: 'hidden', height: '300px', boxShadow: '0 16px 38px rgba(12,26,56,0.1)' }}>
            <img src="/static/img/chefs-3.jpg" alt="Kitchen Operations" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/500x300?text=Operations'; }} />
          </div>
          <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h3 style={{ color: '#0f224a', fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Leadership & Innovation</h3>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '16px', fontSize: '0.98rem' }}>
              Our senior chefs lead by example during live service, guiding plating quality, speed, and kitchen coordination. They also review guest feedback weekly to identify patterns and improve signature items with measurable changes.
            </p>
            <p style={{ color: '#566884', lineHeight: 1.75, marginBottom: '20px', fontSize: '0.98rem' }}>
              Innovation here is practical. We test new ideas in controlled batches, monitor prep complexity, and only launch dishes that meet flavor goals and delivery performance. This approach keeps the menu exciting without compromising consistency.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Weekly review cycle for flavor, service time, and ratings.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Menu innovation backed by real kitchen feasibility checks.</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#27416b', fontWeight: 700 }}><CheckCircle size={16} color="#1f9d5d" /> Chef-led quality control from prep station to final handoff.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box Join Us Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem', marginBottom: '5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f224a, #132f63)',
          borderRadius: '24px',
          padding: '3rem',
          color: '#fff',
          textAlign: 'left',
          boxShadow: '0 18px 42px rgba(9, 24, 52, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          alignItems: 'center',
        }} className="cta-box-flex">
          <div style={{ flex: '1 1 500px' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>Want To Join Our Culinary Team?</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7, marginBottom: '24px', fontSize: '1rem' }}>
              We are always looking for talented chefs and kitchen professionals who care about food quality and guest experience.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/contact/" style={{ background: 'linear-gradient(135deg, #ffbf24, #e69500)', color: '#fff', borderRadius: '30px', padding: '12px 28px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }} className="hover-lift">Apply Now</Link>
              <Link to="/about/" style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255,255,255,0.24)', color: '#fff', borderRadius: '30px', padding: '12px 28px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }} className="hover-lift">Learn More</Link>
            </div>
          </div>

          <div style={{ flex: '1 1 350px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800 }}>20+</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Kitchen Experts</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800 }}>1200+</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Meals Served Daily</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800 }}>4.8/5</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Chef Ratings</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800 }}>7 Days</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Active Kitchen</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ borderTop: '1px solid var(--site-border)', paddingTop: '5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '3.5rem' }}>Frequently Asked Questions</h2>
        
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

    </div>
  );
}
