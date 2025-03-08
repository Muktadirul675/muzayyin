import Image from "next/image";

export default async function Unauthorized(){
    return <div className="flex flex-col flex-wrap max-w-full  p-5 justify-center items-center h-[50vh]">
        <Image src={'/logo.png'} alt="Zilmil" width={120} height={80} className="rounded"/>
        <div className="text-[60px] font-extrabold">Unauthorized</div>
        <h3 className="text-lg my-1">Access denied</h3>
        <h3 className="text-lg my-1">If this is unexpected, contact the website owner</h3>
    </div>
}