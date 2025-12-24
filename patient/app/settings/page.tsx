"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { Settings, User, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
    return (
        <SidebarLayout>
            <div className="w-full px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Personal Information</p>
                                    <p className="text-sm text-gray-500">Update your name, phone, and address</p>
                                </div>
                                <button className="text-emerald-600 font-medium hover:underline">Edit</button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Appointment Reminders</p>
                                    <p className="text-sm text-gray-500">Get notified via email and SMS</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition-colors duration-200 ease-in-out bg-emerald-500 rounded-full cursor-pointer">
                                    <span className="absolute left-6 inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                </div>
                                <button className="text-emerald-600 font-medium hover:underline">Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
