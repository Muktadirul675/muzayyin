'use client'

import { useState } from "react"
import { useErrors } from "./errors"
import { Color } from "@/types"

const EMPTY_COLOR_ERROR = "You must provide both color name and hex code. You have to provide stocks too."

let lastKey = 1

export function useColors() {
    const [name, setName] = useState<string | null>(null)
    const [hex, setHex] = useState<string | null>(null)
    const [stocks, setStocks] = useState<number | null>(null)
    const [colors, setColors] = useState<Color[]>([])
    const errors = useErrors()

    function add() {
        if (name && name !== '' && hex && hex !== '' && stocks && stocks > 0) {
            setColors((prev) => [...prev, { key: lastKey++, name: name, hex: hex, stocks: stocks }])
            setName(null)
            setHex(null)
            setStocks(null)
        } else {
            errors.add(EMPTY_COLOR_ERROR)
        }
    }

    function addObj({name,stocks,hex}:{name:string,stocks:number, hex:string}){
        setColors((prev) => [...prev, { key: lastKey++, name: name, hex: hex, stocks: stocks }])
    }

    function remove(key: number) {
        if (colors.length) {
            setColors((prev) => prev.filter((color) => color.key === key))
        }
    }

    return { colors, add, remove, setName, setHex, setStocks, errors, name, hex, stocks, addObj }
}