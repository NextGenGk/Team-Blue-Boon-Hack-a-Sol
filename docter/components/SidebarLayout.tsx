"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, LayoutDashboard, Calendar, Users, Receipt, Settings, Phone, LogOut, Search, User, Stethoscope } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [docName, setDocName] = useState('Doctor');
    const [initial, setInitial] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.last_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'Doctor';
                setDocName(name);
                if (user.email) setInitial(user.email[0].toUpperCase());
            }
        };
        getUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor-dashboard' },
        { name: 'Appointments', icon: Calendar, path: '/appointments' },
        { name: 'My Patients', icon: Users, path: '/patients' },
        { name: 'Receipts', icon: Receipt, path: '/receipts' },
        { name: 'Settings', icon: Settings, path: '/settings' },
        { name: 'Contact us', icon: Phone, path: '/contact' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl hidden lg:flex sticky top-0 h-screen text-white">
                <div className="p-6 flex items-center justify-center border-b border-slate-800">
                    <img
                        src="/logo.png"
                        alt="AyurSutra Logo"
                        className="h-12 object-contain cursor-pointer transition-transform hover:scale-105 brightness-0 invert"
                        onClick={() => router.push('/')}
                    />
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${(pathname === item.path)
                                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${(pathname === item.path) ? 'text-white' : 'text-slate-400'}`} />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors mb-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shadow-sm shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
                            Welcome Back, Dr. {docName}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold transition-all px-5 py-2.5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md active:scale-95"
                            >
                                <Search className="w-4 h-4" />
                                AI Search
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-0 lg:pl-6 lg:border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    Dr. {docName}
                                </p>
                                <p className="text-xs text-gray-500">Cardiologist</p>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden text-emerald-600 font-bold">
                                    {initial ? initial : <User className="w-5 h-5 text-gray-400" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
