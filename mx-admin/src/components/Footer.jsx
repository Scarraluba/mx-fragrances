/**
 * Project: mx-admin
 * Created: 2026/05/14 19:09
 * Author: Scarra Luba
 */

import {
    Mail,
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="border-t">
            <div
                className="
                    mx-auto flex max-w-7xl
                    flex-col gap-6 px-4 py-8
                    md:flex-row md:items-center
                    md:justify-between
                "
            >
                {/* =====================================
                    LEFT
                ===================================== */}

                <div>
                    <h2 className="text-lg font-bold">
                        LOGO
                    </h2>

                    <p className="mt-2 text-sm">
                        Built with React and Tailwind.
                    </p>
                </div>

                {/* =====================================
                    CENTER
                ===================================== */}

                <div
                    className="
                        flex flex-wrap items-center gap-4
                        text-sm
                    "
                >
                    <button className="transition hover:underline">
                        Home
                    </button>

                    <button className="transition hover:underline">
                        About
                    </button>

                    <button className="transition hover:underline">
                        Contact
                    </button>

                    <button className="transition hover:underline">
                        Privacy
                    </button>
                </div>

                {/* =====================================
                    RIGHT
                ===================================== */}

                <div className="flex items-center gap-3">
                    {/*<button*/}
                    {/*    className="*/}
                    {/*        rounded-xl border p-2*/}
                    {/*        transition hover:bg-black/5*/}
                    {/*    "*/}
                    {/*>*/}
                    {/*    <Github size={18}/>*/}
                    {/*</button>*/}

                    {/*<button*/}
                    {/*    className="*/}
                    {/*        rounded-xl border p-2*/}
                    {/*        transition hover:bg-black/5*/}
                    {/*    "*/}
                    {/*>*/}
                    {/*    <Linkedin size={18}/>*/}
                    {/*</button>*/}

                    {/*<button*/}
                    {/*    className="*/}
                    {/*        rounded-xl border p-2*/}
                    {/*        transition hover:bg-black/5*/}
                    {/*    "*/}
                    {/*>*/}
                    {/*    <Instagram size={18}/>*/}
                    {/*</button>*/}

                    <button
                        className="
                            rounded-xl border p-2
                            transition hover:bg-black/5
                        "
                    >
                        <Mail size={18}/>
                    </button>                    <button
                        className="
                            rounded-xl border p-2
                            transition hover:bg-black/5
                        "
                    >
                        <Mail size={18}/>
                    </button>                    <button
                        className="
                            rounded-xl border p-2
                            transition hover:bg-black/5
                        "
                    >
                        <Mail size={18}/>
                    </button>                    <button
                        className="
                            rounded-xl border p-2
                            transition hover:bg-black/5
                        "
                    >
                        <Mail size={18}/>
                    </button>
                </div>
            </div>

            {/* =========================================
                BOTTOM
            ========================================= */}

            <div
                className="
                    border-t px-4 py-4
                    text-center text-sm
                "
            >
                © 2026 mx-admin. All rights
                reserved.
            </div>
        </footer>
    );
};

export default Footer;