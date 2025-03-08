'use client'

import { CustomError } from "@/types";
import { CgClose } from "react-icons/cg";

export default function ErrorList({errorInstance}:{errorInstance: {
    errors: CustomError[];
    add: (error: string) => void;
    remove: (key: number) => void;
}}){
    if(errorInstance.errors){
        return <div className="my-1 flex flex-col">
            {errorInstance.errors.map((error)=><div key={error.key} className="my-1 p-3 flex items-center text-white bg-red-300 border-red-500">
                {error.error}
                <CgClose onClick={()=>errorInstance.remove(error.key)} className="text-lg ms-auto text-white cursor-pointer"/>
            </div> )}
        </div>
    }else return null
}