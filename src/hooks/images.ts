'use client';

import { InputImage } from "@/types";
import { useState } from "react";
import { useErrors } from "./errors";

const IMAGE_EMPTY_ERROR = "Image can't be empty"

let lastKey = 1

export function useImages() {
    const [images, setImages] = useState<InputImage[]>([])
    const errors = useErrors()

    async function add(image: File) {
        if (image) {
            const preview = URL.createObjectURL(image)
            setImages((prev) => [...prev, { image: image, key: lastKey++, preview: preview }])
        } else {
            errors.add(IMAGE_EMPTY_ERROR)
        }
    }

    function remove(key: number) {
        if (images.length) {
            setImages((prev) => prev.filter((img) => img.key !== key))
        }
    }

    return { add, remove, images, errors }
}
