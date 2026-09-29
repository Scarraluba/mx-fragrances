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

const contentRef = collection(db, "storefront");

export const createContent = async (content) => {
    try {
        if (!content || typeof content !== "object") {
            return {
                success: false,
                message: "Please enter valid product information."
            };
        }

        const docRef = await addDoc(contentRef, content);

        return {
            success: true,
            message: "Content created successfully.",
            data: {
                id: docRef.id,
                ...content
            }
        };

    } catch (error) {
        console.error("createContent failed:", error);

        return {
            success: false,
            message: "Unable to create content right now. Please try again."
        };
    }
};

export const listenContent = (callback) => {
    if (typeof callback !== "function") {
        return {
            success: false,
            message: "Invalid callback function."
        };
    }

    return onSnapshot(contentRef, (snapshot) => {
        const content = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        callback({
            success: true,
            message: "Content retrieved successfully.",
            data: content
        });
    }, (error) => {
        console.error("listenContent failed:", error);
        callback({
            success: false,
            message: "Unable to retrieve content right now. Please try again."
        });
    });
};

export const updateContent = async (id, updatedContent) => {
    try {
        if (!id || typeof id !== "string") {
            return {
                success: false,
                message: "Please provide a valid content ID."
            };
        }

        const docRef = doc(db, "storefront", id);
        await updateDoc(docRef, updatedContent);

        return {
            success: true,
            message: "Content updated successfully.",
            data: {
                id,
                ...updatedContent
            }
        };
    } catch (error) {
        console.error("updateContent failed:", error);
        return {
            success: false,
            message: "Unable to update content right now. Please try again."
        };
    }
};
