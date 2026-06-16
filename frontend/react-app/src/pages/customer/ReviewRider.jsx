import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useApp } from '../../AppContext';
import { Star, MessageSquare, ChevronLeft, IndianRupee } from 'lucide-react';

export default function ReviewRider() {
  const { orderId } = useParams();
  const { addAlert } = useApp();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState('0.00');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addAlert('Please enter comments about the delivery', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', comment);
      formData.append('review_star', String(rating));
      formData.append('tip', String(parseFloat(tip) || 0.00));

      const response = await apiRequest(`/review-rider/${orderId}/`, {
        method: 'POST',
        body: formData,
      });

      addAlert('Rider review submitted successfully!', 'success');
      navigate('/view-orders/');
    } catch (err) {
      addAlert('Failed to submit rider review.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-wrapper fade-in-up" style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <Link 
          to="/view-orders/" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}
        >
          <ChevronLeft size={16} /> Back to orders
        </Link>
      </div>

      <div className="glass-card-light" style={{ padding: '2.5rem', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(25,135,84,0.1)', color: '#198754', marginBottom: '1rem' }}>
            <MessageSquare size={28} style={{ color: '#198754' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Review Delivery Rider</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Leave a rating and tip for your Rider for Order #{orderId}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          {/* Star selector */}
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
              Rider Service Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: (hoverRating || rating) >= star ? '#198754' : '#cbd5e1',
                    transition: 'transform 0.15s, color 0.15s'
                  }}
                  className="hover-scale"
                >
                  <Star size={36} fill={(hoverRating || rating) >= star ? '#198754' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          {/* Tip Input */}
          <div className="form-group">
            <label className="form-label">Delivery Rider Tip (INR)</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                ₹
              </div>
              <input
                type="number"
                step="0.01"
                min="0.00"
                placeholder="0.00"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="form-control glass-input"
                style={{ paddingLeft: '24px' }}
              />
            </div>
          </div>

          {/* Comment input */}
          <div className="form-group">
            <label className="form-label">Delivery Feedback</label>
            <textarea
              rows="4"
              placeholder="Was the delivery rider polite? Did the food arrive hot and fresh?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-control glass-input"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-submit" style={{ marginTop: '0.5rem' }}>
            {submitting ? 'Submitting review...' : 'Submit Rider Review & Tip'}
          </button>
        </form>
      </div>
    </div>
  );
}
