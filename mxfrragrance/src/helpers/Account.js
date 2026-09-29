/**
 * Project: mxfrragrance
 * Created: 2026/05/14 19:55
 * Author: Scarra Luba
 */

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where
} from "firebase/firestore";

import { db } from "/Config.js";

const addressBook = collection(db, "addressbook");

/**
 * CREATE ADDRESS
 */
export const createAddress = async (userId, address) => {
    try {
        if (!userId) return { success: false, message: "User ID is required." };
        if (!address || typeof address !== "object") return { success: false, message: "Invalid address data." };

        const dataToSave = {
            ...address,
            userId,
            isPrimary: address.isPrimary || false,
            createdAt: Date.now()
        };

        const docRef = await addDoc(addressBook, dataToSave);

        return {
            success: true,
            message: "Address created successfully.",
            data: { id: docRef.id, ...dataToSave }
        };

    } catch (error) {
        console.error("createAddress failed:", error);
        return { success: false, message: "Failed to create address." };
    }
};

/**
 * UPDATE ADDRESS (EDIT)
 */
export const updateAddress = async (addressId, updates) => {
    try {
        if (!addressId) return { success: false, message: "Address ID required." };

        const ref = doc(db, "addressbook", addressId);

        await updateDoc(ref, {
            ...updates,
            updatedAt: Date.now()
        });

        return {
            success: true,
            message: "Address updated successfully."
        };

    } catch (error) {
        console.error("updateAddress failed:", error);
        return { success: false, message: "Failed to update address." };
    }
};

/**
 * DELETE ADDRESS
 */
export const deleteAddress = async (addressId) => {
    try {
        if (!addressId) return { success: false, message: "Address ID required." };

        await deleteDoc(doc(db, "addressbook", addressId));

        return {
            success: true,
            message: "Address deleted successfully."
        };

    } catch (error) {
        console.error("deleteAddress failed:", error);
        return { success: false, message: "Failed to delete address." };
    }
};

/**
 * SET PRIMARY ADDRESS
 * ensures ONLY ONE primary per user
 */
export const setPrimaryAddress = async (userId, addressId) => {
    try {
        if (!userId || !addressId) {
            return { success: false, message: "Missing userId or addressId." };
        }

        const q = query(addressBook, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        const updates = snapshot.docs.map((d) => {
            const ref = doc(db, "addressbook", d.id);
            return updateDoc(ref, {
                isPrimary: d.id === addressId,
                updatedAt: Date.now()
            });
        });

        await Promise.all(updates);

        return {
            success: true,
            message: "Primary address updated."
        };

    } catch (error) {
        console.error("setPrimaryAddress failed:", error);
        return { success: false, message: "Failed to set primary address." };
    }
};

/**
 * GET USER ADDRESSES
 */
export const getUserAddresses = async (userId) => {
    try {
        if (!userId) return { success: false, message: "User ID required." };

        const q = query(addressBook, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        return {
            success: true,
            data
        };

    } catch (error) {
        console.error("getUserAddresses failed:", error);
        return { success: false, message: "Failed to fetch addresses." };
    }
};