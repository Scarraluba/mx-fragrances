/**
 * Project: mx-admin
 * Created: 2026/05/15 20:40
 * Author: Scarra Luba
 */
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    onSnapshot,
    orderBy,arrayUnion
} from "firebase/firestore";
import { db } from "/Config.js";

/* =========================================================
 * CREATE ORDER (ADMIN/SYSTEM)
 * ========================================================= */

export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: orderData.status || "Payment Pending"
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("createOrder failed:", error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
 * LISTEN TO ALL ORDERS (READ / LISTEN)
 * ========================================================= */

export const listenToAllOrders = (callback) => {
    const q = query(collection(db, "orders"));

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs
            .map((d) => ({
                id: d.id,
                ...d.data()
            }))
            .sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.seconds - a.createdAt.seconds;
            });
        callback(orders);
    }, (error) => {
        console.error("listenToAllOrders failed:", error);
        callback([]);
    });
};

/* =========================================================
 * GET SINGLE ORDER (READ)
 * ========================================================= */

export const getOrder = async (orderId) => {
    try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) {
            return { success: true, data: { id: snap.id, ...snap.data() } };
        }
        return { success: false, message: "Order not found" };
    } catch (error) {
        console.error("getOrder failed:", error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
 * UPDATE ORDER STATUS (UPDATE)
 * ========================================================= */

export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const ref = doc(db, "orders", orderId);
        await updateDoc(ref, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("updateOrderStatus failed:", error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
 * UPDATE ORDER DETAILS (UPDATE)
 * ========================================================= */

export const updateOrderDetails = async (orderId, updateData) => {
    try {
        const ref = doc(db, "orders", orderId);
        await updateDoc(ref, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("updateOrderDetails failed:", error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
 * DELETE ORDER (DELETE)
 * ========================================================= */

export const deleteOrder = async (orderId) => {
    try {
        await deleteDoc(doc(db, "orders", orderId));
        return { success: true };
    } catch (error) {
        console.error("deleteOrder failed:", error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
 * ADD TRACKING EVENT (UPDATE)
 * ========================================================= */

export const addTrackingEvent = async (orderId, event) => {
    try {
        const ref = doc(db, "orders", orderId);

        // Atomic update: Appends directly to the array without reading it first
        await updateDoc(ref, {
            tracking: arrayUnion({
                ...event,
                time: new Date().toLocaleTimeString(),
                date: new Date().toISOString().split("T")[0]
            }),
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        // Look at your browser console! If it says "Missing or insufficient permissions", it is a security rule issue.
        console.error("addTrackingEvent failed:", error);
        return { success: false, message: error.message };
    }
};

/* =========================================================
 * MARK ORDER PAID (UPDATE)
 * ========================================================= */

export const markOrderPaid = async (orderId, paymentReference = null) => {
    try {
        const ref = doc(db, "orders", orderId);
        await updateDoc(ref, {
            status: "paid",
            paymentStatus: "paid",
            paidAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            paymentReference
        });
        return { success: true };
    } catch (error) {
        console.error("markOrderPaid failed:", error);
        return { success: false };
    }
};