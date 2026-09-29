/**
 * Project: mx-admin
 * Created: 2026/05/14 18:44
 * Author: Scarra Luba
 */

import {Mail} from "lucide-react";
import {Link} from "react-router-dom";
import {useState} from "react";
import {handlePasswordReset} from "../../helpers/Auth.js";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    function handleSubmit(event){
        event.preventDefault();
        handlePasswordReset(email);

    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
                <h1 className="mb-2 text-center text-3xl font-bold">
                    Forgot Password
                </h1>

                <p className="mb-6 text-center text-sm">
                    Enter your email address and we’ll send you a
                    password reset link.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email
                        </label>

                        <div className="flex items-center rounded-xl border px-3">
                            <Mail size={18}/>

                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="Enter email"
                                className="w-full bg-transparent p-3 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl border p-3 font-medium"
                    >
                        Send Reset Link
                    </button>

                    <p className="text-center text-sm">
                        Remember your password?{" "}
                        <Link
                            to="/login"
                            className="underline"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;