/**
 * Project: mx-admin
 * Created: 2026/05/14 12:51
 * Author: Scarra Luba
 */

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import AuthPageTransition from "./pages/auth/AuthPageTransition.jsx";
import StoreCms from "./pages/StoreCms.jsx";

import useAuth from "./context/auth/useAuth.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import { BarChart3, DollarSign, Eye, Globe, Package, Settings, Shield, ShoppingCart, User, Users } from "lucide-react";
import DesktopSideBar from "./components/DesktopSideBar.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import OrderPage from "./pages/OrderPage.jsx";

const InnerApp = () => {
    const { user } = useAuth();
    const drawerRef = useRef(null);

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const activePath = location.pathname;

    const SIDEBAR_NAV = [{ path: '/', label: 'Intelligence', icon: BarChart3 }, {
        path: '/inventory', label: 'Vault Control', icon: Package
    }, { path: '/orders', label: 'Operations', icon: ShoppingCart }, {
        path: '/crm', label: 'Clientele', icon: Users
    }, { path: '/finance', label: 'Financials', icon: DollarSign }, {
        path: '/staff', label: 'Personnel', icon: Shield
    }, { path: '/settings', label: 'System', icon: Settings }, {
        path: '/cms', label: 'Storefront CMS', icon: Globe
    }];



    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

    const handleNavClick = (path) => {
        navigate(path);
        setIsMobileNavOpen(false);
    };

    const onLogout = () => {

    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMobileNavOpen &&
                drawerRef.current &&
                !drawerRef.current.contains(event.target)
            ) {
                setIsMobileNavOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileNavOpen]);

    return (<React.Fragment>
        <div className="h-[100dvh] w-full flex overflow-hidden text-left selection:bg-[#D4AF37] selection:text-black">

            {!isAuthPage &&
                <>
                    {/*Desktop Sidebar*/}
                    <DesktopSideBar sidebarnav={SIDEBAR_NAV} callbackfn={item => (<button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium tracking-wide transition-colors 
                ${activePath === item.path ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                        <item.icon size={16} className={activePath === item.path ? "text-black" : "text-white/40"} />
                        {item.label}
                    </button>)} onClick={onLogout} />

                </>
            }

            {/* Main Content Constraint */}
            <div className="flex-1 flex flex-col h-dvh overflow-hidden bg-[#0B0B0D]">

                {/* Mobile Header */}
                <MobileHeader onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} mobileNavOpen={isMobileNavOpen} />

                <AnimatePresence>
                    {isMobileNavOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 z-20 md:hidden"
                            />

                            {/* Drawer */}
                            <motion.div
                                ref={drawerRef}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="md:hidden fixed left-0 top-15 bottom-16 w-[70%] z-30 bg-[#111111] p-4 flex flex-col shadow-2xl overflow-y-auto border-r border-white/5 custom-scrollbar"
                            >
                                <div className="space-y-2">
                                    {[...SIDEBAR_NAV, ...STOREFRONT_NAV].map(item => (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavClick(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${activePath === item.path
                                                    ? 'bg-[#D4AF37] text-black'
                                                    : 'text-white/60 bg-white/5'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <main className="flex-1 overflow-y-auto p-0 md:p-0 custom-scrollbar relative">
                    <Suspense fallback={<PageLoader />}>

                        <Routes>
                            <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
                            <Route path="/inventory" element={user ? <InventoryPage /> : <Navigate to="/login" replace />} />
                            <Route path="/cms" element={user ? <StoreCms /> : <Navigate to="/login" replace />} />
                            <Route path="/orders" element={user ? <OrderPage /> : <Navigate to="/login" replace />} />

                            <Route element={<AuthPageTransition />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                            </Route>
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </main>

                <Navbar callbackfn={item => (
                    <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activePath === item.path ? 'text-[#D4AF37]' : 'text-white/40 hover:text-white/80'}`}
                    >
                        <item.icon size={20} strokeWidth={activePath === item.path ? 2.5 : 1.5} />
                        <span className="text-[9px] uppercase tracking-wider font-bold">{item.label}</span>
                    </button>
                )} />
            </div>
        </div>


    </React.Fragment>);
};
const PageLoader = () => {
    return (
        <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 flex flex-col items-center justify-center"
        >
            <div className="relative w-16 h-16 mb-6">
                {/* Outer spinning ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[2px] border-white/5 border-t-[#D4AF37]"
                />
                {/* Inner stationary lock */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock size={18} className="text-[#D4AF37]" />
                </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-white tracking-widest mb-2">MX</h2>
            <p className="text-[#D4AF37]/70 text-[9px] uppercase tracking-widest animate-pulse">
                Initializing
            </p>
        </motion.div>
    );
};
const App = () => {
    return (<BrowserRouter>
        <div
            className="min-h-[100dvh] bg-[#0B0B0D] text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; transition: all 0.3s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.6); }
        @media print {
          body * { visibility: hidden; }
          #invoice-modal, #invoice-modal * { visibility: visible; }
          #invoice-modal { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; margin: 0; box-shadow: none; background: white; }
        }
      `}</style>
            <InnerApp />
        </div>
    </BrowserRouter>

    );
};

export default App;