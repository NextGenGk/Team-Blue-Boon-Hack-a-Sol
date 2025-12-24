"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Filter, X, Calendar, Activity, Pill, DollarSign } from "lucide-react";
import { CaregiverCard } from "@/components/CaregiverCard";
import SidebarLayout from "@/components/SidebarLayout";

export default function PatientDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQueryParam = searchParams.get("search");

    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dashboard Data State
    const [dashboardData, setDashboardData] = useState<any>({
        medicines: [],
        finance: [],
        adherence: 0,
        upcomingAppointment: null,
        loading: true
    });

    // Filter states
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
    const [maxFee, setMaxFee] = useState<number>(10000);
    const [minExperience, setMinExperience] = useState<number>(0);
    const [availableForHomeVisits, setAvailableForHomeVisits] = useState<boolean>(false);
    const [availableForOnline, setAvailableForOnline] = useState<boolean>(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/dashboard-data');
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData({ ...data, loading: false });
                } else {
                    console.error("Failed to load dashboard data");
                    setDashboardData(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setDashboardData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (searchQueryParam) {
            performSearch(searchQueryParam);
        } else {
            // If search is cleared, reset results
            setResults([]);
            setFilteredResults([]);
        }
    }, [searchQueryParam]);

    useEffect(() => {
        applyFilters();
    }, [results, selectedType, selectedSpecialization, maxFee, minExperience, availableForHomeVisits, availableForOnline]);

    const performSearch = async (query: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&lang=en`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            setError('Failed to fetch search results. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...results];

        if (selectedType !== "all") {
            filtered = filtered.filter(r => r.type === selectedType);
        }

        if (selectedSpecialization !== "all") {
            filtered = filtered.filter(r =>
                r.specializations?.includes(selectedSpecialization)
            );
        }

        filtered = filtered.filter(r => r.consultation_fee <= maxFee);
        filtered = filtered.filter(r => r.experience_years >= minExperience);

        if (availableForHomeVisits) {
            filtered = filtered.filter(r => r.available_for_home_visits);
        }

        if (availableForOnline) {
            filtered = filtered.filter(r => r.available_for_online);
        }

        setFilteredResults(filtered);
    };

    const resetFilters = () => {
        setSelectedType("all");
        setSelectedSpecialization("all");
        setMaxFee(10000);
        setMinExperience(0);
        setAvailableForHomeVisits(false);
        setAvailableForOnline(false);
    };

    return (
        <SidebarLayout>
            <div className="w-full px-6 lg:px-8 py-8">
                {/* Render Search Results if they exist */}
                {(results.length > 0 || loading || error || searchQueryParam) ? (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {loading ? 'Searching...' : `Found ${results.length} Results`}
                            </h2>
                            <button
                                onClick={() => router.push('/patient-dashboard')}
                                className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-red-200 transition-colors"
                            >
                                <X className="w-4 h-4" /> Clear Search
                            </button>
                        </div>

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                                <p className="text-gray-500 animate-pulse">Consulting AI Knowledge Base...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {!loading && !error && filteredResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                {filteredResults.map((caregiver) => (
                                    <CaregiverCard key={caregiver.id} caregiver={caregiver} showBookButton={true} />
                                ))}
                            </div>
                        )}

                        {!loading && !error && filteredResults.length === 0 && results.length > 0 && (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500">No results match your filters.</p>
                                <button onClick={resetFilters} className="text-emerald-600 mt-2 hover:underline">Reset Filters</button>
                            </div>
                        )}

                        {!loading && !error && results.length === 0 && searchQueryParam && (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500">No results found for "{searchQueryParam}".</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Default Dashboard Widgets */
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
                        {/* Make Appointment Widget (Large) */}
                        <div className="col-span-1 md:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500" />
                            <div className="absolute right-10 top-10 text-emerald-100">
                                <Calendar className="w-24 h-24 opacity-20" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {dashboardData.upcomingAppointment ? 'Upcoming Appointment' : 'Book an Appointment'}
                                </h3>
                                {dashboardData.upcomingAppointment ? (
                                    <div className="mb-8 max-w-sm">
                                        <p className="text-lg font-bold text-emerald-600">{dashboardData.upcomingAppointment.doctor_name}</p>
                                        <p className="text-gray-500">{new Date(dashboardData.upcomingAppointment.scheduled_date).toLocaleDateString()} at {dashboardData.upcomingAppointment.scheduled_time}</p>
                                        <p className="text-sm text-gray-400 mt-1">{dashboardData.upcomingAppointment.mode === 'online' ? 'Online Consultation' : 'In-Person Visit'}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mb-8 max-w-sm">
                                        Schedule a consultation with top specialists. We have streamlined the process for you.
                                    </p>
                                )}

                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center gap-3 hover:-translate-y-1">
                                    {dashboardData.upcomingAppointment ? 'View Details' : 'Book Now'} <ArrowLeft className="w-5 h-5 rotate-180" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Widget (Medium) */}
                        <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">Health Goal</h3>
                                    <Activity className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-5xl font-bold text-emerald-400">{dashboardData.adherence}%</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-2 backdrop-blur-sm">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${dashboardData.adherence}%` }} />
                                </div>
                                <p className="text-sm text-gray-400">Adherence to medication</p>
                            </div>
                        </div>

                        {/* Medicine Widget (Medium) */}
                        <div className="col-span-1 md:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Pill className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Medicines</h3>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wide">Latest Rx</span>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.medicines.length > 0 ? (
                                    dashboardData.medicines.map((med: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${med.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300 group-hover:border-emerald-400'}`}>
                                                    {med.checked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${med.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{med.name}</p>
                                                    <p className="text-xs text-gray-500">{med.dose} • {med.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No active medications.</p>
                                )}
                            </div>
                        </div>

                        {/* Finance Widget (Large) */}
                        <div className="col-span-1 md:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Finance Log</h3>
                                </div>
                                <button className="text-sm text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
                            </div>
                            <div className="space-y-2">
                                {dashboardData.finance.length > 0 ? (
                                    dashboardData.finance.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-2xl transition-colors border-b border-gray-100 last:border-0 last:pb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold">
                                                    $
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.desc}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{item.type} • {item.date}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No recent transactions.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
