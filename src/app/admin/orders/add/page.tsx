'use client';

import { addOrder } from "@/actions/orders";
import Spinner from "@/components/Spinner";
import StateButton from "@/components/StateButton";
import { Area, City, Zone, usePathao } from "@/stores/pathao";
import { useProducts } from "@/stores/products";
import Image from "next/image";
import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BiMinus, BiPlus } from "react-icons/bi";

interface Variant {
    id: string,
    name: string,
    stocks: number
}

interface Color {
    id: string,
    name: string,
    stocks: number,
    hex: string
}

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
    variants: Variant[],
    colors: Color[],
}[]

export interface Item {
    uid: number,
    count: number,
    product: Product,
    variant: {
        id: string,
        name: string
    } | null,
    color: {
        id: string,
        name: string
    } | null
}

interface OrderItem {
    product: Product,
    variant: {
        id: string,
        name: string
    } | null,
    color: {
        id: string,
        name: string
    } | null
}

// interface Variant{
//     id: string
// }

export interface Order {
    id: string,
    name: string,
    address: string,
    phone: string,
    courier: string | null,
    items: Item[],
    order_price: number,
    note?: string | null,
    inside_dhaka: boolean,
    zone?: number | null,
    city?: number | null,
    area?: number | null,
    status: string
}

let uid = 0;

function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) {
    return <label htmlFor={htmlFor} className="text-lg font-bold">{children}</label>
}

function AddProduct({ product, items, set }: {
    items: Item[],
    product: Product, set: Dispatch<SetStateAction<Item[]>>
}) {
    const [color, setColor] = useState<Color | null>(null)
    const [variant, setVariant] = useState<Variant | null>(null)
    const [count, setCount] = useState<number>(1)

    function add() {
        if (product.variants.length > 0 && variant === null) {
            toast.error("Select a variant")
            return
        }
        if (product.colors.length > 0 && color === null) {
            toast.error("Select a color")
            return
        }
        const oldItems = [...items];
        for (const i of oldItems) {
            if (i.product.id === product.id && i.variant?.id === variant?.id && i.color?.id == color?.id) {
                i.count = i.count + count;
                set(oldItems)
                return
            }
        }
        const newItem: Item = {
            color: color,
            count: count,
            product: product,
            uid: uid++,
            variant: variant
        }
        oldItems.push(newItem)
        set(oldItems)
    }

    return <>
        <div className="flex my-1">
            <Image src={product.images[0].url} alt="Image" width={100} height={100} className="w-[100px] h-[100px]" />
            <div className="mx-2"></div>
            <div>
                {product.name} <br />
                Stocks: {product.stocks} <br />
                {variant !== null && <>{variant.name} <br /></>}
                {color !== null && <>{color.name} <br /></>}
                <div className="flex">
                    {product.variants.map((va) => {
                        return <div className="border cursor-pointer m-1 p-2" onClick={() => setVariant(va)}>{va.name}</div>
                    })}
                </div>
                <div className="flex">
                    {product.colors.map((va) => {
                        return <div style={{ backgroundColor: `${va.hex}` }} className="border cursor-pointer m-1 rounded-full h-[30px] w-[30px]" onClick={() => setColor(va)}></div>
                    })}
                </div>
                <div className="flex items-center">
                    <BiMinus onClick={() => setCount((prev) => (prev > 1 ? prev - 1 : prev))} className="border border-r-0 text-xl cursor-pointer" />
                    <input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="remove-arrow w-14 border border-r-0 border-l-0 text-center" />
                    <BiPlus onClick={() => setCount((prev) => prev + 1)} className="border border-l-0 text-xl cursor-pointer" />
                    <button onClick={add} type="button" className="ms-1 btn">Add</button>
                </div>
            </div>
        </div>
    </>
}

