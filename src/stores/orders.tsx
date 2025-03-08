'use client';

import { Order } from '@/components/orders/Orders';
import { Order as OrderAddPayload } from '@/app/admin/orders/add/page';
import { ORDER_STATUS } from '@/types';
import { Order as POrder } from '@prisma/client';
// context/CartContext.tsx
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// Define the Cart context value type
interface CartContextType {
    orders: { page: number, orders: Order[] }[],
    counts: {
        count: number,
        pending: number,
        delivered: number,
        returned: number,
        confirmed: number,
        dismissed:number,
        hold:number
    },
    getPage : (page: number) => Promise<Order[]>,
    addOrder: (payload: OrderAddPayload)=>Promise<void>,
    editOrder : (id: string,payload: OrderAddPayload)=>Promise<void>
}

// Create the Cart Context with a default value
const OrderContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the Cart context
export const useOrders = (): CartContextType => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// CartProvider component that wraps around your application
interface OrderProviderProp {
    children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProp) => {
    const [orders, setOrders] = useState<{ page: number, orders: Order[] }[]>([])
    const [counts, setCounts] = useState<{
        count: number,
        pending: number,
        delivered: number,
        returned: number,
        confirmed: number,
        dismissed : number,
        hold: number
    }>({
        count: 0,
        pending: 0,
        delivered: 0,
        returned: 0,
        confirmed: 0,
        dismissed: 0,
        hold:0
    })
    const [isLoading] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(false)

    async function getCount() {
        const res = await fetch("/api/order/count")
        const json: {
            count: number,
            pending: number,
            delivered: number,
            returned: number,
            confirmed: number,
            dismissed:number,
            hold:number
        } = await res.json()
        setCounts(json)
    }

    async function getPage(page: number){
        for(const o of orders){
            if(o.page === page){
                return o.orders
            }
        }
        const res = await fetch("/api/order?page="+page)
        const data: Order[] = await res.json()
        setOrders((prev)=>[...prev,{page:page, orders: data}])
        setOrders((prev)=>{
            let newOrders = prev;
            for(let i=0;i<newOrders.length;i++){
                for(let j=0;j<newOrders.length;j++){
                    if(newOrders[i].page > newOrders[j].page){
                        const temp = newOrders[i]
                        newOrders[i] = newOrders[j]
                        newOrders[j] = temp;
                    }
                }
            }
            return newOrders
        })
        return data;
    }

    async function addOrder(payload: OrderAddPayload){
        try{
            const res = await fetch("/api/order/add",{
                body: JSON.stringify(payload),
                method: 'POST'
            })
            const data = await res.json()
            setOrders((prev)=>{
                const first = prev[0];
                first.orders = [data, ...(first.orders)]
                prev[0] = first;
                return prev;
            })
            getCount()
            toast.success("Order added")
        }catch(e){
            toast.error(JSON.stringify(e))
        }
    }

    async function editOrder(id: string,payload: OrderAddPayload){
        try{
            const res = await fetch(`/api/order/${id}/edit`,{
                body: JSON.stringify({id:id, payload:payload}),
                method: 'POST'
            })
            const data = await res.json()
            setOrders((prev)=>{
                return prev.map((ord)=>{
                    const page = ord.page;
                    const orders = ord.orders.map((o)=>{
                        if(o.id === data.id){
                            return data;
                        }
                        return o;
                    })
                    return {
                        page: page,
                        orders: orders
                    }
                })
            })
            getCount()
            toast.success("Order Saved")
        }catch(e){
            toast.error(JSON.stringify(e))
        }
    }

    useEffect(() => {
        getCount()
        getPage(1)
    }, [])

    return <OrderContext.Provider value={{ orders, counts, getPage, addOrder, editOrder }}>
        {children}
    </OrderContext.Provider>
};


