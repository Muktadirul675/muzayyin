'use client';

import Image from "next/image";
import Crane from '../../public/crane.gif'
import { useEffect, useState } from "react";

export default function LoadingPage(){
    const loadingQuotes : string[] = [
        "Finding the best deals for you...",
        "Hang tight, your perfect match is on the way!",
        "Good things take time, great things take a moment...",
        "Preparing your shopping experience...",
        "Just a moment, wrapping up the best offers for you...",
        "Your next favorite product is loading...",
        "Fetching happiness for your cart...",
        "Almost there! Shopping made seamless...",
        "The wait is worth it â great finds are coming...",
        "Curating your perfect shopping spree..."
    ]

    const [quote, setQuote] = useState<string>(loadingQuotes[Math.floor(Math.random()*loadingQuotes.length)])

    useEffect(()=>{
        setInterval(()=>{
            setQuote(loadingQuotes[Math.floor(Math.random()*loadingQuotes.length)])
        },1500)
    })

    return (
        <div className="w-[100vw] h-[100vh] flex justify-center items-center flex-col">
            <Image src={Crane} alt="Loading..." width={120} height={120} /> <br />
            <b className="max-w-[75vw]">
                {quote}
            </b>
        </div>
    )
}
