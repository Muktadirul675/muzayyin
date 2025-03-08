import path from 'path';
import fs from 'fs';
import EditBanner from '@/components/customize/banner/EditBanner';

export const dynamic = 'force-dynamic'

export default async function Page() {
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json: { banner: string[] } = JSON.parse(homejsonfile)
    return <>
        <EditBanner bannerJson={json.banner} />
    </>
}