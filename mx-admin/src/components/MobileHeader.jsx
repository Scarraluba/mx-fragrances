/**
 * Project: mx-admin
 * Created: 2026/05/15 19:43
 * Author: Scarra Luba
 */

import {Menu, X} from "lucide-react";
import GoldBottleIcon from "../assets/logo.svg";

export default function MobileHeader(props) {
    return <header
        className="md:hidden flex-none h-[60px] flex items-center justify-between px-4 bg-[#111111] border-b border-white/5 z-20 shadow-xl">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-black rounded-sm">
                <img
                    src={GoldBottleIcon}
                    alt="MX Logo"
                    className="w-8.5 h-8.4 md:w-10 md:h-10 transition-transform group-hover:scale-110"
                />
            </div>
            <span className="text-white font-serif text-sm">Enterprise ERP</span>
        </div>
        <button onClick={props.onClick} className="text-white/70">
            {props.mobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
    </header>
}