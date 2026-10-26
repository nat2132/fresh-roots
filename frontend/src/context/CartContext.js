'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, total_price: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], total_items: 0, total_price: 0 });
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (e) {
      console.error('Failed to fetch cart', e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to add item' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeCartItem(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const clearCart = () => {
    setCart({ items: [], total_items: 0, total_price: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
