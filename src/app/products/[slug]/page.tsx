import HomeAddCartButton from "@/components/HomeAddCartButton";
import OrderNow from "@/components/OrderNow";
import Toast from "@/components/Toast";
import AddToCartaOrBuy from "@/components/products/AddToCartOrBuy";
import Carousel from "@/components/products/Carousel";
import { prisma } from "@/prisma";
import { getProduct } from "@/utils/db/products";
import { formattedPrice } from "@/utils/priceString";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { CgEye } from "react-icons/cg";
import { TbCurrencyTaka } from "react-icons/tb";

export const revalidate = 86400;

export default async function Page({ searchParams, params }: { searchParams: { select: string }, params: { slug: string } }) {
    const product = await getProduct(params.slug)
    const getRelatedProducts = cache(async () => {
        const prods = await prisma.product.findMany({
            take: 10,
            where: {
                categories: {
                    some: {
                        id: {
                            in: product.categories.map((p) => { return p.id })
                        }
                    }
                }
            },
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
        })
        return prods;
    })
    const relatedProds = await getRelatedProducts()
    const { select } = searchParams
    if (product) {
        return <>
            {select === 'v' && <Toast message={`Please select a variant`} />}
            {select === 'c' && <Toast message={`Please select a color`} />}
            {select === 'vc' && <Toast message={`Please select a variant and a color`} />}
            <div className="p-2 w-full md:w-1/2 mx-auto">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2">
                        {product.images !== null && <Carousel images={product.images} />}
                    </div>
                    <div className="w-full md:w-1/2 px-0 md:ps-5">
                        <h3 className="text-[28px] font-semibold my-1 font-serif">
                            {product.name}
                        </h3>
                        <h3 className='flex items-center my-3'>
                            {product.discounted_price ? <>
                                <div className="text-[30px] md:text-2xl md:font-bold text-red-500 flex items-center"> <TbCurrencyTaka className="inline" />
                                    {formattedPrice(product.discounted_price)}
                                </div>
                                <div className="mx-2"></div>
                                <div className="line-through flex items-center"> <TbCurrencyTaka className="inline" /> {formattedPrice(product.price)}</div>
                            </>
                                : <div className='text-[30px] md:text-2xl md:font-bold text-red-500 flex items-center'><TbCurrencyTaka className="inline" />{formattedPrice(product.price)}</div>
                            }
                        </h3>
                        <div className="my-1" dangerouslySetInnerHTML={{__html:product.description}}>
                        </div>
                        <AddToCartaOrBuy product={product} />
                        {product.categories.length && <div className="my-1">
                            <b>Categories : </b> {product.categories.map((cat) => <Link href={`/categories/${cat.id}`} key={cat.id} className="mx-1 text-base-theme">{cat.name}</Link>)}
                        </div>}
                        {/* <div className="h-1 bg-gray-200 rounded w-full my-4"></div> */}
                    </div>
                </div>
                {/* <div className="my-1 text-white py-1 flex bg-base-theme justify-center items-center text-lg font-bold">
                    Description
                </div>
                <div className="my-1 p-3" dangerouslySetInnerHTML={{ __html: product.description }}>
                </div>
                <div className="my-1 text-white py-1 flex bg-base-theme justify-center items-center text-lg font-bold">
                    Delivery
                </div>
                <div className="my-1 p-3">
                    Inside dhaka 60 taka <br />
                    Outside dhaka 110 taka
                </div>
                <div className="my-1 text-white py-1 flex bg-base-theme justify-center items-center text-lg font-bold">
                    Return Policy
                </div>
                <div className="my-1 p-3">
                    If you dont like the product after recieving, you can return it.
                </div> */}
                <hr className="mb-3" />
                <h3 className="text-xl font-bold">
                    Related Products
                </h3>
                <div className="flex w-full flex-wrap">
                    {relatedProds.map((prod) => {
                        return <> <div key={prod.id} className='hover:shadow hover:border w-1/2 md:w-1/4 xl:w-1/5 p-1 group flex flex-col mb-2'>
                            <div className='w-full h-full'>
                                <div className="w-full flex justify-center relative">
                                    <Link className="block w-full" href={`/products/${prod.slug}`}>
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
        </>
    } else return "Not found"
}