'use client';

import { Variant } from "@/types";
import { useState } from "react";
import { useErrors } from "./errors";

const VARIANT_EMPTY_ERROR = "You must provide variant name and stocks"

let lastKey = 0

export function useVariants(){
    const [name, setName] = useState<string|null>(null)
    const [stocks, setStocks] = useState<number|null>(null)
    const [variants, setVariants] = useState<Variant[]>([])
    const errors = useErrors()

    function add(){
        if(name && name !== '' && stocks && stocks>0){
            setVariants((prev)=>[...prev, {name:name, stocks:stocks, key:lastKey++}])
            setName(null)
            setStocks(null)
        }else{
            errors.add(VARIANT_EMPTY_ERROR)
        }
    }

    function addObj({name, stocks}:{name:string, stocks: number}){
        setVariants((prev)=>[...prev, {name:name, stocks: stocks, key:lastKey++}])
    }

    function remove(key:number){
        if(variants.length){
            setVariants((prev)=>prev.filter((variant)=>variant.key!==key))
        }
    }

    return {add, remove, variants, setName, setStocks, errors, name, stocks, addObj}
}