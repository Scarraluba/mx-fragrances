/**
 * Project: mxfrragrance
 * Created: 2026/05/18 15:42
 * Author: Scarra Luba
 */

import React, { useEffect, useState } from 'react';

import {
    ChevronRight
} from 'lucide-react';
import {IoLogoTiktok, IoLogoInstagram,IoLogoFacebook } from "react-icons/io5";

import { getStoreInfo } from "../helpers/Storefront.js";

// import "./Contact.css";

const Contact = () => {

    const [content, setStoreInfo] = useState({
        heading1: "",
        heading2: "",
        description: "",
        instagram: "",
        tiktok: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadStoreInfo = async () => {

            try {

                setLoading(true);

                const response = await getStoreInfo();

                if (response.success && response.data.length > 0) {

                    console.log(response.data);

                    setStoreInfo(response.data[0].contact);

                } else {

                    console.error(response.message);

                }

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        };

        loadStoreInfo();

    }, []);

    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="pt-36 pb-24 container mx-auto px-6 max-w-5xl text-left min-h-screen">

            <div className="grid md:grid-cols-2 gap-24">

                <div className="space-y-12">

                    <div className="space-y-4">

                        <p className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-semibold">
                            Inquiries
                        </p>

                        <h1 className="text-6xl text-white font-serif tracking-tight">
                            {content.heading1}
                            <br />
                            <span className="italic">
                                {content.heading2}
                            </span>
                        </h1>

                    </div>

                    <p className="text-white/50 leading-relaxed font-light max-w-sm whitespace-pre-wrap">
                        {content.description}
                    </p>

                    <div className="space-y-4">

                        {
                            content.instagram && (
                                <a
                                    href={`https://instagram.com/${content.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-white/70 hover:text-[#D4AF37] transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37] transition-all">
                                        <IoLogoInstagram size={20} />
                                    </div>

                                    <span className="text-xs uppercase tracking-widest font-medium">
                                        {content.instagram}
                                    </span>
                                </a>
                            )
                        }

                        {
                            content.tiktok && (
                                <a
                                    href={`https://tiktok.com/${content.tiktok.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-white/70 hover:text-[#D4AF37] transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37] transition-all">
                                        <IoLogoTiktok size={20} />
                                    </div>

                                    <span className="text-xs uppercase tracking-widest font-medium">
                                        {content.tiktok}
                                    </span>
                                </a>
                            )
                        }

                    </div>

                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        alert("Inquiry received securely. We will be in touch.");
                    }}
                    className="bg-zinc-900 p-10 space-y-6 border border-white/5 shadow-2xl rounded-sm"
                >

                    <div className="space-y-2">

                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            Identity
                        </label>

                        <input
                            type="text"
                            className="w-full bg-black/50 border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            placeholder="Full Name"
                        />

                    </div>

                    <div className="space-y-2">

                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            Subject
                        </label>

                        <div className="relative">

                            <select className="w-full bg-black/50 border border-white/10 p-4 text-white/50 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none rounded-sm">

                                <option>Product Inquiry</option>
                                <option>Sourcing Request</option>
                                <option>Verification Services</option>
                                <option>Other</option>

                            </select>

                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>

                        </div>

                    </div>

                    <div className="space-y-2">

                        <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            Message
                        </label>

                        <textarea
                            rows="4"
                            className="w-full bg-black/50 border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            placeholder="How can we assist your collection?"
                        />

                    </div>

                    <button className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-all shadow-lg">
                        Send
                    </button>

                </form>

            </div>

        </div>
    );
};

export default Contact;