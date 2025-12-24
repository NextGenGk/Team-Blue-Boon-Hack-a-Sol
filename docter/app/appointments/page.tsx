"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Video, MapPin, MoreHorizontal, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Demo Mode Fallback
                const { data: demoData } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patients (
                            pid,
                            users (
                                name,
                                email,
                                phone
                            )
                        )
                    `)
                    .order('start_time', { ascending: true })
                    .limit(20);

                setAppointments(formatAppointments(demoData || []));
                setLoading(false);
                return;
            }

            // Get Doctor ID
            const { data: doctor } = await supabase
                .from('doctors')
                .select('did')
                .eq('uid', user.id)
                .single();

            if (doctor) {
                const { data } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patients (
                            pid,
                            users (
                                name,
                                email,
                                phone
                            )
                        )
                    `)
                    .eq('did', doctor.did)
                    .order('start_time', { ascending: true });

                setAppointments(formatAppointments(data || []));
            } else {
                // Fetch All for Demo if no doctor profile found
                const { data: demoData } = await supabase
                    .from('appointments')
                    .select(`
                    *,
                    patients (
                        pid,
                        users (
                            name,
                            email,
                            phone
                        )
                    )
                `)
                    .limit(20);
                setAppointments(formatAppointments(demoData || []));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAppointments = (data: any[]) => {
        return data.map(apt => ({
            id: apt.aid,
            patientName: apt.patients?.users?.name || 'Unknown Patient',
            patientEmail: apt.patients?.users?.email,
            date: new Date(apt.start_time).toLocaleDateString(),
            time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: '30 min', // Calculate if end_time exists
            type: apt.mode || 'Online',
            status: apt.status || 'upcoming',
            link: apt.meet_link
        }));
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesTab =
            activeTab === 'upcoming' ? (apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'upcoming') :
                activeTab === 'completed' ? (apt.status === 'completed') :
                    (apt.status === 'cancelled');

        const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <SidebarLayout>
            <div className="w-full px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
                        <p className="text-gray-500">Manage your schedule and patient visits</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Calendar View
                        </button>
                        <button onClick={() => router.push('/appointments/new')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                            + New Appointment
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {['upcoming', 'completed', 'cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading appointments...</div>
                    ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt) => (
                            <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <Link href={`/appointments/${apt.id}`} className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity">
                                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl shrink-0">
                                        {apt.patientName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{apt.patientName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {apt.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {apt.time}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${apt.type === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {apt.type}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3 md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                                    {apt.status === 'scheduled' && apt.type === 'Online' && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                                            <Video className="w-4 h-4" /> Join Call
                                        </button>
                                    )}
                                    {apt.status === 'scheduled' && apt.type === 'In-Person' && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">
                                            <MapPin className="w-4 h-4" /> In Clinic
                                        </div>
                                    )}
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border dashed border-gray-200">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
                            <p className="text-gray-500 mb-6">You don't have any appointments in this category.</p>
                            {activeTab === 'upcoming' && (
                                <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                                    Schedule New
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
