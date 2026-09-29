/**
 * Project: mx-admin
 * Created: 2026/05/14 19:55
 * Author: Scarra Luba
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "/Config.js";

/* =========================================================
 * SIGN UP
 * ========================================================= */

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        return {
            success: true,
            message: "Account created successfully",
            user: userCredential.user
        };

    } catch (error) {
        return {
            success: false,
            message: error.message,
            code: error.code
        };
    }
};

/* =========================================================
 * SIGN IN
 * ========================================================= */

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        return {
            success: true,
            message: "Login successful",
            user: userCredential.user
        };

    } catch (error) {
        return {
            success: false,
            message: error.message,
            code: error.code
        };
    }
};

/* =========================================================
 * LOGOUT
 * ========================================================= */

export const logout = async () => {
    try {
        await signOut(auth);

        return {
            success: true,
            message: "Logged out successfully"
        };

    } catch (error) {
        return {
            success: false,
            message: error.message,
            code: error.code
        };
    }
};

/* =========================================================
 * PASSWORD RESET
 * ========================================================= */

export const handlePasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);

        return {
            success: true,
            message: "Password reset email sent"
        };

    } catch (error) {
        return {
            success: false,
            message: error.message,
            code: error.code
        };
    }
};