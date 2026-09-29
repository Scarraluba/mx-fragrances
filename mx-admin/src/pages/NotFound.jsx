/**
 * Project: mx-admin
 * Created: 2026/05/14 17:49
 * Author: Scarra Luba
 */

import {Link} from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-white">
            <h1 className="text-8xl font-black text-red-500">
                404
            </h1>

            <h2 className="mt-4 text-2xl font-bold">
                Page Not Found
            </h2>

            <p className="mt-2 max-w-md text-center text-zinc-400">
                The page you are looking for does not exist or has
                been moved.
            </p>

            <Link to="/"
                  className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 hover:bg-zinc-200">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;