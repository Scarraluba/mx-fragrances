/**
 * Project: mxfrragrance
 * Created: 2026/05/18 14:55
 * Author: Scarra Luba
 */
import {
    collection,
    getDocs,
} from "firebase/firestore";

import { db } from "/Config.js";

const storefrontRef = collection(db, "storefront");

// READ ALL
export const getStoreInfo = async () => {
    try {
        const snapshot = await getDocs(storefrontRef);

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            message: "StoreInfo loaded successfully.",
            data
        };

    } catch (error) {
        console.error("getStoreInfo failed:", error);

        return {
            success: false,
            message: "Unable to load storeInfo right now."
        };
    }
};

