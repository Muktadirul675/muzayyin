import { editNotice } from "@/actions/customize";
import StateButton from "@/components/StateButton";
import path from 'path';
import fs from 'fs';

export default async function Page(){
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json = JSON.parse(homejsonfile)
    const notice = json.notice

    return <div className="p-2">
        <form action={editNotice}>
            <label htmlFor="notice" className="text-lg font-bold"></label>
            <textarea rows={5} name="notice" className="form-input my-1" defaultValue={notice} required>
            </textarea> <br />
            <StateButton>Save</StateButton>
        </form>
    </div>
}