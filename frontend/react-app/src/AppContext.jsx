import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // Fetch initial status (check logged in user and cart items from session)
  useEffect(() => {
    async function loadInitialState() {
      try {
        // Fetch index or account status to check user session
        const data = await apiRequest('/menu/'); // menu is a light view that returns session info
        if (data) {
          if (data.user) {
            setUser({
              username: data.user,
              name: data.name || data.user,
              role: data.role,
            });
          }
          // In Django, cart is stored in request.session.get('cart')
          // Since our custom render monkeypatch serializes request context, 
          // let's fetch mycart data or extract cart count / items
          if (data.cart_items) {
            setCart(data.cart_items);
          } else if (data.cart_count !== undefined) {
            // If the view only returns cart_count, we can sync items from mycart endpoint
            const cartData = await apiRequest('/mycart/');
            if (cartData && cartData.cart_items) {
              setCart(cartData.cart_items);
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync session state:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialState();
  }, []);

  const addAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  const handleLogout = async (portal = 'customer') => {
    try {
      let url = '/logout/';
      if (portal === 'admin') url = '/admin/logout';
      else if (portal === 'restro') url = '/restro/logout';
      else if (portal === 'delivery-boy') url = '/delivery-boy/logout';
      
      await apiRequest(url);
      setUser(null);
      setCart([]);
      addAlert('Logged out successfully', 'success');
      // Redirect to login
      window.location.href = portal === 'customer' ? '/login/' : `/${portal}/login`;
    } catch (err) {
      addAlert('Logout failed', 'danger');
    }
  };

  const refreshCart = async () => {
    try {
      const data = await apiRequest('/mycart/');
      if (data && data.cart_items) {
        setCart(data.cart_items);
      }
    } catch (err) {
      console.error('Failed to refresh cart:', err);
    }
  };

  const addToCart = async (food) => {
    try {
      // POST to manage_cart with multipart form encoding
      const formData = new FormData();
      formData.append('Add_To_Cart', '1');
      formData.append('Item_Name', food.title || food.Item_Name);
      formData.append('Price', String(food.price || food.Price));
      formData.append('Id', String(food.id || food.Id));
      formData.append('Restro_Name', food.restro_name || food.Restro_Name || 'General');
      
      const data = await apiRequest('/manage-cart', {
        method: 'POST',
        body: formData,
      });

      if (data) {
        await refreshCart();
        addAlert('Item added to cart!', 'success');
      }
    } catch (err) {
      addAlert('Failed to add item', 'danger');
    }
  };

  const removeFromCart = async (itemName) => {
    try {
      const formData = new FormData();
      formData.append('Remove_Item', '1');
      formData.append('Item_Name', itemName);
      
      await apiRequest('/manage-cart', {
        method: 'POST',
        body: formData,
      });
      await refreshCart();
      addAlert('Item removed from cart', 'warning');
    } catch (err) {
      addAlert('Failed to remove item', 'danger');
    }
  };

  const updateQty = async (itemName, qty) => {
    try {
      const formData = new FormData();
      formData.append('Mod_Quantity', '1');
      formData.append('Item_Name', itemName);
      formData.append('Mod_Quantity', String(qty));
      
      await apiRequest('/manage-cart', {
        method: 'POST',
        body: formData,
      });
      await refreshCart();
    } catch (err) {
      addAlert('Failed to update quantity', 'danger');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        refreshCart,
        logout: handleLogout,
        loading,
        alerts,
        addAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
