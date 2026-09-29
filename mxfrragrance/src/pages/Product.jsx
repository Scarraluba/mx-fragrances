/**
 * Project: matenge-fragrances
 * Created: 2026/03/01 16:58
 * Author: Scarra Luba
 *
 * UPDATE:
 * - DB-only: no arbitrary/default values. All fields sourced from context products/combos.
 * - Supports viewing BOTH:
 *    A) Normal products: /product/:id
 *    B) Combos: /product/:id (matched against combo.id, string-safe)
 * - Combo add-to-cart uses the same payload shape as Shop.jsx (type: "combo", refId, meta.items)
 * - Wishlist state derived from context wishlist (no external isWishlisted prop)
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Heart, Minus, Plus, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import useAppContext from "../context/app/UseAppContext.jsx";

function formatRand(amount) {
    try {
        return `R ${Number(amount).toLocaleString()}`;
    } catch {
        return `R ${amount}`;
    }
}

function clampInt(n, min, max) {
    const x = Number.isFinite(n) ? n : min;
    return Math.min(max, Math.max(min, x));
}

function findVariant(product, sku) {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => v.sku === sku) || null;
}

function defaultVariant(product) {
    if (!product?.variants?.length) return null;
    const inStock = product.variants.find((v) => (v.stock ?? 0) > 0);
    return inStock || product.variants[0] || null;
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

                    const img =
                        (Array.isArray(v?.images) && v.images[0]) ||
                        (Array.isArray(p?.images) && p.images[0]) ||
                        p.image ||
                        "";

                    return { product: p, variant: v, image: img };
                })
                .filter(Boolean);

            const heroImage = resolvedItems[0]?.image || "";
            const images = resolvedItems.map((x) => x.image).filter(Boolean);

            return { ...combo, resolvedItems, heroImage, images };
        })
        .filter((c) => c.resolvedItems.length > 0);
}

function variantImages(product, variant) {
    const vImgs = Array.isArray(variant?.images) ? variant.images : null;
    const pImgs = Array.isArray(product?.images) ? product.images : null;
    if (vImgs && vImgs.length) return vImgs;
    if (pImgs && pImgs.length) return pImgs;
    if (product?.image) return [product.image];
    return [];
}

function stockForVariant(product, variant) {
    if (product?.variants?.length) return variant?.stock ?? 0;
    return product?.stock ?? 0;
}

const Product = ({ addToCart, onToggleWishlist }) => {
    const { products, combos, wishlist } = useAppContext();

    const { id } = useParams();
    const navigate = useNavigate();

    const productsById = useMemo(() => {
        const map = new Map();
        (products || []).forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    const resolvedCombos = useMemo(
        () => buildComboResolved(combos, productsById),
        [combos, productsById]
    );

    // Match combo by string-safe id comparison (DB ids may be string or number)
    const combo = useMemo(() => {
        if (!id) return null;
        return resolvedCombos.find((c) => String(c.id) === String(id)) || null;
    }, [resolvedCombos, id]);

    // Match product only if no combo matched
    const product = useMemo(() => {
        if (combo) return null;
        if (!id) return null;
        return (products || []).find((p) => String(p.id) === String(id)) || null;
    }, [products, id, combo]);

    // ---- shared state ----
    const [selectedSku, setSelectedSku] = useState("");
    const [qty, setQty] = useState(1);
    const [activeImgIndex, setActiveImgIndex] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // init for PRODUCT
    useEffect(() => {
        if (!product) return;
        const v = defaultVariant(product);
        setSelectedSku(v?.sku || "");
        setQty(1);
        setActiveImgIndex(0);
    }, [product]);

    // init for COMBO
    useEffect(() => {
        if (!combo) return;
        setSelectedSku("");
        setQty(1);
        setActiveImgIndex(0);
    }, [combo]);

    // -------------------- PRODUCT VIEW DERIVATIONS --------------------
    const selectedVariant = useMemo(() => {
        if (!product) return null;
        if (!selectedSku) return defaultVariant(product);
        return findVariant(product, selectedSku) || defaultVariant(product);
    }, [product, selectedSku]);

    const productImages = useMemo(() => {
        if (!product) return [];
        return variantImages(product, selectedVariant);
    }, [product, selectedVariant]);

    const productStock = useMemo(() => {
        if (!product) return 0;
        return stockForVariant(product, selectedVariant);
    }, [product, selectedVariant]);

    const productIsOut = productStock <= 0;
    const productQtyMax = Math.max(1, productStock || 99);

    const productPriceToShow = selectedVariant?.price ?? product?.price ?? 0;
    const productSizeLabel = selectedVariant?.sizeMl ? `${selectedVariant.sizeMl}ml` : "";
    const productHasSizes = (product?.variants?.length ?? 0) > 1;

    // -------------------- COMBO VIEW DERIVATIONS --------------------
    const comboImages = useMemo(() => {
        if (!combo) return [];
        if (Array.isArray(combo.images) && combo.images.length) return combo.images;
        if (combo.heroImage) return [combo.heroImage];
        return [];
    }, [combo]);

    // combo stock = min stock across included variants (bundle limited by the lowest)
    const comboStock = useMemo(() => {
        if (!combo?.resolvedItems?.length) return 0;
        const stocks = combo.resolvedItems.map(({ variant }) => variant?.stock ?? 0);
        const min = Math.min(...stocks);
        return Number.isFinite(min) ? min : 0;
    }, [combo]);

    const comboIsOut = comboStock <= 0;
    const comboQtyMax = Math.max(1, comboStock || 99);

    // -------------------- Wishlist --------------------
    const wishlisted = useMemo(() => {
        if (!Array.isArray(wishlist)) return false;
        if (combo) {
            return wishlist.some(
                (w) => w.type === "combo" && String(w.refId) === String(combo.id)
            );
        }
        if (product) {
            return wishlist.some(
                (w) => w.type === "product" && String(w.refId) === String(product.id)
            );
        }
        return false;
    }, [wishlist, product, combo]);

    // -------------------- ACTIONS --------------------
    const handleAddToCartProduct = () => {
        if (!product || !selectedVariant) return;
        if ((selectedVariant.stock ?? 0) <= 0) return;

        addToCart({
            type: "product",
            refId: product.id,
            title: product.name,
            image: productImages[0] || product.image,
            unitPrice: selectedVariant.price,
            quantity: qty,
            meta: {
                productId: product.id,
                brand: product.brand,
                category: product.category,
                productType: product.type,
                verification: product.verification,
                sku: selectedVariant.sku,
                sizeMl: selectedVariant.sizeMl,
                format: selectedVariant.format || "Full Bottle",
            },
        });
    };

    const handleAddCombo = () => {
        if (!combo?.resolvedItems?.length) return;
        if (comboIsOut) return;

        const comboImage = combo.heroImage || comboImages[0] || "";

        addToCart({
            type: "combo",
            refId: combo.id,
            title: combo.title,
            image: comboImage,
            unitPrice: combo.discountPrice,
            quantity: qty,
            meta: {
                items: combo.resolvedItems.map(({ product: p, variant: v, image }) => ({
                    productId: p.id,
                    brand: p.brand,
                    name: p.name,
                    image:
                        image ||
                        (Array.isArray(v?.images) && v.images[0]) ||
                        (Array.isArray(p?.images) && p.images[0]) ||
                        p.image ||
                        "",
                    category: p.category,
                    type: p.type,
                    sku: v.sku,
                    sizeMl: v.sizeMl,
                    unitPrice: v.price,
                })),
            },
        });
    };

    const handleWishlist = () => {
        if (typeof onToggleWishlist !== "function") return;

        if (product) {
            onToggleWishlist({
                type: "product",
                refId: product.id,
                title: product.name,
                image: productImages[0] || product.image,
                unitPrice: selectedVariant?.price ?? product.price,
                quantity: 1,
                meta: {
                    brand: product.brand,
                    category: product.category,
                    productType: product.type,
                },
            });
        } else if (combo) {
            onToggleWishlist({
                type: "combo",
                refId: combo.id,
                title: combo.title,
                image: combo.heroImage || comboImages[0],
                unitPrice: combo.discountPrice,
                quantity: 1,
                meta: {
                    items: combo.resolvedItems.map(({ product: p, variant: v }) => ({
                        productId: p.id,
                        brand: p.brand,
                        name: p.name,
                        sku: v.sku,
                        sizeMl: v.sizeMl,
                        unitPrice: v.price,
                    })),
                },
            });
        }
    };

    // -------------------- NOT FOUND --------------------
    if (!product && !combo) {
        return (
            <div className="pt-40 text-center h-screen">
                <h1 className="text-2xl font-serif mb-4">Asset Not Found</h1>
                <button
                    onClick={() => navigate("/shop")}
                    className="text-[#D4AF37] uppercase text-xs tracking-widest"
                >
                    Return to Collection
                </button>
            </div>
        );
    }

    const pageIsCombo = !!combo;

    const name = pageIsCombo ? combo.title : product.name;
    const brand = pageIsCombo ? "Boutique Pairing" : product.brand;
    const category = pageIsCombo ? "Combo" : product.category;
    const type = pageIsCombo ? "Bundle" : product.type;

    const images = pageIsCombo ? comboImages : productImages;
    const activeSrc = images[activeImgIndex] || images[0];

    const priceToShow = pageIsCombo ? combo.discountPrice : productPriceToShow;
    const stock = pageIsCombo ? comboStock : productStock;
    const isOutOfStock = pageIsCombo ? comboIsOut : productIsOut;
    const qtyMax = pageIsCombo ? comboQtyMax : productQtyMax;

    const sizeLabel = pageIsCombo ? "" : productSizeLabel;
    const hasSizes = pageIsCombo ? false : productHasSizes;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 md:pt-32 pb-24 text-left min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Catalog
                    </button>

                    {/* Breadcrumb — brand/category links into /shop with query param */}
                    <div className="hidden md:flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
                        <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
                        <span>/</span>
                        <Link to="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
                        <span>/</span>

                        {pageIsCombo ? (
                            // Combos have no single brand — link to combo category filter
                            <Link
                                to="/shop?category=Combo"
                                className="text-white/60 hover:text-[#D4AF37] transition-colors"
                            >
                                Boutique Pairing
                            </Link>
                        ) : (
                            <Link
                                to={`/shop?brand=${encodeURIComponent(product.brand || "")}`}
                                className="text-white/60 hover:text-[#D4AF37] transition-colors"
                            >
                                {brand}
                            </Link>
                        )}

                        <span>/</span>
                        <span className="text-white/60">{name}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* LEFT: Images */}
                    <div className="lg:w-1/2">
                        <div className="grid grid-cols-1 sm:grid-cols-[92px_1fr] gap-4 sm:gap-6 items-start">
                            {/* Thumbnails */}
                            <div className="order-2 sm:order-1">
                                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
                                    {images.map((src, i) => {
                                        const active = i === activeImgIndex;
                                        return (
                                            <button
                                                key={`${src}-${i}`}
                                                onClick={() => setActiveImgIndex(i)}
                                                className={[
                                                    "shrink-0 w-20 h-20 sm:w-[92px] sm:h-[92px] rounded-sm border overflow-hidden transition-all",
                                                    active ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 bg-white/5 hover:border-white/30",
                                                ].join(" ")}
                                                aria-label={`Image ${i + 1}`}
                                            >
                                                <img src={src} alt={`${name} thumbnail ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Main image */}
                            <div className="order-1 sm:order-2">
                                <div className="relative overflow-hidden rounded-sm">
                                    <div className="aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5] max-h-[520px]">
                                        <img src={activeSrc} className="w-full h-full object-contain" alt={name} draggable={false} />
                                    </div>

                                    <div className="absolute top-5 left-5 flex flex-col gap-3">
                                        {!pageIsCombo && product.verification === "Gold Verified" && (
                                            <div className="bg-[#D4AF37] text-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider rounded-sm flex items-center gap-2 shadow-2xl">
                                                <Award size={14} /> Gold Verified Protocol
                                            </div>
                                        )}

                                        {pageIsCombo ? (
                                            <div className="bg-[#D4AF37] text-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider rounded-sm flex items-center gap-2 shadow-2xl">
                                                <Zap size={14} fill="currentColor" /> Exclusive Combo
                                            </div>
                                        ) : (
                                            sizeLabel && (
                                                <div className="bg-black/50 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider rounded-sm shadow-2xl">
                                                    Full Bottle · {sizeLabel}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Combo includes list (only on combo page) */}
                        {pageIsCombo && combo?.resolvedItems?.length > 0 && (
                            <div className="mt-8 space-y-3">
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                                    Included Bottles
                                </p>

                                <div className="space-y-3">
                                    {combo.resolvedItems.map(({ product: p, variant: v }) => (
                                        <div key={`${combo.id}-${p.id}-${v.sku}`} className="bg-white/5 border border-white/10 rounded-sm p-4 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold">
                                                    {p.brand}
                                                </p>
                                                <p className="text-white font-serif text-base truncate">{p.name}</p>
                                                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                                                    Full Bottle · {v.sizeMl}ml · SKU {v.sku}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-white/40 text-[10px] uppercase tracking-widest">Each</p>
                                                <p className="text-white font-serif italic">{formatRand(v.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Details */}
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="border-b border-white/5 pb-8 mb-8">
                            <p className="text-[#D4AF37] text-sm tracking-[0.4em] uppercase mb-4 font-semibold">
                                {brand}
                            </p>

                            <h1 className="text-4xl md:text-6xl text-white font-serif mb-4 leading-tight tracking-tight">
                                {name}
                            </h1>

                            <div className="flex items-center gap-6 flex-wrap">
                                <span className="text-3xl text-white font-serif italic">
                                    {formatRand(priceToShow)}
                                </span>
                                <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
                                <span className="text-white/40 text-[11px] uppercase tracking-[0.2em] font-medium">
                                    {category} · {type}
                                    {!pageIsCombo && sizeLabel ? ` · ${sizeLabel}` : ""}
                                </span>
                            </div>

                            {/* Size selector (product only) */}
                            {hasSizes && (
                                <div className="mt-6">
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">
                                        Select Size
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v) => {
                                            const out = (v.stock ?? 0) <= 0;
                                            const active = v.sku === selectedSku;

                                            return (
                                                <button
                                                    key={v.sku}
                                                    onClick={() => {
                                                        setSelectedSku(v.sku);
                                                        setQty(1);
                                                        setActiveImgIndex(0);
                                                    }}
                                                    disabled={out}
                                                    className={[
                                                        "px-4 py-3 rounded-sm border text-left transition-all",
                                                        "min-w-[140px]",
                                                        out ? "opacity-40 cursor-not-allowed" : "hover:border-[#D4AF37]/60",
                                                        active ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 bg-white/5",
                                                    ].join(" ")}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-white text-sm font-medium">{v.sizeMl}ml</span>
                                                        <span className="text-white/60 text-[10px] uppercase tracking-widest">Full Bottle</span>
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-white/80 text-[11px] uppercase tracking-tight">
                                                            {formatRand(v.price)}
                                                        </span>
                                                        <span className="text-white/30 text-[10px] uppercase tracking-widest">
                                                            {out ? "Out" : `${v.stock} left`}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Add row */}
                            <div className="mt-7 flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-[190px]">
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">
                                        Quantity
                                    </p>

                                    <div className="flex items-center border border-white/10 rounded-sm bg-white/5 overflow-hidden">
                                        <button
                                            onClick={() => setQty((q) => clampInt(q - 1, 1, qtyMax))}
                                            disabled={qty <= 1}
                                            className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-40"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <input
                                            value={qty}
                                            onChange={(e) => {
                                                const n = Number.parseInt(e.target.value, 10);
                                                const next = Number.isFinite(n) ? n : 1;
                                                setQty(clampInt(next, 1, qtyMax));
                                            }}
                                            inputMode="numeric"
                                            className="w-full h-12 bg-transparent text-white text-center outline-none text-sm"
                                        />

                                        <button
                                            onClick={() => setQty((q) => clampInt(q + 1, 1, qtyMax))}
                                            disabled={stock > 0 ? qty >= stock : false}
                                            className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-40"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <p className="mt-2 text-white/30 text-[10px] uppercase tracking-widest">
                                        {stock > 0 ? `Max ${stock}` : "Unavailable"}
                                    </p>
                                </div>

                                <div className="w-full flex-1">
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-3 opacity-0 sm:opacity-100">
                                        Action
                                    </p>

                                    <button
                                        onClick={() => {
                                            if (!isOutOfStock) {
                                                if (pageIsCombo) handleAddCombo();
                                                else handleAddToCartProduct();
                                            }
                                        }}
                                        disabled={isOutOfStock}
                                        className={[
                                            "w-full h-12 bg-white text-black font-bold uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl rounded-sm",
                                            "flex items-center justify-center gap-3",
                                            isOutOfStock ? "bg-white/20 text-white/50 cursor-not-allowed" : "hover:bg-[#D4AF37]",
                                        ].join(" ")}
                                    >
                                        <ShoppingBag size={18} />
                                        {isOutOfStock ? "Out of stock" : pageIsCombo ? "Acquire Bundle" : "Add Bottle to Collection"}
                                    </button>

                                    <button
                                        onClick={handleWishlist}
                                        className="mt-3 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                                    >
                                        <Heart
                                            size={18}
                                            className={wishlisted ? "text-[#D4AF37]" : "text-white/60"}
                                            fill={wishlisted ? "currentColor" : "none"}
                                        />
                                        <span className="text-[11px] uppercase tracking-[0.25em] font-semibold">
                                            {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {stock > 0 && stock <= 3 && (
                                <p className="mt-2 text-[#D4AF37]/90 text-[10px] uppercase tracking-[0.3em] font-semibold">
                                    Low stock: {stock} left
                                </p>
                            )}
                        </div>

                        <div className="space-y-10 mb-12 flex-grow">
                            <div className="space-y-4">
                                <h4 className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                                    Asset Narrative
                                </h4>
                                <p className="text-white/70 text-base leading-relaxed font-light font-serif">
                                    {pageIsCombo ? (combo.description || "A curated pairing from the vault.") : product.description}
                                </p>
                            </div>

                            {!pageIsCombo && (
                                <div className="space-y-4">
                                    <h4 className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                                        Olfactory Layers
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(product.notes || []).map((note) => (
                                            <span
                                                key={note}
                                                className="bg-white/5 text-white/80 text-[10px] px-5 py-2 rounded-full border border-white/10 uppercase tracking-widest"
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bundle advantage note */}
                        {pageIsCombo && combo?.resolvedItems?.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-sm p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                                            Bundle Advantage
                                        </p>
                                        <p className="text-white/60 text-sm mt-2">
                                            Bundle price applies at checkout when you acquire the combo.
                                        </p>
                                    </div>
                                    <Sparkles size={18} className="text-[#D4AF37]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Product;