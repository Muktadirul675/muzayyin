'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface City {
    name: string;
    id: number;
}

export interface Zone {
    name: string;
    id: number;
}

export interface Area {
    name: string;
    id: number;
}

interface PathaoContextType {
    cities: City[],
    getZones: (city: number) => Promise<Zone[]>,
    getAreas: (zone: number) => Promise<Area[]>,
}

const PathaoContext = createContext<PathaoContextType | undefined>(undefined);

// Custom hook to use the Cart context
export const usePathao = (): PathaoContextType => {
    const context = useContext(PathaoContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface Prop {
    children: ReactNode;
}

export const PathaoProvider = ({ children }: Prop) => {
    const [cities, setCities] = useState<City[]>([])

    const getData = useCallback(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATHAO_URL}/cities`)
        const city_data = await res.json()
        setCities(city_data.data.data.map((c: { city_name: string, city_id: number }) => { return { name: c.city_name, id: c.city_id } }))
    }, [])

    async function getZones(city: number){
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATHAO_URL}/zones?city=${city}`)
        const data = await res.json()
        return data.data.data.map((z: { zone_name: string, zone_id: number }) => { return { id: z.zone_id, name: z.zone_name } })
    }

    async function getAreas(zone: number) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PATHAO_URL}/areas?zone=${zone}`)
        const data = await res.json()
        return data.data.data.map((a: {
            area_id: number,
            area_name: string,
            home_delivery_available: boolean,
            pickup_available: boolean
        }) => {
                return { id: a.area_id, name: a.area_name }
        })
    }

    useEffect(() => {
        getData()
    }, [])

    return <PathaoContext.Provider value={{ cities, getAreas, getZones }}>
        {children}
    </PathaoContext.Provider>
};
