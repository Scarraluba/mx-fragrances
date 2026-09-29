/**
 * Project: mx-admin
 * Created: 2026/05/14 18:44
 * Author: Scarra Luba
 */

import {useState} from "react";
import {
    Eye, EyeOff, Lock, Mail, User,
} from "lucide-react";

import {Link} from "react-router-dom";
import {signUp} from "../../helpers/Auth.js";

const Register = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordsMatch = password === confirmPassword;

    function handleSubmit(event){
        event.preventDefault();
        signUp(email,password);

       console.log(email+"",password);
       // event.target.reset();
    }

    return (<div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
                <h1 className="mb-6 text-center text-3xl font-bold">
                    Register
                </h1>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/*<div>*/}
                    {/*    <label className="mb-2 block text-sm font-medium">*/}
                    {/*        Username*/}
                    {/*    </label>*/}

                    {/*    <div className="flex items-center rounded-xl border px-3">*/}
                    {/*        <User size={18}/>*/}

                    {/*        <input*/}
                    {/*            type="text"*/}
                    {/*            placeholder="Enter username"*/}
                    {/*            className="w-full bg-transparent p-3 outline-none"*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email
                        </label>

                        <div className="flex items-center rounded-xl border px-3">
                            <Mail size={18}/>

                            <input
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent p-3 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Password
                        </label>

                        <div className="flex items-center rounded-xl border px-3">
                            <Lock size={18}/>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent p-3 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (<EyeOff size={18}/>) : (<Eye size={18}/>)}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Confirm Password
                        </label>

                        <div className="flex items-center rounded-xl border px-3">
                            <Lock size={18}/>

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-transparent p-3 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (<EyeOff size={18}/>) : (<Eye size={18}/>)}
                            </button>
                        </div>

                        {!passwordsMatch && confirmPassword.length > 0 && (<p className="mt-2 text-sm">
                                Passwords do not match
                            </p>)}
                    </div>

                    <button
                        type="submit"
                        disabled={!passwordsMatch}
                        className="w-full rounded-xl border p-3 font-medium disabled:opacity-50"
                    >
                        Create Account
                    </button>

                    <p className="text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="underline"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>);
};

export default Register;