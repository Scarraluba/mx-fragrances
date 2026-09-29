/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:43
 * Author: Scarra Luba
 */

import { useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../../Config.js";

import {
    getUserRole,
    signIn,
    signUp,
    logout,
    updateUserProfile
} from "../../helpers/Auth.js";

const AuthProvider = ({ children }) => {

    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(null);

    const [userData, setUserData] = useState(null);

    useEffect(() => {

        const unsubscribe =
            onAuthStateChanged(auth, async (firebaseUser) => {

                try {

                    if (firebaseUser) {

                         /* console.log(
                          "User state changed:",
                            firebaseUser.uid
                        );*/

                        setUser(firebaseUser);

                        const response =
                            await getUserRole(firebaseUser.uid);

                        if (response.ok) {

                            setUserData(response.data);

                        }

                    } else {

                        console.log("User signed out");

                        setUser(null);

                        setUserData(null);

                    }

                } catch (error) {

                    console.error(error);

                } finally {

                    setLoading(false);

                }

            });

        return () => unsubscribe();

    }, []);

    const register = async (
        email,
        password,
        fullName="",
        phoneNumber=""
    ) => {

        setLoading(true);

        const response =
            await signUp(
                email,
                password,
                fullName,
                phoneNumber
            );

        setLoading(false);

        return response;

    };

    const login = async (email, password) => {

        setLoading(true);

        const response =
            await signIn(email, password);

        setLoading(false);

        return response;

    };

    const signOutUser = async () => {

        await logout();

    };

    const updateProfile = async (
        fullName="",
        phoneNumber=""
    ) => {

        if (!user) {

            return {
                ok: false,
                message: "No authenticated user"
            };

        }

        const response =
            await updateUserProfile(
                user.uid,
                fullName,
                phoneNumber
            );

        if (response.ok) {

            setUserData((previous) => ({
                ...previous,
                fullName,
                phoneNumber
            }));

        }

        return response;

    };

    const value = useMemo(() => {

        return {

            user,
            userData,

            loading,

            login,
            register,

            logout: signOutUser,

            updateProfile,

            setLoading

        };

    }, [user, userData, loading]);

    return (

        <AuthContext.Provider value={value}>

            {!loading && children}

        </AuthContext.Provider>

    );

};

export default AuthProvider;