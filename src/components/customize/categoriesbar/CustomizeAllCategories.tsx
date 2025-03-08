'use client';

import { editAllCategories } from "@/actions/customize";
import Spinner from "@/components/Spinner";
import { Category } from "@prisma/client";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";

interface Content {
    uid: number,
    name?: string,
    id?: string,
    subs?: { uid: number, id?: string, name?: string }[],
    imgUrl?: string,
    img?: File | null
}

let uid = 0;

function InputLogo({content}:{content: Content}){
    const [preview, setPreview] = useState<string>('')
    const [logo, setLogo] = useState<File|null>(null)
}

export default function CustomizeAllCategories({ selecteds, categories }: { selecteds: Content[], categories: Category[] }) {
    const [contents, setContents] = useState<Content[]>(selecteds)
    const [adding, setAdding] = useState<boolean>(false)
    const [inSelecteds, setInSelecteds] = useState<{
        uid: number,
        name?: string,
        id?: string,
    }[]>([])
    const [name, setName] = useState<string>('')
    const [logo, setLogo] = useState<File|null>(null)

    function del(uid: number) {
        setContents((prev) => {
            const newContents: Content[] = []
            prev.forEach((c) => {
                const nc = { ...c }
                if (nc.uid === uid) {
                    return;
                } else {
                    newContents.push({
                        id: nc.id,
                        uid: nc.uid,
                        name: nc.name,
                        subs: nc.subs?.filter((s) => s.uid != uid) ?? []
                    })
                }
            })
            return newContents
        })
    }

    function add() {
        if (name === '') {
            setContents((prev) => [...prev, ...inSelecteds])
        } else {
            setContents((prev) => [...prev, { uid: uid++, name: name, img: logo, subs: [...inSelecteds] }])
        }
        setInSelecteds([])
    }

    async function save() {
        setAdding(true)
        const formData = new FormData()
        formData.append('categories', JSON.stringify(contents, null, 2))
        await editAllCategories(formData)
        setAdding(false)
    }

    return <div className="p-3">
        {contents.map((c) => {
            return <div className="my-1 flex items-center">
                {c.imgUrl !== null ? <img/> : null}
                {c.name} <div className="mx-2"></div> <BiTrash className="text-red-500" onClick={() => del(c.uid)} /> <br />
                {(c?.subs?.length && c?.subs?.length > 0) && <ul className="ps-5">
                    {c?.subs?.map((s) => <li className="list-disc flex items-center">{s.name} <div className="mx-2"></div> <BiTrash className="text-red-500" onClick={() => del(s.uid)} /> </li>)}
                </ul>}
            </div>
        })}
        <div className="my-1">
            <div className="p-1 flex items-center">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
                <div className="flex items-center mx-2">
                    {logo !== null && <img src={URL.createObjectURL(logo)} className="h-[40px] w-[40px]"/>}
                    <div className="mx-2"></div>
                    <input type="file" name="" accept="image/*" id="" onChange={(e)=>setLogo(e.target.files? e.target.files[0] : null)}/>
                </div>
            </div>
            {categories.map((c) => {
                return <div className="flex items-center">
                    <input type="checkbox" name="" checked={inSelecteds.some((is) => is.id === c.id)} onChange={(e) => {
                        if (e.target.checked) {
                            setInSelecteds((prev) => [...prev, { uid: uid++, id: c.id, name: c.name }])
                        } else {
                            setInSelecteds((prev) => prev.filter((p) => p.id !== c.id))
                        }
                    }} id="" /> <div className="mx-1"></div> {c.name}
                </div>
            })}
            <div className="flex items-center">
                <button className="btn" onClick={add}>Add</button>
                <div className="mx-2"> </div>
                {adding ? <Spinner /> : <button onClick={save} className="btn my-1">Save</button>}
            </div>
        </div>
    </div>
}