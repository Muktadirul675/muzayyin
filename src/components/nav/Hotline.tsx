import { BiHeadphone } from "react-icons/bi";

export default function Hotline() {
    return <div className="hidden md:flex items-center flex-row">
        <div>
            <BiHeadphone className="text-[40px] font-bold"/>
        </div>
        <div className="mx-1"></div>
        <div>
            <h3 className="text-base-theme text-lg font-bold">
                01301871077
            </h3>
            <h3 className="font-bold text-sm">Hotline Number</h3>
        </div>
    </div>
}