/**
 * Project: mx-admin
 * Created: 2026/05/15 20:40
 * Author: Scarra Luba
 */

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "firebase/firestore";

import { db } from "/Config.js";

/* =========================================================
 * PRODUCTS
 * ========================================================= */

const productsRef = collection(db, "products");

// REALTIME READ
export const listenProducts = (callback) => {
    if (typeof callback !== "function") {
        return {
            success: false,
            message: "Invalid callback function."
        };
    }

    try {
        return onSnapshot(
            productsRef,
            (snapshot) => {
                const data = snapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));

                callback({
                    success: true,
                    message: "Products loaded successfully.",
                    data
                });
            },
            (error) => {
                console.error("listenProducts snapshot error:", error);

                callback({
                    success: false,
                    message: "Unable to load products right now."
                });
            }
        );

    } catch (error) {
        console.error("listenProducts failed to start:", error);

        return {
            success: false,
            message: "Unable to start product listener."
        };
    }
};

/* =========================================================
 * COMBOS
 * ========================================================= */

const combosRef = collection(db, "combos");

// REALTIME READ
export const listenCombos = (callback) => {
    if (typeof callback !== "function") {
        return {
            success: false,
            message: "Invalid callback function."
        };
    }

    try {
        return onSnapshot(
            combosRef,
            (snapshot) => {
                const data = snapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));

                callback({
                    success: true,
                    message: "Combos loaded successfully.",
                    data
                });
            },
            (error) => {
                console.error("listenCombos snapshot error:", error);

                callback({
                    success: false,
                    message: "Unable to load combos right now."
                });
            }
        );

    } catch (error) {
        console.error("listenCombos failed to start:", error);

        return {
            success: false,
            message: "Unable to start combos listener."
        };
    }
};
