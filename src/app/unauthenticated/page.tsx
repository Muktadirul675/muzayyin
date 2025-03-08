import Image from "next/image";
import Link from "next/link";

export default async function Unauthorized(){
    return <div className="flex flex-col p-5 flex-wrap max-w-full justify-center items-center h-50vh">
        <Image src={'/logo.png'} alt="Zilmil" width={120} height={80} className="rounded"/>
        <div className="text-[60px] font-extrabold">Unauthenticated</div>
        <h3 className="text-lg my-1">You are not logged in. Please <Link href="/login" className="link">login</Link></h3>
    </div>
}