import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Star, ChevronLeft, ChefHat, ThumbsUp } from 'lucide-react';

export default function ReviewRestro() {
  const { restroName } = useParams();
  const { addAlert } = useApp();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [restroImage, setRestroImage] = useState('');

  const decodedRestroName = decodeURIComponent(restroName || '');

  // Try to load restro image from restaurant list
  useEffect(() => {
    async function loadRestroImage() {
      try {
        const response = await apiRequest('/restaurant/');
        if (response && response.restaurants) {
          const found = response.restaurants.find(
            (r) => r.restro_name === decodedRestroName
          );
          if (found) setRestroImage(found.restro_image || '');
        }
      } catch {
        // silently ignore
      }
    }
    loadRestroImage();
  }, [decodedRestroName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addAlert('Please enter a comment for the review', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', comment);
      formData.append('review_star', String(rating));

      await apiRequest(`/review-restro/${encodeURIComponent(decodedRestroName)}/`, {
        method: 'POST',
        body: formData,
      });

      addAlert('Review submitted successfully! Thank you.', 'success');
      setSubmitted(true);
    } catch {
      addAlert('Failed to submit restaurant review.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const ratingColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  const displayRating = hoverRating || rating;

  if (submitted) {
    return (
      <div className="content-wrapper fade-in-up" style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '3rem 2rem',
          boxShadow: '0 14px 40px rgba(15,33,74,0.1)', border: '1px solid #e6eaf4'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ThumbsUp size={36} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>Thank You!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
            Your review for <strong>{decodedRestroName}</strong> has been submitted. We appreciate your feedback!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/view-orders/" style={{ background: '#e69500', color: '#fff', padding: '11px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              My Orders
            </Link>
            <Link to="/restaurant/" style={{ background: '#f1f5f9', color: '#0f172a', padding: '11px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '620px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>
      {/* Back */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/view-orders/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> Back to orders
        </Link>
      </div>

      {/* Restaurant Banner */}
      <div style={{
        borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem',
        boxShadow: '0 14px 36px rgba(15,33,74,0.1)', border: '1px solid #e6eaf4',
        background: '#fff',
      }}>
        {/* Image section */}
        <div style={{ height: '180px', position: 'relative', background: '#f1f5f9', overflow: 'hidden' }}>
          {restroImage ? (
            <img
              src={`/images/${restroImage}`}
              alt={decodedRestroName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback */}
          <div style={{
            display: restroImage ? 'none' : 'flex', position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'rgba(255,255,255,0.5)',
          }}>
            <ChefHat size={40} />
          </div>

          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />

          {/* Restaurant name on image */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {decodedRestroName}
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <div style={{ padding: '28px 28px 32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Write Your Review</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '2rem' }}>
            Share your dining experience to help other customers.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Star Rating */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                Overall Rating
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px',
                      color: displayRating >= star ? '#fea116' : '#cbd5e1',
                      transition: 'transform 0.15s, color 0.15s',
                      transform: displayRating >= star ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Star size={36} fill={displayRating >= star ? '#fea116' : 'none'} />
                  </button>
                ))}
                {/* Label */}
                <span style={{
                  marginLeft: '8px', fontWeight: 800, fontSize: '1rem',
                  color: ratingColors[displayRating],
                  transition: 'color .2s',
                }}>
                  {ratingLabels[displayRating]}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} style={{
                    flex: 1, height: '5px', borderRadius: '4px',
                    background: displayRating >= star ? '#fea116' : '#e2e8f0',
                    transition: 'background .2s',
                  }} />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
                Your Review
              </label>
              <textarea
                rows={5}
                placeholder="What did you like or dislike about the food or restaurant service? Be specific to help others!"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                style={{
                  width: '100%', borderRadius: '12px',
                  border: '1.5px solid #dbe6fb',
                  padding: '12px 14px', outline: 'none',
                  fontSize: '0.9rem', lineHeight: 1.6,
                  resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', color: '#0f172a',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
                className="review-textarea-focus"
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                {comment.length} characters
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', border: 0, borderRadius: '12px',
                padding: '13px', fontSize: '0.96rem', fontWeight: 800,
                color: '#fff',
                background: submitting ? '#cbd5e1' : 'linear-gradient(135deg, #ffb325, #e69500)',
                boxShadow: submitting ? 'none' : '0 12px 24px rgba(230,149,0,0.28)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all .2s',
              }}
            >
              <Star size={16} fill={submitting ? 'none' : '#fff'} />
              {submitting ? 'Submitting review...' : 'Submit Restaurant Review'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .review-textarea-focus:focus {
          border-color: #7aa4ea !important;
          box-shadow: 0 0 0 4px rgba(64,124,224,0.12) !important;
        }
      `}</style>
    </div>
  );
}
