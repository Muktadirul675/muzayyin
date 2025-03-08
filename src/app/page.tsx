import BannerSlider from '@/components/BannerSlider'
import CategoryBannerSlider from '@/components/CategoryBannerSlider'
import HomeAddCartButton from '@/components/HomeAddCartButton'
import OrderNow from '@/components/OrderNow'
import { prisma } from '@/prisma'
import { formattedPrice } from '@/utils/priceString'
import fs from 'fs'
import Image from 'next/image'
import Link from 'next/link'
import path from 'path'
import { CgEye } from 'react-icons/cg'
import { TbCurrencyTaka } from 'react-icons/tb'

export const revalidate = 3600;

export default async function Home() {
  const filePath = path.join(process.cwd(), 'src', 'home.json')
  const content = fs.readFileSync(filePath, 'utf-8')
  const json: {
    banner: string[],
    notice: string,
    categories: ({
      products: {
        id: string;
        name: string;
      }[];
    } & {
      id: string;
      name: string;
      created_at: Date;
      updated_at: Date;
    })[]
  } = JSON.parse(content)

  const result: {
    products: {
      images: {
        id: string;
        created_at: Date;
        updated_at: Date;
        url: string;
        index: number;
        productId: string;
        caption: string | null;
      }[];
      id: string;
      name: string;
      slug: string;
      stocks: number;
      price: number;
      discounted_price: number | null;
      _count: {
        variants: number,
        colors: number,
      }
    }[]; id?: string | undefined;
    name?: string | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
  }[] = await Promise.all(json.categories.map(async (cat) => {
    const category = await prisma.category.findUnique({
      where: { id: cat.id }
    })
    const products = await prisma.product.findMany({
      where: {
        AND: {
          id: {
            in: cat.products.map((prod) => prod.id)
          },
          is_available: true
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

    return {
      ...category,
      products: products
    }
  }))

  const categoriesJson = path.join(process.cwd(), 'src', 'categories_banner.json')
  const categoriesJsonPath = fs.readFileSync(categoriesJson, 'utf-8')
  const categoryBannerJson: { id: string, logo: string, name: string }[] = JSON.parse(categoriesJsonPath)

  return (
    <>
      <div className="flex flex-col w-full justify-center bg-slate-50">
        <div className="w-full md:w-2/3 mx-auto">
          <BannerSlider images={json.banner} />
        </div>
      </div>
      <div className="my-2"></div>
      <div className="flex justify-center">
        <div className="w-full md:w-1/2 mx-auto">
          <div className="flex items-center w-full justify-center text-[40px] font-extrabold p-3 rounded bg-slate-100">
            Top Categories
          </div>
          <div className="my-1 flex flex-wrap p-3 justify-center">
            <div className="w-2/3 flex justify-center flex-wrap">
              {categoryBannerJson.map((c)=>{
                return <div className="flex flex-col p-3 justify-center">
                  <Image height={40} width={40} src={c.logo} className={`h-[40px] w-[40px] rounded-full`} alt="Category"/>
                  <small>{c.name}</small>
                </div>
              })}
            </div>
          </div>
          <div className=''>
            {result.map((category) => {
              return <div key={category.id} className='my-1 rounded p-1 md:p-3 shadow-slate-100'>
                <div className="flex items-center justify-center text-[40px] font-extrabold p-3 rounded bg-slate-100">
                  {category.name}
                </div>
                <div className="flex justify-start my-1 flex-wrap">
                  {category.products.map((prod) => {
                    return <> <div key={prod.id} className='hover:shadow hover:border w-1/2 md:w-1/3 lg:w-1/4 p-1 group flex flex-col mb-2'>
                      <div className='w-full h-full'>
                        <div className="w-full flex justify-center relative">
                          <Link className="block w-full p-3" href={`/products/${prod.slug}`}>
                            <Image quality={100} height={200} width={200} src={prod.images[0].url} alt="Image" className='w-full rounded-lg object-fill' />
                          </Link>
                          <div className="justify-center absolute bottom-0 hidden group-hover:flex h-5 py-2 animate-bottomTopSlide bg-white w-full">
                            <HomeAddCartButton slug={prod.slug} variants={prod._count.variants} colors={prod._count.colors} id={prod.id} />
                            <div className="mx-2"></div>
                            <Link href={`/products/${prod.slug}`}>
                              <CgEye className='hover:text-base-theme transition-all text-2xl' />
                            </Link>
                          </div>
                        </div>
                        <div className="p-2 flex flex-col justify-center">
                          <h3 className="md:text-lg font-[400] my-1 overflow-hidden whitespace-nowrap text-center">{prod.name}</h3>
                          <h3 className='flex items-center justify-center'>
                            {prod.discounted_price ? <>
                              <div className="text-lg md:font-bold  flex items-center text-red-500"> <TbCurrencyTaka className="inline" />
                                {formattedPrice(prod.discounted_price)}
                              </div>
                              <div className="mx-1"></div>
                              <div className="line-through flex items-center"> <TbCurrencyTaka className="inline" /> {formattedPrice(prod.price)}</div>
                            </>
                              : <div className='md:text-lg md:font-bold  flex items-center text-red-500'><TbCurrencyTaka className="inline" />{formattedPrice(prod.price)}</div>
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
            })}
          </div>
        </div>
      </div>
    </>
  );
}
