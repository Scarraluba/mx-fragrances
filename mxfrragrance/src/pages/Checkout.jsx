/**
 * Project: mxfrragrance
 * Created: 2026/05/14 22:00
 * Author: Scarra Luba
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Route, Routes, Link, NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Search, ShoppingBag, X, Menu, Plus, Minus, Trash2, Zap,
  ChevronRight, Send, Lock, ArrowLeft, CheckCircle2,
  Sparkles, Phone, MapPin, Truck, Heart, Award, SlidersHorizontal, Filter, User, ArrowRight, LogOut,
  Star, StarHalf, ThumbsUp, ChevronDown, ChevronUp
} from 'lucide-react';
import { checkoutCart } from "../helpers/Checkout.js";
import { getUserAddresses, createAddress } from "../helpers/Account.js";
import useAuthContext from "../context/auth/useAuthContext.jsx";
import useAppContext from "../context/app/UseAppContext.jsx";
import { AnimatePresence, motion } from 'framer-motion'
function formatRand(amount) {
  try { return `R ${Number(amount).toLocaleString()}`; } catch { return `R ${amount}`; }
}
const Checkout = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuthContext();
  const { cart } = useAppContext();

  const useId = user?.uid;
  const [savedAddresses, setAddresses] = useState([]);
  const primaryAddress = savedAddresses?.find(address => address.isPrimary === true);

  const [formData, setFormData] = useState({
    name: userData?.fullName || "",
    phone: userData?.phoneNumber || "",
    fulfillment: "ship",
    selectedAddressId: primaryAddress?.id ? primaryAddress.id : (savedAddresses.length > 0 ? savedAddresses[0].id : null),
    shippingOption: "standard",
    collectionPoint: "sandton_vault",
    paymentMethod: "card"
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    mobile: "",
    street: "",
    complex: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: ""
  });

  const provinces = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];

  useEffect(() => {

    const load = async () => {
      const res = await getUserAddresses(useId);
      if (res.success) setAddresses(res.data);
    };

    load();
  }, [useId]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.unitPrice ?? item.price ?? 0) * item.quantity, 0), [cart]);

  const shippingFee = useMemo(() => {
    if (formData.fulfillment !== "ship") return 0;
    return formData.shippingOption === "overnight" ? 199 : 99;
  }, [formData.fulfillment, formData.shippingOption]);

  const total = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);
  const shippingLabel = formData.shippingOption === "overnight" ? "Overnight" : "Standard";
  const collectionLabel = "Vault Collection";
  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const setFulfillment = (mode) => setFormData((prev) => mode === "collect" ? { ...prev, fulfillment: "collect", address: "", collectionPoint: prev.collectionPoint || "sandton_vault" } : { ...prev, fulfillment: "ship", shippingOption: prev.shippingOption || "standard" });


  const handleSubmit = async (e) => {

    e.preventDefault();

 
    let shippingAddress = null;

    let deliveryMethod = "Collection";

    if (formData.fulfillment === "ship") {

      const selected =primaryAddress;

      if (!selected) {
        return;
      }


      shippingAddress = {
        ...selected
      };

      deliveryMethod =
        formData.shippingOption === "overnight"
          ? "Priority Overnight (Main Centers)"
          : "Standard Courier (Insured)";
    }

    const result = await checkoutCart({

      userId: useId,

      fulfillment: formData.fulfillment,

      shippingAddress,

      deliveryMethod,

      paymentMethod: formData.paymentMethod,

      shippingFee

    });

    if (!result.success) {
      console.error(result.message);
      return;
    }

    console.log("ORDER CREATED:", result);

    navigate(`/order/${result.orderId}`);

  };
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    await createAddress(useId, newAddress);
    setIsAddingAddress(false);
    setNewAddress({
      name: "", mobile: "", street: "", complex: "", suburb: "", city: "", province: "", postalCode: ""
    });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 pb-24 container mx-auto px-6 min-h-screen text-left">
      <h1 className="text-4xl text-white font-serif mb-12">Secure Checkout Protocol</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 space-y-6 border border-white/5 shadow-2xl rounded-sm">
          <div className="space-y-2">
            <label className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2"><Truck size={12} /> Fulfillment</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFulfillment("ship")} className={["p-4 rounded-sm border text-xs uppercase tracking-[0.2em] font-bold transition-colors", formData.fulfillment === "ship" ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"].join(" ")}>Ship to me</button>
              <button type="button" onClick={() => setFulfillment("collect")} className={["p-4 rounded-sm border text-xs uppercase tracking-[0.2em] font-bold transition-colors", formData.fulfillment === "collect" ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"].join(" ")}>Collect</button>
            </div>
          </div>

          {formData.fulfillment === "ship" && (
            <>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Shipping Address</label>
                  {!isAddingAddress && (
                    <button type="button" onClick={() => setIsAddingAddress(true)} className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 hover:text-white transition-colors"><Plus size={12} /> Add New</button>
                  )}
                </div>

                {isAddingAddress ? (
                  <div className="bg-black/40 border border-[#D4AF37]/30 p-4 rounded-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">New Address Details</p>
                      <button type="button" onClick={() => setIsAddingAddress(false)} className="text-white/40 hover:text-white"><X size={14} /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Recipient Name" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                      <input type="tel" placeholder="Mobile Number" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.mobile} onChange={e => setNewAddress({ ...newAddress, mobile: e.target.value })} />
                    </div>
                    <input type="text" placeholder="Street Address" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Complex / Unit (Optional)" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.complex} onChange={e => setNewAddress({ ...newAddress, complex: e.target.value })} />
                      <input type="text" placeholder="Suburb" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.suburb} onChange={e => setNewAddress({ ...newAddress, suburb: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input type="text" placeholder="City" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      <select className="w-full bg-black/50 border border-white/10 p-3 text-white/70 text-sm appearance-none rounded-sm" value={newAddress.province} onChange={e => setNewAddress({ ...newAddress, province: e.target.value })}>
                        <option value="">Select Province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input type="text" placeholder="Postal Code" className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm rounded-sm" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                    </div>
                    <button type="button" onClick={handleSaveNewAddress} className="w-full bg-white text-black py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-colors rounded-sm mt-2">Save Address</button>
                  </div>)

                  : (
                    <div className="space-y-3">
                      {savedAddresses.length === 0 ? (
                        <div className="text-center p-6 border border-white/10 border-dashed rounded-sm text-white/40 text-sm">
                          No saved addresses. Please add one above.
                        </div>
                      ) : (
                        savedAddresses.map(addr => (
                          <label key={addr.id} className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-colors ${formData.selectedAddressId === addr.id ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-black/30 hover:border-white/30'}`}>
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.selectedAddressId === addr.id ? 'border-[#D4AF37]' : 'border-white/40'}`}>
                              {formData.selectedAddressId === addr.id &&
                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{addr.name}
                                <span className="text-white/40 text-xs ml-2">{addr.mobile}</span></p>
                              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                                {addr.street}{addr.complex ? `, ${addr.complex}` : ''}<br />
                                {addr.suburb}, {addr.city}<br />
                                {addr.province}, {addr.postalCode}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  )}
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2"><Truck size={12} /> Shipping Option</label>
                <div className="relative">
                  <select className="w-full bg-black/50 border border-white/10 p-4 text-white/70 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none rounded-sm" value={formData.shippingOption} onChange={(e) => setField("shippingOption", e.target.value)}>
                    <option value="standard">Standard Courier (Insured)</option>
                    <option value="overnight">Priority Overnight (Main Centers)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20"><ChevronRight size={16} className="rotate-90" /></div>
                </div>
              </div>
            </>

          )}

          {formData.fulfillment === "collect" && (
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Collection Point</label>
              <div className="relative">
                <select className="w-full bg-black/50 border border-white/10 p-4 text-white/70 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none rounded-sm" value={formData.collectionPoint} onChange={(e) => setField("collectionPoint", e.target.value)}>
                  <option value="sandton_vault">Collection (Lifestyle Center)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20"><ChevronRight size={16} className="rotate-90" /></div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 space-y-4">
            <label className="text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-2"><Lock size={12} /> Secure Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setField("paymentMethod", "card")} className={["p-3 rounded-sm border text-[10px] uppercase tracking-widest font-bold transition-colors text-center", formData.paymentMethod === "card" ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"].join(" ")}>Card</button>
              <button type="button" onClick={() => setField("paymentMethod", "eft")} className={["p-3 rounded-sm border text-[10px] uppercase tracking-widest font-bold transition-colors text-center", formData.paymentMethod === "eft" ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"].join(" ")}>EFT</button>
              <button type="button" onClick={() => setField("paymentMethod", "payfast")} className={["p-3 rounded-sm border text-[10px] uppercase tracking-widest font-bold transition-colors text-center", formData.paymentMethod === "payfast" ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80"].join(" ")}>PayFast</button>
            </div>

            {formData.paymentMethod === "eft" && (
              <div className="bg-white/5 border border-[#D4AF37]/30 p-4 rounded-sm mt-4">
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold mb-2">EFT Transfer Details</p>
                <pre className="text-white/70 font-sans text-sm whitespace-pre-wrap">{/*settings.bankDetails*/}</pre>
                <p className="text-white/40 text-[9px] uppercase tracking-widest mt-3">Order will be dispatched upon cleared funds.</p>
              </div>
            )}

            {formData.paymentMethod === "card" && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-sm mt-4 text-center">
                <p className="text-white/60 text-sm font-light">You will be redirected to our secure 3D-Secure payment gateway.</p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button type="submit" disabled={cart.length === 0} className="w-full bg-[#D4AF37] text-black py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C19A2E] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">Place Secure Order <ArrowRight size={16} /></button>
            <p className="text-center text-[9px] text-white/30 uppercase mt-4 tracking-widest">By placing your order, you agree to our curation protocols.</p>
          </div>
        </form>

        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden sticky top-32">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-serif text-white flex items-center gap-2"><ShoppingBag size={18} /> Selection Summary</h2>
          </div>
          <div className="p-6 border-b border-white/10 bg-black/20">
            {
              cart.length === 0 ? (
                <div className="text-center py-6 text-white/40 italic font-serif">Selection is empty</div>
              ) : (
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-4">Assets for Delivery</p>
                  <div className="flex flex-wrap items-center -space-x-4 py-2 pl-2">
                    {cart.map((i, idx) => (
                      <div key={i.key} className="relative w-16 h-20 bg-zinc-900 rounded-sm overflow-hidden border border-white/20 shadow-2xl transition-transform hover:-translate-y-2 hover:z-50" style={{ zIndex: cart.length - idx }}>
                        <img src={i.image} className="w-full h-full object-cover" alt="" title={`${i.quantity}x ${i.kind === 'combo' ? i.title : i.name}`} />
                        {i.quantity > 1 && (
                          <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                            x{i.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-6">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Total Units
                  </p>
                </div>
              )
            }
          </div>
          <div className="p-6 border-t border-white/10 bg-zinc-900 space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-white/60 uppercase tracking-widest text-[10px]">Subtotal</span>
              <span className="text-white font-light italic">R {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-white/60 uppercase tracking-widest text-[10px]">Shipping</span>
              <span className="text-white/30 ml-2 normal-case tracking-normal text-[10px]">({formData.fulfillment === "collect" ? collectionLabel : shippingLabel})</span>
              <span className="text-white font-light italic">R {shippingFee.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center"><span className="text-white text-lg font-serif">Total Valuation</span><span className="text-[#D4AF37] text-xl font-serif">R {total.toLocaleString()}</span></div>
            {/* */}</div>
        </div>
      </div>
    </motion.div>
  );

};

export default Checkout;