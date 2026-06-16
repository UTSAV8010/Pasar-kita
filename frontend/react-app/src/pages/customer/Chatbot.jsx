import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { apiRequest } from '../../api';
import { 
  MessageSquare, 
  RotateCcw, 
  X, 
  Send, 
  Volume2, 
  Sparkles, 
  Smile, 
  Compass, 
  Truck, 
  HelpCircle,
  Copy,
  PhoneCall,
  Mail,
  Flame,
  Award,
  ChevronRight,
  Mic,
  MicOff,
  ShoppingBag,
  MapPin,
  User,
  Bike,
  Gift
} from 'lucide-react';

export default function Chatbot() {
  const { user, addAlert, addToCart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [scratchedCoupons, setScratchedCoupons] = useState({});
  const [dbFoods, setDbFoods] = useState([]);
  const bodyRef = useRef(null);
  const recognitionRef = useRef(null);

  const username = user?.username || 'guest';
  const storageKey = `rmChatbotHistory_${username}`;

  const quickActions = [
    { label: "Today's Deals 🔥", query: "offers" },
    { label: "Recommend Food 🍕", query: "recommend" },
    { label: "Track My Order 🚚", query: "order status" },
    { label: "Food Trivia 💡", query: "trivia" },
    { label: "Get Help 💬", query: "help" }
  ];

  const moods = [
    { emoji: "😫", label: "Stressed", response: "Oh no! Stressed spelt backwards is Desserts! Let's get you some comforting sweets or cheesy delights. 🍕🍰", tag: "comfort" },
    { emoji: "😴", label: "Tired", response: "Feeling sluggish? Let's recharge your energy with some spicy and savory mains or a hot refreshment! ☕🍛", tag: "energy" },
    { emoji: "🥗", label: "Healthy", response: "Fueling your body with goodness! Here are some fresh, nutritious, and balanced options for you. 🥑🥗", tag: "healthy" },
    { emoji: "🎉", label: "Celebrating", response: "Cheers! Let's make it a feast with our premium sharing platters, pizzas, and special deals! 🍕🍔", tag: "feast" },
    { emoji: "☕", label: "Cozy", response: "Snuggle up! Here are some perfect warm snacks and comfort drinks for your cozy time. ☕🍟", tag: "cozy" }
  ];

  const foodJokes = [
    "Did you know that honey never spoils? You could theoretically eat 3,000-year-old honey! 🍯",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the tomato blush? Because it saw the salad dressing! 🍅",
    "Did you know that margherita pizza was named after Queen Margherita of Savoy in 1889? It was decorated to represent the colors of the Italian flag! 🍕",
    "Why did the banana go to the doctor? Because it wasn't peeling well! 🍌",
    "Did you know that french fries are not actually French? They originated in Belgium! 🍟",
    "Why did the mushroom go to the party? Because he was a fun-gi! 🍄"
  ];

  const recommendations = [
    { id: 1, title: "Cheesy Pepperoni Pizza", rating: "4.9★", price: "INR 299", desc: "Loaded with mozzarella and classic pepperoni slices.", icon: "🍕" },
    { id: 2, title: "Double Cheeseburger", rating: "4.7★", price: "INR 149", desc: "Double grilled patty with cheddar cheese and house sauce.", icon: "🍔" },
    { id: 3, title: "Chicken Alfredo Pasta", rating: "4.8★", price: "INR 210", desc: "Fettuccine pasta in rich creamy parmesan white sauce.", icon: "🍝" },
    { id: 4, title: "Special Veg Biryani", rating: "4.6★", price: "INR 180", desc: "Fragrant basmati rice cooked with fresh seasonal veggies and aromatic spices.", icon: "🍛" }
  ];

  const activeCoupons = [
    { code: "FIRST50", discount: "50% OFF", desc: "Valid on your first order. Max discount INR 150." },
    { code: "FESTIVE20", discount: "20% OFF", desc: "Valid on orders above INR 499. Perfect for weekends." },
    { code: "FREEDEL", discount: "FREE DELIVERY", desc: "Get free delivery on orders above INR 350." }
  ];

  // Load message history & fetch database menu foods
  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
    if (history.length === 0) {
      const welcomeMsg = { 
        type: 'bot', 
        text: "Hello! I am your AI assistant. I can recommend top foods, fetch active discount coupons, share fun food facts, or check your order delivery status! How can I help you today? 🌟" 
      };
      setMessages([welcomeMsg]);
    } else {
      setMessages(history);
    }

    const fetchMenu = async () => {
      try {
        const response = await apiRequest('/menu/');
        if (response && response.foods) {
          setDbFoods(response.foods);
        }
      } catch (err) {
        console.error('Failed to pre-fetch menu for chatbot:', err);
      }
    };
    fetchMenu();
  }, [username]);

  // Setup Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
      };
      
      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const saveMessage = (type, text, card = null) => {
    const updatedMessages = [...messages, { type, text, card }];
    setMessages(updatedMessages);
    sessionStorage.setItem(storageKey, JSON.stringify(updatedMessages));
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      
      const plainText = text.replace(/<[^>]*>/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(plainText);
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      addAlert('Speech synthesis is not supported in this browser.', 'warning');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addAlert('Speech recognition is not supported in this browser.', 'warning');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    addAlert(`Coupon code "${code}" copied to clipboard!`, 'success');
  };

  const handleScratch = (code) => {
    setScratchedCoupons(prev => ({ ...prev, [code]: true }));
    addAlert(`Coupon ${code} revealed! 🎉`, 'success');
  };

  const handleAddFood = async (item) => {
    const matched = dbFoods.find(f => f.title?.toLowerCase() === item.title?.toLowerCase() || f.id === item.id);
    if (matched) {
      await addToCart(matched);
    } else {
      const dummyFood = {
        id: item.id || 999,
        title: item.title,
        price: parseInt(item.price.replace(/[^\d]/g, '')) || 200,
        restro_name: item.restro_name || 'General',
        stock: 10
      };
      await addToCart(dummyFood);
    }
  };

  const handleMoodSelect = (mood) => {
    const userText = `Feeling ${mood.label} ${mood.emoji}`;
    const newMessages = [...messages, { type: 'user', text: userText }];
    setMessages(newMessages);
    sessionStorage.setItem(storageKey, JSON.stringify(newMessages));

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      let items = [...recommendations];
      if (dbFoods.length > 0) {
        items = dbFoods.map(f => ({
          id: f.id,
          title: f.title,
          rating: "4.8★",
          price: `INR ${f.price}`,
          desc: f.description || "Fresh and delicious food item prepared on order.",
          icon: f.title.toLowerCase().includes("pizza") ? "🍕" : 
                f.title.toLowerCase().includes("burger") ? "🍔" : 
                f.title.toLowerCase().includes("pasta") ? "🍝" : 
                f.title.toLowerCase().includes("biryani") ? "🍛" : "🍲",
          restro_name: f.restro_name
        }));
      }

      let filtered = [];
      if (mood.tag === "comfort") {
        filtered = items.filter(i => 
          i.title.toLowerCase().includes("pizza") || 
          i.title.toLowerCase().includes("burger") ||
          i.title.toLowerCase().includes("pasta")
        );
      } else if (mood.tag === "healthy") {
        filtered = items.filter(i => 
          i.title.toLowerCase().includes("veg") || 
          i.title.toLowerCase().includes("biryani") ||
          i.title.toLowerCase().includes("salad")
        );
      } else if (mood.tag === "energy") {
        filtered = items.filter(i => 
          i.title.toLowerCase().includes("spicy") || 
          i.title.toLowerCase().includes("biryani") || 
          i.title.toLowerCase().includes("pasta")
        );
      } else if (mood.tag === "cozy") {
        filtered = items.filter(i => 
          i.title.toLowerCase().includes("fries") || 
          i.title.toLowerCase().includes("burger") ||
          i.title.toLowerCase().includes("tea") ||
          i.title.toLowerCase().includes("coffee")
        );
      } else {
        filtered = items;
      }
      
      if (filtered.length === 0) {
        filtered = items.slice(0, 3);
      } else {
        filtered = filtered.slice(0, 3);
      }

      saveMessage('bot', mood.response, {
        type: 'recommendation',
        items: filtered
      });

    }, 600);
  };

  const fetchOrderStatus = async (orderId) => {
    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);

      const data = await apiRequest('/get_order_status.php', {
        method: 'POST',
        body: formData,
      });

      setIsTyping(false);
      if (data && data.success) {
        const text = `I found order #${data.order_id}! Here is the current progress status and active delivery tracker map:`;
        saveMessage('bot', text, {
          type: 'orderStatus',
          orderId: data.order_id,
          name: data.cus_name,
          total: data.total_price,
          status: data.order_status
        });
      } else {
        saveMessage('bot', "I couldn't locate that order ID. Please double-check the number and try again. 🔍");
      }
    } catch (err) {
      setIsTyping(false);
      saveMessage('bot', "Order lookup is temporarily unavailable. Please try again shortly.");
    }
  };

  const handleSend = (customVal = '') => {
    const queryText = (customVal || inputVal).trim();
    if (!queryText) return;

    const newMessages = [...messages, { type: 'user', text: queryText }];
    setMessages(newMessages);
    sessionStorage.setItem(storageKey, JSON.stringify(newMessages));
    if (!customVal) setInputVal('');

    const normalized = queryText.toLowerCase();

    if (/^\d+$/.test(normalized) || (normalized.startsWith("order") && /\d+/.test(normalized))) {
      const numericId = normalized.match(/\d+/)[0];
      fetchOrderStatus(numericId);
      return;
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (normalized.includes("order status") || normalized.includes("track")) {
        saveMessage('bot', "Please enter your numeric <strong>Order ID</strong> (e.g., 12) to fetch live delivery progress.");
        return;
      }

      if (normalized.includes("recommend") || normalized.includes("food") || normalized.includes("specials") || normalized.includes("suggest") || normalized.includes("eat") || normalized.includes("veg") || normalized.includes("pizza")) {
        let items = [...recommendations];
        if (dbFoods.length > 0) {
          items = dbFoods.map(f => ({
            id: f.id,
            title: f.title,
            rating: "4.8★",
            price: `INR ${f.price}`,
            desc: f.description || "Delicious partner restaurant special.",
            icon: f.title.toLowerCase().includes("pizza") ? "🍕" : 
                  f.title.toLowerCase().includes("burger") ? "🍔" : 
                  f.title.toLowerCase().includes("pasta") ? "🍝" : 
                  f.title.toLowerCase().includes("biryani") ? "🍛" : "🍲",
            restro_name: f.restro_name
          }));
        }
        
        let filtered = items;
        if (normalized.includes("veg")) {
          filtered = items.filter(i => i.title.toLowerCase().includes("veg") || i.title.toLowerCase().includes("biryani"));
        } else if (normalized.includes("pizza")) {
          filtered = items.filter(i => i.title.toLowerCase().includes("pizza"));
        }
        
        if (filtered.length === 0) filtered = items;

        saveMessage('bot', "Here are the top-rated recommendations from our partner restaurants today! 🍕🍔🍟", {
          type: 'recommendation',
          items: filtered.slice(0, 4)
        });
        return;
      }

      if (normalized.includes("offer") || normalized.includes("deal") || normalized.includes("coupon") || normalized.includes("discount") || normalized.includes("first50")) {
        saveMessage('bot', "Tap to reveal and scratch off active discount coupons to save money at checkout! 🎁💰", {
          type: 'offers',
          items: activeCoupons
        });
        return;
      }

      if (normalized.includes("trivia") || normalized.includes("joke") || normalized.includes("fact")) {
        const randomJoke = foodJokes[Math.floor(Math.random() * foodJokes.length)];
        saveMessage('bot', `💡 <strong>Food Facts & Trivia:</strong><br/>${randomJoke}`);
        return;
      }

      if (normalized.includes("contact") || normalized.includes("support") || normalized.includes("help") || normalized.includes("call")) {
        saveMessage('bot', "Need assistance? You can connect with our support agents directly:", {
          type: 'support'
        });
        return;
      }

      const replies = {
        hello: "Hi there! How can I help you today? Ask me about menu suggestions, active deals, or order tracking! 😊",
        hi: "Hello! What can I fetch for you today? 🍕",
        hey: "Hey! Nice to chat with you. How's your hunger level today? 😋",
        menu: "We offer delicious pizza, cheesy burgers, chicken pastas, hot momos, and traditional thalis. Select the <strong>Menu</strong> tab in the navigation bar to browse all available options.",
        hours: "Our partner restaurants are open for orders daily from <strong>09:00 AM to 11:00 PM</strong>.",
        location: "We currently deliver to Surat, Ahmedabad, and Baroda. You can check exact coverage for your area during checkout.",
        bye: "Goodbye! Have a great day and enjoy your meals! 🍔👋"
      };

      for (const key in replies) {
        if (normalized.includes(key)) {
          saveMessage('bot', replies[key]);
          return;
        }
      }

      saveMessage('bot', "I'm still learning! You can ask about <strong>menu</strong>, <strong>offers</strong>, <strong>order status</strong>, or <strong>trivia</strong>. Or click one of the quick action buttons below. 👇");

    }, 600);
  };

  const handleClear = () => {
    sessionStorage.removeItem(storageKey);
    const welcome = { type: 'bot', text: "Chat history cleared. What can I help you with now? 🌟" };
    setMessages([welcome]);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="rm-chatbot-root">
      {/* Toggler button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="rm-chatbot-toggle" 
          type="button" 
          aria-label="Open AI helper chat"
        >
          <Sparkles className="sparkle-icon" size={24} />
          <span className="toggle-badge">Help</span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="rm-chatbot-panel is-open" role="dialog" aria-label="AI Support Chatbot">
          {/* Header */}
          <div className="rm-chatbot-head">
            <div className="head-identity">
              <div className="bot-avatar-pulse">
                <Sparkles size={16} color="#ffffff" />
                <span className="online-dot"></span>
              </div>
              <div>
                <p className="rm-chatbot-title">AI Foodie Assistant</p>
                <p className="rm-chatbot-sub">Online Assistance & FAQs</p>
              </div>
            </div>
            <div className="rm-chatbot-head-actions">
              <button 
                onClick={handleClear} 
                className="rm-chatbot-head-btn" 
                type="button" 
                title="Clear Chat"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }} 
                className="rm-chatbot-head-btnClose" 
                type="button" 
                title="Close Window"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Interactive Mood Picker */}
          <div className="rm-chatbot-mood-picker">
            <div className="mood-picker-label">How's your vibe?</div>
            <div className="mood-picker-row">
              {moods.map((m, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleMoodSelect(m)}
                  className="mood-picker-btn"
                  type="button"
                  title={`Feeling ${m.label}`}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-name">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div ref={bodyRef} className="rm-chatbot-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`msg-wrapper ${msg.type}`}>
                <div className={`rm-chatbot-msg ${msg.type}`}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  
                  {/* Text to Speech Button for bot messages */}
                  {msg.type === 'bot' && (
                    <button 
                      onClick={() => handleSpeak(msg.text)} 
                      className={`speak-btn ${isSpeaking ? 'active' : ''}`}
                      type="button"
                      title="Speak Text"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>

                {/* 1. Recommendation Card Layout with Add to Cart */}
                {msg.card && msg.card.type === 'recommendation' && (
                  <div className="card-attachment recommendation-grid">
                    {msg.card.items.map((item, i) => (
                      <div key={i} className="rec-card">
                        <span className="rec-icon">{item.icon}</span>
                        <div className="rec-info">
                          <h5>{item.title}</h5>
                          <p className="rec-desc">{item.desc}</p>
                          <div className="rec-footer">
                            <span className="rec-price">{item.price}</span>
                            <button
                              onClick={() => handleAddFood(item)}
                              className="rec-add-cart-btn"
                              type="button"
                              title="Add to Cart"
                            >
                              <ShoppingBag size={11} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Offers Card Layout with Scratch to Reveal */}
                {msg.card && msg.card.type === 'offers' && (
                  <div className="card-attachment coupons-list">
                    {msg.card.items.map((coupon, i) => {
                      const isScratched = scratchedCoupons[coupon.code];
                      return (
                        <div key={i} className={`coupon-item ${isScratched ? 'scratched' : 'unscratched'}`}>
                          {!isScratched ? (
                            <div 
                              onClick={() => handleScratch(coupon.code)}
                              className="scratch-overlay"
                            >
                              <Gift size={16} className="scratch-gift-icon" />
                              <span>Tap to scratch off 🎁</span>
                            </div>
                          ) : (
                            <>
                              <div className="coupon-badge">
                                <Flame size={12} />
                                <span>{coupon.discount}</span>
                              </div>
                              <div className="coupon-content">
                                <div className="coupon-header">
                                  <code className="coupon-code">{coupon.code}</code>
                                  <button 
                                    onClick={() => copyToClipboard(coupon.code)}
                                    className="copy-btn" 
                                    type="button"
                                    title="Copy code"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                                <p className="coupon-desc">{coupon.desc}</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Support Contacts Card Layout */}
                {msg.card && msg.card.type === 'support' && (
                  <div className="card-attachment support-card">
                    <a href="tel:+919978043407" className="support-link">
                      <PhoneCall size={14} />
                      <span>Call Support (+91 9978043407)</span>
                      <ChevronRight size={14} />
                    </a>
                    <a href="mailto:Pasar-kita@gmail.com" className="support-link">
                      <Mail size={14} />
                      <span>Email Support (Pasar-kita@gmail.com)</span>
                      <ChevronRight size={14} />
                    </a>
                    <a href="/contact/" className="support-link highlight">
                      <HelpCircle size={14} />
                      <span>Visit Contact Page</span>
                      <ChevronRight size={14} />
                    </a>
                  </div>
                )}

                {/* 4. Order Status Tracking Timeline & Interactive SVG Map */}
                {msg.card && msg.card.type === 'orderStatus' && (
                  <div className="card-attachment tracking-card">
                    <div className="tracking-header">
                      <span>Order #{msg.card.orderId}</span>
                      <span className="tracking-total">INR {msg.card.total}</span>
                    </div>
                    <div className="tracking-recipient">Customer: {msg.card.name}</div>
                    
                    {/* SVG Map Simulator */}
                    <div className="map-simulator">
                      <svg viewBox="0 0 320 120" className="map-svg">
                        <defs>
                          <pattern id="mapGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapGrid)" rx="12" />
                        
                        {/* Winding road path */}
                        <path 
                          id="deliveryPath"
                          d="M 25 70 Q 100 25 160 70 T 295 70" 
                          fill="none" 
                          stroke="rgba(226, 232, 240, 0.9)" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                        />
                        
                        {/* Active Road Progress */}
                        <path 
                          d="M 25 70 Q 100 25 160 70 T 295 70" 
                          fill="none" 
                          stroke="url(#routeGradient)" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          strokeDasharray="300"
                          strokeDashoffset={
                            msg.card.status === 'Order Placed' ? 260 :
                            msg.card.status === 'Preparing' ? 180 :
                            msg.card.status === 'Out for Delivery' ? 80 : 0
                          }
                          className="map-active-road"
                        />

                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ffb327" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>

                        {/* Store Pin */}
                        <g transform="translate(25, 70)">
                          <circle cx="0" cy="0" r="10" fill="#1e3d75" stroke="#ffffff" strokeWidth="2" />
                          <circle cx="0" cy="0" r="4" fill="#ffffff" />
                          <text x="-14" y="-14" className="map-pin-label">Shop</text>
                        </g>

                        {/* Home Pin */}
                        <g transform="translate(295, 70)">
                          <circle cx="0" cy="0" r="10" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                          <circle cx="0" cy="0" r="4" fill="#ffffff" />
                          <text x="-16" y="-14" className="map-pin-label">Home</text>
                        </g>

                        {/* Animated Marker (Delivery vehicle) */}
                        {msg.card.status !== 'Completed' && (
                          <g className="map-bike-marker" style={{
                            offsetPath: "path('M 25 70 Q 100 25 160 70 T 295 70')",
                            offsetDistance: 
                              msg.card.status === 'Order Placed' ? "15%" :
                              msg.card.status === 'Preparing' ? "40%" : "75%"
                          }}>
                            <circle cx="0" cy="0" r="14" fill="#ffb327" stroke="#ffffff" strokeWidth="2" className="bike-pulse" />
                            <text x="-7" y="5" style={{ fontSize: '12px' }}>🚴</text>
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Driver details subcard */}
                    {['Preparing', 'Out for Delivery', 'Completed'].includes(msg.card.status) && (
                      <div className="driver-details">
                        <div className="driver-avatar-circle">
                          <User size={16} color="#ffffff" />
                        </div>
                        <div className="driver-meta">
                          <h6>Ramesh Kumar</h6>
                          <p>GJ-05-AB-1234 • Honda Activa</p>
                        </div>
                        <a href="tel:+919978043407" className="driver-call" title="Call Driver">
                          <PhoneCall size={12} color="#16a34a" />
                        </a>
                      </div>
                    )}
                    
                    {/* Progress Timeline */}
                    <div className="timeline">
                      <div className={`timeline-step ${['Order Placed', 'Preparing', 'Out for Delivery', 'Completed'].includes(msg.card.status) ? 'active' : ''}`}>
                        <div className="step-circle">1</div>
                        <span className="step-label">Placed</span>
                      </div>
                      <div className={`timeline-step ${['Preparing', 'Out for Delivery', 'Completed'].includes(msg.card.status) ? 'active' : ''}`}>
                        <div className="step-circle">2</div>
                        <span className="step-label">Cooking</span>
                      </div>
                      <div className={`timeline-step ${['Out for Delivery', 'Completed'].includes(msg.card.status) ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <span className="step-label">On Way</span>
                      </div>
                      <div className={`timeline-step ${msg.card.status === 'Completed' ? 'active' : ''}`}>
                        <div className="step-circle">4</div>
                        <span className="step-label">Delivered</span>
                      </div>
                    </div>
                    
                    <div className="tracking-footer">
                      Current Status: <strong className="status-highlight">{msg.card.status}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="msg-wrapper bot">
                <div className="rm-chatbot-msg bot">
                  <span className="rm-chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Smart Suggestion Tags */}
          {inputVal === '' && (
            <div className="rm-chatbot-suggestions">
              <span className="suggest-lbl">Try:</span>
              <button onClick={() => setInputVal("Recommend Veg 🥗")} className="suggest-tag">Recommend Veg</button>
              <button onClick={() => setInputVal("FIRST50")} className="suggest-tag">FIRST50 Coupon</button>
              <button onClick={() => setInputVal("Order 12")} className="suggest-tag">Track Order</button>
            </div>
          )}

          {/* Quick FAQ Actions */}
          <div className="rm-chatbot-quick">
            {quickActions.map((action, idx) => (
              <button 
                key={idx} 
                className="rm-chatbot-chip" 
                type="button"
                onClick={() => handleSend(action.query)}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="rm-chatbot-foot">
            <div className="rm-chatbot-input-row">
              <button
                onClick={toggleListening}
                className={`rm-chatbot-mic ${isListening ? 'active' : ''}`}
                type="button"
                title={isListening ? "Listening... Click to Stop" : "Voice Input"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input 
                className="rm-chatbot-input" 
                type="text" 
                placeholder="Ask me anything or enter Order ID..." 
                maxLength="240"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                onClick={() => handleSend()}
                className="rm-chatbot-send" 
                type="button" 
                aria-label="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="rm-chatbot-help">
              Type "pizza" for suggestions, "FIRST50" for coupons, or your Order ID to track.
            </div>
          </div>
        </div>
      )}

      {/* Styled block matching the original chatbot styles */}
      <style>{`
        .rm-chatbot-root {
          position: fixed;
          right: 32px;
          bottom: 28px;
          z-index: 1100;
          font-family: 'Outfit', sans-serif;
        }

        .rm-chatbot-toggle {
          width: 62px;
          height: 62px;
          border: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffb327 0%, #e69500 100%);
          color: #fff;
          box-shadow: 0 12px 30px rgba(230, 149, 0, 0.35);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s;
          position: relative;
        }
        
        .rm-chatbot-toggle:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 16px 36px rgba(230, 149, 0, 0.42);
        }

        .rm-chatbot-toggle .sparkle-icon {
          animation: sparkleRotate 3s infinite linear;
        }

        @keyframes sparkleRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .toggle-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #558a3e;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 999px;
          border: 2px solid #fff;
          letter-spacing: 0.5px;
        }

        .rm-chatbot-panel {
          position: absolute;
          right: 0;
          bottom: 80px;
          width: min(390px, calc(100vw - 32px));
          max-height: min(680px, calc(100vh - 120px));
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px) saturate(180%);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.15);
          display: none;
          overflow: hidden;
          animation: slideUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards;
        }

        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .rm-chatbot-panel.is-open {
          display: flex;
          flex-direction: column;
        }

        .rm-chatbot-head {
          background: linear-gradient(135deg, #0f224a, #1b356c);
          color: #fff;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .head-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-avatar-pulse {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fea116, #e69500);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 10px rgba(230, 149, 0, 0.3);
        }

        .online-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border: 2px solid #fff;
          border-radius: 50%;
          position: absolute;
          bottom: -2px;
          right: -2px;
          animation: pulseGreen 2s infinite;
        }

        @keyframes pulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .rm-chatbot-title {
          margin: 0;
          font-size: 0.98rem;
          font-weight: 800;
          letter-spacing: .2px;
        }

        .rm-chatbot-sub {
          margin: 1px 0 0;
          font-size: .76rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .rm-chatbot-head-actions {
          display: flex;
          gap: 6px;
        }

        .rm-chatbot-head-btn,
        .rm-chatbot-head-btnClose {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rm-chatbot-head-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .rm-chatbot-head-btnClose:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }

        /* Mood picker layout */
        .rm-chatbot-mood-picker {
          background: #f8fafc;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          text-align: left;
        }

        .mood-picker-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .mood-picker-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .mood-picker-row::-webkit-scrollbar {
          display: none;
        }

        .mood-picker-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 5px 10px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .mood-picker-btn:hover {
          border-color: #ffb327;
          background: #fffdf5;
          transform: translateY(-1px);
        }

        .mood-emoji {
          font-size: 0.95rem;
        }

        .mood-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: #334155;
        }

        .rm-chatbot-body {
          padding: 18px 14px;
          background: #f1f5f9;
          overflow-y: auto;
          height: 290px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
        }

        .msg-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 8px;
        }

        .rm-chatbot-msg {
          max-width: 82%;
          padding: 10px 14px;
          border-radius: 16px;
          line-height: 1.45;
          font-size: .9rem;
          word-wrap: break-word;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
        }

        .rm-chatbot-msg.user {
          margin-left: auto;
          background: linear-gradient(135deg, #10274f 0%, #1e3d75 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(16, 39, 79, 0.15);
        }

        .rm-chatbot-msg.bot {
          margin-right: auto;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom-left-radius: 4px;
        }

        .speak-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 6px;
        }

        .speak-btn:hover {
          color: #fea116;
          background: #f1f5f9;
        }

        .speak-btn.active {
          color: #ef4444;
          animation: pulseSpeak 1s infinite alternate;
        }

        @keyframes pulseSpeak {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }

        /* Structured Card Attachments */
        .card-attachment {
          max-width: 82%;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          animation: cardPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards;
        }

        @keyframes cardPop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Recommendations layout */
        .recommendation-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .rec-card {
          display: flex;
          gap: 12px;
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .rec-card:last-child {
          border-bottom: 0;
        }

        .rec-card:hover {
          background: #f8fafc;
        }

        .rec-icon {
          font-size: 1.6rem;
          display: flex;
          align-items: center;
        }

        .rec-info {
          flex: 1;
          text-align: left;
        }

        .rec-info h5 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .rec-desc {
          margin: 2px 0 6px;
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.3;
        }

        .rec-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .rec-price {
          color: #e69500;
          font-weight: 800;
        }

        .rec-add-cart-btn {
          border: none;
          background: linear-gradient(135deg, #ffb327, #e69500);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 6px rgba(230, 149, 0, 0.2);
        }

        .rec-add-cart-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(230, 149, 0, 0.3);
        }

        .rec-add-cart-btn:active {
          transform: translateY(0);
        }

        /* Coupons list & Scratch overlay */
        .coupons-list {
          display: flex;
          flex-direction: column;
        }

        .coupon-item {
          position: relative;
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          align-items: flex-start;
          text-align: left;
          min-height: 52px;
        }

        .coupon-item:last-child {
          border-bottom: 0;
        }

        .scratch-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.35s ease;
          z-index: 10;
        }

        .scratch-overlay:hover {
          background: linear-gradient(135deg, #b2c1d3, #7e91a8);
        }

        .scratch-gift-icon {
          animation: giftBounce 1.5s infinite alternate;
        }

        @keyframes giftBounce {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-4px) scale(1.1); }
        }

        .coupon-badge {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          text-transform: uppercase;
        }

        .coupon-content {
          flex: 1;
        }

        .coupon-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .coupon-code {
          font-size: 0.8rem;
          font-weight: 800;
          color: #1e3d75;
          letter-spacing: 0.5px;
        }

        .copy-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 3px;
          border-radius: 4px;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
        }

        .copy-btn:hover {
          background: #f1f5f9;
          color: #e69500;
        }

        .coupon-desc {
          margin: 3px 0 0;
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.3;
        }

        /* Support layout */
        .support-card {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .support-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .support-link:last-child {
          border-bottom: 0;
        }

        .support-link svg:first-child {
          color: #e69500;
        }

        .support-link span {
          flex: 1;
        }

        .support-link svg:last-child {
          color: #94a3b8;
        }

        .support-link:hover {
          background: #f8fafc;
        }

        .support-link.highlight {
          background: #fffbfa;
        }
        .support-link.highlight:hover {
          background: #fff5f0;
        }

        /* Tracking Timeline layout */
        .tracking-card {
          padding: 14px;
          text-align: left;
        }

        .tracking-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .tracking-total {
          color: #16a34a;
        }

        .tracking-recipient {
          font-size: 0.74rem;
          color: #64748b;
          margin-bottom: 12px;
        }

        /* SVG Map Simulator */
        .map-simulator {
          width: 100%;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          margin-bottom: 12px;
        }

        .map-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .map-pin-label {
          font-size: 8px;
          font-weight: 800;
          fill: #475569;
        }

        .map-active-road {
          animation: drawRoad 1.5s ease-out forwards;
        }

        @keyframes drawRoad {
          to { stroke-dashoffset: var(--dashoffset, 0); }
        }

        .bike-pulse {
          animation: pulseBike 1.5s infinite alternate;
        }

        @keyframes pulseBike {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }

        /* Delivery Driver panel */
        .driver-details {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 14px;
        }

        .driver-avatar-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .driver-meta {
          flex: 1;
        }

        .driver-meta h6 {
          margin: 0;
          font-size: 0.76rem;
          font-weight: 800;
          color: #0f172a;
        }

        .driver-meta p {
          margin: 1px 0 0;
          font-size: 0.65rem;
          color: #64748b;
        }

        .driver-call {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(22, 163, 74, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .driver-call:hover {
          background: rgba(22, 163, 74, 0.2);
        }

        .timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-bottom: 14px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          top: 11px;
          left: 10px;
          right: 10px;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          z-index: 2;
          width: 25%;
        }

        .step-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          transition: background 0.3s, color 0.3s;
        }

        .step-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          white-space: nowrap;
        }

        .timeline-step.active .step-circle {
          background: #e69500;
          color: #fff;
          box-shadow: 0 0 0 3px rgba(230, 149, 0, 0.15);
        }

        .timeline-step.active .step-label {
          color: #1e293b;
        }

        .tracking-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          font-size: 0.76rem;
          color: #64748b;
        }

        .status-highlight {
          color: #e69500;
          font-weight: 800;
        }

        /* Suggestion tags section */
        .rm-chatbot-suggestions {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 8px 14px 2px;
          background: #fff;
          align-items: center;
        }

        .suggest-lbl {
          font-size: 0.68rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .suggest-tag {
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          color: #475569;
          border-radius: 8px;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 4px 8px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .suggest-tag:hover {
          border-color: #ffb327;
          background: #fffdf5;
          color: #e69500;
        }

        /* Typing Indicator dot animations */
        .rm-chatbot-typing {
          display: inline-flex;
          gap: 5px;
          align-items: center;
          padding: 4px 0;
        }

        .rm-chatbot-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #90a1bc;
          animation: rm-chatbot-dot 1.1s infinite;
        }

        .rm-chatbot-typing span:nth-child(2) { animation-delay: 0.14s; }
        .rm-chatbot-typing span:nth-child(3) { animation-delay: 0.28s; }

        @keyframes rm-chatbot-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: .5; }
          40% { transform: translateY(-3px); opacity: 1; }
        }

        .rm-chatbot-quick {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 10px 14px 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          background: #fff;
        }

        .rm-chatbot-quick::-webkit-scrollbar {
          display: none;
        }

        .rm-chatbot-chip {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #1e293b;
          border-radius: 999px;
          font-size: .74rem;
          font-weight: 700;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .rm-chatbot-chip:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .rm-chatbot-chip:active {
          transform: translateY(0);
        }

        .rm-chatbot-foot {
          background: #fff;
          padding: 12px 14px;
        }

        .rm-chatbot-input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .rm-chatbot-mic {
          border: 1px solid #d4dbe8;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .rm-chatbot-mic:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
          color: #475569;
        }

        .rm-chatbot-mic.active {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
          animation: pulseMic 1.2s infinite alternate;
        }

        @keyframes pulseMic {
          from { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          to { transform: scale(1.06); box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        }

        .rm-chatbot-input {
          width: 100%;
          border: 1px solid #d4dbe8;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: .9rem;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .rm-chatbot-input:focus {
          border-color: #7fa8ea;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .rm-chatbot-send {
          min-width: 44px;
          height: 40px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffb327, #e69500);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s, transform 0.1s;
        }

        .rm-chatbot-send:hover {
          filter: brightness(1.05);
        }

        .rm-chatbot-send:active {
          transform: scale(0.95);
        }

        .rm-chatbot-help {
          margin-top: 8px;
          color: #64748b;
          font-size: .72rem;
          text-align: left;
          line-height: 1.35;
        }

        @media (max-width: 576px) {
          .rm-chatbot-root {
            right: 20px;
            bottom: 20px;
          }
          .rm-chatbot-panel {
            position: fixed;
            left: 10px;
            right: 10px;
            width: auto;
            max-width: none;
            bottom: 90px;
            max-height: calc(100vh - 110px);
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  );
}
