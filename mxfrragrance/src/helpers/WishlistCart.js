/**
 * Project: mxfrragrance
 * Created: 2026/05/18 06:32
 * Author: Scarra Luba
 */

import {
    addDoc, collection, deleteDoc, doc, query, where, onSnapshot, updateDoc
} from "firebase/firestore";

import {db} from "/Config.js";

/* =========================================================
 * REFERENCES
 * ========================================================= */

const wishlistRef = collection(db, "wishlist");
const cartRef = collection(db, "cart");

/* =========================================================
 * COMMON HELPERS
 * ========================================================= */

const invalidCallback = () => {
};

const validateUserId = (userId) => {
    return typeof userId === "string" && userId.trim().length > 0;
};

const validateObject = (data) => {
    return data !== null && typeof data === "object" && !Array.isArray(data);
};

/* =========================================================
 * WISHLIST
 * ========================================================= */

/**
 * Creates a wishlist item for the authenticated user.
 *
 * @param {string} userId Firebase authentication UID.
 * @param {Object} item Wishlist item data.
 * @returns {Promise<Object>} Operation result.
 */
export const createWishlistItem = async (userId, item) => {

    try {

        if (!validateUserId(userId)) {

            return {
                success: false, message: "User ID is required to add an item."
            };

        }

        if (!validateObject(item)) {

            return {
                success: false, message: "Please enter valid wishlist information."
            };

        }

        const dataToSave = {
            ...item, userId
        };

        const docRef = await addDoc(wishlistRef, dataToSave);

        return {

            success: true,

            message: "Item added to wishlist successfully.",

            data: {
                id: docRef.id, ...dataToSave
            }

        };

    } catch (error) {

        console.error("createWishlistItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to add item to wishlist right now."

        };

    }

};

/**
 * Listens to the authenticated user's wishlist.
 *
 * @param {string} userId Firebase authentication UID.
 * @param {Function} callback Listener callback.
 * @returns {Function} Firestore unsubscribe function.
 */
export const listenWishlist = (userId, callback) => {

    if (typeof callback !== "function") {

        console.error("listenWishlist: Invalid callback function.");

        return invalidCallback;

    }

    if (!validateUserId(userId)) {

        callback({

            success: false,

            message: "Missing userId for wishlist listener.",

            data: []

        });

        return invalidCallback;

    }

    try {

        const q = query(wishlistRef, where("userId", "==", userId));

        return onSnapshot(q,

            (snapshot) => {

                const data = snapshot.docs.map((snapshotDocument) => ({

                    id: snapshotDocument.id,

                    ...snapshotDocument.data()

                }));

                callback({

                    success: true,

                    message: "Wishlist loaded successfully.",

                    data

                });

            },

            (error) => {

                console.error("listenWishlist snapshot error:", error);

                callback({

                    success: false,

                    message: error?.message || "Unable to load wishlist right now.",

                    data: []

                });

            });

    } catch (error) {

        console.error("listenWishlist failed:", error);

        callback({

            success: false,

            message: error?.message || "Unable to start wishlist listener.",

            data: []

        });

        return invalidCallback;

    }

};

/**
 * Updates a wishlist item.
 *
 * @param {string} id Firestore wishlist document ID.
 * @param {Object} updatedData Updated fields.
 * @returns {Promise<Object>} Operation result.
 */
export const updateWishlistItem = async (id, updatedData) => {

    try {

        if (!id) {

            return {

                success: false,

                message: "Wishlist item ID is missing."

            };

        }

        if (!validateObject(updatedData)) {

            return {

                success: false,

                message: "Please enter valid update information."

            };

        }

        const ref = doc(db, "wishlist", id);

        await updateDoc(ref, updatedData);

        return {

            success: true,

            message: "Wishlist item updated successfully.",

            data: {
                id, ...updatedData
            }

        };

    } catch (error) {

        console.error("updateWishlistItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to update wishlist item right now."

        };

    }

};

/**
 * Deletes a wishlist item.
 *
 * @param {string} id Firestore wishlist document ID.
 * @returns {Promise<Object>} Operation result.
 */
