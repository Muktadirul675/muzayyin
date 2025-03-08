'use client';

import { OrderPayload } from '@/types';
// context/CartContext.tsx
import { Color, Image, CartItem as PCartItem, Product as PProduct, Variant } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface Product extends PProduct {
  images: Image[]
}

// Define the Cart item type
interface CartItem extends PCartItem {
  product: Product,
  variant: Variant | null,
  color: Color | null
}

export interface Item {
  product: Product,
  count: number,
  variant: Variant | null,
  color: Color | null,
  uid: number,
  cartid: string
}

// Define the Cart context value type
interface CartContextType {
  cartFetching: boolean,
  cart: CartItem[];
  items: Item[],
  addItemToCart: (id: string, count: number, selection: { variantId: string | null, colorId: string | null }) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  increasetItem: (uid: number) => void;
  decreasetItem: (uid: number) => void;
  placeOrder: (name: string, address: string, inside_dhaka: boolean, phone: string, price: number) => Promise<void>;
  removeItemFull: (prodId: string, variantId: string | null, colorId: string | null) => Promise<void>;
}

// Create the Cart Context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the Cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// CartProvider component that wraps around your application
interface CartProviderProps {
  children: ReactNode;
}

let anonid: number = 0;

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartFetching, setCartFetching] = useState<boolean>(false)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([])

  const session = useSession()

  const placeOrder = useCallback(async (name: string, address: string, inside_dhaka: boolean, phone: string, price: number) => {
    const secret: string = process.env.NEXT_PUBLIC_ZILMIL_SECRET as string
    console.log("items", items)
    const payload: OrderPayload = {
      secret: secret, id: '', userId: '', address: address, inside_dhaka: inside_dhaka, phone: phone, order_price: price, name: name, status: "pending",
      items: items.map((i) => { return { product: i.product.id, variant: i.variant?.id ?? null, color: i.color?.id ?? null, count : i.count } }),

    }
    try {
      const res = await fetch("/api/order", {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(payload),
      })
      await res.json()
      setCart([])
      toast.success("Order Placed!")
    } catch (e) {
      alert("error: " + e)
    }
  }, [items])

  const increasetItem = useCallback((uid: number) => {
    const incItems = { ...items }
    for (const i of incItems) {
      if (i.uid === uid) {
        i.count = i.count + 1;
      }
      break;
    }
    setItems(incItems)
  }, [])

  const decreasetItem = useCallback((uid: number) => {
    const incItems = { ...items }
    for (const i of incItems) {
      if (i.uid === uid) {
        i.count = i.count - 1;
      }
      break;
    }
    setItems(incItems.filter((i) => i.count > 0))
  }, [])

  useEffect(() => {
    const newItems: Item[] = []
    for (const c of cart) {
      console.log('c', c)
      let found = false;
      for (const i of newItems) {
        if (c.colorId && c.variantId) {
          if (c.product.id === i.product.id && c.variantId === i.variant?.id && c.colorId === i.color?.id) {
            i.count = i.count + 1;
            found = true;
            break;
          }
        } else if (c.colorId) {
          if (c.product.id === i.product.id && c.colorId === i.color?.id) {
            i.count = i.count + 1;
            found = true;
            break;
          }
        } else if (c.variantId) {
          if (c.product.id === i.product.id && c.variantId === i.variant?.id) {
            i.count = i.count + 1;
            found = true;
            break;
          }
        } else {
          if (c.product.id === i.product.id) {
            i.count = i.count + 1;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        console.log('ni', { uid: anonid++, product: c.product, count: 1, variant: c.variant, color: c.color, cartid: c.id })
        newItems.push({ uid: anonid++, product: c.product, count: 1, variant: c.variant, color: c.color, cartid: c.id })
      }
    }
    setItems(newItems)
    console.log('cart', cart)
    console.log('items', newItems)
  }, [cart])

  const fetchCartLocally = useCallback(async () => {
    setCartFetching(true)
    const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') ?? '[]')
    setCart(cartItems)
    setCartFetching(false)
    console.log(cartItems)
  }, [])

  const fetchCartDb = useCallback(async () => {
    const res = await fetch("/api/cart", {
      cache: 'no-store'
    })
    const data: CartItem[] = await res.json()
    if (data) {
      setCart((prev) => [...prev, ...data])
    }
  }, [])

  useEffect(() => {
    if ((session.status !== 'loading')) {
      if ((session.status !== 'authenticated')) {
        fetchCartLocally()
      } else {
        fetchCartDb()
      }
    }
  }, [session.status])

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      localStorage.setItem('cart', JSON.stringify(cart))
      console.log(cart)
    }
  }, [cart])

  const removeItemFull = async (prodId: string, variantId: string | null, colorId: string | null) => {
    for (const c of cart) {
      if (c.colorId === colorId && c.variantId === variantId && c.productId === prodId) {
        await removeItemFromCart(c.id)
      }
    }
  }

  const addItemToCart = async (id: string, count: number = 1, selection: { variantId: string | null, colorId: string | null }) => {
    setCartFetching(true)
    console.log(selection)
    const res1 = await fetch("/api/products/" + id, {
      cache: 'no-store'
    })
    const product: Product = await res1.json()
    if(product.stocks < count){
      toast.error("Not enough stocks")
      return;
    }
    if (!(session.status === 'authenticated')) {
      let variant: Variant | null = null;
      let color: Color | null = null;
      if (selection.variantId) {
        const res2 = await fetch("/api/variants/" + selection.variantId, {
          cache: 'no-store'
        })
        variant = await res2.json()
      }
      if (selection.colorId) {
        const res3 = await fetch("/api/colors/" + selection.colorId, {
          cache: 'no-store'
        })
        color = await res3.json()
      }
      if (product) {
        const newItems: CartItem[] = []
        for (let i = 0; i < count; i++) {
          newItems.push({ id: `${anonid++}`, userId: 'anon', productId: product.id, product: product, variant: variant, color: color, variantId: variant?.id ?? null, colorId: color?.id ?? null })
        }
        setCart((prevCart) => [...prevCart, ...newItems]);
      }
    } else {
      const newItems: CartItem[] = []
      for (let i = 0; i < count; i++) {
        const res = await fetch(`/api/cart?product=${id}${selection.variantId ? `&variant=${selection.variantId}` : ''}${selection.colorId ? `&color=${selection.colorId}` : ''}`, {
          method: 'post'
        })
        const item = await res.json()
        if (!item) {
          return
        }
        newItems.push(item)
      }
      setCart((prev) => [...prev, ...newItems])
    }
    setCartFetching(false)
  };

  const removeItemFromCart = async (id: string) => {
    if (session.status !== 'loading') {
      if (session.status === 'authenticated') {
        await fetch(`/api/cart/${id}`, {
          method: 'delete'
        })
      }
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
      if (session.status !== 'authenticated') {
        localStorage.setItem('cart', JSON.stringify(cart))
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItemToCart, removeItemFromCart, cartFetching, items, increasetItem, decreasetItem, placeOrder, removeItemFull }}>
      {children}
    </CartContext.Provider>
  );
};