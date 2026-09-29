/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:52
 * Author: Scarra Luba
 */
import React, { useEffect, useMemo, useState } from 'react';
import useAuth from "../context/auth/useAuth.jsx";
import useAppContext from "../context/app/UseAppContext.jsx";
import {
    X, Menu, Plus, Trash2, ChevronRight, Lock, ArrowLeft,
    Package, Star, Eye, History, Edit, BarChart3, Users,
    DollarSign, Settings, TrendingUp, AlertTriangle,
    ShieldCheck, User, LogOut, Upload, ShoppingCart, Printer, FileText, Truck,
    Undo, Save, Globe, ArrowUpDown, ArrowUp, ArrowDown, Shield, Search,
    Bell, ChevronDown, MessageSquare, CornerDownLeft, CheckCircle2
} from 'lucide-react';
import Accordion from '../components/Accordion.jsx';

const SHARED_CLASSES = {
    inputClass: "w-full bg-[#1A1A1A] border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm shadow-inner",
    labelClass: "text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1.5 block",
    btnClass: "bg-[#D4AF37] text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    cardClass: "bg-[#111111] border border-white/5 rounded-sm p-5 shadow-lg relative overflow-hidden"
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";

const formatOrderDate = (createdAt) => {
    if (!createdAt) return 'Unknown Date';
    if (createdAt.seconds) {
        return new Date(createdAt.seconds * 1000).toLocaleDateString('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    if (typeof createdAt === 'string') return createdAt.split(',')[0];
    return new Date(createdAt).toLocaleDateString('en-ZA');
};

const OrderPage = () => {
    const { user } = useAuth();
    
    // Fully destructuring the CRUD methods from context
    const { 
        orders, 
        updateOrderStatus, 
        addTrackingEvent, 
        deleteOrder, 
        confirm 
    } = useAppContext(); 
    
    const [logisticsData, setLogisticsData] = useState({});
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'completed'
    
    const { inputClass, labelClass, btnClass } = SHARED_CLASSES;

    // Split orders into categories based on their need of attendance
    const { attendanceOrders, completedOrders } = useMemo(() => {
        const attendance = [];
        const completed = [];
        
        (orders || []).forEach(o => {
            // Treat Delivered and Refunded as completed/archived
            if (o.status === 'Delivered' || o.status === 'Refund Processed') {
                completed.push(o);
            } else {
                attendance.push(o);
            }
        });
        
        return { attendanceOrders: attendance, completedOrders: completed };
    }, [orders]);

    const displayOrders = activeTab === 'attendance' ? attendanceOrders : completedOrders;

    // --- CRUD ACTION HANDLERS ---

    const handleStatusChange = async (orderId, newStatus) => {
        if(updateOrderStatus) {
            await updateOrderStatus(orderId, newStatus);
            await addTrackingEvent(orderId, {
                event: `Status Updated to ${newStatus}`,
                location: "Admin Panel"
            });
        }
    };

    const handleUpdateLogistics = (orderId) => {
        const logistics = logisticsData[orderId];
        
        if (!logistics?.courier || !logistics?.tracking) {
            alert("Please provide both Courier Company and Tracking Number.");
            return;
        }

        confirm(`Dispatch Order #${String(orderId).slice(-6)}? This will mark it 'In Transit' and add a tracking event.`, async () => {
            if (updateOrderStatus && addTrackingEvent) {
                await updateOrderStatus(orderId, 'In Transit');
                await addTrackingEvent(orderId, {
                    event: "Courier Assigned & Dispatched",
                    courier: logistics.courier,
                    trackingNumber: logistics.tracking,
                    location: "Warehouse"
                });
                
                // Clear the input fields for this order
                setLogisticsData(prev => {
                    const next = { ...prev };
                    delete next[orderId];
                    return next;
                });
            }
        });
    };

    const handleProcessRefund = (orderId) => {
        confirm(`Mark Order #${String(orderId).slice(-6)} as Received & Refunded?`, async () => {
            if (updateOrderStatus) {
                await updateOrderStatus(orderId, 'Refund Processed');
                               await addTrackingEvent(orderId, {
                    event: 'Refund Processed',                  
                    location: "Warehouse"
                });
            }
        });
    };

    const handleDeleteOrder = (orderId) => {
        confirm(`Are you absolutely sure you want to delete Order #${String(orderId).slice(-6)}? This cannot be undone.`, async () => {
            if (deleteOrder) {
                await deleteOrder(orderId);
            }
        });
    };

    return (
        <div className="space-y-6 p-4 mx-auto">
            {/* Header Section with Toggle Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-white/5 pb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-white tracking-tight">Order Operations</h2>
                    <p className="text-white/40 text-xs font-light mt-1">Fulfillment pipeline, logistics tracking, and verifications.</p>
                </div>
                
                {/* Toggle Group */}
                <div className="flex bg-[#1A1A1A] p-1 rounded-sm border border-white/10 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('attendance')}
                        className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            activeTab === 'attendance' 
                            ? 'bg-[#D4AF37] text-black shadow-sm' 
                            : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <AlertTriangle size={12} className={activeTab === 'attendance' ? 'text-black' : 'text-white/50'} />
                        Needs Attention ({attendanceOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            activeTab === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'text-white/50 hover:text-white border border-transparent'
                        }`}
                    >
                        <CheckCircle2 size={12} />
                        Completed ({completedOrders.length})
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-2">
                {displayOrders.length === 0 ? (
                    <div className="text-center py-12 border border-white/5 border-dashed rounded-sm bg-[#111111]">
                        <Package className="mx-auto h-8 w-8 text-white/20 mb-3" />
                        <p className="text-white/50 text-xs uppercase tracking-widest font-bold">No orders found in this category</p>
                    </div>
                ) : (
                    displayOrders.map(o => {
                        const isReturn = o.status?.includes('Return') || o.status?.includes('Refund');
                        const isDelivered = o.status === 'Delivered';
                        
                        const badgeNode = (
                            <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold flex items-center gap-1 w-fit ${
                                isReturn ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                isDelivered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                            }`}>
                                {isReturn && <AlertTriangle size={10} />}
                                {isDelivered && <CheckCircle2 size={10} />}
                                {o.status}
                            </span>
                        );

                        return (
                            <Accordion
                                key={o.id}
                                icon={isReturn ? CornerDownLeft : ShoppingCart}
                                title={`Order #${o.orderNumber || String(o.id).slice(-6)}`}
                                badge={badgeNode}
                                isOpen={expandedOrderId === o.id}
                                onToggle={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                                rightElement={<span className={`font-serif text-sm mr-4 ${isReturn ? 'text-red-400' : 'text-white'}`}>R {(o.totalAmount || o.total || 0).toLocaleString()}</span>}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                    {/* Action Column */}
                                    <div className="space-y-6 flex flex-col">
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Update Status</p>
                                            <select 
                                                className={inputClass} 
                                                value={o.status} 
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                            >
                                                <option value="Payment Pending">Payment Pending</option>
                                                <option value="paid">Payment Verified (Paid)</option>
                                                <option value="Vault Packaging">Vault Packaging</option>
                                                <option value="Courier Assigned">Courier Assigned</option>
                                                <option value="In Transit">In Transit</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Return Requested">Return Requested</option>
                                                <option value="Refund Processed">Refund Processed</option>
                                            </select>
                                        </div>

                                        {o.fulfillment === 'ship' && !isDelivered && !isReturn && (
                                            <div className="bg-[#1A1A1A] p-4 rounded-sm border border-white/5 space-y-3">
                                                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"><Truck size={12} /> Advanced Logistics</p>
                                                <input 
                                                    type="text" 
                                                    placeholder="Courier Company (e.g. The Courier Guy)" 
                                                    className={inputClass} 
                                                    value={logisticsData[o.id]?.courier || ''} 
                                                    onChange={e => setLogisticsData({ ...logisticsData, [o.id]: { ...(logisticsData[o.id] || {}), courier: e.target.value } })} 
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Tracking Number" 
                                                    className={inputClass} 
                                                    value={logisticsData[o.id]?.tracking || ''} 
                                                    onChange={e => setLogisticsData({ ...logisticsData, [o.id]: { ...(logisticsData[o.id] || {}), tracking: e.target.value } })} 
                                                />
                                                <button 
                                                    onClick={() => handleUpdateLogistics(o.id)} 
                                                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors border border-white/10 mt-2"
                                                >
                                                    Assign & Dispatch
                                                </button>
                                            </div>
                                        )}

                                        {isReturn && (
                                            <div className="bg-red-500/5 p-4 rounded-sm border border-red-500/20 space-y-3 mt-4">
                                                <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"><CornerDownLeft size={12} /> Return Authorization</p>
                                                <p className="text-white/60 text-xs">Client has requested a return. Await receipt of item before processing refund.</p>
                                                {o.status === 'Return Requested' && (
                                                    <button 
                                                        onClick={() => handleProcessRefund(o.id)} 
                                                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors border border-red-500/30 mt-2"
                                                    >
                                                        Mark as Received & Refunded
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Spacer to push Delete button to bottom if desired */}
                                        <div className="flex-1"></div>

                                        <button 
                                            onClick={() => handleDeleteOrder(o.id)} 
                                            className="w-fit flex items-center gap-2 text-red-500/60 hover:text-red-500 text-[10px] uppercase tracking-widest font-bold transition-colors mt-4"
                                        >
                                            <Trash2 size={12} /> Delete Order
                                        </button>
                                    </div>

                                    {/* Details Column */}
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Client Details</p>
                                        <div className="bg-[#1A1A1A] p-3 rounded-sm border border-white/5 text-xs text-white/80 space-y-2">
                                            <p><span className="text-white/40 w-16 inline-block">Date:</span> {formatOrderDate(o.createdAt || o.date)}</p>
                                            <p><span className="text-white/40 w-16 inline-block">Name:</span> {o.shippingAddress?.name || o.userData?.name}</p>
                                            <p><span className="text-white/40 w-16 inline-block">Mobile:</span> {o.shippingAddress?.mobile || o.userData?.phone}</p>
                                            <p className="flex items-start"><span className="text-white/40 w-16 inline-block shrink-0">Address:</span> <span className="whitespace-pre-wrap">
                                                {o.shippingAddress ?
                                                    `${o.shippingAddress.street}, ${o.shippingAddress.suburb || ''}, ${o.shippingAddress.city}, ${o.shippingAddress.postalCode}`
                                                    : o.userData?.address}
                                            </span></p>
                                        </div>
                                    </div>

                                    {/* Manifest Column */}
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Manifest</p>
                                        <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                                            {o.items.map((it, i) => (
                                                <div key={i} className="flex gap-3 items-center bg-[#1A1A1A] p-2 rounded-sm border border-white/5">
                                                    <img src={it.image || FALLBACK_IMG} className="w-8 h-10 object-cover rounded-sm bg-black" alt="" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white text-xs truncate">{it.title || it.name}</p>
                                                        <p className="text-white/40 text-[9px]">Qty: {it.quantity} | {it.type || 'Item'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white text-xs">R {(it.subtotal || (it.quantity * (it.unitPrice || it.price)) || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                                                <span className="text-white/40 text-xs">Subtotal</span>
                                                <span className="text-white text-xs">R {(o.subtotal || o.totalAmount || o.total || 0).toLocaleString()}</span>
                                            </div>
                                            {o.shippingFee > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/40 text-xs">Shipping Fee</span>
                                                    <span className="text-white text-xs">R {o.shippingFee.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Accordion>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default OrderPage;