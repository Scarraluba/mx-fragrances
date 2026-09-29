/**
 * Project: mxfrragrance
 * Created: 2026/05/14 19:09
 * Author: Scarra Luba
 */
import {Link, useLocation} from "react-router-dom";
import React from "react";
import GoldBottleIcon from '../assets/logo.svg';
import {IoLogoTiktok, IoLogoInstagram, IoLogoFacebook} from "react-icons/io5";

const Footer = () => {
    const location = useLocation();
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <footer className="bg-black pt-12 pb-8 border-t border-white/5 font-sans relative">
            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={GoldBottleIcon} alt="MX Logo" className="w-6 h-6"/>
                            <span className="text-white/90 font-serif font-bold text-lg tracking-tight">MX</span>
                        </Link>
                        <div className="flex gap-8">
                            <a href="#" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                                <IoLogoInstagram size={14}/> Instagram
                            </a>
                            <a href="#" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                                <IoLogoFacebook size={14}/> Facebook
                            </a>
                            <a href="#" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                                <IoLogoTiktok size={14}/> TikTok
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                        <Link to="/legal/terms" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Terms of Vault</Link>
                        <Link to="/legal/privacy" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Privacy Policy</Link>
                        <Link to="/legal/shipping" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Shipping & Returns</Link>
                        <Link to="/legal/payment" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">Payment & Order Policy</Link>
                        <Link to="/legal/faq" className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold transition-colors">FAQ</Link>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-bold">
                        © 2026 MX Fragrances. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;