export default function Page() {
    const [name, setName] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [quantity, setQuantity] = useState<number>(0)
    const [weight, setWeight] = useState<string>('0.5')
    const [items, setItems] = useState<Item[]>([])
    const [subTotal, setSubTotal] = useState<number>(0)
    const [location, setLocation] = useState<string>('insideDhaka')
    const [note, setNote] = useState<string>('')
    const [courier, setCourier] = useState<string>('pathao')
    const [status, setStatus] = useState<string>('')

    const pathao = usePathao()
    const [zones, setZones] = useState<Zone[]>([])
    const [areas, setAreas] = useState<Area[]>([])
    const [city, setCity] = useState<number | null>(null)
    const [zone, setZone] = useState<number | null>(null)
    const [area, setArea] = useState<number | null>(null)

    const products = useProducts()
    const [searchStr, setSearchStr] = useState<string>('')
    const [filtered, setFiltered] = useState<Product[]>(products.products)

    useEffect(() => {
        if (searchStr === '') {
            setFiltered(products.products)
        }
        setFiltered(products.products.filter((prod) => {
            return prod.name.toLowerCase().includes(searchStr.toLowerCase())
        }))
    }, [searchStr, products.products])

    useEffect(() => {
        const adrs = address.trim().replace(',', '').replace('-', ' ').replace('/', ' ')
        const c = pathao.cities.find((ci) => {
            return adrs.toLowerCase().includes((ci.name.toLowerCase()))
        })
        setCity(c?.id ?? null)
    }, [address])

    async function getZones() {
        if (city) {
            const zns = await pathao.getZones(city)
            setZones(zns)
        }
    }

    async function getAreas() {
        if (zone) {
            const ars = await pathao.getAreas(zone)
            setAreas(ars)
        }
    }

    useEffect(() => {
        if (city) {
            getZones()
        }
        if (zone) {
            getAreas()
        }
    }, [zone, city])

    useEffect(() => {
        const adrs = address.trim().replace(',', '').replace('-', ' ').replace('/', ' ')
        const c = zones.find((ci) => {
            return adrs.toLowerCase().includes((ci.name.toLowerCase()))
        })
        setZone(c?.id ?? null)
    }, [address, pathao.cities, city])

    useEffect(() => {
        const adrs = address.trim().replace(',', '').replace('-', ' ').replace('/', ' ')
        const c = areas.find((ci) => {
            return adrs.toLowerCase().includes((ci.name.toLowerCase()))
        })
        setArea(c?.id ?? null)
    }, [address, zone])

    const total = useMemo(() => {
        return subTotal + (location === 'insideDhaka' ? 60 : 110);
    }, [subTotal, location])

    useEffect(() => {
        let totl = 0;
        items.forEach((item) => {
            totl += item.product.discounted_price ? item.product.discounted_price : item.product.price
        })
        setSubTotal(totl)
    }, [items])

    useEffect(() => {
        let ttl = 0;
        items.forEach((it) => ttl += it.count)
        setQuantity(ttl)
    }, [items])

    const [adding, setAdding] = useState<boolean>(false)

    async function submit(e: FormEvent) {
        e.preventDefault()
        setAdding(true)
        const formData = new FormData()
        if (!name || !address || !phone || !total || !location || !courier || status === '') {
            toast.error("Provide nanme, address, phone and courier")
            return
        }
        if (courier === 'pathao') {
            if (!city || !zone) {
                toast.error("Select city and zone")
                return
            }
        }
        formData.append('name', name)
        formData.append('address', address)
        formData.append('phone', phone)
        formData.append('quantity', `${quantity}`)
        formData.append('weight', weight)
        formData.append('total', `${total}`)
        formData.append('location', `${location}`)
        formData.append('courier', `${courier}`)
        formData.append('note', `${note}`)
        formData.append('city', `${city}`)
        formData.append('area', `${area}`)
        formData.append('zone', `${zone}`)
        formData.append('status', `${status}`)
        await addOrder(items, formData)
        setAdding(false)
    }

    return <form onSubmit={submit} className="flex flex-col md:flex-row">
        <div className="flex-grow flex flex-col p-2">
            <Label htmlFor="name">Name</Label>values
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="name" placeholder="Name" id="" className="form-input" />
            <Label htmlFor="address">Address</Label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" name="address" placeholder="Address" id="" className="form-input" />
            <Label htmlFor="phone">Phone</Label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" name="phone" placeholder="Phone" id="" className="form-input" />
            <Label htmlFor="weight">Weight (KG)</Label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="text" name="weight" placeholder="Weight" id="" className="form-input" />
            <Label htmlFor="quantity">Quantity</Label>
            <input value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} type="number" name="quantity" placeholder="Quantity" id="" className="form-input" />
            <Label htmlFor="subTotal">Sub Total {`[Total: ${total}]`}</Label>
            <input value={subTotal} onChange={(e) => setSubTotal(parseInt(e.target.value))} type="number" name="subTotal" placeholder="Quantity" id="" className="form-input" />
            <div className="my-1">
                Select Location : <select className="px-2 py-1 rounded border bg-white" value={location} onChange={(e) => setLocation(e.target.value)} name="location" id="">
                    <option value="">Select Location</option>
                    <option value="insideDhaka">Inside Dhaka</option>
                    <option value="outsideDhaka">Outside Dhaka</option>
                </select>
            </div>
            <div className="my-1">
                Select Courier : <select className="px-2 py-1 rounded border bg-white" value={courier} onChange={(e) => setCourier(e.target.value)} name="location" id="">
                    <option value="">Select Courier</option>
                    <option value="pathao">Pathao</option>
                    <option value="steadfast">Steadfast</option>
                </select>
            </div>
            {courier === 'pathao' && <div className="my-1 flex flex-col items-start">
                {pathao.cities.length > 0 && <div>
                    Select City: <select name="city" id="" value={`${city}`} onChange={(e) => setCity(parseInt(e.target.value))} className="px-2 py-1 my-1 rounded bg-white border">
                        <option value="">Select City</option>
                        {pathao.cities.map((ci) => {
                            return <option value={ci.id}>{ci.name}</option>
                        })}
                    </select>
                </div>}
                {city !== null && zones.length > 0 && <div>
                    Select Zone: <select name="zone" id="" value={`${zone}`} onChange={(e) => setZone(parseInt(e.target.value))} className="px-2 py-1 my-1 rounded bg-white border">
                        <option value="">Select Zone</option>
                        {zones.map((ci) => {
                            return <option value={ci.id}>{ci.name}</option>
                        })}
                    </select>
                </div>}
                {zone !== null && areas.length > 0 && <div>
                    Select Area: <select name="area" id="" value={`${area}`} onChange={(e) => setArea(parseInt(e.target.value))} className="px-2 py-1 my-1 rounded bg-white border">
                        <option value="">Select Area</option>
                        {areas.map((ci) => {
                            return <option value={ci.id}>{ci.name}</option>
                        })}
                    </select>
                </div>}
            </div>}
            <div className="my-1">
                Select status : <select name="status" id="" value={`${status}`} onChange={(e) => setStatus((e.target.value))} className="px-2 py-1 my-1 rounded bg-white border">
                    <option value="">Select Status</option>
                    <option value="Pending">New</option>
                    <option value="Complete">Complete</option>
                    <option value="Hold">Hold</option>
                </select>
            </div>
            <textarea name="" onChange={(e) => setNote(e.target.value)} value={note} id="" className="form-input w-full my-1" placeholder="Note" rows={5}></textarea>
            {adding ? <Spinner/> :<StateButton>Add</StateButton>}
        </div> 
        <div className="flex-grow flex flex-col p-2">
            <h3 className="font-bold">Selected Products</h3>
            <div className="my-1">
                {items.map((item) => {
                    return <div className="my-1 flex">
                        <Image src={item.product.images[0].url} alt="Image" width={100} height={100} className="w-[100px] h-[100px]" />
                        <div className="mx-2"></div>
                        <div>
                            {item.product.name} X {item.count} <br />
                            {item.variant !== null && <>{item.variant.name} <br /></>}
                            {item.color !== null && <>{item.color.name} <br /></>}
                            <button className="btn" type="button" onClick={() => {
                                setItems((prev) => prev.filter((it) => it.uid !== item.uid))
                            }}>Remove</button>
                        </div>
                    </div>
                })}
            </div>
            <h3 className="font-bold">
                Add Products
            </h3>
            <div className="my-1">
                <input type="text" value={searchStr} onChange={(e) => setSearchStr(e.target.value)} className="form-input" />
            </div>
            <div className="h-[500px] overflow-auto">
                {filtered.map((prod) => {
                    return <AddProduct items={items} product={prod} set={setItems} key={prod.id} />
                })}
            </div>
        </div>
    </form>
}
