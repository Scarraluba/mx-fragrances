/**
 * Project: mxfrragrance
 * Created: 2026/05/14 18:44
 * Author: Scarra Luba
 */

import {useState} from "react";
import {
    Mail,
    ArrowLeft
} from "lucide-react";

import {
    Link
} from "react-router-dom";

import {
    handlePasswordReset
} from "../../helpers/Auth.js";

import {motion} from "framer-motion";

const ForgotPassword = () => {

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [success, setSuccess] =
        useState(null);

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);

        const result =
            await handlePasswordReset(email);

        setLoading(false);

        if (!result.ok) {

            setError(result.message);
            return;

        }

        setSuccess(result.message);

    };

    return (

        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="pt-40 pb-24 container mx-auto px-6 max-w-md text-left min-h-[75vh]"
        >

            <div className="bg-zinc-900 border border-white/5 p-8 md:p-10 shadow-2xl rounded-sm">

                <h2 className="text-xl sm:text-2xl font-serif text-white text-left mb-1 sm:mb-2">
                    Reset Password
                </h2>

                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-6">
                    Recover your account
                </p>

                {error && (

                    <div
                        className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-[10px] uppercase tracking-widest rounded-sm">
                        {error}
                    </div>

                )}

                {success && (

                    <div
                        className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 p-3 text-[10px] uppercase tracking-widest rounded-sm">
                        {success}
                    </div>

                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-5"
                >

                    <div>

                        <label
                            className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 sm:mb-1.5 block">
                            Email Address
                        </label>

                        <div className="relative">

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pl-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            />

                            <Mail
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#D4AF37] text-black py-2.5 sm:py-3 rounded-sm text-[9px] sm:text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors shadow-lg mt-2 sm:mt-4 disabled:opacity-50"
                    >

                        {loading
                            ? "Sending..."
                            : "Send Reset Link"
                        }

                    </button>

                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase tracking-widest hover:text-[#D4AF37] transition-colors mt-6"
                    >

                        <ArrowLeft size={14}/>

                        Back To Login

                    </Link>

                </form>

            </div>

        </motion.div>

    );

};

export default ForgotPassword;

