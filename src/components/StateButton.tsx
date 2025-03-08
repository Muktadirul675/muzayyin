'use client';

import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

export default function StateButton({children}:{children:React.ReactNode}){
    const {pending} = useFormStatus()
    if(pending){
        return <Spinner/>
    }
    return <button className="px-2 py-1.5 bg-base-theme rounded">{children}</button>
}
