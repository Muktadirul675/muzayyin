'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface Product {
    name: string;
    id: string;
    stocks: number;
    price: number;
    discounted_price: number | null;
    images: {
        id: string;
        created_at: Date;
        updated_at: Date;
        productId: string;
        url: string;
        index: number;
        caption: string | null;
    }[];
    variants: {
        id: string,
        name: string,
        stocks: number
    }[],
    colors: {
        id: string,
        name: string,
        stocks: number,
        hex: string
    }[],
}


interface ProductContextType {
    products: Product[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Custom hook to use the Cart context
export const useProducts = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface Prop {
    children: ReactNode;
}

export const ProductsProvider = ({ children }: Prop) => {
    const [products, setProducts] = useState<Product[]>([])

    async function getProducts(){
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
    }

    useEffect(()=>{
        getProducts()
    },[])

    return <ProductContext.Provider value={{ products }}>
        {children}
    </ProductContext.Provider>
};