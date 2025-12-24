"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart, Bell, Settings, User } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-3">
                        <div
                            className="flex items-center space-x-3 cursor-pointer group"
                            onClick={() => router.push("/")}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Heart className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                    AyurSutra
                                </h1>
                                <p className="text-xs text-gray-500">Doctor Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">
                                    Dr. Rajesh Kumar
                                </p>
                                <p className="text-xs text-gray-500">Cardiologist</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
