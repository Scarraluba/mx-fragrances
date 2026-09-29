/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:45
 * Author: Scarra Luba
 */

import {useContext} from "react";
import AuthContext from "./AuthContext";

const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuthContext must be used inside AuthProvider"
        );
    }

    return context;
};

export default useAuthContext;