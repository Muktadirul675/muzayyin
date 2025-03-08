'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import { useSwipeable } from "react-swipeable";

export default function BannerSlider({images}:{images:string[]}){
    const [activeIndex, setActiveIndex] = useState<number>(0)

    function right(){
        setActiveIndex((prev)=>(prev+1)%images.length)
    }

    function left(){
        if(activeIndex - 1 <= 0){
            setActiveIndex(images.length-1)
        }else{
            setActiveIndex((prev)=>prev-1)
        }
    }

    useEffect(()=>{
        const timer = setInterval(right, 5000)
        return ()=>{
            clearInterval(timer)
        }
    },[])

    const swipHandlers = useSwipeable({
        onSwipedLeft: left,
        onSwipedRight: right
    })

    return <div className="flex overflow-hidden relative w-full flex-grow-0 shrink-0">
        {images.map((image)=>{
            return <>
                <div onClick={left} className="absolute h-full left-0 bottom-0 top-0 w-10 md:w-20 flex justify-center items-center bg-transparent bg-opacity-5 cursor-pointer">
                    <BiArrowToLeft className="text-2xl"/>
                </div>
                <Image quality={100} width={500} height={300} {...swipHandlers} style={{translate: `${-100 * activeIndex}%`}} src={image} className="w-full transition-all duration-200 flex-grow-0 aspect-[1580/580] shrink-0 object-fill block" alt="" />
                <div onClick={right} className="absolute h-full right-0 bottom-0 top-0 w-10 md:w-20 flex justify-center items-center bg-transparent bg-opacity-5 cursor-pointer">
                    <BiArrowToRight className="text-2xl"/>
                </div>
            </>
        })}
    </div>
}
