"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, User, Video, FileText, Pill, Activity, ArrowLeft, Phone, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AppointmentDetails({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patients (
                            pid,
                            dob,
                            gender,
                            blood_group,
                            users (
                                name,
                                email,
                                phone
                            )
                        )
                    `)
                    .eq('aid', params.id)
                    .single();

                if (error) throw error;
                setAppointment(data);
            } catch (err) {
                console.error(err);
                toast.error("Could not load appointment details");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchAppointment();
    }, [params.id]);

    if (loading) return (
        <SidebarLayout>
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading details...</div>
            </div>
        </SidebarLayout>
    );

    if (!appointment) return (
        <SidebarLayout>
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-gray-500">Appointment not found</div>
                <button onClick={() => router.back()} className="text-emerald-600 hover:underline">Go Back</button>
            </div>
        </SidebarLayout>
    );

    const patient = appointment.patients?.users;
    const patientDetails = appointment.patients;

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('aid', appointment.aid);

            if (error) throw error;
            toast.success('Appointment Cancelled');
            setAppointment({ ...appointment, status: 'cancelled' });
        } catch (err: any) {
            toast.error(err.message || 'Failed to cancel');
        }
    };

    const [showReschedule, setShowReschedule] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const handleReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const startDateTime = new Date(`${newDate}T${newTime}`);
            const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

            const { error } = await supabase
                .from('appointments')
                .update({
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    scheduled_date: newDate,
                    scheduled_time: newTime,
                    status: 'confirmed'
                })
                .eq('aid', appointment.aid);

            if (error) throw error;
            toast.success('Appointment Rescheduled & Confirmed');
            setAppointment({
                ...appointment,
                start_time: startDateTime.toISOString(),
                status: 'confirmed'
            });
            setShowReschedule(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to reschedule');
        }
    };

    return (
        <SidebarLayout>
            {showReschedule && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Set Appointment Time</h2>
                        <form onSubmit={handleReschedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowReschedule(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Confirm Time</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Appointments
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Details</h1>
                            <div className="flex items-center gap-4 text-gray-500">
                                <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                                    <Calendar className="w-4 h-4" /> {new Date(appointment.start_time).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                                    <Clock className="w-4 h-4" /> {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${appointment.status === 'confirmed' || appointment.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {appointment.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setNewDate(new Date(appointment.start_time).toISOString().split('T')[0]);
                                    setNewTime(new Date(appointment.start_time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }));
                                    setShowReschedule(true);
                                }}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                            >
                                {appointment.status === 'scheduled' ? 'Set Date & Time' : 'Reschedule'}
                            </button>
                            {appointment.status !== 'cancelled' && (
                                <button
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50"
                                >
                                    Cancel
                                </button>
                            )}
                            <button className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2">
                                <Video className="w-4 h-4" /> Start Consultation
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Patient Info Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl">
                                {patient?.name?.[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{patient?.name}</h2>
                                <p className="text-gray-500 text-sm">Patient ID: #{appointment.pid}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Gender</span>
                                </div>
                                <span className="font-bold text-gray-900 capitalize">{patientDetails?.gender || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Blood Group</span>
                                </div>
                                <span className="font-bold text-gray-900">{patientDetails?.blood_group || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Phone</span>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{patient?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <span className="font-bold text-gray-900 text-xs truncate max-w-[150px]">{patient?.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Past History</h3>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">
                                    No past records linked.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consultation Notes & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-100">
                                <FileText className="w-6 h-6" />
                                Clinical Notes
                            </button>
                            <button className="p-4 bg-purple-50 text-purple-700 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition-colors border border-purple-100">
                                <Pill className="w-6 h-6" />
                                Prescribe Meds
                            </button>
                        </div>

                        {/* Current Complaint */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-600" /> Reason for Visit
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-xl text-gray-700">
                                No specific reason provided for this appointment.
                            </div>
                        </div>

                        {/* Notes Area */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Doctor's Observations</h3>
                                <span className="text-xs text-gray-400">Private Note</span>
                            </div>
                            <textarea
                                className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                placeholder="Type your clinical observations here..."
                            ></textarea>
                            <div className="flex justify-end mt-4">
                                <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
