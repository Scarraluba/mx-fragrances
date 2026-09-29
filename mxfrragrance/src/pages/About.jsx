/**
 * Project: mxfrragrance
 * Created: 2026/05/18 15:01
 * Author: Scarra Luba
 */
import {getStoreInfo} from "../helpers/Storefront.js";
import {useEffect, useState} from "react";

//import "./About.css";

const About = () => {
    const [storeInfo, setStoreInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadStoreInfo = async () => {

            setLoading(true);

            const response = await getStoreInfo();

            if (response.success) {

               // console.log(response.message);
               // console.log(response.data[0].about);

                setStoreInfo(response.data[0].about);

            } else {

                console.error(response.message);

            }

            setLoading(false);
        };

        loadStoreInfo().then(r => {});

    }, []);
    return (
        <div className="pt-36 pb-24 container mx-auto px-6 max-w-4xl text-left min-h-screen">
            <div className="space-y-16">
                <div className="space-y-4">
                    <p className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-semibold">Our Philosophy</p>
                    <h1 className="text-6xl text-white font-serif leading-tight tracking-tight">{storeInfo.heading1} <br /> <span className="italic">{storeInfo.heading2}</span></h1>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                        <p className="text-white/80 leading-relaxed font-light whitespace-pre-wrap">{storeInfo.philosophy}</p>
                        <p className="text-white/40 text-sm leading-relaxed italic border-l border-[#D4AF37] pl-6 py-2">"{storeInfo.quote}"</p>
                    </div>
                    <div className="space-y-6">
                        <p className="text-white/80 leading-relaxed font-light whitespace-pre-wrap">{storeInfo.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;