import Breadcrumb from "@/components/Breadcrumb"
import HomeAddCartButton from "@/components/HomeAddCartButton"
import OrderNow from "@/components/OrderNow"
import { prisma } from "@/prisma"
import Image from "next/image"
import Link from "next/link"
import { TbCurrencyTaka } from 'react-icons/tb';
import { CgEye } from "react-icons/cg"
import { formattedPrice } from "@/utils/priceString"

export const revalidate = 3600;

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id
    const category = await prisma.category.findUnique({
        where: { id: id },
        include: {
            products: {
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    stocks: true,
                    price: true,
                    discounted_price: true,
                    images: {
                        take: 1
                    },
                    _count: {
                        select: {
                            variants: true,
                            colors: true
                        }
                    }
                }
            }
        }
    })
    return <>
        <Breadcrumb links={[{ name: 'Home', url: "/" }, { name: category?.name as string, url: `/categories/${category?.id}` }]} />
        <div className="flex justify-center">
            <div className="w-full md:w-2/3 mx-auto">
                <div className="my-1 flex flex-wrap">
                    {category?.products.map((prod) => {
                        return <> <div key={prod.id} className='hover:shadow hover:border w-1/2 md:w-1/3 lg:w-1/5 p-1 group flex flex-col mb-2'>
                            <div className='w-full h-full'>
                                <div className="w-full flex justify-center relative">
                                    <Link className="block w-full"  href={`/products/${prod.slug}`}>
                                        <Image quality={100} height={200} width={200} src={prod.images[0].url} alt="Image" className='w-full h-52 object-fill' />
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
                                    <h3 className="md:text-lg md:font-semibold my-1 overflow-hidden whitespace-nowrap">{prod.name}</h3>
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
            </div>
        </div>
    </>
}