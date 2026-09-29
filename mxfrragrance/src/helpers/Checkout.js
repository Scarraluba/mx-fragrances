/**
 * Project: mxfrragrance
 * Created: 2026/05/22
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
    writeBatch,
    onSnapshot,
    orderBy
} from "firebase/firestore";

import { db } from "/Config.js";

/* =========================================================
 * ORDER NUMBER COUNTER
 * ========================================================= */

const counterRef = doc(db, "counters", "orderNumber");

const generateOrderNumber = async () => {

    const snap = await getDoc(counterRef);

    let next = 1;

    if (snap.exists()) {
        next = (snap.data().lastNumber || 0) + 1;
    }

    await updateDoc(counterRef, {
        lastNumber: next
    });

    return `${String(next).padStart(6, "0")}`;
};

/* =========================================================
 * CHECKOUT CART
 * ========================================================= */

export const checkoutCart = async ({
    userId,
    shippingAddress,
    deliveryMethod,
    paymentMethod = "card",
    shippingFee = 0,
    fulfillment = "ship"
}) => {

    try {

        if (!userId) {
            return {
                success: false,
                message: "User ID required"
            };
        }

        if (fulfillment === "ship" && !shippingAddress) {
            return {
                success: false,
                message: "Shipping address required"
            };
        }

        /* ================================
         * GET CART
         * ================================ */

        const cartQuery = query(
            collection(db, "cart"),
            where("userId", "==", userId)
        );

        const cartSnap = await getDocs(cartQuery);

        if (cartSnap.empty) {
            return {
                success: false,
                message: "Cart is empty"
            };
        }

        const items = [];

        let subtotal = 0;

        cartSnap.forEach((d) => {

            const data = d.data();

            const price = Number(data.unitPrice || data.price || 0);
            const quantity = Number(data.quantity || 1);

            const itemSubtotal = price * quantity;

            subtotal += itemSubtotal;

            items.push({
                refId: data.refId || null,
                title: data.title || data.name || "",
                image: data.image || "",
                type: data.type || "product",
                unitPrice: price,
                quantity,
                subtotal: itemSubtotal
            });

        });

        const totalAmount = subtotal + shippingFee;

        /* ================================
         * ORDER NUMBER
         * ================================ */

        const orderNumber = await generateOrderNumber();

        /* ================================
         * PAYMENT STATE
         * ================================ */

        const isPaidInstantly =
            paymentMethod === "card" ||
            paymentMethod === "payfast";

        /* ================================
         * TRACKING
         * ================================ */

        const now = new Date();

        const date = now.toISOString().split("T")[0];

        const time = now.toLocaleTimeString();

        const tracking = [
            {
                event: "Order Placed",
                date,
                time,
                location: "Online Checkout"
            }
        ];

        if (isPaidInstantly) {
            tracking.push({
                event: "Payment Confirmed - Preparing for Dispatch",
                date,
                time,
                location: "MX Vault Systems"
            });
        }

        /* ================================
         * CREATE ORDER
         * ================================ */

        const orderData = {

            orderNumber,

            userId,

            items,

            subtotal,
            shippingFee,
            totalAmount,

            fulfillment,
            deliveryMethod,

            shippingAddress: shippingAddress || null,

            paymentMethod,

            status: isPaidInstantly
                ? "paid"
                : "pending_payment",

            paymentStatus: isPaidInstantly
                ? "paid"
                : "unpaid",

            createdAt: serverTimestamp(),

            paidAt: isPaidInstantly
                ? serverTimestamp()
                : null,

            deliveryDate: null,
            signedBy: null,

            tracking
        };

        const orderRef = await addDoc(
            collection(db, "orders"),
            orderData
        );

        /* ================================
         * CLEAR CART
         * ================================ */

        const batch = writeBatch(db);

        cartSnap.forEach((d) => {
            batch.delete(doc(db, "cart", d.id));
        });

        await batch.commit();

        /* ================================
         * RETURN
         * ================================ */

        return {
            success: true,
            orderId: orderRef.id,
            orderNumber,
            totalAmount
        };

    } catch (error) {

        console.error("checkoutCart failed:", error);

        return {
            success: false,
            message: "Checkout failed"
        };

    }

};

/* =========================================================
 * LISTEN TO USER ORDERS
 * ========================================================= */

export const listenToUserOrders = (
    userId,
    callback
) => {

    const q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {

        const orders = snapshot.docs
            .map((d) => ({
                id: d.id,
                ...d.data()
            }))
            .sort((a, b) => {

                if (!a.createdAt || !b.createdAt) {
                    return 0;
                }

                return (
                    b.createdAt.seconds -
                    a.createdAt.seconds
                );

            });
 
        callback(orders);

    }, (error) => {

        console.error("listenToUserOrders failed:", error);

        callback([]);

    });

};



/* =========================================================
 * LISTEN TO SINGLE ORDER
 * ========================================================= */

export const listenToOrder = (
    orderId,
    callback
) => {

    const ref = doc(db, "orders", orderId);

    return onSnapshot(ref, (snapshot) => {

        if (!snapshot.exists()) {
            callback(null);
            return;
        }

        callback({
            id: snapshot.id,
            ...snapshot.data()
        });

    }, (error) => {

        console.error("listenToOrder failed:", error);

        callback(null);

    });

};

/* =========================================================
 * MARK ORDER PAID
 * ========================================================= */

export const markOrderPaid = async (
    orderId,
    paymentReference = null
) => {

    try {

        const ref = doc(db, "orders", orderId);

        await updateDoc(ref, {
            status: "paid",
            paymentStatus: "paid",
            paidAt: serverTimestamp(),
            paymentReference
        });

        return {
            success: true
        };

    } catch (error) {

        console.error("markOrderPaid failed:", error);

        return {
            success: false
        };

    }

};