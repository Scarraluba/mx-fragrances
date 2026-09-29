/**
 * Project: mxfrragrance
 * Created: 2026/05/18 02:52
 * Author: Scarra Luba
 *
 * UPDATE:
 * - Filters now sync with URL search params (deep-linkable, back/forward safe).
 * - Supports: ?category=, ?brand=, ?type=, ?size=, ?price=, ?q=
 * - Breadcrumb links from Product page (/shop?brand=...) now apply filters.
 */

import useAppContext from "../context/app/UseAppContext.jsx";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import FilterSideBar from "../components/FilterSideBar.jsx";
import PublicProductCard from "../components/ProductCard.jsx";

function findVariant(product, sku) {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => v.sku === sku) || null;
}

function defaultVariant(product) {
    if (!product?.variants?.length) return null;
    const inStock = product.variants.find((v) => (v.stock ?? 0) > 0);
    return inStock || product.variants[0] || null;
}

function getProductBasePrice(product) {
    if (product?.variants?.length) {
        return Math.min(...product.variants.map((v) => v.price || 0));
    }
    return product?.price ?? 0;
}

function buildComboResolved(combos, productsById) {
    if (!Array.isArray(combos)) return [];
    return combos
        .filter((c) => c && c.active)
        .map((combo) => {
            const resolvedItems = (combo.items || [])
                .map((it) => {
                    const p = productsById.get(it.productId);
                    if (!p) return null;
                    const v = findVariant(p, it.sku) || defaultVariant(p);
                    if (!v) return null;
                    const img = (Array.isArray(v?.images) && v.images[0]) || (Array.isArray(p?.images) && p.images[0]) || p.image || "";
                    return { product: p, variant: v, image: img };
                })
                .filter(Boolean);
            const heroImage = resolvedItems[0]?.image || "";
            const images = resolvedItems.map((x) => x.image).filter(Boolean);
            return { ...combo, resolvedItems, heroImage, images };
        })
        .filter((c) => c.resolvedItems.length > 0);
}

// Helpers for URL <-> filter state
function parseMulti(params, key) {
    return params.getAll(key).flatMap((v) => v.split(",")).map((s) => s.trim()).filter(Boolean);
}

