'use client';

import { editBanner } from "@/actions/customize";
import Spinner from "@/components/Spinner";
import { useImages } from "@/hooks/images";
import { useCallback, useEffect, useState } from "react";
import { BiCloudUpload } from "react-icons/bi";
import { CgClose } from "react-icons/cg";


export default function EditBanner({ bannerJson }: { bannerJson: string[] }) {
    const images = useImages()
    const [saving, setSaving] = useState<boolean>(false)

    const fetchImages = useCallback(async () => {
        for (const i of bannerJson) {
            const res = await fetch(i)
            const blob = await res.blob()
            const blobImg = new File([blob], i.split('/')[2], { type: blob.type })
            await images.add(blobImg)
        }
    }, [])

    useEffect(() => {
        fetchImages()
    }, [])

    useEffect(() => {
        console.log(images.images)
    }, [images.images])

    const save = useCallback(async () => {
        setSaving(true)
        const formData = new FormData()
        for (const i of images.images) {
            console.log(i.image)
            formData.append('images[]', i.image)
        }
        await editBanner(formData);
        setSaving(false)
    }, [images.images])

    return <div className="p-2">
        <div className="flex flex-wrap">
            {images.images.map((i) => {
                return <div key={i.key} className="p-1 relative">
                    <img className="max-w-full" src={i.preview} alt="Banner" />
                    <div className="opacity-50 absolute cursor-pointer hover:opacity-100 top-2 right-2 bg-red-500 rounded text-center p-2 text-white">
                        <CgClose onClick={() => images.remove(i.key)} className="text-xl" />
                    </div>
                </div>
            })}
        </div>
        <div className="p-3 flex flex-col">
            <input onChange={async (e) => {
                if (e.target.files) {
                    const files = Array.from(e.target.files)
                    for (const f of files) {
                        await images.add(f)
                    }
                }
            }} type="file" name="images" id="images" className="hidden" multiple />
            <label htmlFor="images" className="flex w-full p-3 justify-center items-center border-2 border-dashed rounded bg-slate-100 cursor-pointer">
                <BiCloudUpload className="text-xl text-blue-500" />
                <div className="mx-1"></div>
                <b>Add Image (Optional)</b>
            </label>
            <div className="p-2">
                {saving ? <Spinner /> : <button className="btn" onClick={save}>Save</button>}
            </div>
        </div>
    </div>
}
