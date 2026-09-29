/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:51
 * Author: Scarra Luba
 */

import React, {useMemo, useState} from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import AuthPageTransition from "./pages/auth/AuthPageTransition.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import useAppContext from "./context/app/UseAppContext.jsx";
import useAuthContext from "./context/auth/useAuthContext.jsx";
import Wishlist from "./pages/auth/Wishlist.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Account from "./pages/Account.jsx";
import Checkout from "./pages/Checkout.jsx";
import Legal from "./pages/Legal.jsx";
import Product from "./pages/Product.jsx";

const InnerApp = () => {
    const location = useLocation();

    const isAuthPage =
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/forgot-password';

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const {
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,

        wishlist,
        addToWishlist,
        removeFromWishlist
    } = useAppContext();

    const {user} = useAuthContext();

    const cartCount = useMemo(() => cart.reduce((s, i) => s + (i.quantity ?? 0), 0), [cart]);

    /* =========================================================
     * WISHLIST TOGGLE (UPDATED)
     * ========================================================= */
    const onToggleWishlist = (item) => {
        const refId = item.refId ?? item.id;
        const type = item.type ?? (item.isCombo ? "combo" : "product");

        // Use .find() instead of .some() so we can grab the unique Firebase/Local ID
        const existingItem = wishlist.find(
            w => w.refId === refId && w.type === type
        );

        if (existingItem) {
            // Pass the UNIQUE ID to the remove function, NOT the refId
            removeFromWishlist(existingItem.id);
            return;
        }

        // If it doesn't exist, add it
        addToWishlist({
            refId,
            type,
            title: item.title,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity: 1,
            meta: item.meta ?? {}
        });
    };

    /* =========================================================
     * CART ACTIONS
     * ========================================================= */
    const addProdCart = (t) => {

        addToCart(t);
        setIsCartOpen(true);
    };

    return (
        <React.Fragment>
            {!isAuthPage && (
                <Navbar
                    cartCount={cartCount}
                    onOpenCart={() => setIsCartOpen(true)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    wishlistCount={wishlist.length}
                    user={user}
                />
            )}

            <main className="flex-grow ">
                <Routes>
                    <Route path="/" element={<Home addToCart={addProdCart} wishlist={wishlist}
                                                   onToggleWishlist={onToggleWishlist}/>}/>
                    <Route path="/shop" element={<Shop addToCart={addProdCart} onToggleWishlist={onToggleWishlist}
                                                       searchQuery={searchQuery}/>}/>
                    <Route
                        path="/product/:id"
                        element={<Product
                            addToCart={addToCart}
                            onToggleWishlist={onToggleWishlist}
                        />}/>

                    <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onToggleWishlist={onToggleWishlist}
                                                               onAddToCart={addProdCart}/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/account" element={<Account/>}/>
                    <Route path="/account/*" element={<Account/>}/>
                    <Route path="/checkout/*" element={<Checkout/>}/>
                    <Route path="/legal" element={<Legal/>}/>
                    <Route path="/legal/:slug" element={<Legal/>}/>

                    <Route element={<AuthPageTransition/>}>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    </Route>

                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </main>

            {/* CART DRAWER (UPDATED PROPS) */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                // Updated to find the unique ID before updating
                updateQuantity={(refId, type, delta) => {
                    const item = cart.find(i => i.refId === refId && i.type === type);
                    if (item) {
                        // Pass the unique document ID to context
                        updateCartQuantity(item.id, delta);
                    }
                }}
                // Updated to find the unique ID before removing
                removeItem={(refId, type) => {
                    const item = cart.find(i => i.refId === refId && i.type === type);
                    if (item) {
                        // Pass the unique document ID to context
                        removeFromCart(item.id);
                    }
                }}
                onProceed={() => setIsCartOpen(false)}
                user={user}
            />

            {!isAuthPage && <Footer/>}
        </React.Fragment>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <div
                className="min-h-screen bg-[#0B0B0D] text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
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
                <InnerApp/>
            </div>
        </BrowserRouter>
    );
};

export default App;