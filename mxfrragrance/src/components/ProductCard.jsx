/**
 * Project: mxfrragrance
 * Created: 2026/05/17 16:45
 * Author: Scarra Luba
 */
import {  Link } from "react-router-dom";
import { 
  Search, ShoppingBag, X, Menu, Plus, Minus, Trash2, Zap, 
  ChevronRight,  Send, Lock, ArrowLeft, CheckCircle2, 
  Sparkles, Phone, MapPin, Truck, Heart, Award, SlidersHorizontal, Filter, User, ArrowRight, LogOut,
  Package, FileText, RotateCcw, Star, Shield, Mail, Download, Eye, History, Printer, Smartphone, Laptop, Edit,
  CreditCard
} from 'lucide-react';

const FALLBACK_IMG = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";


function formatRand(amount) {
  try { return `R ${Number(amount).toLocaleString()}`; } catch { return `R ${amount}`; }
}

function defaultVariant(product) {
  if (!product?.variants?.length) return null;
  const inStock = product.variants.find((v) => (v.stock ?? 0) > 0);
  return inStock || product.variants[0] || null;
}
const PublicProductCard = ({
                             product,
                             isCombo,
                             onAddToCart,
                             onToggleWishlist,
                             isWishlisted
                           }) => {
  const v = !isCombo ? defaultVariant(product) : null;
  const price = isCombo ? product.discountPrice : (v?.price ?? product?.price);
  const isOut = isCombo ? false : ((v?.stock ?? product?.stock ?? 0) <= 0);
  const image = product.image || FALLBACK_IMG;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCombo) {
      onAddToCart(product, true);
    } else {
      onAddToCart({
        productId: product.id, brand: product.brand, name: product.name, image: image, verification: product.verification, category: product.category, type: product.type,
        sku: v?.sku, sizeMl: v?.sizeMl, format: v?.format || "Full Bottle", unitPrice: v?.price ?? product.price, quantity: 1, key: `${product.id}:${v?.sku || 'default'}`
      }, false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-zinc-900/40 border border-white/5 rounded-sm overflow-hidden transition-all hover:border-white/20">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-black overflow-hidden">
        <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {product.verification === 'Gold Verified' && !isCombo && (
          <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[8px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1 shadow-lg z-10">
            <Award size={10} /> Gold
          </div>
        )}
        {isCombo && (
          <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[8px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm flex items-center gap-1 shadow-lg z-10">
            <Zap size={10} fill="currentColor" /> Bundle
          </div>
        )}
        <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (typeof onToggleWishlist === "function") {
                onToggleWishlist(product);
              }
            }}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all hover:scale-110 hover:border-[#D4AF37]"
        >
          <Heart
              size={15}
              className={isWishlisted ? "text-[#D4AF37]" : "text-white/70"}
              fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
        {isOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-10">
            <span className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-sm border border-white/20">Out of Stock</span>
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block flex-1 min-w-0">
          <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-bold truncate mb-1.5">{product.brand}</p>
          <h3 className="text-white font-serif text-[15px] leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 truncate">
            {isCombo ? "Curated Pairing" : `${product.category} · ${product.type}`}
          </p>
        </Link>
        
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-white font-serif italic text-[15px]">{formatRand(price)}</span>
          <button 
            onClick={handleAdd} disabled={isOut} aria-label="Add to Selection"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isOut ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/10 text-white/70 hover:bg-[#D4AF37] hover:text-black hover:scale-110 shadow-lg'}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicProductCard;