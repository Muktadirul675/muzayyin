'use client';

import { CustomError } from "@/types";
import { useState } from "react";

let lastKey = 0;

export function useErrors() {
    const [errors, setErrors] = useState<CustomError[]>([])

    function add(error: string) {
        if (error && error !== '') {
            setErrors((prev) => [...prev, { error: error, key: lastKey++ }])
        }
    }

    function remove(key: number) {
        if (errors.length) {
            setErrors((prev) => prev.filter((err) => err.key !== key))
        }
    }

    return { errors, add, remove }
}
