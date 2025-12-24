"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
    return (
        <SidebarLayout>
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                <p className="text-gray-500 text-sm mb-2">For general inquiries and support.</p>
                                <a href="mailto:support@ayursutra.com" className="text-emerald-600 font-bold hover:underline">support@ayursutra.com</a>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                <p className="text-gray-500 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+1234567890" className="text-blue-600 font-bold hover:underline">+1 (234) 567-890</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-600" /> Send a Message
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
                            </div>
                            <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
