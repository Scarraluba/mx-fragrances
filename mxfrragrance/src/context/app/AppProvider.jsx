/**
 * Project: mxfrragrance
 * Created: 2026/05/14 22:13
 * Author: Scarra Luba
 */

import { useState, useEffect, useRef } from "react";
import AppContext from "./AppContext";

import { listenProducts, listenCombos } from "../../helpers/Inventory.js";

import {
    listenCart,
    listenWishlist,
    createCartItem,
    createWishlistItem,
    updateCartItem,
    deleteCartItem,
    deleteWishlistItem
} from "../../helpers/WishlistCart.js";

import useAuthContext from "../auth/useAuthContext.jsx";

const CART_STORAGE_KEY = "mx_vault_cart_v1";
const WISHLIST_STORAGE_KEY = "mx_vault_wishlist_v1";

const readLocalArray = (key) => {
    try {
        const saved = localStorage.getItem(key);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Failed to read localStorage key "${key}":`, error);
        return [];
    }
};

const writeLocalArray = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
    } catch (error) {
        console.error(`Failed to write localStorage key "${key}":`, error);
    }
};

const normalizeCartItem = (item) => {
    const normalizedItem = {
        type: item?.type || "product",
        refId: item?.refId || item?.id || item?.productId || "",
        brand: item?.brand || {},
        title: item?.title || item?.name || "Unknown Item",
        image: item?.image || "",
        unitPrice: Number(item?.unitPrice ?? item?.price ?? 0),
        quantity: Math.max(1, Number(item?.quantity ?? 1)),
        meta: item?.meta || {},
        sizeMl: item?.sizeMl || item?.meta?.sizeMl || 0,
        sku: item?.sku || item?.meta?.sku || "N/A"
    };

    return normalizedItem;
};

const normalizeWishlistItem = (item) => {
    return {
        ...item,
        refId: item?.refId || item?.id || item?.productId || "",
        type: item?.type || "product"
    };
};

const getCartKey = (item) => {
    return `${item?.type || "product"}:${item?.refId || ""}`;
};

const getWishlistKey = (item) => {
    return `${item?.type || "product"}:${item?.refId || ""}`;
};

const mergeCartItems = (localItems, remoteItems) => {
    const merged = new Map();

    for (const item of remoteItems || []) {
        const normalized = normalizeCartItem(item);

        if (!normalized.refId) {
            continue;
        }

        merged.set(getCartKey(normalized), normalized);
    }

    for (const item of localItems || []) {
        const normalized = normalizeCartItem(item);

        if (!normalized.refId) {
            continue;
        }

        const key = getCartKey(normalized);
        const existing = merged.get(key);

        if (existing) {
            merged.set(key, {
                ...existing,
                ...normalized,
                id: existing.id || normalized.id,
                quantity: Math.max(
                    1,
                    Number(existing.quantity || 0) + Number(normalized.quantity || 0)
                )
            });
        } else {
            merged.set(key, normalized);
        }
    }

    return Array.from(merged.values());
};

const mergeWishlistItems = (localItems, remoteItems) => {
    const merged = new Map();

    for (const item of remoteItems || []) {
        const normalized = normalizeWishlistItem(item);

        if (!normalized.refId) {
            continue;
        }

        merged.set(getWishlistKey(normalized), normalized);
    }

    for (const item of localItems || []) {
        const normalized = normalizeWishlistItem(item);

        if (!normalized.refId) {
            continue;
        }

        const key = getWishlistKey(normalized);

        if (!merged.has(key)) {
            merged.set(key, normalized);
        }
    }

    return Array.from(merged.values());
};

export function AppProvider({ children }) {
    const { user } = useAuthContext();

    const [currentPath, setCurrentPath] = useState("");

    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);

    const [cart, setCart] = useState(() => readLocalArray(CART_STORAGE_KEY));
    const [wishlist, setWishlist] = useState(() => readLocalArray(WISHLIST_STORAGE_KEY));

    const previousUserRef = useRef(null);
    const syncingUserRef = useRef(null);
    const firebaseReadyRef = useRef(false);

    /* =========================================================
     * INVENTORY LISTENERS
     * ========================================================= */

    useEffect(() => {
        const unsubProducts = listenProducts((response) => {
            if (response?.success) {
                setProducts(response.data || []);
            }
        });

        const unsubCombos = listenCombos((response) => {
            if (response?.success) {
                setCombos(response.data || []);
            }
        });

        return () => {
            if (typeof unsubProducts === "function") {
                unsubProducts();
            }

            if (typeof unsubCombos === "function") {
                unsubCombos();
            }
        };
    }, []);

    /* =========================================================
     * GUEST LOCAL STORAGE
     *
     * Firestore is NEVER touched while logged out.
     * ========================================================= */

    useEffect(() => {
        if (user?.uid) {
            return;
        }

        writeLocalArray(CART_STORAGE_KEY, cart);
    }, [cart, user?.uid]);

    useEffect(() => {
        if (user?.uid) {
            return;
        }

        writeLocalArray(WISHLIST_STORAGE_KEY, wishlist);
    }, [wishlist, user?.uid]);

    /* =========================================================
     * FIREBASE LISTENERS
     *
     * Only start these listeners for authenticated users.
     * ========================================================= */

    useEffect(() => {
        if (!user?.uid) {
            firebaseReadyRef.current = false;
            return undefined;
        }

        firebaseReadyRef.current = false;

        const unsubCart = listenCart(user.uid, (response) => {
            if (!response?.success) {
                console.error(
                    "listenCart failed:",
                    response?.message || response?.error || response
                );
                return;
            }

            if (!syncingUserRef.current) {
                setCart(response.data || []);
            }

            firebaseReadyRef.current = true;
        });

        const unsubWishlist = listenWishlist(user.uid, (response) => {
            if (!response?.success) {
                console.error(
                    "listenWishlist failed:",
                    response?.message || response?.error || response
                );
                return;
            }

            if (!syncingUserRef.current) {
                setWishlist(response.data || []);
            }
        });

        return () => {
            if (typeof unsubCart === "function") {
                unsubCart();
            }

            if (typeof unsubWishlist === "function") {
                unsubWishlist();
            }

            firebaseReadyRef.current = false;
        };
    }, [user?.uid]);

    /* =========================================================
     * LOGIN / LOGOUT SYNC
     *
     * Guest data is merged into the authenticated Firebase
     * account instead of simply overwriting either side.
     * ========================================================= */

    useEffect(() => {
        const synchronizeUserData = async () => {
            const uid = user?.uid || null;
            const previousUid = previousUserRef.current;

            /* -------------------------------------------------
             * LOGGED OUT
             *
             * Keep the current cart/wishlist locally.
             * This means a guest can continue shopping after
             * logging out.
             * ------------------------------------------------- */

            if (!uid) {
                if (previousUid) {
                    writeLocalArray(CART_STORAGE_KEY, cart);
                    writeLocalArray(WISHLIST_STORAGE_KEY, wishlist);
                }

                syncingUserRef.current = null;
                previousUserRef.current = null;
                firebaseReadyRef.current = false;

                return;
            }

            /* -------------------------------------------------
             * SAME USER
             *
             * No need to run the migration repeatedly.
             * ------------------------------------------------- */

            if (previousUid === uid && syncingUserRef.current !== uid) {
                return;
            }

            /* -------------------------------------------------
             * PREVENT DUPLICATE SYNC
             * ------------------------------------------------- */

            if (syncingUserRef.current === uid) {
                return;
            }

            syncingUserRef.current = uid;
            previousUserRef.current = uid;

            try {
                const localCart = readLocalArray(CART_STORAGE_KEY);
                const localWishlist = readLocalArray(WISHLIST_STORAGE_KEY);

                /* -------------------------------------------------
                 * If there is no guest data, Firebase remains the
                 * source of truth.
                 * ------------------------------------------------- */

                if (!localCart.length && !localWishlist.length) {
                    syncingUserRef.current = null;
                    return;
                }

                /* -------------------------------------------------
                 * Upload guest cart.
                 *
                 * We deliberately remove the local ID because
                 * Firestore owns its document IDs.
                 * ------------------------------------------------- */

                for (const item of localCart) {
                    const normalized = normalizeCartItem(item);

                    if (!normalized.refId) {
                        continue;
                    }

                    const { id, ...firebaseItem } = normalized;

                    try {
                        await createCartItem(uid, firebaseItem);
                    } catch (error) {
                        console.error(
                            "Failed to sync local cart item:",
                            error
                        );
                    }
                }

                /* -------------------------------------------------
                 * Upload guest wishlist.
                 * ------------------------------------------------- */

                for (const item of localWishlist) {
                    const normalized = normalizeWishlistItem(item);

                    if (!normalized.refId) {
                        continue;
                    }

                    const { id, ...firebaseItem } = normalized;

                    try {
                        await createWishlistItem(uid, firebaseItem);
                    } catch (error) {
                        console.error(
                            "Failed to sync local wishlist item:",
                            error
                        );
                    }
                }

                /* -------------------------------------------------
                 * Firebase now owns the authenticated data.
                 *
                 * Do NOT immediately clear React state.
                 * The Firestore listener will return the actual
                 * Firebase state.
                 * ------------------------------------------------- */

                localStorage.removeItem(CART_STORAGE_KEY);
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
            } catch (error) {
                console.error("synchronizeUserData failed:", error);
            } finally {
                syncingUserRef.current = null;
            }
        };

        synchronizeUserData();
    }, [user?.uid]);

    /* =========================================================
     * CART ACTIONS
     * ========================================================= */

    const addToCart = async (item) => {
        const normalizedItem = normalizeCartItem(item);

        if (!normalizedItem.refId) {
            console.error(
                "addToCart failed: Product is missing an ID!",
                item
            );
            return;
        }

        const existingItem = cart.find(
            (currentItem) =>
                currentItem.refId === normalizedItem.refId &&
                currentItem.type === normalizedItem.type
        );

        /* -----------------------------------------------------
         * AUTHENTICATED
         *
         * Firebase is the source of truth.
         * ----------------------------------------------------- */

        if (user?.uid) {
            try {
                if (existingItem?.id) {
                    await updateCartItem(existingItem.id, {
                        quantity:
                            Number(existingItem.quantity || 0) +
                            Number(normalizedItem.quantity || 1)
                    });
                } else {
                    await createCartItem(user.uid, normalizedItem);
                }
            } catch (error) {
                console.error("addToCart Firebase failed:", error);
            }

            return;
        }

        /* -----------------------------------------------------
         * GUEST
         *
         * Local state + localStorage.
         * ----------------------------------------------------- */

        if (existingItem) {
            setCart((previous) =>
                previous.map((currentItem) =>
                    currentItem.id === existingItem.id
                        ? {
                            ...currentItem,
                            quantity:
                                Number(currentItem.quantity || 0) +
                                Number(normalizedItem.quantity || 1)
                        }
                        : currentItem
                )
            );

            return;
        }

        const localItem = {
            ...normalizedItem,
            id: `local-cart-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`
        };

        setCart((previous) => [...previous, localItem]);
    };

    const removeFromCart = async (id) => {
        if (!id) {
            return;
        }

        /* Authenticated */
        if (user?.uid) {
            try {
                await deleteCartItem(id);
            } catch (error) {
                console.error("removeFromCart Firebase failed:", error);
            }

            return;
        }

        /* Guest */
        setCart((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const updateCartQuantity = async (id, delta) => {
        if (!id) {
            return;
        }

        const item = cart.find(
            (currentItem) => currentItem.id === id
        );

        if (!item) {
            return;
        }

        const newQuantity = Math.max(
            1,
            Number(item.quantity || 0) + Number(delta || 0)
        );

        /* Authenticated */
        if (user?.uid) {
            try {
                await updateCartItem(id, {
                    quantity: newQuantity
                });
            } catch (error) {
                console.error(
                    "updateCartQuantity Firebase failed:",
                    error
                );
            }

            return;
        }

        /* Guest */
        setCart((previous) =>
            previous.map((currentItem) =>
                currentItem.id === id
                    ? {
                        ...currentItem,
                        quantity: newQuantity
                    }
                    : currentItem
            )
        );
    };

    /* =========================================================
     * WISHLIST ACTIONS
     * ========================================================= */

    const addToWishlist = async (item) => {
        const normalizedItem = normalizeWishlistItem(item);

        if (!normalizedItem.refId) {
            console.error(
                "addToWishlist failed: Item is missing an ID!",
                item
            );
            return;
        }

        const existingItem = wishlist.find(
            (currentItem) =>
                currentItem.refId === normalizedItem.refId &&
                currentItem.type === normalizedItem.type
        );

        if (existingItem) {
            return;
        }

        /* -----------------------------------------------------
         * AUTHENTICATED
         * ----------------------------------------------------- */

        if (user?.uid) {
            try {
                const { id, ...firebaseItem } = normalizedItem;

                await createWishlistItem(
                    user.uid,
                    firebaseItem
                );
            } catch (error) {
                console.error(
                    "addToWishlist Firebase failed:",
                    error
                );
            }

            return;
        }

        /* -----------------------------------------------------
         * GUEST
         * ----------------------------------------------------- */

        const localItem = {
            ...normalizedItem,
            id: `local-wishlist-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`
        };

        setWishlist((previous) => [
            ...previous,
            localItem
        ]);
    };

    const removeFromWishlist = async (id) => {
        if (!id) {
            return;
        }

        /* Authenticated */
        if (user?.uid) {
            try {
                await deleteWishlistItem(id);
            } catch (error) {
                console.error(
                    "removeFromWishlist Firebase failed:",
                    error
                );
            }

            return;
        }

        /* Guest */
        setWishlist((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    /* =========================================================
     * PROVIDER
     * ========================================================= */

    return (
        <AppContext.Provider
            value={{
                currentPath,
                setCurrentPath,

                products,
                combos,

                cart,
                wishlist,

                addToCart,
                removeFromCart,
                updateCartQuantity,

                addToWishlist,
                removeFromWishlist
            }}
        >
            {children}
        </AppContext.Provider>
    );
}