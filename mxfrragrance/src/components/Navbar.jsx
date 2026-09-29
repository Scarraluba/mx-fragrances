/**
 * Project: mxfrragrance
 * Created: 2026/05/14 19:03
 * Author: Scarra Luba
 */

import {useEffect, useMemo, useRef, useState} from "react";
import GoldBottleIcon from "../assets/logo.svg";
import {ArrowLeft, Heart, LogOut, Menu, Search, ShoppingBag, User, X} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import {NavLink,Link, useLocation, useNavigate} from "react-router-dom";
import {ACCOUNT_SECTIONS} from "../helpers/AccounSections.jsx";
import {logout} from "../helpers/Auth.js";

import useAppContext from "../context/app/UseAppContext.jsx";

/* =========================================================
 * NAVBAR
 * ========================================================= */

const Navbar = ({
                    cartCount,
                    onOpenCart,
                    searchQuery,
                    setSearchQuery,
                    wishlistCount = 0,
                    user,
                    onOpenWishlist,

                    onOpenAuth
                }) => {
    const { currentPath } = useAppContext();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileView, setMobileView] = useState('main'); // 'main' | 'account'
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchWidth, setSearchWidth] = useState(200);

    const searchInputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isMobileMenuOpen) {
            setTimeout(() => setMobileView('main'), 300);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (isSearchActive && searchInputRef.current) searchInputRef.current.focus();
    }, [isSearchActive]);

    useEffect(() => {
        const onResize = () => setSearchWidth(window.innerWidth > 768 ? 200 : 140);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => { window.removeEventListener("scroll", handleScroll); setIsMobileMenuOpen(false); };
    }, [location.pathname]);

    const handleSearchToggle = () => setIsSearchActive((v) => !v);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length > 0 && location.pathname !== "/shop") navigate("/shop");
    };

    const handleWishlistClick = () => {
        if (typeof onOpenWishlist === 'function') {
            onOpenWishlist();
        } else {
            navigate('/wishlist');
        }
    };
    const navLinkClass = useMemo(() => ({ isActive }) => ["text-xs tracking-widest uppercase font-semibold transition-colors", isActive ? "text-[#D4AF37]" : "text-white/70 hover:text-[#D4AF37]"].join(" "), []);
    const navLinkClassShop = useMemo(() => ({ isActive }) => ["text-xs tracking-widest uppercase font-semibold transition-colors", isActive || location.pathname.startsWith("/shop") ? "text-[#D4AF37]" : "text-white/70 hover:text-[#D4AF37]"].join(" "), [location.pathname]);
    const mobileLinkClass = useMemo(() => ({ isActive }) => ["text-2xl font-serif transition-colors", isActive ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"].join(" "), []);
    const mobileLinkClassShop = useMemo(() => ({ isActive }) => ["text-2xl font-serif transition-colors", isActive || location.pathname.startsWith("/shop") ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"].join(" "), [location.pathname]);

    return(
        <>
            <nav className={`fixed top-0 left-0 w-full z-[500] transition-all duration-500 ${isScrolled || isMobileMenuOpen ? "bg-[#0B0B0D]/95 backdrop-blur-md py-4 shadow-xl" : "bg-transparent py-8"}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-8 group relative z-[510]" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110 flex items-center justify-center">    <img
                                src={GoldBottleIcon}
                                alt="MX Logo"
                                className="w-8.5 h-8.4 md:w-10 md:h-10 transition-transform group-hover:scale-110"
                            /></div>
                            <span className="text-[#D4AF37] text-[8px] md:text-[10px] tracking-[0.3em] uppercase mt-1 font-sans font-medium">Fragrances</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex gap-10 items-center">
                        <NavLink to="/shop" className={navLinkClassShop}>Store</NavLink>
                        <NavLink to="/about" className={navLinkClass} end>About</NavLink>
                        <NavLink to="/contact" className={navLinkClass} end>Contact</NavLink>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 z-[510]">
                        <div className="relative flex items-center">
                            <AnimatePresence>
                                {isSearchActive && (
                                    <motion.input
                                        ref={searchInputRef}
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: searchWidth, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        type="text"
                                        placeholder="Find asset..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="bg-white/5 border border-[#D4AF37]/30 text-white text-xs px-4 py-2 rounded-sm outline-none focus:border-[#D4AF37] transition-all mr-2"
                                    />
                                )}
                            </AnimatePresence>
                            <button onClick={handleSearchToggle} className={`transition-colors ${isSearchActive ? "text-[#D4AF37]" : "text-white/70 hover:text-white"}`} aria-label="Search">
                                <Search size={18} strokeWidth={1.5} />
                            </button>
                        </div>

                        {user && !user.isAnonymous ? (
                            <Link to="/account" className="hidden md:block relative group text-white/70 hover:text-white transition-colors" aria-label="Account">
                                <User size={20} />
                            </Link>
                        ) : (
                            <button onClick={() => navigate('/login')} className="hidden md:block relative group text-white/70 hover:text-white transition-colors" aria-label="Sign in">
                                <User size={20} />
                            </button>
                        )}

                        <button onClick={handleWishlistClick} className="hidden md:block relative group text-white/70 hover:text-white transition-colors" aria-label="Wishlist">
                            <Heart size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0 -right-0.5 bg-[#D4AF37] text-black text-[9px] font-bold w-2 h-2 rounded-full flex items-center justify-center shadow-lg" />
                            )}
                        </button>

                        <button onClick={onOpenCart} className="relative group text-white/70 hover:text-white transition-colors" aria-label="Cart">
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
                            )}
                        </button>

                        <button onClick={() => setIsMobileMenuOpen((v) => !v)} className="md:hidden text-white/70 hover:text-white" aria-label="Menu">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="fixed inset-y-0 left-0 w-[80%] max-w-sm z-[310] bg-[#0B0B0D] border-r border-white/10 pt-28 px-8 md:hidden flex flex-col pb-8 shadow-2xl"
                        >
                            {mobileView === 'main' ? (
                                <div className="flex flex-col gap-8 text-left flex-1">
                                    <NavLink to="/shop" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClassShop}>Store</NavLink>
                                    <NavLink to="/about" end onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>About</NavLink>
                                    <NavLink to="/contact" end onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass}>Contact</NavLink>
                                    <button onClick={() => { setIsMobileMenuOpen(false); handleWishlistClick(); }} className="text-2xl font-serif transition-colors text-white hover:text-[#D4AF37] inline-flex items-center justify-start gap-4">
                                        <Heart size={22} /> Wishlist
                                        {wishlistCount > 0 && <span className="bg-[#D4AF37] text-black text-[11px] font-bold px-3 py-1 rounded-full">{wishlistCount}</span>}
                                    </button>
                                    {user && !user.isAnonymous ? (
                                        <button onClick={() => setMobileView('account')} className="text-2xl font-serif transition-colors text-white hover:text-[#D4AF37] inline-flex items-center justify-start gap-4">
                                            <User size={22} /> Account
                                        </button>
                                    ) : (
                                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="text-2xl font-serif transition-colors text-white hover:text-[#D4AF37] inline-flex items-center justify-start gap-4">
                                            <User size={22} /> Sign In
                                        </button>
                                    )}

                                    {/*{user && !user.isAnonymous && (*/}
                                    {/*    <div className="mt-auto border-t border-white/10 pt-6">*/}
                                    {/*        <button onClick={() => { setIsMobileMenuOpen(false); auth && signOut(auth); navigate('/'); }} className="text-sm uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors flex items-center justify-start gap-3 w-full">*/}
                                    {/*            <LogOut size={16} /> Secure Sign Out*/}
                                    {/*        </button>*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 h-full max-h-full overflow-hidden text-left">
                                    <button onClick={() => setMobileView('main')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold mb-6 pb-6 border-b border-white/10 w-full group">
                                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Main Menu
                                    </button>
                                    <div className="overflow-y-auto flex-1 custom-scrollbar space-y-6 pb-6">
                                        {ACCOUNT_SECTIONS.map(sec => (
                                            <div key={sec.title}>
                                                <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">{sec.title}</h4>
                                                <div className="space-y-1">
                                                    {sec.items.map(item => (
                                                        <NavLink key={item.id} to={`/account/${item.id}`} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-sm text-xs tracking-widest uppercase transition-all ${isActive || location.pathname.endsWith(item.id) ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37] font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                                                            <item.icon size={16} /> {item.label}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;