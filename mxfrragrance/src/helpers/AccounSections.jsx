/**
 * Project: mxfrragrance
 * Created: 2026/05/14 21:54
 * Author: Scarra Luba
 */
import {FileText, Mail, MapPin, Package, RotateCcw, Shield, Star, User} from "lucide-react";

export const ACCOUNT_SECTIONS = [
    {
        title: "Orders",
        items: [
            { id: "orders", label: "Orders", icon: Package, desc: "Track, return, or view past purchases" },
            { id: "invoices", label: "Invoices", icon: FileText, desc: "Preview and save tax documents" },
            { id: "returns", label: "Returns", icon: RotateCcw, desc: "Track vault return protocols" },
            { id: "reviews", label: "Asset Reviews", icon: Star, desc: "Manage your collection valuations" }
        ]
    },
    {
        title: "Profile",
        items: [
            { id: "personal-details", label: "Identity Protocols", icon: User, desc: "Update your vault identity" },
            { id: "security", label: "Security & Access", icon: Shield, desc: "Keys, 2FA, and trusted hardware" },
            { id: "addresses", label: "Drop Locations", icon: MapPin, desc: "Manage your delivery coordinates" },
            { id: "newsletter", label: "Communications", icon: Mail, desc: "Manage intelligence briefings" }
        ]
    }
];