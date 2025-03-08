import { Image, Order } from "@prisma/client"

export interface CustomError {
    key: number,
    error: string
}

export interface Color {
    key: number,
    name: string,
    hex: string,
    stocks: number
}

export interface Variant {
    key: number,
    name: string,
    stocks: number
}

export interface InputImage {
    image: File,
    key: number,
    preview: string
}

export interface ListedProduct {
    name: string,
    price: number,
    stocks: number,
    id: string,
    discounted_price: number | null,
    is_available: boolean,
    slug: string
}

export interface ProductImage {
    id: string;
    created_at: Date;
    updated_at: Date;
    caption: string | null;
    url: string;
    index: number;
    productId: string;
}

export interface Product {
    name: string,
    price: number,
    stocks: number,
    id: string,
    discounted_price: number | null,
    is_available: boolean,
    slug: string,
    description: string,
    variants: {
        name: string,
        stocks: number
    }[],
    colors: {
        name: string,
        hex: string,
        stocks: number
    }[],
    images: Image[]
}

export interface ListedUser {
    id: string,
    name: string | null,
    is_staff: boolean,
    email: string | null,
    phone: string | null,
    address: string | null
}

export interface ListedCategory {
    id: string;
    name: string;
    _count: {
        products: number;
    };
}

export interface OrderPayload extends Omit<Order,'created_at'|'updated_at'|'c_id'|'courier'|'courier_status'|'note'|'city'|'zone'|'area'>{
    secret : string,
    items: {
        product : string,
        variant : string | null,
        color : string | null,
        count : number
    }[],
}

export const ORDER_STATUS = {
    pending : 'pending',
    confirmed : 'confirmed',
    returned : 'returned',
    completed : 'completed'
}

export const perPageOrder = 20