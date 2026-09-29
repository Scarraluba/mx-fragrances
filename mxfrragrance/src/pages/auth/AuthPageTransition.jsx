/**
 * Project: mxfrragrance
 * Created: 2026/05/14 18:46
 * Author: Scarra Luba
 */
//import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const AuthPageTransition = () => {
    const location = useLocation()

    return (
        <div
            key={location.pathname}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
            <Outlet />
        </div>
    )
}

export default AuthPageTransition