const Shop = ({ addToCart, onToggleWishlist, searchQuery }) => {
    const { products, combos, wishlist } = useAppContext();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filterVisibility, setFilterVisibility] = useState({
        categories: true,
        brands: true,
        types: true,
        sizes: true,
        prices: true
    });

    const [priceRanges] = useState([
        { id: '1', label: 'Under R3,000', min: 0, max: 3000 },
        { id: '2', label: 'R3,000 - R7,000', min: 3000, max: 7000 },
        { id: '3', label: 'R7,000 - R15,000', min: 7000, max: 15000 },
        { id: '4', label: 'R15,000+', min: 15000, max: 1000000 },
    ]);

    const toggleFilterGroupVisibility = (groupKey) => {
        setFilterVisibility(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    // --- DYNAMIC OPTIONS GENERATOR ---
    const productsById = useMemo(() => {
        const map = new Map();
        (products || []).forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    const resolvedCombos = useMemo(() => buildComboResolved(combos, productsById), [combos, productsById]);

    const comboAsProducts = useMemo(() => resolvedCombos.map((c) => ({
        id: c.id,
        isCombo: true,
        image: c.heroImage,
        images: c.images,
        title: c.title,
        discountPrice: c.discountPrice,
        description: c.description,
        badge: c.badge,
        name: c.title,
        __combo: c
    })), [resolvedCombos]);

    const availableOptions = useMemo(() => {
        const uniqueCategories = new Set();
        const uniqueTypes = new Set();
        const uniqueBrands = new Set();
        const uniqueSizes = new Set();

        (products || []).forEach(p => {
            if (p.category) uniqueCategories.add(p.category);
            if (p.type) uniqueTypes.add(p.type);
            if (p.brand) uniqueBrands.add(p.brand);

            if (p.variants && Array.isArray(p.variants)) {
                p.variants.forEach(v => {
                    if (v.sizeMl) uniqueSizes.add(v.sizeMl);
                });
            }
        });

        return {
            categories: Array.from(uniqueCategories).sort(),
            types: Array.from(uniqueTypes).sort(),
            brands: Array.from(uniqueBrands).sort(),
            sizes: Array.from(uniqueSizes).sort((a, b) => a - b),
            priceRanges: priceRanges
        };
    }, [products, priceRanges]);

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // ---- Filter state, hydrated from URL ----
    const [activeFilters, setActiveFilters] = useState(() => ({
        categories: parseMulti(searchParams, "category"),
        types: location.state?.filter
            ? [location.state.filter]
            : parseMulti(searchParams, "type"),
        brands: parseMulti(searchParams, "brand"),
        sizes: parseMulti(searchParams, "size").map(Number).filter(Number.isFinite),
        priceRange: searchParams.get("price") || "All",
    }));

    // Re-hydrate when URL changes (back/forward, breadcrumb click while already on /shop)
    useEffect(() => {
        setActiveFilters({
            categories: parseMulti(searchParams, "category"),
            types: parseMulti(searchParams, "type"),
            brands: parseMulti(searchParams, "brand"),
            sizes: parseMulti(searchParams, "size").map(Number).filter(Number.isFinite),
            priceRange: searchParams.get("price") || "All",
        });
    }, [searchParams]);

    // ---- Write filter state back to URL ----
    const syncFiltersToUrl = (next) => {
        const params = new URLSearchParams();

        // Preserve search query if present
        const q = searchParams.get("q");
        if (q) params.set("q", q);

        if (next.categories?.length) next.categories.forEach((c) => params.append("category", c));
        if (next.types?.length) next.types.forEach((t) => params.append("type", t));
        if (next.brands?.length) next.brands.forEach((b) => params.append("brand", b));
        if (next.sizes?.length) next.sizes.forEach((s) => params.append("size", s));
        if (next.priceRange && next.priceRange !== "All") params.set("price", next.priceRange);

        // replace: true prevents history spam on every checkbox click
        setSearchParams(params, { replace: true });
    };

    const [showStickyBar, setShowStickyBar] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 400) {
                if (currentScrollY < lastScrollY) setShowStickyBar(true);
                else setShowStickyBar(false);
            } else {
                setShowStickyBar(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const toggleFilter = (key, value) => {
        if (key === "reset") {
            const cleared = { categories: [], types: [], brands: [], sizes: [], priceRange: "All" };
            setActiveFilters(cleared);
            syncFiltersToUrl(cleared);
            return;
        }

        setActiveFilters((prev) => {
            let next;
            if (key === "priceRange") {
                next = { ...prev, priceRange: prev.priceRange === value ? "All" : value };
            } else {
                const current = prev[key];
                next = {
                    ...prev,
                    [key]: current.includes(value)
                        ? current.filter((i) => i !== value)
                        : [...current, value]
                };
            }
            syncFiltersToUrl(next);
            return next;
        });
    };

    const filteredProducts = useMemo(() => {
        const priceRangeMap = availableOptions.priceRanges.reduce((acc, curr) => {
            acc[curr.label] = { min: curr.min, max: curr.max };
            return acc;
        }, {});

        return (products || []).filter((p) => {
            const catMatch = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category);
            const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(p.type);
            const brandMatch = activeFilters.brands.length === 0 || activeFilters.brands.includes(p.brand);

            const sizeMatch = activeFilters.sizes.length === 0 ||
                (p.variants && p.variants.some(v => activeFilters.sizes.includes(v.sizeMl)));

            const keywordMatch = !searchQuery ||
                (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

            let priceMatch = true;
            if (activeFilters.priceRange !== "All") {
                const r = priceRangeMap[activeFilters.priceRange];
                const price = getProductBasePrice(p);
                priceMatch = r ? price >= r.min && price < r.max : true;
            }

            return catMatch && typeMatch && brandMatch && sizeMatch && priceMatch && keywordMatch;
        });
    }, [products, activeFilters, searchQuery, availableOptions]);

    const filteredComboAsProducts = useMemo(() => {
        const priceRangeMap = availableOptions.priceRanges.reduce((acc, curr) => {
            acc[curr.label] = { min: curr.min, max: curr.max };
            return acc;
        }, {});

        const keyword = (searchQuery || "").trim().toLowerCase();

        return comboAsProducts.filter((p) => {
            const c = p.__combo;
            const keywordMatch = !keyword ||
                (p.title || "").toLowerCase().includes(keyword) ||
                (p.description || "").toLowerCase().includes(keyword) ||
                (c?.resolvedItems || []).some(({ product: rp }) =>
                    (rp.name || "").toLowerCase().includes(keyword) ||
                    (rp.brand || "").toLowerCase().includes(keyword)
                );

            let priceMatch = true;
            if (activeFilters.priceRange !== "All") {
                const r = priceRangeMap[activeFilters.priceRange];
                const price = p.discountPrice ?? 0;
                if (r) priceMatch = price >= r.min && price < r.max;
            }

            const catMatch = activeFilters.categories.length === 0 ||
                activeFilters.categories.includes("Combo") ||
                activeFilters.categories.includes(p.category) ||
                (c?.resolvedItems || []).some(({ product: rp }) => activeFilters.categories.includes(rp?.category));

            const brandMatch = activeFilters.brands.length === 0 ||
                activeFilters.brands.includes(p.brand) ||
                (c?.resolvedItems || []).some(({ product: rp }) => activeFilters.brands.includes(rp?.brand));

            const typeMatch = activeFilters.types.length === 0 ||
                activeFilters.types.includes(p.type) ||
                (c?.resolvedItems || []).some(({ product: rp }) => activeFilters.types.includes(rp?.type));

            const sizeMatch = activeFilters.sizes.length === 0 ||
                (c?.resolvedItems || []).some(({ variant: v }) => activeFilters.sizes.includes(v?.sizeMl));

            return keywordMatch && priceMatch && catMatch && brandMatch && typeMatch && sizeMatch;
        });
    }, [comboAsProducts, searchQuery, activeFilters, availableOptions]);

    const gridItems = useMemo(() => [...filteredComboAsProducts, ...filteredProducts], [filteredComboAsProducts, filteredProducts]);
    const totalShown = gridItems.length;

    const handleAddCombo = (comboResolved) => {
        if (!comboResolved?.resolvedItems?.length) return;

        const firstItem = comboResolved.resolvedItems[0];
        const comboImage =
            firstItem?.image ||
            firstItem?.variant?.images?.[0] ||
            firstItem?.product?.images?.[0] ||
            firstItem?.product?.image ||
            "";

        const payload = {
            type: "combo",
            refId: comboResolved.id,
            title: comboResolved.title,
            image: comboImage,
            unitPrice: comboResolved.discountPrice,
            quantity: 1,
            meta: {
                items: comboResolved.resolvedItems.map(({ product: p, variant: v, image }) => ({
                    productId: p.id,
                    brand: p.brand,
                    name: p.name,
                    image: image || v?.images?.[0] || p?.images?.[0] || p?.image || "",
                    category: p.category,
                    type: p.type,
                    sku: v.sku,
                    sizeMl: v.sizeMl,
                    unitPrice: v.price
                }))
            }
        };

        addToCart(payload);
    };

    return (
        <div className="pt-32 md:pt-40 pb-24 container mx-auto px-4 md:px-6 text-left min-h-screen">
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 72 }} exit={{ y: -100 }} className="fixed top-0 left-0 w-full z-40 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl">
                        <div className="container mx-auto px-6 flex justify-between items-center">
                            <div className="flex items-center gap-4 h-8">
                                <button onClick={() => setIsMobileFiltersOpen(true)} className="flex items-center gap-2 text-white/70 hover:text-[#D4AF37] transition-colors uppercase text-[10px] tracking-widest font-bold"><Filter size={14} /> Filter</button>
                                <div className="hidden md:block h-4 w-[1px] bg-white/10" />
                                <p className="hidden md:block text-white/30 text-[9px] uppercase tracking-widest font-medium">Showing {totalShown} assets {searchQuery && <span className="text-[#D4AF37]"> for "{searchQuery}"</span>}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-left">
                <div className="text-left w-full md:w-auto">
                    <h1 className="text-4xl md:text-5xl text-white font-serif tracking-tight">The Collection</h1>
                    {searchQuery && <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-2">Results for: "{searchQuery}"</p>}
                </div>
                <button onClick={() => setIsMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-white rounded-sm w-full justify-center"><SlidersHorizontal size={14} className="text-[#D4AF37]" /> Filter Collection</button>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-[240px_1fr] gap-12 text-left">
                <aside className="hidden md:block sticky top-32 h-fit">
                    <FilterSideBar activeFilters={activeFilters} onFilterChange={toggleFilter} onReset={() => toggleFilter("reset")} availableOptions={availableOptions} filterVisibility={filterVisibility} />
                </aside>

                <div className="flex-1">
                    {totalShown > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                            {gridItems.map((item) => (
                                <PublicProductCard
                                    key={item.isCombo ? `combo-${item.id}` : `prod-${item.id}`}
                                    product={item}
                                    isCombo={!!item.isCombo}
                                    onAddToCart={(payload, comboFlag) => {
                                        if (comboFlag) handleAddCombo(payload.__combo);
                                        else addToCart(payload);
                                    }}
                                    onToggleWishlist={(product) => {
                                        const normalized = product.isCombo
                                            ? {
                                                type: "combo",
                                                refId: product.id,
                                                title: product.title,
                                                image: product.image,
                                                unitPrice: product.discountPrice,
                                                quantity: 1,
                                                meta: {}
                                            }
                                            : {
                                                type: "product",
                                                refId: product.id,
                                                title: product.name,
                                                image: product.image,
                                                unitPrice: defaultVariant(product)?.price ?? product.price,
                                                quantity: 1,
                                                meta: {
                                                    brand: product.brand,
                                                    category: product.category,
                                                    productType: product.type
                                                }
                                            };
                                        onToggleWishlist(normalized);
                                    }}
                                    isWishlisted={
                                        wishlist.some(w =>
                                            w.refId === item.id &&
                                            w.type === (item.isCombo ? "combo" : "product")
                                        )
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <Search size={48} className="mx-auto text-white/10 mb-6" />
                            <p className="text-white font-serif text-xl">No assets found matching current criteria.</p>
                            <button onClick={() => toggleFilter("reset")} className="mt-4 text-[#D4AF37] text-xs underline uppercase tracking-widest">Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFiltersOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] md:hidden" />
                        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} onClick={(e) => e.stopPropagation()} className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-[#0B0B0D] p-8 z-[210] md:hidden overflow-y-auto border-r border-white/5 text-left">
                            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                                <h2 className="text-xl font-serif text-white">Filters</h2>
                                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                            </div>
                            <FilterSideBar activeFilters={activeFilters} onFilterChange={toggleFilter} onReset={() => toggleFilter("reset")} availableOptions={availableOptions} filterVisibility={filterVisibility} />
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full mt-10 bg-[#D4AF37] text-black py-4 uppercase text-[10px] tracking-widest font-bold rounded-sm hover:bg-white transition-colors">Show {totalShown} Results</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shop;