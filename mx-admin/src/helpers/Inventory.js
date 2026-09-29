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

// CREATE
export const createProduct = async (product) => {
    try {
        if (!product || typeof product !== "object") {
            return {
                success: false,
                message: "Please enter valid product information."
            };
        }

        const docRef = await addDoc(productsRef, product);

        return {
            success: true,
            message: "Product created successfully.",
            data: {
                id: docRef.id,
                ...product
            }
        };

    } catch (error) {
        console.error("createProduct failed:", error);

        return {
            success: false,
            message: "Unable to create product right now. Please try again."
        };
    }
};

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
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
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

// UPDATE
export const updateProduct = async (id, updatedData) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Product ID is missing."
            };
        }

        if (!updatedData || typeof updatedData !== "object") {
            return {
                success: false,
                message: "Please enter valid update information."
            };
        }

        const ref = doc(db, "products", id);

        await updateDoc(ref, updatedData);

        return {
            success: true,
            message: "Product updated successfully.",
            data: {
                id,
                ...updatedData
            }
        };

    } catch (error) {
        console.error("updateProduct failed:", error);

        return {
            success: false,
            message: "Unable to update product right now. Please try again."
        };
    }
};

// DELETE
export const deleteProduct = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Product ID is missing."
            };
        }

        const ref = doc(db, "products", id);

        await deleteDoc(ref);

        return {
            success: true,
            message: "Product deleted successfully."
        };

    } catch (error) {
        console.error("deleteProduct failed:", error);

        return {
            success: false,
            message: "Unable to delete product right now. Please try again."
        };
    }
};

/* =========================================================
 * COMBOS
 * ========================================================= */

const combosRef = collection(db, "combos");

// CREATE
export const createCombo = async (combo) => {
    try {
        if (!combo || typeof combo !== "object") {
            return {
                success: false,
                message: "Please enter valid combo information."
            };
        }

        const docRef = await addDoc(combosRef, combo);

        return {
            success: true,
            message: "Combo created successfully.",
            data: {
                id: docRef.id,
                ...combo
            }
        };

    } catch (error) {
        console.error("createCombo failed:", error);

        return {
            success: false,
            message: "Unable to create combo right now. Please try again."
        };
    }
};

// READ ALL
export const getCombos = async () => {
    try {
        const snapshot = await getDocs(combosRef);

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            message: "Combos loaded successfully.",
            data
        };

    } catch (error) {
        console.error("getCombos failed:", error);

        return {
            success: false,
            message: "Unable to load combos right now."
        };
    }
};
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

// UPDATE
export const updateCombo = async (id, updatedData) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Combo ID is missing."
            };
        }

        if (!updatedData || typeof updatedData !== "object") {
            return {
                success: false,
                message: "Please enter valid update information."
            };
        }

        const ref = doc(db, "combos", id);

        await updateDoc(ref, updatedData);

        return {
            success: true,
            message: "Combo updated successfully.",
            data: {
                id,
                ...updatedData
            }
        };

    } catch (error) {
        console.error("updateCombo failed:", error);

        return {
            success: false,
            message: "Unable to update combo right now. Please try again."
        };
    }
};

// DELETE
export const deleteCombo = async (id) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Combo ID is missing."
            };
        }

        const ref = doc(db, "combos", id);

        await deleteDoc(ref);

        return {
            success: true,
            message: "Combo deleted successfully."
        };

    } catch (error) {
        console.error("deleteCombo failed:", error);

        return {
            success: false,
            message: "Unable to delete combo right now. Please try again."
        };
    }
};