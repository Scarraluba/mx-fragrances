/**
 * Project: mxfrragrance
 * Created: 2026/05/18 08:10
 * Author: Scarra Luba
 */

import {Heart} from "lucide-react";
import {Link} from "react-router-dom";

function formatRand(amount) {
    try { return `R ${Number(amount).toLocaleString()}`; } catch { return `R ${amount}`; }
}
const Wishlist = ({ wishlist, onToggleWishlist, onAddToCart }) => (
    <div className="pt-40 pb-24 container mx-auto px-6 min-h-[80vh] text-center">
        <h1 className="text-4xl font-serif text-white mb-12">Private Wishlist</h1>
        {wishlist.length === 0 ? (
            <div className="text-white/40 flex flex-col items-center gap-4 mt-20">
                <Heart size={48} className="opacity-20" />
                <p className="font-serif italic">Your wishlist is currently empty.</p>
                <Link to="/shop" className="mt-4 text-[#D4AF37] text-[10px] uppercase tracking-widest underline hover:text-white transition-colors">Explore Vault</Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {wishlist.map(item => {

                    const isCombo = item.type === "combo";

                    return (
                        <div
                            key={`${item.type}-${item.refId}`}
                            className="bg-zinc-900 border border-white/5 rounded-sm p-4 flex flex-col group relative"
                        >

                            <div className="relative aspect-[4/5] bg-black mb-4 overflow-hidden rounded-sm">

                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                <button
                                    onClick={() => onToggleWishlist(item)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#D4AF37] hover:text-white transition-colors z-10"
                                >
                                    <Heart size={14} fill="currentColor" />
                                </button>

                            </div>

                            <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold mb-1">
                                {isCombo
                                    ? "Boutique Pairing"
                                    : item.meta?.brand || "Fragrance"}
                            </p>

                            <h3 className="text-white font-serif text-sm flex-1">
                                {item.title}
                            </h3>

                            <p className="text-white/60 text-xs mt-2">
                                {formatRand(item.unitPrice)}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-2">

                                <button
                                    onClick={() => onAddToCart({
                                        ...item,
                                        quantity: 1
                                    })}
                                    className="bg-[#D4AF37] hover:bg-white text-black text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm transition-all"
                                >
                                    Add
                                </button>

                                <Link
                                    to={`/product/${item.refId}`}
                                    className="text-center bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm transition-all"
                                >
                                    View
                                </Link>

                            </div>

                        </div>
                    );
                })}
            </div>
        )}
    </div>
);

export default Wishlist;