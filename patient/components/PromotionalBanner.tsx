"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PromotionalBannerProps {
    message?: string;
    backgroundColor?: string;
    textColor?: string;
    dismissible?: boolean;
}

export default function PromotionalBanner({
    message = "Medical Disclaimer: This is not medical advice. For emergencies, call 102 or visit a hospital.",
    backgroundColor = "#10B981",
    textColor = "text-white",
    dismissible = true,
}: PromotionalBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div
            className={`${textColor} py-3 px-4 text-center text-sm relative`}
            style={{ backgroundColor }}
        >
            <p>{message}</p>
            {dismissible && (
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                    aria-label="Close banner"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
