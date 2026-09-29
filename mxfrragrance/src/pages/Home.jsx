/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:52
 * Author: Scarra Luba
 */
import useAuthContext from "../context/auth/useAuthContext.jsx";
import useAppContext from "../context/app/UseAppContext.jsx";
import {  Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import PublicProductCard from "../components/ProductCard.jsx";

function defaultVariant(product) {
    if (!product?.variants?.length) return null;
    const inStock = product.variants.find((v) => (v.stock ?? 0) > 0);
    return inStock || product.variants[0] || null;
}
const Home = ({addToCart,wishlist , onToggleWishlist}) => {
   // const { user } = useAuthContext();
    const { products } = useAppContext();

    return (
  <motion.div className="custom-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <section className="h-[90vh] md:h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center scale-105">
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 text-center space-y-8 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          <p className="text-[#D4AF37] tracking-[0.3em] md:tracking-[0.5em] uppercase text-[10px] md:text-xs mb-4 font-semibold">Established Curation</p>
          <h1 className="text-5xl md:text-8xl text-white font-serif mb-8 tracking-tighter leading-tight">The Art of <br /> <span className="italic">Rare</span> Scents</h1>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/shop" className="bg-[#D4AF37] text-black px-10 md:px-12 py-4 md:py-5 uppercase text-[10px] md:text-[11px] font-bold tracking-widest hover:bg-white transition-all shadow-xl rounded-sm">Shop Collection</Link>
            <Link to="/about" className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-10 md:px-12 py-4 md:py-5 uppercase text-[10px] md:text-[11px] font-bold tracking-widest hover:bg-white/10 transition-all rounded-sm">Explore MX</Link>
          </div>
        </motion.div>
      </div>
    </section>

        <section className="container mx-auto px-6 py-20 md:py-32">
      <div className="flex justify-between items-end mb-12 md:mb-16">
        <div className="space-y-2">
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-semibold">Latest</p>
          <h2 className="text-3xl md:text-4xl text-white font-serif tracking-tight">Drops</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 text-left">
        {products.filter(p => p.isFeatured && p.status === 'Available').map(item => (
          <PublicProductCard key={`prod-${item.id}`}
                             product={item}
                             isCombo={!!item.isCombo}
                             onAddToCart={addToCart}
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
    </section>
    </motion.div>
    );
};

export default Home;