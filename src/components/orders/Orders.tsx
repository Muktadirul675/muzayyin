import { Color, Order as POrder, OrderItem as POrderItem, Product as PProduct, Image as ProdImage, Variant } from "@prisma/client";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css';

export interface Product extends Omit<PProduct, 'description' | 'created_at' | 'updated_at' | 'profit'> {
    images: ProdImage[]
}

export interface OrderItem extends POrderItem {
    product: Product,
    variant: Variant | null,
    color: Color | null
}

export interface Order extends POrder {
    items: OrderItem[]
}

export interface Item {
    product: Product,
    count: number,
    variant: Variant | null,
    color: Color | null,
    cartid: string
}