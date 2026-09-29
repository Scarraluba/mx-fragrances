/**
 * Project: mxfrragrance
 * Created: 2026/05/18 06:23
 * Author: Scarra Luba
 */
import {useNavigate} from "react-router-dom";
import {Minus, Plus, ShoppingBag, Trash2, X} from 'lucide-react';
import {AnimatePresence, motion} from "framer-motion";

function formatRand(amount) {
    try { return `R ${Number(amount).toLocaleString()}`; } catch { return `R ${amount}`; }
}
const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeItem, onProceed, user }) => {
    const navigate = useNavigate();
    const total = cart.reduce((sum, i) => sum + (i.unitPrice ?? i.price ?? 0) * (i.quantity ?? 1), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-650 custom-scrollbar" />
                    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={(e) => e.stopPropagation()} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0B0B0D] border-l border-white/5 z-[660] shadow-2xl flex flex-col">
                        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center text-white text-left">
                            <h2 className="text-xl font-serif">Selection</h2>
                            <button onClick={onClose} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4 font-serif italic text-sm"><ShoppingBag size={48} /><p>Selection is empty</p></div>
                            ) : (
                                cart.map((i) => {
                                    const key = i.id || i.refId;
                                    const qty = i.quantity ?? 1;
                                    const lineTotal = (i.unitPrice ?? 0) * qty;

                                    const isCombo = i.type === "combo";

                                    const title = i.title;

                                    const subtitle = isCombo
                                        ? `${i.meta?.items?.length ?? 0} items`
                                        : [
                                            i.meta?.brand,
                                            i.meta?.sizeMl ? `${i.meta.sizeMl}ml` : null,
                                            i.meta?.sku ? `SKU: ${i.meta.sku}` : null
                                        ].filter(Boolean).join(" · ");

                                    return (
                                        <div key={key} className="flex gap-4">

                                            <div className="w-16 h-20 bg-zinc-900 rounded-sm overflow-hidden flex-shrink-0">
                                                <img
                                                    src={i.image}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    alt=""
                                                    onClick={() => {
                                                        onClose();
                                                        navigate(`/product/${i.refId}`);
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 space-y-1 text-white min-w-0">

                                                <div className="flex justify-between items-start gap-2 text-left">
                                                    <h4 className="text-sm font-serif truncate">
                                                        {title}
                                                    </h4>

                                                    <button
                                                        onClick={() => removeItem(i.refId, i.type)}
                                                        className="text-white/20 hover:text-red-500"
                                                        aria-label="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {subtitle && (
                                                    <p className="text-white/40 text-[10px] uppercase tracking-widest truncate">
                                                        {subtitle}
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-end mt-3">

                                                    <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-sm border border-white/10">

                                                        <button
                                                            onClick={() => updateQuantity(i.refId, i.type, -1)}
                                                            className="text-white/70 hover:text-white"
                                                        >
                                                            <Minus size={10} />
                                                        </button>

                                                        <span className="text-[10px] w-5 text-center">
                            {qty}
                        </span>

                                                        <button
                                                            onClick={() => updateQuantity(i.refId, i.type, 1)}
                                                            className="text-white/70 hover:text-white"
                                                        >
                                                            <Plus size={10} />
                                                        </button>

                                                    </div>

                                                    <p className="text-xs italic font-serif">
                                                        {formatRand(lineTotal)}
                                                    </p>

                                                </div>

                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 md:p-6 border-t border-white/5 bg-zinc-950 space-y-4">
                                <div className="flex justify-between items-end text-white">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Total</span>
                                    <span className="text-2xl font-serif italic text-[#D4AF37]">{formatRand(total)}</span>
                                </div>
                                <p className="text-[8px] center text-white/35 uppercase tracking-widest   p-3 rounded-sm">
                                    Adding an item to your cart does not guarantee availability. Stock is confirmed at checkout.
                                </p>
                                {!user || user.isAnonymous ? (
                                    <button onClick={() => { onClose(); navigate('/auth'); }} className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-[11px] hover:bg-[#D4AF37] transition-colors shadow-lg rounded-sm">Login To Checkout</button>
                                ) : (
                                    <button onClick={() => { onClose(); if (typeof onProceed === "function") onProceed(); navigate("/checkout"); }} className="w-full bg-[#D4AF37] text-black py-4 font-bold uppercase tracking-widest text-[11px] hover:bg-white transition-colors shadow-lg rounded-sm">Proceed To Checkout</button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;