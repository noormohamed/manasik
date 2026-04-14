"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  type: 'HOTEL' | 'EXPERIENCE' | 'CAR' | 'FLIGHT';
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  
  // Hotel specific
  roomTypeId?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guestCount?: number;
  
  // Pricing
  basePrice: number;
  quantity: number;
  currency: string;
  subtotal: number;
  
  // Metadata
  metadata?: any;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  currency: string;
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemsByType: (type: CartItem['type']) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = `${item.type}-${item.serviceId}-${item.roomTypeId || ''}-${Date.now()}`;
    const subtotal = item.basePrice * item.quantity;
    
    const newItem: CartItem = {
      ...item,
      id,
      subtotal,
    };

    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          subtotal: item.basePrice * quantity,
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getItemsByType = (type: CartItem['type']) => {
    return items.filter(item => item.type === type);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const currency = items.length > 0 ? items[0].currency : 'USD';

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        currency,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemsByType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
