'use client';

import { Image as ProductImage } from "@prisma/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";

export default function Carousel({ images }: { images: ProductImage[] }) {
    const [activeIndex, setActiveIndex] = useState<number>(0)

    function right() {
        setActiveIndex((prev) => (prev + 1) % images.length)
    }

    function left() {
        setActiveIndex((prev) => {
            if (prev == 0) {
                return (images.length - 1)
            } else {
                return prev - 1
            }
        })
    }

    const [posX, setPosX] = useState<number>(0)
    const [posY, setPosY] = useState<number>(0)
    const [zoom, setZoom] = useState<boolean>(false)
    const zoomImg = useRef<HTMLImageElement | null>(null)
    const carouselRef = useRef<HTMLDivElement | null>(null)

    return <>
        <div className="flex w-full flex-nowrap relative">
            <div ref={carouselRef} className="flex overflow-hidden relative w-full flex-grow-0 shrink-0">
                {images.map((image) => {
                    return <>
                        <div onClick={left} className="absolute h-full left-0 bottom-0 top-0 p-1 flex justify-center items-center bg-transparent bg-opacity-5 cursor-pointer">
                            <BiArrowToLeft className="text-2xl" />
                        </div>
                        <Image ref={zoomImg} onMouseMove={(e) => {
                            const rect = zoomImg.current?.getBoundingClientRect();
                            const carRect = carouselRef.current?.getBoundingClientRect()
                            const rectX = carRect?.left ?? 0;
                            const rectY = rect?.top ?? 0;
                            
                            // Calculate x and y positions
                            const x = (((e.clientX - rectX) * 100) / (zoomImg.current?.width ?? 1)) - 8;
                            const y = ((e.clientY - rectY) * 100) / (zoomImg.current?.height ?? 1) - 8;
                            
                            // Update state
                            setPosX(x);
                            setPosY(y);
                            setZoom(true)
                            console.log(x, y);
                        }} onMouseLeave={()=>setZoom(false)} quality={100} width={500} height={300} style={{ translate: `${-100 * activeIndex}%` }} src={image.url} className="w-full transition-all duration-200 flex-grow-0 shrink-0  block rounded aspect-auto  cursor-zoom-in" alt="" />
                        <div onClick={right} className="absolute h-full right-0 bottom-0 top-0 p-1 flex justify-center items-center bg-transparent bg-opacity-5 cursor-pointer">
                            <BiArrowToRight className="text-2xl" />
                        </div>
                    </>
                })}
            </div>
            <div className="block w-0 md:w-full md:hidden" hidden></div>
            {images.map((image, index) => <div key={image.id} style={{ background: `url(${image.url})`, backgroundSize: '300%', backgroundPosition: `${posX}% ${posY}%` }} className={`w-0 ${index === activeIndex ? `${zoom ? 'w-full' : 'w-0'}` : 'w-0'} z-10 rounded transition-all hidden md:block absolute top-0 left-full ms-2 h-full overflow-hidden`}>
            </div>)}
        </div>
        <div className="flex flex-wrap p-0 m-0">
            {images.map((image, index) => {
                return <div key={index} className="p-1 m-0 relative">
                    <Image onClick={() => setActiveIndex(index)} src={image.url} alt="Image" height={50} width={70} className="h-12 w-auto rounded cursor-pointer" />
                </div>
            })}
        </div>
    </>
}
