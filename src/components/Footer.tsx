'use client'

import { usePathname } from "next/navigation";
import Image from 'next/image'
import Link from 'next/link'
import FacebookPage from "./FBPage";

export default function Footer() {
    const path = usePathname()
    if (path.startsWith("/admin")) {
        return null;
    }
    return <div className="relative">
        <div className="w-full min-h-[200px] h-fit flex flex-col items-center bg-base-theme pt-5 text-white absolute top-0 left-0 right-0 border-t">
            <div className="w-full md:w-2/3 flex mx-auto flex-wrap my-3 p-3">
                <div className="w-full flex flex-col justify-start md:w-1/4 mb-3 md:mb-0">
                    <Image src={'/logo.png'} alt="Zilmil" height={100} width={120} className='h-[50px] mb-1' />
                    <b className="my-2">Got a question? Call us 9AM - 10PM</b>
                    <b className="my-2">01301871077</b>
                    <b className="my-2">Follow us</b>
                    <div className="flex">
                        <a target="_blank" className="shadow" href="https://www.facebook.com/share/1B6xYeJGSD/">
                            <Image height={80} width={80} src="/facebook.png" alt="Facebook" className="w-[30px] h-[30px] me-2" />
                        </a>
                        <a target="_blank" className="shadow" href="https://www.instagram.com/zilmil.com.bd/">
                            <Image height={80} width={80} src="/instagram.png" alt="instagram" className="w-[30px] h-[30px] me-2" />
                        </a>
                        <a target="_blank" className="shadow" href="https://wa.me/8801331094992">
                            <Image height={80} width={80} src="/whatsapp.png" alt="whatsapp" className="w-[30px] h-[30px] me-2" />
                        </a>
                        <a target="_blank" className="shadow" href="https://www.youtube.com/@ZilmilOnlineShop">
                            <Image height={80} width={80} src="/youtube.png" alt="youtube" className="w-[30px] h-[30px] me-2" />
                        </a>
                    </div>
                </div>
                <div className="w-full flex flex-col justify-start md:w-1/4 mb-3 md:mb-0">
                    <div className="text-2xl text-white font-bold">Company</div>
                    <b className="my-2">Return Policy</b>
                    <b className="my-2">Privacy Policy</b>
                    <b className="my-2">Deliver an Policy</b>
                </div>
                <div className="w-full flex flex-col justify-start md:w-1/4 mb-3 md:mb-0">
                    <div className="text-2xl text-white font-bold">Support</div>
                    <b className="my-2">Contact us</b>
                    <b className="my-2">Shop</b>
                    <b className="my-2">Track your order</b>
                </div>
                <div className="w-full flex flex-col justify-start md:w-1/4 mb-3 md:mb-0">
                    <div>
                        Like us on facebook
                    </div>
                    <FacebookPage/>
                    {/* <iframe src="https://www.facebook.com/share/15uo9cXspW/"></iframe> */}
                    {/* <iframe
                        src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                        width="500"
                        height="600"
                        style={{ border: "none", overflow: "hidden" }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    ></iframe> */}
                </div>
            </div>
            <div className="w-full h-[50px] bg-slate-50 p-5">
                <div className="w-full md:w-2/3 flex items-center mx-auto flex-wrap flex-cop md:flex-row">
                    <span className="text-base-theme font-bold">
                        @Muzayyin all right reserved
                    </span>
                    <div className="md:ms-auto flex-wrap hidden md:flex">
                        <span className="font-bold text-base-theme">We are using safe payments</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
