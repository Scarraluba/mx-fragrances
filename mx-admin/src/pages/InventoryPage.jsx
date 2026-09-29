/**
 * Project: mx-admin
 * Created: 2026/05/15 20:10
 * Author: Scarra Luba
 */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ArrowDown, Filter, ArrowUp, ArrowUpDown, ChevronRight, Edit, Plus, Search, Settings2, Trash2, Upload, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createProduct, updateProduct, listenProducts,createCombo,updateCombo,listenCombos } from "../helpers/Inventory.js";

const SHARED_CLASSES = {
    inputClass: "w-full bg-[#1A1A1A] border border-white/10 p-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm shadow-inner",
    labelClass: "text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1.5 block",
    btnClass: "bg-[#D4AF37] text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    cardClass: "bg-[#111111] border border-white/5 rounded-sm p-5 shadow-lg relative overflow-hidden"
};

// Dummy helper for notifications if needed, preventing breaks
const showToast = (msg, type) => console.log(`[${type.toUpperCase()}]: ${msg}`);

const FALLBACK_IMG = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";

const InventoryPage = () => {
    const { inputClass, labelClass, btnClass } = SHARED_CLASSES;

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem("mx_vault_settings_v2");
        const parsed = saved ? JSON.parse(saved) : {};
        return {
            categories: parsed.categories || ['Niche', 'Designer', 'Rare', 'Bundle'],
            types: parsed.types || ['Cologne', 'Perfume', 'EDP', 'EDT', 'Parfum'],
            priceRanges: parsed.priceRanges || [
                { label: 'Under R3,000', min: 0, max: 3000 },
                { label: 'R3,000 - R7,000', min: 3000, max: 7000 },
                { label: 'R7,000 - R15,000', min: 7000, max: 15000 },
                { label: 'R15,000+', min: 15000, max: 1000000 }
            ],
        };
    });

    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);

    // View State
    const [view, setView] = useState('assets');
    const [groupMode, setGroupMode] = useState('grouped');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Submission guard state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'brand', dir: 'asc' });

    // Expandables & Editors
    const [expandedBrand, setExpandedBrand] = useState(null);
    const [expandedCombo, setExpandedCombo] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCombo, setEditingCombo] = useState(null);
    
    // Combo sub-selectors
    const [selectedProdId, setSelectedProdId] = useState('');
    const [selectedSku, setSelectedSku] = useState('');

    const [confirmDialogState, setConfirmDialogState] = useState({ message: '', onConfirm: null });

    const sortMenuRef = useRef(null);

    useEffect(() => {
        const unsub = listenProducts((response) => {
            if (response.success) {
                setProducts(response.data);
            } else {
                showToast(response.message, "error");
            }
        });

        return () => {
            if (typeof unsub === "function") {
                unsub();
            }
        };
    }, []);

        useEffect(() => {
        const unsub = listenCombos((response) => {
            if (response.success) {
                setCombos(response.data);
            } else {
                showToast(response.message, "error");
            }
        });

        return () => {
            if (typeof unsub === "function") {
                unsub();
            }
        };
    }, []);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sortFn = (a, b) => {
        let valA, valB;
        if (sortConfig.key === 'price') {
            valA = a.variants?.[0]?.price || 0;
            valB = b.variants?.[0]?.price || 0;
        } else if (sortConfig.key === 'stock') {
            valA = a.variants?.reduce((s, v) => s + v.stock, 0) || 0;
            valB = b.variants?.reduce((s, v) => s + v.stock, 0) || 0;
        } else {
            valA = a[sortConfig.key]?.toString().toLowerCase() || '';
            valB = b[sortConfig.key]?.toString().toLowerCase() || '';
        }
        if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower) || p.variants?.some(v => v.sku.toLowerCase().includes(lower)));
        }
        if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
        if (typeFilter) result = result.filter(p => p.type === typeFilter);
        if (priceFilter) {
            const rangeObj = (settings?.priceRanges || []).find(r => r.label === priceFilter);
            if (rangeObj) {
                result = result.filter(p => p.variants?.some(v => v.price >= rangeObj.min && v.price <= rangeObj.max));
            }
        }
        return result;
    }, [products, searchTerm, categoryFilter, typeFilter, priceFilter, settings]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        filteredProducts.forEach(p => {
            if (!groups[p.brand]) groups[p.brand] = [];
            groups[p.brand].push(p);
        });
        
        Object.keys(groups).forEach(brand => {
            groups[brand].sort(sortFn);
        });

        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [filteredProducts, sortConfig]);

    const flatProducts = useMemo(() => {
        let result = [...filteredProducts];
        if (sortConfig.key) {
            result.sort(sortFn);
        }
        return result;
    }, [filteredProducts, sortConfig]);

    // FIXED: Convert both to String to safely handle alphanumeric DB IDs
    const activeComboProd = products.find(p => String(p.id) === String(selectedProdId));

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
        setShowSortDropdown(false);
    };

    const handleImageUpload = (e, obj, setter, field) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setter({ ...obj, [field]: reader.result });
        reader.readAsDataURL(file);
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (editingProduct.id) {
                // If updateProduct is an async lifecycle helper, await it here
               
                    await updateProduct(editingProduct.id,editingProduct);
               
             //   setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
            } else {
                const newProduct = await createProduct(editingProduct);
               // setProducts(prev => [{ ...editingProduct, id: Date.now() }, ...prev]);
            }
            setEditingProduct(null);
        } catch (error) {
            showToast("Failed to lock asset modifications into records.", "error");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveCombo = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Simulated asynchronous validation/processing delay if needed
            if (editingCombo.id) {
               await updateCombo(editingCombo.id,editingCombo);
            } else {
                await createCombo(editingCombo); // If createCombo is async, await it here
            }
            setEditingCombo(null);
        } catch (error) {
            showToast("Failed to compile layout modifications.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdd = () => {
        if (view === 'assets') {
            setEditingProduct({ brand: '', name: '', category: settings?.categories?.[0] || 'Niche', type: settings?.types?.[0] || 'EDP', description: '', status: 'Available', isFeatured: false, isTester: false, variants: [] });
        } else {
            setEditingCombo({ title: '', description: '', discountPrice: 0, active: true, badge: '', items: [] });
        }
    };

    const sortOptions = [
        ...(groupMode === 'flat' ? [
            { label: 'Brand (A-Z)', key: 'brand', dir: 'asc' },
            { label: 'Brand (Z-A)', key: 'brand', dir: 'desc' },
        ] : []),
        { label: 'Name (A-Z)', key: 'name', dir: 'asc' },
        { label: 'Name (Z-A)', key: 'name', dir: 'desc' },
        { label: 'Price (Low-High)', key: 'price', dir: 'asc' },
        { label: 'Price (High-Low)', key: 'price', dir: 'desc' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] w-full text-white font-sans">
            <div className="space-y-4 md:space-y-6 w-full mx-auto p-2 md:p-6 pb-24">
                
                {/* --- DESKTOP HEADER --- */}
                <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                    <div>
                        <h2 className="text-2xl font-serif text-white tracking-tight">Vault Inventory Lifecycle</h2>
                        <p className="text-white/40 text-xs font-light mt-1 mb-4">Manage catalog, metadata, and combo pairings.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setView('assets')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-2 border-b-2 ${view === 'assets' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Single Assets</button>
                            <button onClick={() => setView('bundles')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-2 border-b-2 ${view === 'bundles' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Curated Bundles</button>
                        </div>
                    </div>
                    <button onClick={handleAdd} className={btnClass + " flex items-center gap-2 shrink-0"}><Plus size={14}/> Add {view === 'assets' ? 'Asset' : 'Bundle'}</button>
                </div>

                {/* --- MOBILE NAVBAR --- */}
                <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0a] border-b border-white/5 pb-3 pt-2 px-1">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-3 mt-1">
                            <button onClick={() => setView('assets')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-1 border-b-2 ${view === 'assets' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Single Assets</button>
                            <button onClick={() => setView('bundles')} className={`text-[10px] uppercase tracking-widest font-bold transition-all pb-1 border-b-2 ${view === 'bundles' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/40 hover:text-white'}`}>Curated Bundles</button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {view === 'assets' && (
                                <>
                                    <button onClick={() => setShowSearch(!showSearch)} className="w-9 h-9 flex items-center justify-center bg-[#1A1A1A] border border-white/10 text-white/60 rounded-sm hover:text-white transition-colors">
                                        <Search size={16} />
                                    </button>
                                    <button onClick={() => setShowMobileFilters(true)} className="w-9 h-9 flex items-center justify-center bg-[#1A1A1A] border border-white/10 text-[#D4AF37] rounded-sm hover:bg-[#D4AF37]/10 transition-colors relative">
                                        <Settings2 size={16} />
                                        {(categoryFilter || typeFilter || priceFilter) && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                                    </button>
                                </>
                            )}
                            <button onClick={handleAdd} className="w-9 h-9 flex items-center justify-center bg-[#D4AF37] text-black rounded-sm shadow-sm transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Collapsible Search */}
                    <AnimatePresence>
                        {showSearch && view === 'assets' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input autoFocus type="text" placeholder="Search vault..." className="w-full bg-[#1A1A1A] border border-white/10 p-2.5 pl-9 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm shadow-inner" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setGroupMode('flat'); }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- MOBILE FILTERS OVERLAY --- */}
                <AnimatePresence>
                    {showMobileFilters && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm p-4 flex flex-col md:hidden">
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                <h3 className="text-white font-serif text-lg flex items-center gap-2"><Filter size={18} className="text-[#D4AF37]"/> View & Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="text-white/50 hover:text-white p-2"><X size={20}/></button>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto">
                                <div>
                                    <label className={labelClass}>View Mode</label>
                                    <div className="flex bg-[#1A1A1A] border border-white/10 rounded-sm overflow-hidden text-[10px] uppercase tracking-widest font-bold">
                                        <button onClick={() => setGroupMode('grouped')} className={`flex-1 px-4 py-3 transition-colors ${groupMode === 'grouped' ? 'bg-[#D4AF37] text-black' : 'text-white/40 hover:text-white'}`}>Brand Folders</button>
                                        <button onClick={() => setGroupMode('flat')} className={`flex-1 px-4 py-3 transition-colors ${groupMode === 'flat' ? 'bg-[#D4AF37] text-black' : 'text-white/40 hover:text-white'}`}>All Assets</button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select className={inputClass} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setGroupMode('flat'); }}>
                                            <option value="">All Categories</option>
                                            {(settings?.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Type</label>
                                        <select className={inputClass} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setGroupMode('flat'); }}>
                                            <option value="">All Types</option>
                                            {(settings?.types || []).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Price Range</label>
                                        <select className={inputClass} value={priceFilter} onChange={e => { setPriceFilter(e.target.value); setGroupMode('flat'); }}>
                                            <option value="">All Prices</option>
                                            {(settings?.priceRanges || []).map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 mt-4 flex gap-3">
                                <button onClick={() => { setCategoryFilter(''); setTypeFilter(''); setPriceFilter(''); }} className="flex-1 py-3 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-bold rounded-sm">Reset</button>
                                <button onClick={() => setShowMobileFilters(false)} className="flex-[2] bg-[#D4AF37] text-black text-[10px] uppercase tracking-widest font-bold rounded-sm py-3">Apply & Close</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {view === 'assets' && (
                    <div className="space-y-4">
                        
                        {/* DESKTOP FILTER BAR */}
                        <div className="hidden md:flex flex-wrap lg:flex-nowrap justify-between items-center gap-4 bg-[#111111] p-4 border border-white/5 rounded-sm shadow-lg">
                            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-white/10 rounded-sm px-4 py-2.5 w-full lg:w-80 transition-colors focus-within:border-[#D4AF37]/50 shrink-0">
                                <Search size={16} className="text-white/40" />
                                <input type="text" placeholder="Search vault by brand, name..." className="bg-transparent border-none text-white text-xs focus:outline-none w-full" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setGroupMode('flat'); }} />
                            </div>
                            <div className="flex gap-2 flex-wrap flex-1 justify-start lg:justify-center">
                                <select className={`${inputClass} !py-2 !text-[10px] uppercase tracking-widest min-w-[120px] max-w-[20%] flex-1 lg:flex-none`} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setGroupMode('flat'); }}>
                                    <option value="">All Categories</option>
                                    {(settings?.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className={`${inputClass} !py-2 !text-[10px] uppercase tracking-widest min-w-[120px] max-w-[20%] flex-1 lg:flex-none`} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setGroupMode('flat'); }}>
                                    <option value="">All Types</option>
                                    {(settings?.types || []).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select className={`${inputClass} !py-2 !text-[10px] uppercase tracking-widest min-w-[120px] max-w-[20%] flex-1 lg:flex-none`} value={priceFilter} onChange={e => { setPriceFilter(e.target.value); setGroupMode('flat'); }}>
                                    <option value="">All Prices</option>
                                    {(settings?.priceRanges || []).map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="flex bg-[#1A1A1A] border border-white/10 rounded-sm overflow-hidden text-[10px] uppercase tracking-widest font-bold shrink-0 w-full lg:w-auto">
                                <button onClick={() => setGroupMode('grouped')} className={`flex-1 lg:flex-none px-6 py-2.5 transition-colors ${groupMode === 'grouped' ? 'bg-[#D4AF37] text-black' : 'text-white/40 hover:text-white'}`}>Brand Folders</button>
                                <button onClick={() => setGroupMode('flat')} className={`flex-1 lg:flex-none px-6 py-2.5 transition-colors ${groupMode === 'flat' ? 'bg-[#D4AF37] text-black' : 'text-white/40 hover:text-white'}`}>All Assets</button>
                            </div>
                        </div>

                        {/* DESKTOP/MOBILE SORTING ROW */}
                        <div className="flex justify-between items-center px-1">
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold hidden md:block">
                                {filteredProducts.length} Assets Found
                            </p>
                            <div className="relative ml-auto" ref={sortMenuRef}>
                                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 text-white/60 hover:text-white text-[10px] uppercase tracking-widest font-bold bg-[#1A1A1A] md:bg-transparent border border-white/10 md:border-none px-3 py-2 md:px-0 md:py-0 rounded-sm transition-colors">
                                    <span>Sort By: {sortOptions.find(o => o.key === sortConfig.key && o.dir === sortConfig.dir)?.label || 'Custom'}</span>
                                    <ArrowUpDown size={12} className={showSortDropdown ? "text-[#D4AF37]" : ""} />
                                </button>
                                
                                <AnimatePresence>
                                    {showSortDropdown && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-full mt-2 w-48 bg-[#111111] border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden">
                                            {sortOptions.map(opt => (
                                                <button key={`${opt.key}-${opt.dir}`} onClick={() => { setSortConfig({ key: opt.key, dir: opt.dir }); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortConfig.key === opt.key && sortConfig.dir === opt.dir ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ASSETS LIST */}
                        {groupMode === 'grouped' ? (
                            groupedProducts.map(([brand, brandProducts]) => (
                                <div key={brand} className="bg-[#111111] border border-white/5 rounded-sm overflow-hidden shadow-lg">
                                    <div className="bg-[#1A1A1A] border-b border-white/10 px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedBrand(expandedBrand === brand ? null : brand)}>
                                        <div className="flex items-center gap-3">
                                            <ChevronRight size={16} className={`text-white/40 transition-transform ${expandedBrand === brand ? 'rotate-90 text-white' : ''}`} />
                                            <h3 className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-xs">{brand}</h3>
                                        </div>
                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{brandProducts.length} Assets</span>
                                    </div>
                                    <AnimatePresence>
                                        {expandedBrand === brand && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                
                                                {/* Mobile Inline List */}
                                                <div className="md:hidden divide-y divide-white/5">
                                                    {brandProducts.map(p => {
                                                        const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                                                        const basePrice = p.variants?.[0]?.price || 0;
                                                        return (
                                                            <div key={p.id} className="p-3 flex items-center justify-between gap-3 bg-[#0a0a0a]">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <img src={p.image || FALLBACK_IMG} className="w-10 h-10 object-cover rounded-sm bg-[#1A1A1A] shrink-0" alt=""/>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="text-white font-serif text-sm truncate">{p.name}</p>
                                                                            {p.isFeatured && <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold shrink-0">Featured</span>}
                                                                            {p.isTester && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold shrink-0">Tester</span>}
                                                                            <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">({totalStock} in stock)</span>
                                                                        </div>
                                                                        <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest truncate mt-0.5">R {basePrice.toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1 shrink-0">
                                                                    <button onClick={() => setEditingProduct(p)} className="text-white/40 hover:text-white p-2 transition-colors rounded-sm"><Edit size={14}/></button>
                                                                    <button onClick={() => setConfirmDialogState({ message: `Delete asset ${p.name}?`, onConfirm: () => setProducts(products.filter(x => x.id !== p.id))})} className="text-white/40 hover:text-red-400 p-2 transition-colors rounded-sm"><Trash2 size={14}/></button>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Desktop Table */}
                                                <div className="hidden md:block overflow-x-auto">
                                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                                        <thead className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30 bg-[#141414]">
                                                            <tr><th className="p-4 font-bold">Asset</th><th className="p-4 font-bold">Category</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Stock Info</th><th className="p-4 font-bold text-right">Actions</th></tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                        {brandProducts.map(p => {
                                                            const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                                                            return (
                                                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                                    <td className="p-4 flex items-center gap-3">
                                                                        <img src={p.image || FALLBACK_IMG} className="w-10 h-12 object-cover rounded-sm bg-[#1A1A1A] shrink-0" alt=""/>
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                                <p className="text-white font-serif">{p.name}</p>
                                                                                {p.isFeatured && <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">Featured</span>}
                                                                                {p.isTester && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">Tester</span>}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 text-white/70 text-xs">{p.category} · {p.type}</td>
                                                                    <td className="p-4"><span className={`px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest font-bold ${p.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{p.status}</span></td>
                                                                    <td className="p-4 text-white/70 text-xs"><span>{p.variants?.length || 0} Sizes (Total: {totalStock})</span></td>
                                                                    <td className="p-4 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => setEditingProduct(p)} className="text-white/40 hover:text-white p-2 transition-colors inline-flex rounded-sm"><Edit size={14}/></button>
                                                                            <button onClick={() => setConfirmDialogState({ message: `Delete asset ${p.name}?`, onConfirm: () => setProducts(products.filter(x => x.id !== p.id))})} className="text-white/40 hover:text-red-400 p-2 transition-colors inline-flex rounded-sm"><Trash2 size={14}/></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="bg-transparent border border-white/10 rounded-sm overflow-hidden">
                                {/* Mobile Inline List for Flat View */}
                                <div className="md:hidden divide-y divide-white/5 bg-transparent">
                                    {flatProducts.map(p => {
                                        const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                                        const basePrice = p.variants?.[0]?.price || 0;
                                        return (
                                            <div key={p.id} className="p-3 flex items-center justify-between gap-3 bg-transparent hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img src={p.image || FALLBACK_IMG} className="w-10 h-10 object-cover rounded-sm bg-[#1A1A1A] shrink-0" alt=""/>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[#D4AF37] font-bold text-[9px] uppercase tracking-widest truncate">{p.brand}</p>
                                                            <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">({totalStock} in stock)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                            <p className="text-white font-serif text-sm truncate">{p.name}</p>
                                                            {p.isFeatured && <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold shrink-0">Featured</span>}
                                                            {p.isTester && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold shrink-0">Tester</span>}
                                                        </div>
                                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">R {basePrice.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => setEditingProduct(p)} className="text-white/40 hover:text-white p-2 transition-colors rounded-sm"><Edit size={14}/></button>
                                                    <button onClick={() => setConfirmDialogState({ message: `Delete asset ${p.name}?`, onConfirm: () => setProducts(products.filter(x => x.id !== p.id))})} className="text-white/40 hover:text-red-400 p-2 transition-colors rounded-sm"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {flatProducts.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">No assets found matching criteria.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Table for Flat View */}
                                <div className="hidden md:block overflow-x-auto bg-transparent">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-transparent border-b border-white/10 text-[10px] uppercase tracking-widest text-white/50">
                                        <tr>
                                            <th className="p-4 font-bold">Asset</th>
                                            <th className="p-4 font-bold">Brand</th>
                                            <th className="p-4 font-bold">Base Valuation</th>
                                            <th className="p-4 font-bold">Total Supply</th>
                                            <th className="p-4 font-bold">Status</th>
                                            <th className="p-4 font-bold text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                        {flatProducts.map(p => {
                                            const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                                            const basePrice = p.variants?.[0]?.price || 0;
                                            return (
                                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img src={p.image || FALLBACK_IMG} className="w-10 h-12 object-cover rounded-sm bg-[#1A1A1A] shrink-0" alt=""/>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="text-white font-serif">{p.name}</p>
                                                                {p.isFeatured && <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">Featured</span>}
                                                                {p.isTester && <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">Tester</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">{p.brand}</td>
                                                    <td className="p-4 text-white font-serif italic text-sm">R {basePrice.toLocaleString()}</td>
                                                    <td className="p-4 text-white/70 text-xs">{totalStock} Units</td>
                                                    <td className="p-4"><span className={`px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest font-bold ${p.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{p.status}</span></td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingProduct(p)} className="text-white/40 hover:text-white p-2 transition-colors inline-flex rounded-sm"><Edit size={14}/></button>
                                                            <button onClick={() => setConfirmDialogState({ message: `Delete asset ${p.name}?`, onConfirm: () => setProducts(products.filter(x => x.id !== p.id))})} className="text-white/40 hover:text-red-400 p-2 transition-colors inline-flex rounded-sm"><Trash2 size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {flatProducts.length === 0 && (
                                            <tr><td colSpan={6} className="p-8 text-center text-white/40 text-xs uppercase tracking-widest font-bold">No assets found matching criteria.</td></tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'bundles' && (
                    <div className="space-y-4">
                        {combos.map(c => (
                            <div key={c.id} className="bg-[#111111] border border-white/5 rounded-sm overflow-hidden shadow-lg">
                                {/* Header (Clickable) */}
                                <div className="bg-[#1A1A1A] border-b border-white/10 px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors group" onClick={() => setExpandedCombo(expandedCombo === c.id ? null : c.id)}>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <ChevronRight size={16} className={`text-white/40 transition-transform shrink-0 ${expandedCombo === c.id ? 'rotate-90 text-white' : ''}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-white font-serif text-sm truncate">{c.title}</p>
                                                <span className="text-white/40 text-[10px] md:hidden shrink-0">({c.items?.length || 0} items)</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 md:hidden mt-0.5">
                                                <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold truncate">{c.badge || "Standard"}</p>
                                                <p className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">· R {c.discountPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Desktop Info */}
                                    <div className="hidden md:flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">{c.badge || "Standard Bundle"}</p>
                                            <p className="text-white/70 text-xs">{c.items?.length || 0} Assets Included</p>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-white font-serif italic text-sm">R {c.discountPrice?.toLocaleString()}</p>
                                            <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-widest font-bold inline-block mt-1 ${c.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setEditingCombo(c)} className="text-white/40 hover:text-white p-2 transition-colors border border-white/10 rounded-sm"><Edit size={14}/></button>
                                            <button onClick={() => setConfirmDialogState({ message: `Delete bundle ${c.title}?`, onConfirm: () => setCombos(combos.filter(x => x.id !== c.id)) })} className="text-white/40 hover:text-red-400 p-2 transition-colors border border-white/10 rounded-sm ml-1"><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="flex items-center gap-1 md:hidden shrink-0" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => setEditingCombo(c)} className="text-white/40 hover:text-white p-1.5 transition-colors rounded-sm"><Edit size={14}/></button>
                                        <button onClick={() => setConfirmDialogState({ message: `Delete bundle ${c.title}?`, onConfirm: () => setCombos(combos.filter(x => x.id !== c.id)) })} className="text-white/40 hover:text-red-400 p-1.5 transition-colors rounded-sm"><Trash2 size={14}/></button>
                                    </div>
                                </div>

                                {/* Expanded Inner List */}
                                <AnimatePresence>
                                    {expandedCombo === c.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="p-4 bg-[#0a0a0a]">
                                                {c.items && c.items.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {c.items.map((item, idx) => {
                                                            // FIXED: Ensure ID comparison handles alphanumeric IDs
                                                            const p = products.find(x => String(x.id) === String(item.productId));
                                                            const v = p?.variants?.find(v => v.sku === item.sku);
                                                            return (
                                                                <div key={idx} className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-sm border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                                                                    <img src={p?.image || FALLBACK_IMG} className="w-10 h-10 object-cover rounded-sm bg-black shrink-0" alt=""/>
                                                                    <div className="min-w-0">
                                                                        <p className="text-white text-xs truncate font-serif">{p?.name || 'Unknown Asset'}</p>
                                                                        <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold truncate mt-0.5">{p?.brand}</p>
                                                                        <p className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5 truncate">Size: {v?.sizeMl || '?'}ml · SKU: {item.sku}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-white/40 text-xs italic py-2 text-center">No assets in this bundle.</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {combos.length === 0 && (
                            <div className="text-center py-12 bg-transparent border border-white/5 rounded-sm border-dashed">
                                <p className="text-white/40 text-xs font-serif italic mb-2">No bundles curated yet.</p>
                                <button onClick={handleAdd} className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors">Create First Bundle</button>
                            </div>
                        )}
                    </div>
                )}

                {/* PRODUCT EDITOR MODAL */}
                <AnimatePresence>
                    {editingProduct && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm">
                            <div className="bg-[#111111] w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-sm shadow-2xl flex flex-col border border-white/10 custom-scrollbar">
                                <div className="sticky top-0 bg-[#111111] border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
                                    <h3 className="text-xl font-serif text-white">{editingProduct.id ? 'Edit Asset' : 'New Asset Protocol'}</h3>
                                    <button onClick={() => setEditingProduct(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                                </div>
                                <form onSubmit={saveProduct} className="p-6 space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className={labelClass}>Brand</label><input required className={inputClass} value={editingProduct.brand} onChange={e=>setEditingProduct({...editingProduct, brand: e.target.value})}/></div>
                                        <div><label className={labelClass}>Name</label><input required className={inputClass} value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})}/></div>
                                        <div><label className={labelClass}>Category</label><select className={inputClass} value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category: e.target.value})}>{(settings?.categories || ['Niche']).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                        <div><label className={labelClass}>Type</label><select className={inputClass} value={editingProduct.type} onChange={e=>setEditingProduct({...editingProduct, type: e.target.value})}>{(settings?.types || ['EDP']).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        <div><label className={labelClass}>Status</label><select className={inputClass} value={editingProduct.status} onChange={e=>setEditingProduct({...editingProduct, status: e.target.value})}><option>Available</option><option>Vaulted</option><option>Out of Stock</option></select></div>
                                        <div className="flex flex-col justify-center gap-4 pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={editingProduct.isFeatured || false} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} className="w-4 h-4 accent-[#D4AF37] bg-[#1A1A1A] border-white/10 rounded-sm cursor-pointer" />
                                                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Featured Asset</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={editingProduct.isTester || false} onChange={e => {
                                                    const checked = e.target.checked;
                                                    let updatedVariants = editingProduct.variants || [];
                                                    if (checked && updatedVariants.length > 1) updatedVariants = [updatedVariants[0]];
                                                    setEditingProduct({...editingProduct, isTester: checked, variants: updatedVariants});
                                                }} className="w-4 h-4 accent-[#D4AF37] bg-[#1A1A1A] border-white/10 rounded-sm cursor-pointer" />
                                                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Tester Protocol</span>
                                            </label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Asset Image (Upload or Link)</label>
                                            <div className="flex gap-2">
                                                <input type="text" className={inputClass} value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="Image URL (Fallback)" />
                                                <label className="cursor-pointer bg-white/10 border border-white/10 text-white px-4 py-2 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white/20 transition-colors flex items-center justify-center shrink-0"><Upload size={14} className="mr-2 hidden sm:block" /> <span className="hidden sm:inline">Upload Local</span><span className="sm:hidden"><Upload size={14}/></span><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, editingProduct, setEditingProduct, 'image')} /></label>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2"><label className={labelClass}>Narrative Description</label><textarea rows={3} className={inputClass} value={editingProduct.description} onChange={e=>setEditingProduct({...editingProduct, description: e.target.value})}/></div>
                                    </div>
                                    <div className="border-t border-white/10 pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-white/80 text-xs uppercase tracking-widest font-bold">Variants & Pricing {editingProduct.isTester && <span className="text-purple-400 normal-case tracking-normal ml-2 font-medium">(Max 1 for Testers)</span>}</h4>
                                            {(!editingProduct.isTester || (editingProduct.variants?.length || 0) < 1) && (
                                                <button type="button" onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants||[]), {sku:'', sizeMl:50, price:0, stock:0}]})} className="text-[#D4AF37] text-[10px] flex items-center gap-1 uppercase font-bold"><Plus size={12}/> Add Variant</button>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {(editingProduct.variants || []).map((v, i) => (
                                                <div key={i} className="flex flex-wrap md:flex-nowrap gap-3 bg-[#1A1A1A] p-3 rounded-sm border border-white/5 items-end">
                                                    <div className="w-full md:w-1/4"><label className={labelClass}>SKU</label><input required className={inputClass} value={v.sku} onChange={e=>{const n=[...editingProduct.variants]; n[i].sku=e.target.value; setEditingProduct({...editingProduct, variants:n})}}/></div>
                                                    <div className="w-1/3 md:w-1/6"><label className={labelClass}>Size (ml)</label><input type="number" required className={inputClass} value={v.sizeMl} onChange={e=>{const n=[...editingProduct.variants]; n[i].sizeMl=Number(e.target.value); setEditingProduct({...editingProduct, variants:n})}}/></div>
                                                    <div className="w-1/3 md:w-1/4"><label className={labelClass}>Price (R)</label><input type="number" required className={inputClass} value={v.price} onChange={e=>{const n=[...editingProduct.variants]; n[i].price=Number(e.target.value); setEditingProduct({...editingProduct, variants:n})}}/></div>
                                                    <div className="w-1/4 md:w-1/6"><label className={labelClass}>Stock</label><input type="number" required className={inputClass} value={v.stock} onChange={e=>{const n=[...editingProduct.variants]; n[i].stock=Number(e.target.value); setEditingProduct({...editingProduct, variants:n})}}/></div>
                                                    <button type="button" onClick={()=>{const n=[...editingProduct.variants]; n.splice(i,1); setEditingProduct({...editingProduct, variants:n})}} className="text-white/40 hover:text-red-400 p-2 pb-3 transition-colors ml-auto"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sticky bottom-0 bg-[#111111] pt-6 pb-2 border-t border-white/10 mt-6 flex justify-end gap-4">
                                        <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 text-white/50 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors">Cancel</button>
                                        <button type="submit" disabled={isSubmitting} className={btnClass}>
                                            {isSubmitting ? 'Processing...' : 'Commit Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BUNDLE EDITOR MODAL */}
                <AnimatePresence>
                    {editingCombo && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm">
                            <div className="bg-[#111111] w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-sm shadow-2xl flex flex-col border border-white/10 custom-scrollbar">
                                <div className="sticky top-0 bg-[#111111] border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
                                    <h3 className="text-xl font-serif text-white">{editingCombo.id ? 'Edit Bundle' : 'New Curated Bundle'}</h3>
                                    <button onClick={() => setEditingCombo(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                                </div>
                                <form onSubmit={saveCombo} className="p-6 space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className={labelClass}>Bundle Title</label><input required className={inputClass} value={editingCombo.title} onChange={e=>setEditingCombo({...editingCombo, title: e.target.value})}/></div>
                                        <div><label className={labelClass}>Discounted Valuation (R)</label><input required type="number" className={inputClass} value={editingCombo.discountPrice} onChange={e=>setEditingCombo({...editingCombo, discountPrice: Number(e.target.value)})}/></div>
                                        <div><label className={labelClass}>Status</label><select className={inputClass} value={editingCombo.active} onChange={e=>setEditingCombo({...editingCombo, active: e.target.value === 'true'})}><option value="true">Active</option><option value="false">Inactive</option></select></div>
                                        <div><label className={labelClass}>Badge (Optional)</label><input className={inputClass} value={editingCombo.badge || ''} onChange={e=>setEditingCombo({...editingCombo, badge: e.target.value})} placeholder="e.g. Limited Edition"/></div>
                                        <div className="md:col-span-2"><label className={labelClass}>Narrative Description</label><textarea rows={3} className={inputClass} value={editingCombo.description} onChange={e=>setEditingCombo({...editingCombo, description: e.target.value})}/></div>
                                    </div>
                                    <div className="border-t border-white/10 pt-6">
                                        <h4 className="text-white/80 text-xs uppercase tracking-widest font-bold mb-4">Included Assets</h4>
                                        <div className="bg-[#1A1A1A] p-4 rounded-sm border border-white/5 space-y-4 mb-4">
                                            <label className={labelClass}>Add an Asset to Bundle</label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <select className={inputClass} value={selectedProdId} onChange={e => { setSelectedProdId(e.target.value); setSelectedSku(''); }}>
                                                    <option value="">Select Asset...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>)}
                                                </select>
                                                <select className={inputClass} value={selectedSku} onChange={e => setSelectedSku(e.target.value)} disabled={!selectedProdId}>
                                                    <option value="">Select Variant...</option>
                                                    {activeComboProd?.variants?.map(v => <option key={v.sku} value={v.sku}>{v.sizeMl}ml - {v.sku}</option>)}
                                                </select>
                                                <button type="button" disabled={!selectedProdId || !selectedSku} onClick={() => { 
                                                    // FIXED: Safely append correct ID format
                                                    const pId = activeComboProd ? activeComboProd.id : selectedProdId;
                                                    setEditingCombo(prev => ({...prev, items: [...(prev.items||[]), {productId: pId, sku: selectedSku}]})); 
                                                    setSelectedProdId(''); 
                                                    setSelectedSku(''); 
                                                }} className={btnClass + " shrink-0"}>Add</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {(editingCombo.items || []).map((item, idx) => {
                                                // FIXED: Ensure ID comparison handles alphanumeric IDs
                                                const p = products.find(x => String(x.id) === String(item.productId));
                                                return (
                                                    <div key={idx} className="flex justify-between items-center bg-[#1A1A1A] px-4 py-3 rounded-sm border border-white/5">
                                                        <div><p className="text-white text-sm">{p?.brand} {p?.name}</p><p className="text-white/40 text-[9px] uppercase tracking-widest">SKU: {item.sku}</p></div>
                                                        <button type="button" onClick={() => setEditingCombo(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="text-white/40 hover:text-red-400 p-2"><Trash2 size={16}/></button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="sticky bottom-0 bg-[#111111] pt-6 pb-2 border-t border-white/10 mt-6 flex justify-end gap-4">
                                        <button type="button" onClick={() => setEditingCombo(null)} className="px-6 py-2 text-white/50 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors">Cancel</button>
                                        <button type="submit" disabled={isSubmitting} className={btnClass}>
                                            {isSubmitting ? 'Processing...' : 'Commit Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CUSTOM CONFIRM DIALOG */}
                <AnimatePresence>
                    {confirmDialogState.message && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-[#111111] border border-white/10 rounded-sm p-6 w-full max-w-sm shadow-2xl">
                                <h3 className="text-lg font-serif text-white mb-2">Confirm Protocol</h3>
                                <p className="text-white/60 text-sm mb-6">{confirmDialogState.message}</p>
                                <div className="flex gap-3 justify-end">
                                    <button onClick={() => setConfirmDialogState({ message: '', onConfirm: null })} className="px-4 py-2 text-white/50 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Abort</button>
                                    <button onClick={() => { confirmDialogState.onConfirm(); setConfirmDialogState({ message: '', onConfirm: null }); }} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors">Proceed</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InventoryPage;