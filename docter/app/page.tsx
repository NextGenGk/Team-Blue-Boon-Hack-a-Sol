"use client";

import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="AyurSutra Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 font-medium hover:text-emerald-600">Features</button>
                        <button className="text-gray-600 font-medium hover:text-emerald-600">Pricing</button>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-48 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium text-sm mb-6 border border-emerald-100">
                        <Activity className="w-4 h-4" /> AI-Powered Practice Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        The Modern OS for <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Holistic Healthcare</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Streamline your clinical workflow, manage patient records effortlessy, and get AI-driven insights—all in one beautiful dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/signup')}
                            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Get Started <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                            View Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Insights</h3>
                        <p className="text-gray-600">AI-driven analysis of patient history and trends to support your diagnosis.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Records</h3>
                        <p className="text-gray-600">Enterprise-grade security ensuring your patient data is safe and compliant.</p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 mb-6">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Scheduling</h3>
                        <p className="text-gray-600">Automated appointment management with reminders to reduce no-shows.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
