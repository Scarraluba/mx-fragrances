import {useContext} from "react";
import AppContext from "./AppContext.jsx";

export default function useAppContext() {
    const context =  useContext(AppContext);

    if (!context) {
        throw new Error(
            "useAuthContext must be used inside AuthProvider"
        );
    }

    return context;
}