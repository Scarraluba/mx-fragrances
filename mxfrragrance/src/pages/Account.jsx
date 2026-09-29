/**
 * Project: mxfrragrance
 * Created: 2026/05/14 22:00
 * Author: Scarra Luba
 */
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Laptop,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Package,
    Plus,
    Printer,
    RotateCcw,
    Shield,
    Smartphone,
    Star,
    Truck,
    User,
    X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'
import useAuthContext from "../context/auth/useAuthContext.jsx";
import {
    createAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    getUserAddresses
} from "../helpers/Account.js";
import { listenToUserOrders } from "../helpers/Checkout.js";
function formatRand(amount) {
    try { return `R ${Number(amount).toLocaleString()}`; } catch { return `R ${amount}`; }
}
const INITIAL_ORDERS = [
    {
        id: 1715012345678,
        items: [{ id: 1, brand: "Creed", name: "Aventus", price: 6500, quantity: 2, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" }],
        userData: { name: "Marcus Thorne", phone: "+27 82 455 9012", address: "42 Sandton Drive, Johannesburg" },
        total: 13000,
        date: "2024/05/06, 14:32:10",
        status: "Delivered"
    }
];

const ACCOUNT_SECTIONS = [
    {
        title: "Orders",
        items: [
            { id: "orders", label: "Orders", icon: Package, desc: "Track, return, or view past purchases" },
            { id: "invoices", label: "Invoices", icon: FileText, desc: "Preview and save tax documents" },
            { id: "returns", label: "Returns", icon: RotateCcw, desc: "Track vault return protocols" },
            { id: "reviews", label: "Asset Reviews", icon: Star, desc: "Manage your collection valuations" }
        ]
    },
    {
        title: "Profile",
        items: [
            { id: "personal-details", label: "Identity Protocols", icon: User, desc: "Update your vault identity" },
            //  { id: "security", label: "Security & Access", icon: Shield, desc: "Keys, 2FA, and trusted hardware" },
            { id: "addresses", label: "Drop Locations", icon: MapPin, desc: "Manage your delivery coordinates" },
            { id: "newsletter", label: "Communications", icon: Mail, desc: "Manage intelligence briefings" }
        ]
    }
];

const TrackingModal = ({ order, isReturn, onClose }) => {
    const steps = isReturn ? [
        { label: 'Return Initiated', date: order.date, done: true },
        { label: 'Courier Collected', date: '2026/05/11', done: true },
        { label: 'Vault Inspection', date: '2026/05/12', done: true },
        { label: 'Refund Processed', date: '2026/05/13', done: order.status === 'Refund Processed' }
    ] : [
        { label: 'Protocol Authorized', date: order.date, done: true },
        { label: 'Vault Preparation', date: '2024/05/07', done: true },
        { label: 'In Transit', date: '2024/05/08', done: true },
        { label: 'Secured Delivery', date: '2024/05/09', done: true }
    ];

    return (
        <div className="fixed inset-0 z-[300] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-[#0B0B0D] h-full border-l border-white/5 p-8 shadow-2xl z-10 flex flex-col">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="text-xl font-serif text-white">{isReturn ? 'Return Status' : 'Tracking Protocol'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-8">
                    <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">Reference: {order.id}</p>
                    <div className="relative border-l border-white/10 ml-3 space-y-10 py-2">
                        {steps.map((step, i) => (
                            <div key={i} className="relative pl-8">
                                <div className={`absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full border ${step.done ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-[#0B0B0D] border-white/20'}`} />
                                <h4 className={`text-sm ${step.done ? 'text-white font-bold' : 'text-white/40'}`}>{step.label}</h4>
                                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{step.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const OrdersTab = ({ userId }) => {
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);

    useEffect(() => {

        const unsubscribe = listenToUserOrders(
            userId,
            (orders) => {
                setOrders(orders);
            }
        );

        return () => unsubscribe();

    }, []);

    return (
        <>
            {activeOrder == null ? (
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center border border-white/5 bg-white/5 rounded-sm">
                            <p className="text-white/40 font-serif italic">No acquisition history found.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="border border-white/10 bg-white/5 rounded-sm p-6 flex flex-col md:flex-row gap-6 justify-between md:items-center">
                                <div>
                                    <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold mb-1">Order #{order.orderNumber || order.id}</p>
                                    <p className="text-white text-sm mb-2">{order.orderedDate || order.date}</p>
                                    <p className="text-white/50 text-xs">Total: {formatRand(order.total || order.items.reduce((s, i) => s + ((i.unitPrice || i.price) * i.quantity), 0))}</p>
                                    <span className="inline-block mt-3 px-3 py-1 bg-white/10 text-white text-[9px] uppercase tracking-widest rounded-full">{order.status || "Processing"}</span>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => setActiveOrder(order)} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-[#D4AF37] transition-colors text-center">
                                        Track / View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>) : (<div className="space-y-6">
                    <button onClick={() => setActiveOrder(null)} className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"><ArrowLeft size={14} /> Back to Orders</button>
                    <div className="border border-white/10 bg-white/5 p-8 rounded-sm text-left">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/10">
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-2">Order #{activeOrder.orderNumber || activeOrder.id}</h3>
                                <p className="text-white/50 text-xs">Ordered: {activeOrder.orderedDate || activeOrder.date}</p>
                                {activeOrder.paidDate && <p className="text-white/50 text-xs mt-1">Paid: {activeOrder.paidDate}</p>}
                            </div>
                            <span className="px-4 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-widest rounded-full font-bold">{activeOrder.status || "Processing"}</span>
                        </div>

                        <div className="space-y-6 mb-8">
                            {activeOrder.items.map((item, idx) => (
                                <div key={item.key || item.productId || idx} className="flex gap-4">
                                    <img src={item.image} className="w-16 h-20 object-cover bg-black rounded-sm" />
                                    <div>
                                        <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold">{item.brand}</p>
                                        <p className="text-white font-serif">{item.name}</p>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Qty: {item.quantity} · {formatRand(item.unitPrice || item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/10 mb-8">
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Delivery Information</p>
                                <p className="text-white text-sm">{activeOrder.userData?.name}</p>
                                <p className="text-white/70 text-sm mt-1">{activeOrder.shippingAddressString || activeOrder.userData?.address || "Vault Collection"}</p>
                                <p className="text-white/70 text-sm mt-2"><span className="text-white/40">Method:</span> {activeOrder.deliveryMethod || "N/A"}</p>
                                {activeOrder.deliveryDate && <p className="text-white/70 text-sm mt-1"><span className="text-white/40">Delivered:</span> {activeOrder.deliveryDate}</p>}
                                {activeOrder.signedBy && <p className="text-white/70 text-sm mt-1"><span className="text-white/40">Signed By:</span> {activeOrder.signedBy}</p>}
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Order Summary</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{formatRand(activeOrder.subtotal || activeOrder.total)}</span></div>
                                    <div className="flex justify-between text-white/70"><span>Shipping</span><span>{formatRand(activeOrder.shippingFee || 0)}</span></div>
                                    <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                                    <span>Total</span><span>{formatRand(activeOrder.totalAmount)}</span></div>
                                </div>
                            </div>
                        </div>

                        {activeOrder.tracking && activeOrder.tracking.length > 0 && (
                            <div className="pt-8 border-t border-white/10">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-6">Tracking History</p>
                                <div className="relative border-l border-white/20 ml-3 space-y-8">
                                    {activeOrder.tracking.map((evt, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></div>
                                            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-1">
                                                <p className="text-white text-sm font-bold">{evt.event}</p>
                                                <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest">{evt.date} • {evt.time}</span>
                                            </div>
                                            <p className="text-white/50 text-xs">{evt.location}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>)
            }
        </>);

};

const InvoicesTab = ({ orders, userData }) => {
    const [previewInvoice, setPreviewInvoice] = useState(null);

    return (
        <>
            <div className="space-y-4">
                {orders?.map(o => (
                    <div key={`inv-${o.id}`} className="flex items-center justify-between bg-black/50 border border-white/10 p-4 rounded-sm hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-[#D4AF37]"><FileText size={18} /></div>
                            <div>
                                <p className="text-white text-sm">Invoice INV-{o.id}</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{o.date}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setPreviewInvoice(o)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors" aria-label="Preview"><Eye size={14} /></button>
                            <button onClick={() => { setPreviewInvoice(o); setTimeout(() => window.print(), 500); }} className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors" aria-label="Download"><Download size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {previewInvoice && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewInvoice(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md print:hidden" />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} id="invoice-modal" className="relative bg-white text-black w-full max-w-2xl rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-auto print:overflow-visible z-10 custom-scrollbar">
                            <div className="p-8 md:p-12 min-w-[700px]">
                                <div className="flex justify-between items-start border-b border-black/10 pb-6 mb-8">
                                    <div>
                                        <h2 className="font-serif text-3xl font-bold tracking-tight">MX Fragrances</h2>
                                        <p className="text-xs uppercase tracking-widest text-black/50 mt-2">Secure Vault Invoice</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="font-bold text-lg text-[#D4AF37]">INV-{previewInvoice.id}</p>
                                        <p className="text-black/60">{previewInvoice.date}</p>
                                    </div>
                                </div>
                                <div className="mb-8 text-sm">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">Billed To</p>
                                    <p className="font-bold">{previewInvoice.userData?.name || userData?.name}</p>
                                    <p className="text-black/70 whitespace-pre-wrap mt-1">{previewInvoice.userData?.address || userData?.address}</p>
                                </div>
                                <table className="w-full text-sm mb-8">
                                    <thead>
                                        <tr className="border-b border-black/10 text-left text-[10px] uppercase tracking-widest text-black/50">
                                            <th className="pb-3 font-bold w-16">Asset</th>
                                            <th className="pb-3 font-bold">Description</th>
                                            <th className="pb-3 font-bold text-center">Qty</th>
                                            <th className="pb-3 font-bold text-right">Unit Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewInvoice.items?.map((it, i) => (
                                            <tr key={i} className="border-b border-black/5">
                                                <td className="py-4">
                                                    <img src={it.image} alt={it.name} className="w-10 h-12 object-cover rounded-sm bg-black/5" />
                                                </td>
                                                <td className="py-4">
                                                    <p className="font-bold">{it.brand} {it.name}</p>
                                                    <p className="text-black/50 text-[10px] uppercase tracking-widest mt-1">SKU: {it.sku || 'N/A'}</p>
                                                </td>
                                                <td className="py-4 text-center">{it.quantity}</td>
                                                <td className="py-4 text-right">R {it.price?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-end text-sm">
                                    <div className="w-64 space-y-3">
                                        <div className="flex justify-between"><span className="text-black/50">Subtotal</span><span>R {(previewInvoice.total - 99).toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span className="text-black/50">Insured Shipping</span><span>R 99</span></div>
                                        <div className="flex justify-between pt-3 border-t border-black/10 font-bold text-lg"><span>Total Balance</span><span>R {previewInvoice.total?.toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-black/10 flex justify-end gap-4 print:hidden">
                                    <button onClick={() => setPreviewInvoice(null)} className="px-6 py-2 border border-black/20 text-xs uppercase tracking-widest font-bold hover:bg-black/5 transition-colors rounded-sm">Close</button>
                                    <button onClick={() => window.print()} className="px-6 py-2 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-black/80 transition-colors flex items-center gap-2 rounded-sm shadow-xl"><Printer size={14} /> Save PDF</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const ReturnsTab = ({ returns }) => {
    const [trackingReturn, setTrackingReturn] = useState(null);

    if (!returns?.length) {
        return (
            <div className="bg-black/50 border border-white/10 rounded-sm p-10 text-center text-white/40">
                <RotateCcw size={32} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif italic mb-2">You have no active returns.</p>
                <Link to="/shop" className="text-[#D4AF37] text-[10px] uppercase tracking-widest underline hover:text-white transition-colors">View Return Policy</Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {returns.map(ret => (
                    <div key={ret.id} className="bg-black/50 border border-white/10 rounded-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-16 bg-white/5 shrink-0 rounded-sm overflow-hidden">
                                <img src={ret.items[0]?.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">{ret.items[0]?.brand} {ret.items[0]?.name}</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Order #{ret.orderId} · {ret.date}</p>
                                <p className="text-[#D4AF37] text-xs font-serif italic mt-2">{ret.status}</p>
                            </div>
                        </div>
                        <button onClick={() => setTrackingReturn(ret)} className="border border-white/10 text-white/60 px-6 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">Track Return</button>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {trackingReturn && <TrackingModal order={trackingReturn} isReturn={true} onClose={() => setTrackingReturn(null)} />}
            </AnimatePresence>
        </>
    );
};

const ReviewsTab = ({ orders = [], reviews = [], setReviews }) => {
    const [tab, setTab] = useState('to-review');
    const [writingFor, setWritingFor] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const purchasedItems = useMemo(() => {
        return orders
            .flatMap(order => Array.isArray(order.items) ? order.items : [])
            .reduce((acc, curr) => {
                const productId = curr.productId || curr.id;

                if (!acc.find(item => (item.productId || item.id) === productId)) {
                    acc.push(curr);
                }

                return acc;
            }, []);
    }, [orders]);

    const toReview = useMemo(() => {
        return purchasedItems.filter(
            item => !reviews.some(
                review => review.productId === (item.productId || item.id)
            )
        );
    }, [purchasedItems, reviews]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newReview = { id: Date.now(), productId: writingFor.productId || writingFor.id, product: writingFor, rating, comment, date: new Date().toLocaleDateString() };
        setReviews(prev => [newReview, ...prev]);
        setWritingFor(null);
        setTab('history');
        setComment('');
        setRating(5);
    };

    if (writingFor) {
        return (
            <div className="bg-black/50 border border-white/10 p-8 rounded-sm">
                <button onClick={() => setWritingFor(null)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold mb-6"><ArrowLeft size={14} /> Back</button>
                <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/5">
                    <img src={writingFor.image} alt="" className="w-16 h-20 object-cover bg-white/5 rounded-sm" />
                    <div>
                        <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">{writingFor.brand}</p>
                        <h3 className="text-white text-xl font-serif">{writingFor.name}</h3>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3 block">Valuation Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setRating(star)} className={`transition-colors ${star <= rating ? 'text-[#D4AF37]' : 'text-white/20 hover:text-white/40'}`}>
                                    <Star size={24} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-2">Detailed Narrative</label>
                        <textarea required rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe your experience with this scent..." className="w-full bg-black/50 border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm" />
                    </div>
                    <button type="submit" className="bg-[#D4AF37] text-black px-8 py-3 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-white transition-colors shadow-lg">Submit Review Protocol</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-6 border-b border-white/5 mb-6">
                <button onClick={() => setTab('to-review')} className={`pb-3 text-xs uppercase tracking-widest font-bold transition-all border-b-2 ${tab === 'to-review' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>To Review ({toReview.length})</button>
                <button onClick={() => setTab('history')} className={`pb-3 text-xs uppercase tracking-widest font-bold transition-all border-b-2 ${tab === 'history' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Review History ({reviews.length})</button>
            </div>

            {tab === 'to-review' ? (
                toReview.length > 0 ? (
                    <div className="space-y-4">
                        {toReview.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black/50 border border-white/10 p-4 rounded-sm gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt="" className="w-12 h-16 object-cover bg-white/5 rounded-sm" />
                                    <div>
                                        <p className="text-white text-sm font-bold">{item.brand} {item.name}</p>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Pending Review</p>
                                    </div>
                                </div>
                                <button onClick={() => setWritingFor(item)} className="bg-[#D4AF37] text-black px-6 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white transition-colors w-full sm:w-auto text-center">Write Review</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-white/40 font-serif italic">All recent acquisitions have been reviewed.</div>
                )
            ) : (
                reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map(r => (
                            <div key={r.id} className="bg-black/50 border border-white/10 p-6 rounded-sm">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <img src={r.product.image} className="w-8 h-10 object-cover bg-white/5 rounded-sm" alt="" />
                                        <div>
                                            <p className="text-white text-sm font-bold">{r.product.brand} {r.product.name}</p>
                                            <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">{r.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-[#D4AF37]">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i >= r.rating ? "text-white/20" : ""} />)}
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm italic font-serif leading-relaxed">"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-white/40 font-serif italic">No past reviews found in the vault.</div>
                )
            )}
        </div>
    );
};

const PersonalDetailsTab = ({ userData, updateProfile }) => {
    const [name, setName] = useState(userData?.fullName || '');
    const [phone, setPhone] = useState(userData?.phoneNumber || '');
    const [msg, setMsg] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        console.log(userData);
        updateProfile(name, phone);
        // setUserData(prev => ({ ...prev, name, phone }));
        setMsg("Vault identity updated securely.");

        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <form className="space-y-6 max-w-md" onSubmit={handleSave}>
            {msg && <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] p-3 text-[10px] uppercase tracking-widest rounded-sm flex items-center gap-2"><CheckCircle2 size={14} /> {msg}</div>}
            <div className="space-y-2">
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm" />
            </div>
            <div className="space-y-2">
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Email Address</label>
                <input disabled type="email" defaultValue={userData?.email || "user@vault.local"} className="w-full bg-white/5 border border-white/5 p-3 text-white/50 text-sm rounded-sm cursor-not-allowed" />
                <p className="text-white/20 text-[9px] uppercase tracking-widest">Email is tied to core authentication and cannot be changed here.</p>
            </div>
            <div className="space-y-2">
                <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">WhatsApp / Phone</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm" />
            </div>
            <button type="submit" className="bg-[#D4AF37] text-black px-6 py-3 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-white transition-colors">Save Protocol</button>
        </form>
    );
};

const SecurityTab = ({ securityData, setSecurityData }) => {
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [pwdMsg, setPwdMsg] = useState('');

    const toggle2FA = () => setSecurityData(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
    const revokeDevice = (id) => setSecurityData(prev => ({ ...prev, devices: prev.devices.filter(d => d.id !== id) }));

    const handlePwdSubmit = (e) => {
        e.preventDefault();
        setPwdMsg('Encryption key updated successfully.');
        setTimeout(() => { setIsChangingPwd(false); setPwdMsg(''); }, 2000);
    };

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-white text-lg font-serif mb-4">Master Encryption Key</h3>
                {!isChangingPwd ? (
                    <button onClick={() => setIsChangingPwd(true)} className="bg-white/5 border border-white/10 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white/10 transition-all flex items-center gap-2"><Lock size={14} /> Change Password</button>
                ) : (
                    <form onSubmit={handlePwdSubmit} className="bg-black/50 border border-white/10 p-6 rounded-sm space-y-4 max-w-md">
                        {pwdMsg && <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14} /> {pwdMsg}</p>}
                        <div>
                            <input required type="password" placeholder="Current Password" className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>
                        <div>
                            <input required type="password" placeholder="New Password" className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button type="submit" className="bg-[#D4AF37] text-black px-6 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white transition-colors">Update Key</button>
                            <button type="button" onClick={() => setIsChangingPwd(false)} className="text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                        </div>
                    </form>
                )}
            </div>
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-white text-lg font-serif mb-2">Two-Factor Protocol (2FA)</h3>
                <p className="text-white/40 text-sm mb-4">Add an extra layer of encryption to your vault access.</p>
                <button onClick={toggle2FA} className={`flex items-center gap-3 p-4 border rounded-sm w-fit transition-all ${securityData.twoFactor ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-black/50 border-white/10 text-white hover:border-white/30'}`}>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${securityData.twoFactor ? 'bg-[#D4AF37]' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${securityData.twoFactor ? 'left-5' : 'left-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold">{securityData.twoFactor ? '2FA Enabled' : 'Not Enabled'}</span>
                </button>
            </div>
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-white text-lg font-serif mb-4">Trusted Access Points</h3>
                <div className="space-y-3">
                    {securityData.devices.map(dev => (
                        <div key={dev.id} className="bg-black/50 border border-white/10 rounded-sm p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center text-white/50">
                                    {dev.name.includes('iPhone') ? <Smartphone size={18} /> : <Laptop size={18} />}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">{dev.name}</p>
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{dev.location} · {dev.date}</p>
                                </div>
                            </div>
                            {dev.current ? (
                                <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold bg-[#D4AF37]/10 px-3 py-1 rounded-sm">Current</span>
                            ) : (
                                <button onClick={() => revokeDevice(dev.id)} className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-widest underline transition-colors">Revoke Access</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};



const PROVINCES = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const AddressBookTab = ({ addresses, userId }) => {

    const emptyForm = { name: '', mobile: '', street: '', complex: '', suburb: '', city: '', province: '', postalCode: '' };

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setIsAdding(false);
    };


    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        if (editingId) {
            await updateAddress(editingId, form);
        } else {
            await createAddress(userId, form);
        }
        //setAddresses(prev => [...prev, { id: Date.now(), name: form.name, address: form.address, isPrimary: prev.length === 0 }]);
        setLoading(false);
        resetForm();
    };

    const remove = async id => {
        await deleteAddress(id);
    };

    const setPrimary = async id => {
        await setPrimaryAddress(userId, id);
    };

    const edit = addr => {
        setForm({
            name: addr.name,
            mobile: addr.mobile,
            street: addr.street,
            complex: addr.complex,
            suburb: addr.suburb,
            city: addr.city,
            province: addr.province,
            postalCode: addr.postalCode
        });
        setEditingId(addr.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6">

            {addresses.map(addr => (
                <div key={addr.id} className={`bg-black/50 border ${addr.isPrimary ? 'border-[#D4AF37]/50' : 'border-white/10'} rounded-sm p-6 relative`}>

                    {addr.isPrimary && (
                        <span className="absolute top-4 right-4 bg-[#D4AF37] text-black text-[9px] uppercase tracking-widest px-2 py-1 font-bold rounded-sm">
                            Primary
                        </span>
                    )}

                    <div className="flex items-start gap-3">
                        <MapPin className="text-[#D4AF37]/50 mt-1" size={16} />
                        <div>
                            <p className="text-white font-serif text-lg">{addr.name}</p>
                            <p className="text-white/60 text-xs font-mono mb-2">{addr.mobile}</p>
                            <p className="text-white/80 text-sm">{addr.street}{addr.complex ? `, ${addr.complex}` : ''}</p>
                            <p className="text-white/60 text-sm">{addr.suburb}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6 border-t border-white/5 pt-4">

                        {!addr.isPrimary && (
                            <button onClick={() => setPrimary(addr.id)} className="text-white/40 text-[10px] uppercase tracking-widest underline hover:text-white transition-colors">
                                Set Primary
                            </button>
                        )}

                        <button onClick={() => edit(addr)} className="text-blue-400 text-[10px] uppercase tracking-widest underline hover:text-blue-300 transition-colors">
                            Edit
                        </button>

                        <button onClick={() => remove(addr.id)} className="text-red-400 text-[10px] uppercase tracking-widest underline hover:text-red-300 transition-colors">
                            Remove
                        </button>

                    </div>
                </div>
            ))}

            {isAdding ? (
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-sm space-y-6">

                    <h3 className="text-white font-serif text-lg border-b border-white/10 pb-4">
                        {editingId ? 'Edit Location' : 'Add New Location'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Recipient Name</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>

                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Mobile Number</label>
                            <input type="tel" required value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Street Address</label>
                        <input required value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                    </div>

                    <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Complex (Optional)</label>
                        <input value={form.complex} onChange={e => setForm({ ...form, complex: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Suburb</label>
                            <input required value={form.suburb} onChange={e => setForm({ ...form, suburb: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>

                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">City</label>
                            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Province</label>
                            <select required value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm">
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">Postal Code</label>
                            <input required value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-[#D4AF37] outline-none rounded-sm" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="bg-[#D4AF37] text-black px-8 py-3 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white transition-colors">
                            {loading ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                        </button>

                        <button type="button" onClick={resetForm} className="text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>

                </form>
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 border border-white/10 border-dashed py-6 text-white/40 hover:text-white hover:border-white/30 transition-all rounded-sm text-xs uppercase tracking-widest font-bold">
                    <Plus size={16} /> Add Drop Location
                </button>
            )}

        </div>
    );
};

const NewsletterTab = () => (
    <div className="space-y-6 max-w-md">
        <p className="text-white/60 text-sm mb-6">Select the communications you wish to receive from the vault.</p>
        {[
            { id: 'drops', label: "New Drops & Acquisitions", desc: "Be the first to know when rare items arrive.", active: true },
            { id: 'promos', label: "Exclusive Promotions", desc: "Private sales and bundle advantages.", active: true },
            { id: 'updates', label: "Vault Updates", desc: "News, curation protocols, and brand updates.", active: false }
        ].map(item => (
            <label key={item.id} className="flex items-start gap-4 cursor-pointer group">
                <div className={`mt-1 w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${item.active ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20 bg-black/50 group-hover:border-[#D4AF37]/50'}`}>
                    {item.active && <CheckCircle2 size={12} className="text-black" />}
                </div>
                <div>
                    <p className="text-white text-sm font-bold">{item.label}</p>
                    <p className="text-white/40 text-xs mt-1">{item.desc}</p>
                </div>
            </label>
        ))}
        <button className="mt-8 bg-[#D4AF37] text-black px-6 py-3 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-white transition-colors">Save Preferences</button>
    </div>
);

const Account = () => {
    const { user, userData, logout, updateProfile } = useAuthContext();

    const [returns, setReturns] = useState(() => {
        const saved = localStorage.getItem("mx_vault_returns_v1");
        return saved ? JSON.parse(saved) : [
            { id: 'RET-8829', orderId: 1715012345678, date: '2026/05/10', status: 'Refund Processed', items: [{ brand: 'Creed', name: "Aventus", quantity: 1, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' }] }
        ];
    });

    const [reviews, setReviews] = useState(() => {
        const saved = localStorage.getItem("mx_vault_reviews_v1");
        return saved ? JSON.parse(saved) : [];
    });

    const [securityData, setSecurityData] = useState(() => {
        const saved = localStorage.getItem("mx_vault_security_v1");
        return saved ? JSON.parse(saved) : { twoFactor: false, devices: [{ id: 1, name: 'MacBook Pro - Chrome', location: 'Johannesburg, ZA', current: true, date: 'Active Now' }, { id: 2, name: 'iPhone 14 Pro - Safari', location: 'Cape Town, ZA', current: false, date: 'Last active: 2 days ago' }] };
    });



    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem("mx_vault_settings_v1");
        return saved ? JSON.parse(saved) : { whatsapp: '27820000000', currency: 'R', bankDetails: 'Account Name: MX Fragrances\nBank: FNB\nAcc No: 123456789\nRef: [Your Name]' };
    });
    const { '*': currentPath } = useParams();
    const navigate = useNavigate();

    if (!user || user.isAnonymous) {
        return (
            <div className="pt-40 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <User size={48} className="text-white/20 mb-4" />
                <h2 className="text-2xl text-white font-serif mb-2">Authentication Required</h2>
                <p className="text-white/50 text-sm mb-6">Please sign in to access your secure vault profile.</p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/login')} className="bg-[#D4AF37] text-black px-6 py-3 font-bold uppercase tracking-widest text-[11px] rounded-sm hover:bg-white transition-colors">Sign In</button>
                    <button onClick={() => navigate('/')} className="text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-colors mt-3">Return Home</button>
                </div>
            </div>
        );
    }

    const useId = user?.uid;
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {

        const load = async () => {
            const res = await getUserAddresses(useId);
            if (res.success) setAddresses(res.data);
        };

        load();
    }, [useId]);

    const activeItem = ACCOUNT_SECTIONS.flatMap(s => s.items).find(i => i.id === currentPath);

    if (!currentPath || !activeItem) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 md:pt-40 pb-24 container mx-auto px-6 max-w-5xl text-left min-h-screen">
                <h1 className="text-4xl md:text-5xl text-white font-serif tracking-tight mb-2">Secure Vault Account</h1>
                <p className="text-white/40 text-sm mb-12">Manage your collection, secure profile, and historical data.</p>
                <div className="space-y-12">
                    {ACCOUNT_SECTIONS.map(sec => (
                        <div key={sec.title}>
                            <h3 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold border-b border-white/5 pb-4 mb-6">{sec.title}</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {sec.items.map(item => (
                                    <Link key={item.id} to={`/account/${item.id}`} className="bg-white/5 border border-white/10 p-6 rounded-sm hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all group flex flex-col gap-4">
                                        <div className="w-10 h-10 bg-black/50 flex items-center justify-center rounded-sm text-[#D4AF37] group-hover:scale-110 transition-transform">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-white text-sm font-bold tracking-wide">{item.label}</h4>
                                            <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-white/5">
                    <button onClick={() => logout().then(() => navigate('/'))} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                        <LogOut size={16} />  Sign Out
                    </button>
                </div>
            </motion.div>
        );
    }

    const renderAccountContent = (path) => {
        switch (path) {
            case 'orders': return <OrdersTab userId={useId} />;
            case 'invoices': return <InvoicesTab userData={userData} />;
            case 'returns': return <ReturnsTab returns={returns} />;
            case 'reviews': return <ReviewsTab reviews={reviews} setReviews={setReviews} />;
            case 'personal-details': return <PersonalDetailsTab userData={userData} updateProfile={updateProfile} />;
            case 'security': return <SecurityTab securityData={securityData} setSecurityData={setSecurityData} />;
            case 'addresses': return <AddressBookTab addresses={addresses} userId={useId} />;

            case 'newsletter': return <NewsletterTab />;
            default: return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 md:pt-40 pb-24 container mx-auto px-6 max-w-6xl text-left min-h-screen flex flex-col md:flex-row gap-12">
            <aside className="hidden md:block md:w-64 shrink-0 space-y-10">
                <div className="sticky top-32">
                    <Link to="/account" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold mb-8 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                    {ACCOUNT_SECTIONS.map(sec => (
                        <div key={sec.title} className="mb-8">
                            <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">{sec.title}</h4>
                            <div className="space-y-1">
                                {sec.items.map(item => {
                                    const isActive = item.id === currentPath;
                                    return (
                                        <Link key={item.id} to={`/account/${item.id}`} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-xs tracking-widest uppercase transition-all ${isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37] font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                                            <item.icon size={16} /> {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => logout().then(() => navigate('/'))} className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold w-full text-left mt-8">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 bg-zinc-900/40 border border-white/5 p-6 md:p-10 rounded-sm h-fit">
                <Link to="/account" className="md:hidden flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold mb-6 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>
                <h2 className="text-3xl text-white font-serif mb-8 pb-4 border-b border-white/5">{activeItem.label}</h2>
                {renderAccountContent(currentPath)}
            </main>
        </motion.div>
    );
};

export default Account;