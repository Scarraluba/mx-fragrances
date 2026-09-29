/**
 * Project: mxfrragrance
 * Created: 2026/05/15 19:25
 * Author: Scarra Luba
 */

import GoldBottleIcon from "../assets/logo.svg";
import {  LogOut } from "lucide-react";

export default function DesktopSideBar(props) {
    return <>
        {/* Desktop Sidebar */}
        <aside
            className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#111111] shrink-0 z-10 h-full relative">
            <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 flex items-center justify-center bg-black rounded-sm border border-white/10">
                    <img
                        src={GoldBottleIcon}
                        alt="MX Logo"
                        className="w-8.5 h-8.4 md:w-10 md:h-10 transition-transform group-hover:scale-110"
                    />
                </div>
                <div>
                    <h1 className="text-white font-serif tracking-tight text-sm">Enterprise ERP</h1>
                    <p className="text-[#D4AF37] text-[8px] uppercase tracking-[0.2em] font-bold">MX Fragrances</p>
                </div>
            </div>
            <div className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold px-3 mt-4 mb-2">Core
                    Modules</p>
                {props.sidebarnav.map(props.callbackfn)}

            </div>
            <div className="p-4 border-t border-white/5 shrink-0 flex flex-col gap-2">
                <button onClick={props.onClick}
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-[10px] uppercase tracking-widest font-bold py-2 transition-colors">
                    <LogOut size={12}/> Terminate Session
                </button>
            </div>
        </aside>
    </>
}