export const deleteWishlistItem = async (id) => {

    try {

        if (!id) {

            return {

                success: false,

                message: "Wishlist item ID is missing."

            };

        }

        const ref = doc(db, "wishlist", id);

        await deleteDoc(ref);

        return {

            success: true,

            message: "Wishlist item removed successfully."

        };

    } catch (error) {

        console.error("deleteWishlistItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to remove wishlist item right now."

        };

    }

};

/* =========================================================
 * CART
 * ========================================================= */

/**
 * Creates a cart item for the authenticated user.
 *
 * @param {string} userId Firebase authentication UID.
 * @param {Object} item Cart item data.
 * @returns {Promise<Object>} Operation result.
 */
export const createCartItem = async (userId, item) => {

    try {

        if (!validateUserId(userId)) {

            return {

                success: false,

                message: "User ID is required to add an item to the cart."

            };

        }

        if (!validateObject(item)) {

            return {

                success: false,

                message: "Please enter valid cart information."

            };

        }

        const dataToSave = {

            ...item,

            userId

        };

        const docRef = await addDoc(cartRef, dataToSave);

        return {

            success: true,

            message: "Item added to cart successfully.",

            data: {

                id: docRef.id,

                ...dataToSave

            }

        };

    } catch (error) {

        console.error("createCartItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to add item to cart right now."

        };

    }

};

/**
 * Listens to the authenticated user's cart.
 *
 * @param {string} userId Firebase authentication UID.
 * @param {Function} callback Listener callback.
 * @returns {Function} Firestore unsubscribe function.
 */
export const listenCart = (userId, callback) => {

    if (typeof callback !== "function") {

        console.error("listenCart: Invalid callback function.");

        return invalidCallback;

    }

    if (!validateUserId(userId)) {

        callback({

            success: false,

            message: "Missing userId for cart listener.",

            data: []

        });

        return invalidCallback;

    }

    try {

        const q = query(cartRef, where("userId", "==", userId));

        return onSnapshot(q,

            (snapshot) => {

                const data = snapshot.docs.map((snapshotDocument) => ({

                    id: snapshotDocument.id,

                    ...snapshotDocument.data()

                }));

                callback({

                    success: true,

                    message: "Cart loaded successfully.",

                    data

                });

            },

            (error) => {

                console.error("listenCart snapshot error:", error);

                callback({

                    success: false,

                    message: error?.message || "Unable to load cart right now.",

                    data: []

                });

            });

    } catch (error) {

        console.error("listenCart failed:", error);

        callback({

            success: false,

            message: error?.message || "Unable to start cart listener.",

            data: []

        });

        return invalidCallback;

    }

};

/**
 * Updates a cart item.
 *
 * @param {string} id Firestore cart document ID.
 * @param {Object} updatedData Updated fields.
 * @returns {Promise<Object>} Operation result.
 */
export const updateCartItem = async (id, updatedData) => {

    try {

        if (!id) {

            return {

                success: false,

                message: "Cart item ID is missing."

            };

        }

        if (!validateObject(updatedData)) {

            return {

                success: false,

                message: "Please enter valid update information."

            };

        }

        const ref = doc(db, "cart", id);

        await updateDoc(ref, updatedData);

        return {

            success: true,

            message: "Cart item updated successfully.",

            data: {

                id,

                ...updatedData

            }

        };

    } catch (error) {

        console.error("updateCartItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to update cart item right now."

        };

    }

};

/**
 * Deletes a cart item.
 *
 * @param {string} id Firestore cart document ID.
 * @returns {Promise<Object>} Operation result.
 */
export const deleteCartItem = async (id) => {

    try {

        if (!id) {

            return {

                success: false,

                message: "Cart item ID is missing."

            };

        }

        const ref = doc(db, "cart", id);

        await deleteDoc(ref);

        return {

            success: true,

            message: "Cart item removed successfully."

        };

    } catch (error) {

        console.error("deleteCartItem failed:", error);

        return {

            success: false,

            message: error?.message || "Unable to remove cart item right now."

        };

    }

};