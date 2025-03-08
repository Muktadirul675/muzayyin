import HomeAddCartButton from "@/components/HomeAddCartButton";
import OrderNow from "@/components/OrderNow";
import SearchForm from "@/components/nav/SearchForm";
import { prisma } from "@/prisma";
import { formattedPrice } from "@/utils/priceString";
import Image from "next/image";
import Link from "next/link";
import { CgEye } from "react-icons/cg";
import { TbCurrencyTaka } from "react-icons/tb";

export default async function Page({ searchParams }: { searchParams: { query: string } }) {
    if (searchParams.query === null || searchParams.query === undefined || searchParams.query === '') {
        return <div className="min-h-[50vh] flex items-center justify-center w-full md:w-1/2 mx-auto">
            <SearchForm />
        </div>
    }
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: searchParams.query
            }
        },
        select:{
            id: true,
            name:true,slug:true, price:true, discounted_price:true,stocks:true,
            images:{
                take:1
            },
            _count:{
                select:{
                    colors:true,
                    variants: true,
                }
            }
        }
    })
    if(products.length === 0){
        return <div className="min-h-[50vh] flex flex-col items-center justify-center w-full md:w-1/2 mx-auto p-2lowrrcase">
            <h3 className="text-2xl font-bold my-1">No Products Found</h3>
            <SearchForm />
        </div> 
    }
    return <div className="flex flex-wrap w-full md:w-2/3 mx-auto">
        {products.map((prod) => {
            return <> <div key={prod.id} className='hover:shadow hover:border w-1/2 md:w-1/3 lg:w-1/5 p-1 group flex flex-col mb-2'>
                <div className='w-full h-full'>
                    <div className="w-full flex justify-center relative">
                        <Link href={`/products/${prod.slug}`}>
                            <Image quality={100} height={200} width={200} src={prod.images[0].url} alt="Image" className='w-full h-52 object-cover' />
                        </Link>
                        <div className="justify-center absolute bottom-0 hidden group-hover:flex h-5 py-2 animate-bottomTopSlide bg-white w-full">
                            <HomeAddCartButton slug={prod.slug} variants={prod._count.variants} colors={prod._count.colors} id={prod.id} />
                            <div className="mx-2"></div>
                            <Link href={`/products/${prod.slug}`}>
                                <CgEye className='hover:text-base-theme transition-all text-2xl' />
                            </Link>
                        </div>
                    </div>
                    <div className="p-2">
                        <h3 className="md:text-lg md:font-semibold my-1">{prod.name}</h3>
                        <h3 className='flex items-center'>
                            {prod.discounted_price ? <>
                                <div className="md:text-lg md:font-bold text-base-theme flex items-center"> <TbCurrencyTaka className="inline" />
                                    {formattedPrice(prod.discounted_price)}
                                </div>
                                <div className="mx-2"></div>
                                <div className="line-through flex items-center"> <TbCurrencyTaka className="inline" /> {formattedPrice(prod.price)}</div>
                            </>
                                : <div className='md:text-lg md:font-bold text-base-theme flex items-center'><TbCurrencyTaka className="inline" />{formattedPrice(prod.price)}</div>
                            }
                        </h3>
                    </div>
                </div>
                <OrderNow slug={prod.slug} variants={prod._count.variants} colors={prod._count.colors} id={prod.id} stocks={prod.stocks} />
            </div>
            </>
        })}
    </div>
}