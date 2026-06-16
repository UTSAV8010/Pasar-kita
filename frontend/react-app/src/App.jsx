import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';

// Shared Components
import AlertContainer from './components/AlertContainer';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';
import RestroLayout from './components/RestroLayout';
import DeliveryLayout from './components/DeliveryLayout';

// Customer Pages
import Home from './pages/customer/Home';
import About from './pages/customer/About';
import Team from './pages/customer/Team';
import Testimonials from './pages/customer/Testimonials';
import Categories from './pages/customer/Categories';
import CategoryFoods from './pages/customer/CategoryFoods';
import Menu from './pages/customer/Menu';
import Restaurant from './pages/customer/Restaurant';
import RestroCategory from './pages/customer/RestroCategory';
import RestroMenu from './pages/customer/RestroMenu';
import Cart from './pages/customer/Cart';
import Login from './pages/customer/Login';
import Signup from './pages/customer/Signup';
import ForgetPassword from './pages/customer/ForgetPassword';
import Account from './pages/customer/Account';
import Orders from './pages/customer/Orders';
import ReviewRestro from './pages/customer/ReviewRestro';
import ReviewRider from './pages/customer/ReviewRider';
import Contact from './pages/customer/Contact';
import UPICheckout from './pages/customer/UPICheckout';
import OrderSuccess from './pages/customer/OrderSuccess';
import PaymentFailed from './pages/customer/PaymentFailed';
import VerifyPayment from './pages/customer/VerifyPayment';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminForget from './pages/admin/AdminForget';

// Restro Pages
import RestroDashboard from './pages/restro/RestroDashboard';
import RestroLogin from './pages/restro/RestroLogin';
import RestroSignup from './pages/restro/RestroSignup';
import RestroForget from './pages/restro/RestroForget';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliverySignup from './pages/delivery/DeliverySignup';
import DeliveryForget from './pages/delivery/DeliveryForget';

function AppContent() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255,255,255,0.1)',
          borderTopColor: '#e69500',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <AlertContainer />
      <Routes>
        {/* Customer Portal (Public / Shared Layout) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/index.html" element={<Navigate to="/" />} />
          <Route path="/index.php" element={<Navigate to="/" />} />
          <Route path="/about/" element={<About />} />
          <Route path="/team/" element={<Team />} />
          <Route path="/testimonial/" element={<Testimonials />} />
          <Route path="/categories/" element={<Categories />} />
          <Route path="/category-foods/:categoryId/" element={<CategoryFoods />} />
          <Route path="/menu/" element={<Menu />} />
          <Route path="/restaurant/" element={<Restaurant />} />
          <Route path="/restro-category/:categoryId/" element={<RestroCategory />} />
          <Route path="/restro-menu/:restroName/" element={<RestroMenu />} />
          <Route path="/mycart/" element={<Cart />} />
          <Route path="/myaccount/" element={<Account />} />
          <Route path="/update-account/" element={<Account initialTab="update" />} />
          <Route path="/update-password/" element={<Account initialTab="password" />} />
          <Route path="/view-orders/" element={<Orders />} />
          <Route path="/review-restro/:restroName/" element={<ReviewRestro />} />
          <Route path="/review-rider/:orderId/" element={<ReviewRider />} />
          <Route path="/contact/" element={<Contact />} />
          <Route path="/pg/checkout/" element={<UPICheckout />} />
          <Route path="/order-success/" element={<OrderSuccess />} />
          <Route path="/payment-failed/" element={<PaymentFailed />} />
          <Route path="/verify-payment/" element={<VerifyPayment />} />
        </Route>

        {/* Auth Pages (Standalone Layouts without header/footer) */}
        <Route path="/login/" element={<Login />} />
        <Route path="/signup/" element={<Signup />} />
        <Route path="/forget/" element={<ForgetPassword />} />

        {/* Admin Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/forget" element={<AdminForget />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="" element={<AdminDashboard />} />
          <Route path="index" element={<AdminDashboard />} />
          <Route path="index.php" element={<AdminDashboard />} />
          <Route path="*" element={<AdminDashboard />} />
        </Route>

        {/* Restaurant Portal */}
        <Route path="/restro/login" element={<RestroLogin />} />
        <Route path="/restro/signup" element={<RestroSignup />} />
        <Route path="/restro/forget" element={<RestroForget />} />
        <Route path="/restro/*" element={<RestroLayout />}>
          <Route path="" element={<RestroDashboard />} />
          <Route path="*" element={<RestroDashboard />} />
        </Route>

        {/* Delivery Portal */}
        <Route path="/delivery-boy/login" element={<DeliveryLogin />} />
        <Route path="/delivery-boy/signup" element={<DeliverySignup />} />
        <Route path="/delivery-boy/forget" element={<DeliveryForget />} />
        <Route path="/delivery-boy/*" element={<DeliveryLayout />}>
          <Route path="" element={<DeliveryDashboard />} />
          <Route path="*" element={<DeliveryDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
