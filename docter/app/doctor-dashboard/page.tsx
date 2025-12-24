"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, Activity, Clock, Plus, MoreHorizontal } from "lucide-react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";

export default function DoctorDashboard() {
    const [dashboardData, setDashboardData] = useState<any>({
        stats: { patients: 0, appointments: 0, earnings: 0 },
        upcomingAppointments: [],
        loading: true
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                let did: string | null = null;

                // 1. Try to get Doctor ID
                if (user) {
                    const { data: doctorData } = await supabase
                        .from('doctors')
                        .select('did')
                        .eq('uid', user.id)
                        .single();
                    if (doctorData) did = doctorData.did;
                }

                // 2. Demo fallback
                if (!did) {
                    const { data: anyDoctor } = await supabase
                        .from('doctors')
                        .select('did')
                        .limit(1)
                        .single();
                    if (anyDoctor) did = anyDoctor.did;
                }

                if (!did) {
                    setDashboardData((prev: any) => ({ ...prev, loading: false }));
                    return;
                }

                // 3. Fetch Data
                const { count: totalAppointments } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('did', did);

                const { data: recentApts } = await supabase
                    .from('appointments')
                    .select('pid')
                    .eq('did', did)
                    .limit(100);

                // @ts-ignore
                const uniquePatients = new Set(recentApts?.map(a => a.pid)).size;

                const { data: earningsData } = await supabase
                    .from('appointments')
                    .select('payment_amount')
                    .eq('did', did)
                    .eq('status', 'completed');

                // @ts-ignore
                const totalEarnings = earningsData?.reduce((sum, item) => sum + (item.payment_amount || 0), 0) || 0;

                const { data: upcomingData } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patients (
                            users (
                                name
                            )
                        )
                    `)
                    .eq('did', did)
                    .gte('start_time', new Date().toISOString())
                    .order('start_time', { ascending: true })
                    .limit(5);

                const upcomingAppointments = (upcomingData || []).map((apt: any) => ({
                    id: apt.aid,
                    patientName: apt.patients?.users?.name || 'Unknown Patient',
                    time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(apt.start_time).toLocaleDateString(),
                    type: apt.mode || 'Online',
                    status: apt.status
                }));

                setDashboardData({
                    stats: {
                        patients: uniquePatients,
                        appointments: totalAppointments || 0,
                        earnings: totalEarnings
                    },
                    upcomingAppointments,
                    loading: false
                });

            } catch (err) {
                console.error("Dashboard Error:", err);
                setDashboardData((prev: any) => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Total Patients', value: dashboardData.stats.patients, icon: Users, color: 'emerald' },
        { label: 'Appointments', value: dashboardData.stats.appointments, icon: Calendar, color: 'blue' },
        { label: 'Total Earnings', value: `$${dashboardData.stats.earnings}`, icon: DollarSign, color: 'orange' },
    ];

    return (
        <SidebarLayout>
            <div className="w-full px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-14 h-14 rounded-full bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardData.loading ? '...' : stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Appointments (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Upcoming Appointments</h3>
                            <button className="text-sm text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {dashboardData.loading ? (
                                <p className="text-center text-gray-500 py-10">Loading schedule...</p>
                            ) : dashboardData.upcomingAppointments.length > 0 ? (
                                dashboardData.upcomingAppointments.map((apt: any) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                {apt.patientName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{apt.patientName}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {apt.time} • {apt.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {apt.status}
                                            </span>
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No upcoming appointments today.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors text-left">
                                    <div className="bg-white text-emerald-600 p-2 rounded-lg">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">New Appointment</span>
                                </button>
                                <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors text-left">
                                    <div className="bg-white text-emerald-600 p-2 rounded-lg">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Add Patient Record</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
