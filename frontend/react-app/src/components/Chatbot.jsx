import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api';
import { MessageSquare, Redo, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);

  const storageKey = 'rmChatbotHistory_customer';

  const quickActions = [
    "Menu",
    "Order status",
    "Delivery time",
    "Offers",
    "Payment options"
  ];

  const replies = {
    hello: "Hi, how can I help you today?",
    hi: "Hello, how can I assist you?",
    menu: "Our menu includes pizza, burgers, pasta, biryani, and healthy bowls. Open the Menu page for full details.",
    contact: "You can reach support from the Contact page or call the number listed in site footer.",
    bye: "Thanks for chatting with us. Have a good day.",
    offers: "We run rotating deals every week. Check the homepage banners and festival pages for current discounts.",
    hours: "We are available daily from 9:00 AM to 11:00 PM.",
    location: "We currently serve multiple areas from partner restaurants. Enter your location at checkout to verify coverage.",
    specials: "Today specials vary by restaurant. Open categories and filter by top-rated.",
    recommend: "Popular picks: chef special pizza, alfredo pasta, and grilled platters.",
    "thank you": "You're welcome. I can also help with order tracking.",
    "payment options": "We support cash on delivery, cards, and online payment gateways.",
    "delivery time": "Typical delivery time is 30 to 45 minutes depending on your area and traffic.",
    "cancellation policy": "Orders can be cancelled shortly after placing. Contact support quickly for best chance.",
    "refund policy": "Refunds are processed to your original payment method, usually in 3 to 5 business days.",
    "vegetarian options": "Yes, we have dedicated vegetarian items across pizza, pasta, wraps, and thali categories.",
    drinks: "Cold drinks, juices, shakes, and mocktails are available in the drinks section.",
    "kids menu": "Kids options include mini burgers, cheesy pasta, and fresh juices.",
    "allergy info": "Please mention allergies in checkout notes and verify ingredients with the restaurant before ordering.",
    "order status": "Please type your numeric order ID and I will fetch the latest status.",
    help: "I can answer menu, offers, payment, delivery, and order status questions."
  };

  // Load chat history on mount
  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (history.length === 0) {
      setMessages([
        { type: 'bot', text: 'Hi, I am your support assistant. Ask about menu, delivery, payment, or share your order ID.' }
      ]);
    } else {
      setMessages(history);
    }
  }, []);

  // Save chat history on update
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Append user message
    setMessages((prev) => [...prev, { type: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    const normalized = text.toLowerCase();

    // Check if order status ID is inputted
    if (/^\d+$/.test(normalized)) {
      try {
        const formData = new FormData();
        formData.append('order_id', normalized);

        const data = await apiRequest('/get_order_status.php', {
          method: 'POST',
          body: formData,
        });

        setIsTyping(false);
        if (data && data.success) {
          const statusReply = `
            <strong>Order ID:</strong> #${data.order_id}<br />
            <strong>Customer:</strong> ${data.cus_name}<br />
            <strong>Total:</strong> ₹ ${data.total_price}<br />
            <strong>Status:</strong> ${data.order_status}
          `;
          setMessages((prev) => [...prev, { type: 'bot', text: statusReply }]);
        } else {
          setMessages((prev) => [...prev, { type: 'bot', text: 'I could not find that order ID. Please verify and try again.' }]);
        }
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => [...prev, { type: 'bot', text: 'Order status check is currently unavailable.' }]);
      }
      return;
    }

    // Standard static responses
    let reply = "I can help with menu, offers, delivery, payment, and order tracking. Try typing 'help'.";
    for (const key in replies) {
      if (normalized.includes(key)) {
        reply = replies[key];
        break;
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: 'bot', text: reply }]);
    }, 500);
  };

  const handleClear = () => {
    sessionStorage.removeItem(storageKey);
    setMessages([
      { type: 'bot', text: 'Chat history cleared. How can I help you now?' }
    ]);
  };

  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      zIndex: 1100,
      fontFamily: 'sans-serif'
    }}>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            border: 'none',
            borderRadius: '50%',
            background: '#e69500',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
          className="hover-lift"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chatbox Panel */}
      {isOpen && (
        <div className="glass-card-light fade-in-up" style={{
          width: '360px',
          maxHeight: '500px',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          border: '1px solid var(--site-border)',
        }}>
          {/* Head */}
          <div style={{
            background: 'linear-gradient(135deg, #0f224a, #1d3e7a)',
            color: '#fff',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Pasar Kita Assistant</h5>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#cbd5e1' }}>Order tracking and FAQ help</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleClear} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }} title="Clear Chat"><Redo size={14} /></button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          </div>

          {/* Body messages */}
          <div 
            ref={bodyRef}
            style={{
              padding: '16px',
              overflowY: 'auto',
              flexGrow: 1,
              maxHeight: '300px',
              minHeight: '220px',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg, i) => (
              <div 
                key={i}
                dangerouslySetInnerHTML={{ __html: msg.text }}
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  lineHeight: 1.4,
                  wordWrap: 'break-word',
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.type === 'user' ? '#10274f' : '#fff',
                  color: msg.type === 'user' ? '#fff' : '#1e293b',
                  border: msg.type === 'user' ? 'none' : '1px solid #e2e8f0',
                  borderBottomRightRadius: msg.type === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.type === 'user' ? '12px' : '2px',
                }}
              />
            ))}
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#fff',
                padding: '10px 14px',
                borderRadius: '12px',
                borderBottomLeftRadius: '2px',
                border: '1px solid #e2e8f0',
              }}>
                <span className="rm-chatbot-typing" style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'dot 1s infinite' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'dot 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'dot 1s infinite 0.4s' }} />
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover-lift"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask assistance or enter Order ID..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                style={{
                  flexGrow: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              />
              <button
                onClick={() => handleSend()}
                style={{
                  background: '#e69500',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                className="hover-lift"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes dot { 
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 
          40% { transform: scale(1.1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}
