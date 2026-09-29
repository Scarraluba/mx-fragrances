/**
 * Project: mxfrragrance
 * Created: 2026/05/14 18:44
 * Author: Scarra Luba
 */

import {useState} from "react";
import {
    Eye, EyeOff, Mail, User, Phone
} from "lucide-react";

import {
    useNavigate, Link
} from "react-router-dom";

import {
    signUp, googleLogin
} from "../../helpers/Auth.js";

import {motion} from "framer-motion";

const Register = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [error, setError] = useState(null);

    const passwordsMatch = password === confirmPassword;

    const handleGoogleLogin = async () => {

        setIsGoogleLoading(true);
        setError(null);

        const result = await googleLogin();

        setIsGoogleLoading(false);

        if (!result.ok) {

            setError(result.message);
            return;

        }

        navigate("/");

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!passwordsMatch) {

            setError("Passwords do not match.");
            return;

        }

        setLoading(true);
        setError(null);

        const result = await signUp(email, password, fullName, phoneNumber);

        setLoading(false);

        if (!result.ok) {

            setError(result.message);
            return;

        }

        navigate("/");

    };

    return (

        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="pt-20 pb-20 container mx-auto px-6 max-w-md text-left min-h-[75vh]"
        >

            <div className="bg-zinc-900 border border-white/5 p-8 md:p-10 shadow-2xl rounded-sm">

                <h2 className="text-xl sm:text-2xl font-serif text-white text-left mb-1 sm:mb-2">
                    Create Account
                </h2>

                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-6">
                    Join MX Fragrances
                </p>

                {error && (

                    <div
                        className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-[10px] uppercase tracking-widest rounded-sm">
                        {error}
                    </div>

                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-5"
                >

                    <div>

                        <label
                            className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 sm:mb-1.5 block">
                            Full Name
                        </label>

                        <div className="relative">

                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pl-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            />

                            <User
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                            />

                        </div>

                    </div>

                    {/*<div>*/}

                    {/*    <label*/}
                    {/*        className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 sm:mb-1.5 block">*/}
                    {/*        Phone Number*/}
                    {/*    </label>*/}

                    {/*    <div className="relative">*/}

                    {/*        <input*/}
                    {/*            type="tel"*/}
                    {/*            value={phoneNumber}*/}
                    {/*            onChange={(e) => setPhoneNumber(e.target.value)}*/}
                    {/*            className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pl-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"*/}
                    {/*        />*/}

                    {/*        <Phone*/}
                    {/*            size={16}*/}
                    {/*            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"*/}
                    {/*        />*/}

                    {/*    </div>*/}

                    {/*</div>*/}

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
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pl-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            />

                            <Mail
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                            />

                        </div>

                    </div>

                    <div>

                        <label
                            className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 sm:mb-1.5 block">
                            Password
                        </label>

                        <div className="relative">

                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pr-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >

                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}

                            </button>

                        </div>

                    </div>

                    <div>

                        <label
                            className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 sm:mb-1.5 block">
                            Confirm Password
                        </label>

                        <div className="relative">

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-2.5 sm:p-3 pr-10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >

                                {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}

                            </button>

                        </div>

                        {!passwordsMatch && confirmPassword.length > 0 && (

                            <p className="mt-2 text-red-400 text-[9px] uppercase tracking-widest">
                                Passwords do not match
                            </p>

                        )}

                    </div>

                    <button
                        type="submit"
                        disabled={loading || isGoogleLoading || !passwordsMatch}
                        className="w-full bg-[#D4AF37] text-black py-2.5 sm:py-3 rounded-sm text-[9px] sm:text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors shadow-lg mt-2 sm:mt-4 disabled:opacity-50"
                    >

                        {loading ? "Creating Account..." : "Create Account"}

                    </button>

                    <div className="relative flex items-center py-1 sm:py-2">

                        <div className="flex-grow border-t border-white/10"></div>

                        <span
                            className="flex-shrink-0 mx-4 text-white/30 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
                            Or continue with
                        </span>

                        <div className="flex-grow border-t border-white/10"></div>

                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || loading}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white py-2.5 sm:py-3 rounded-sm text-[9px] sm:text-[10px] uppercase tracking-widest font-bold hover:bg-[#222222] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >

                        {isGoogleLoading ? "Connecting..." : (<>
                                <svg
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />

                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />

                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />

                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />

                                </svg>

                                Authenticate via Google
                            </>)}

                    </button>

                    <p className="mt-8 text-center text-white/40 text-[10px] uppercase tracking-widest">

                        Already have an account?

                        <Link
                            to="/login"
                            className="text-[#D4AF37] ml-2 hover:underline focus:outline-none hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>

                    </p>

                </form>

            </div>

        </motion.div>

    );

};

export default Register;

