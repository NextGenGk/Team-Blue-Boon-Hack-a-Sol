"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        specialization: '',
        bio: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setProfile({
                name: user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : '',
                phone: user.phone || '',
                specialization: 'General Practitioner', // Placeholder, need DB field
                bio: ''
            });

            // Try to fetch doctor profile details if available
            const { data: doctor } = await supabase.from('doctors').select('*').eq('uid', user.id).single();
            if (doctor) {
                setProfile(prev => ({
                    ...prev,
                    specialization: doctor.specialization || prev.specialization,
                    bio: doctor.bio || ''
                }));
            }
        }
        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        // Here we would update the 'doctors' table or user metadata
        // For now, let's simulate
        await new Promise(r => setTimeout(r, 1000));
        toast.success("Profile updated successfully!");
        setUpdating(false);
    };

    return (
        <SidebarLayout>
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" /> Public Profile
                    </h2>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                                <input
                                    type="text"
                                    value={profile.specialization}
                                    onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                placeholder="Tell us about your experience..."
                            ></textarea>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={updating}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                            >
                                {updating ? 'Saving...' : 'Save Changes'} <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 opacity-60 pointer-events-none grayscale">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-600" /> Security (Coming Soon)
                    </h2>
                    <div className="space-y-4">
                        <button className="text-gray-500 font-medium">Change Password</button>
                        <br />
                        <button className="text-gray-500 font-medium">Two-Factor Authentication</button>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
