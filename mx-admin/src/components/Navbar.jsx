import {BarChart3, Globe, Package, Settings, ShoppingCart} from "lucide-react";

export default function Navbar(props) {
    return <>
        {/* Native Mobile Bottom Nav */}
        <nav
            className="md:hidden flex-none h-16 bg-[#111111] border-t border-white/5 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-4">
            {[
                {path: '/', icon: BarChart3, label: 'BI'},
                {path: '/inventory', icon: Package, label: 'Vault'},
                {path: '/orders', icon: ShoppingCart, label: 'Orders'},
                {path: '/cms', icon: Globe, label: 'Web'},
                {path: '/settings', icon: Settings, label: 'Sys'}
            ].map(props.callbackfn)}
        </nav>
    </>
}