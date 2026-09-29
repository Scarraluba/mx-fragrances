/**
 * Project: mxfrragrance
 * Created: 2026/05/14 19:55
 * Author: Scarra Luba
 */

import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail
} from "firebase/auth";

import {auth, db, googleProvider} from "../../Config.js";

import {
    doc, setDoc, getDoc, updateDoc, serverTimestamp
} from "firebase/firestore";

export const signUp = async (email, password, fullName = "", phoneNumber = "") => {

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid, email: user.email, fullName, phoneNumber,
            role: "clientele", active: true,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp()

        });

        return {
            ok: true, user
        };

    } catch (error) {

        return {
            ok: false, message: error.message, code: error.code
        };

    }

};

export const googleLogin = async () => {

    try {

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {

            await setDoc(userRef, {

                uid: user.uid,
                email: user.email || "",
                fullName: user.displayName || "",
                phoneNumber: user.phoneNumber || "",

                role: "clientele",
                active: true,

                provider: "google",

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()

            });

        } else {
            await updateDoc(userRef, {
                updatedAt: serverTimestamp()
            });

        }

        return {
            ok: true, user
        };

    } catch (error) {

        return {
            ok: false, message: error.message, code: error.code
        };

    }

};

export const updateUserProfile = async (uid, fullName = "", phoneNumber = "") => {

    try {

        await updateDoc(doc(db, "users", uid), {
            fullName, phoneNumber, updatedAt: serverTimestamp()
        });

        return {
            ok: true, message: "Profile updated successfully"
        };

    } catch (error) {
        return {
            ok: false, message: error.message, code: error.code
        };

    }

};

export const signIn = async (email, password) => {

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            success: true, message: "Login successful", user: userCredential.user
        };

    } catch (error) {

        return{
            success: false, message: error.message, code: error.code
        };

    }

};

export const logout = async () => signOut(auth);

export const handlePasswordReset = async (email) => {

    try {

        await sendPasswordResetEmail(auth, email);

        return {

            ok: true, message: "Password reset email sent. Check your inbox."

        };

    } catch (error) {

        return {

            ok: false, message: error.message, code: error.code

        };

    }

};

export const getUserRole = async (uid) => {

    try {

        const snapshot = await getDoc(doc(db, "users", uid));

        if (!snapshot.exists()) {

            return {

                ok: false, message: "User not found"

            };

        }

        return {

            ok: true, role: snapshot.data().role, data: snapshot.data()

        };

    } catch (error) {

        return {

            ok: false, message: error.message, code: error.code

        };

    }

};
