"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import {
  Users,
  Heart,
  Video,
  DollarSign,
  Calendar,
  TrendingUp,
  Bell,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationCenter";
import { VideoCall, useVideoCall } from "@/components/VideoCall";
import toast from "react-hot-toast";

interface DashboardStats {
  totalPatients: number;
  activeCases: number;
  eVisitsToday: number;
  monthlyEarnings: number;
}

interface Patient {
  id: string;
  name: string;
  condition: string;
  status: "active" | "pending" | "completed";
  progress: number;
  lastUpdated: string;
  image?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: "online" | "home_visit";
  status: "scheduled" | "ongoing" | "completed";
}

interface Payment {
  id: string;
  patientName: string;
  service: string;
  amount: number;
  status: "paid" | "pending";
  date: string;
}

export default function NurseDashboard() {
  const { user, loading } = useEnhancedSupabase();
  const router = useRouter();
  const { isInCall, currentRoomId, currentUserName, startCall, endCall } = useVideoCall();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 24,
    activeCases: 12,
    eVisitsToday: 5,
    monthlyEarnings: 18500,
  });

  const [patients] = useState<Patient[]>([
    {
      id: "1",
      name: "Priya Sharma",
      condition: "Postnatal Care",
      status: "active",
      progress: 85,
      lastUpdated: "2 hours ago",
    },
    {
      id: "2",
      name: "Anjali Verma",
      condition: "Elder Care",
      status: "active",
      progress: 60,
      lastUpdated: "5 hours ago",
    },
    {
      id: "3",
      name: "Meera Patel",
      condition: "Wound Dressing",
      status: "pending",
      progress: 40,
      lastUpdated: "1 day ago",
    },
  ]);

  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "Priya Sharma",
      time: "Today, 3:00 PM",
      type: "online",
      status: "scheduled",
    },
    {
      id: "2",
      patientName: "Anjali Verma",
      time: "Today, 5:30 PM",
      type: "online",
      status: "scheduled",
    },
    {
      id: "3",
      patientName: "Meera Patel",
      time: "Tomorrow, 10:00 AM",
      type: "home_visit",
      status: "scheduled",
    },
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: "1",
      patientName: "Priya Sharma",
      service: "Postnatal Care - 5 days",
      amount: 2500,
      status: "paid",
      date: "2024-01-15",
    },
    {
      id: "2",
      patientName: "Anjali Verma",
      service: "Elder Care - 3 days",
      amount: 1350,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "3",
      patientName: "Meera Patel",
      service: "Wound Dressing - 2 visits",
      amount: 1100,
      status: "paid",
      date: "2024-01-13",
    },
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      // Add logout logic here
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const joinVideoCall = (appointmentId: string) => {
    const roomId = `room_${appointmentId}`;
    const userName = user?.user_metadata?.first_name || "Nurse";
    startCall(roomId, userName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isInCall && currentRoomId) {
    return (
      <VideoCall
        roomId={currentRoomId}
        userName={currentUserName}
        onEndCall={endCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AyurSutra</h1>
                <p className="text-xs text-gray-600">Nurse Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.user_metadata?.first_name?.[0] || "N"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.user_metadata?.first_name || "Nurse"}{" "}
                    {user?.user_metadata?.last_name || ""}
                  </p>
                  <p className="text-xs text-gray-600">Registered Nurse</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Cases</p>
                <p className="text-3xl font-bold mt-2">{stats.activeCases}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">E-Visits Today</p>
                <p className="text-3xl font-bold mt-2">{stats.eVisitsToday}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Video className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Monthly Earnings</p>
                <p className="text-3xl font-bold mt-2">₹{stats.monthlyEarnings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Patients */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="text-purple-600 mr-3" />
                My Patients
              </h3>
              <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {patient.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.condition}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      patient.status === "active"
                        ? "bg-green-100 text-green-700"
                        : patient.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="text-green-600 mr-3" />
                Patient Progress
              </h3>
              <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                View Reports
              </button>
            </div>

            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{patient.name}</span>
                    <span className="text-sm text-green-600 font-semibold">
                      {patient.progress}% Recovered
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: `${patient.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Last updated: {patient.lastUpdated}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* E-Visit Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Video className="text-orange-600 mr-3" />
                E-Visit Schedule
              </h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all">
                + New Visit
              </button>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`flex items-center space-x-4 p-4 border-l-4 rounded-lg ${
                    appointment.type === "online"
                      ? "border-orange-500 bg-orange-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        appointment.type === "online"
                          ? "bg-orange-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <Video
                        className={`${
                          appointment.type === "online"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                  </div>
                  <button
                    onClick={() => joinVideoCall(appointment.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      appointment.status === "scheduled"
                        ? appointment.type === "online"
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {appointment.status === "scheduled" ? "Join" : "Scheduled"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Billing & Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <DollarSign className="text-teal-600 mr-3" />
                Billing & Payments
              </h3>
              <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                View All
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl text-white">
              <p className="text-sm text-teal-100 mb-1">Total Earnings This Month</p>
              <p className="text-3xl font-bold">₹{stats.monthlyEarnings.toLocaleString()}</p>
              <p className="text-sm text-teal-100 mt-2">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                12% increase from last month
              </p>
            </div>

            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.status === "paid"
                          ? "bg-green-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      {payment.status === "paid" ? (
                        <CheckCircle className="text-green-600" />
                      ) : (
                        <Clock className="text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {payment.patientName}
                      </p>
                      <p className="text-xs text-gray-600">{payment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        payment.status === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all">
              <DollarSign className="inline w-5 h-5 mr-2" />
              Download Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}