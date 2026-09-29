/**
 * Project: mx-admin
 * Created: 2026/05/14 12:43
 * Author: Scarra Luba
 */

import {useEffect, useMemo, useState} from "react";
import AuthProviderContext from "./AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import {auth} from "../../../Config.js";
//import "./AuthProvider.css";

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User state changed:", user.uid);
                setUser(user);
            } else {
                console.log("User signed out");
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = useMemo(() => {
        return {
            user,
            loading,
            setLoading,
        };
    }, [user, loading]);

    return (
        <AuthProviderContext.Provider value={value}>
            {!loading && children}
        </AuthProviderContext.Provider>
    );
};

export default AuthProvider;