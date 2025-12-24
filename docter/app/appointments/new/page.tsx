"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Clock, Video, MapPin, Link as LinkIcon, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function NewAppointmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);

    // Form State
    const [selectedPatient, setSelectedPatient] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('Online');
    const [meetLink, setMeetLink] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch All Patients (In real app, filter by doctor's patients)
                const { data } = await supabase
                    .from('patients')
                    .select(`
                        pid,
                        users (
                            name,
                            email
                        )
                    `)
                    .limit(50);

                if (data) setPatients(data);
            }
        };
        fetchPatients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Get Doctor ID
            const { data: doctor } = await supabase
                .from('doctors')
                .select('did')
                .eq('uid', user.id)
                .single();

            if (!doctor) throw new Error("Doctor profile not found");

            // Combine Date & Time
            const startDateTime = new Date(`${date}T${time}`);
            // End time + 30 mins
            const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

            const { error } = await supabase
                .from('appointments')
                .insert({
                    did: doctor.did,
                    pid: selectedPatient,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'scheduled',
                    mode: type,
                    meet_link: type === 'Online' ? meetLink : null,
                    payment_status: 'pending',
                    payment_amount: 500 // Default consultation fee
                });

            if (error) throw error;

            toast.success("Appointment Scheduled!");
            router.push('/appointments');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Appointments
                </button>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule New Appointment</h1>
                    <p className="text-gray-500 mb-8">Create a consultation for a patient.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Patient Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="">-- Choose a Patient --</option>
                                    {patients.map(p => (
                                        <option key={p.pid} value={p.pid}>
                                            {p.users?.name} ({p.users?.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Mode</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType('Online')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${type === 'Online'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                        }`}
                                >
                                    <Video className="w-5 h-5" /> Online Video
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('In-Person')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${type === 'In-Person'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                        }`}
                                >
                                    <MapPin className="w-5 h-5" /> In-Clinic
                                </button>
                            </div>
                        </div>

                        {/* Meet Link (Only if Online) */}
                        {type === 'Online' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Google Meet Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : 'Confirm Appointment'} <Check className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}
