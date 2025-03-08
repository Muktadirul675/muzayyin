import path from 'path';
import fs from 'fs';

export default function Notice() {
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json = JSON.parse(homejsonfile)
    return <div className="flex w-full p-2 text-white text-bold bg-base-theme">
        <div className="mx-auto w-full md:w-2/3 h-[20px] flex items-center text-sm">
            {json.notice}
        </div>
    </div>
}