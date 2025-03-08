import Link from "next/link"

export default function Breadcrumb({ links }: { links: { name: string, url: string }[] }) {
    return <div className="w-full flex justify-center bg-slate-200 py-3">
        <div className="w-full md:w-2/3 flex text-sm font-semibold">
            {links.map((link, index) => {
                return <>
                    <Link href={link.url} className="mx-1 hover:text-base-theme">
                        <span>{link.name}</span>
                    </Link>
                        {index + 1 < links.length ? <div className="mx-1">\</div> : null}
                </>
            })}
        </div>
    </div>
}