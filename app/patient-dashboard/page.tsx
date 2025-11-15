"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import {
  Heart,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  Video,
  Home,
  Star,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { BookingModal } from "@/components/BookingModal";

interface Symptom {
  id: string;
  name: string;
  checked: boolean;
}

interface Caregiver {
  id: string;
  name: string;
  type: "mitanin" | "nurse";
  specialization: string;
  distance: string;
  price: string;
  bio: string;
  availability: string;
  location?: string;
  image: string;
  rating: number;
  isVerified: boolean;
}



export default function PatientDashboard() {
  const { user, loading } = useEnhancedSupabase();
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const symptoms: Symptom[] = [
    { id: "headache", name: "Headache", checked: false },
    { id: "pregnancy", name: "Pregnancy", checked: false },
    { id: "migraine", name: "Migraine", checked: false },
    { id: "other", name: "Other", checked: false },
  ];

  const mitaninCaregivers: Caregiver[] = [
    {
      id: "m1",
      name: "Sita Devi",
      type: "mitanin",
      specialization: "Community Health Worker",
      distance: "2.3 km away",
      price: "Free",
      bio: "Experienced community health worker with 8 years of service. Specialized in maternal and child health care.",
      availability: "Available Mon-Sat, 9 AM - 5 PM",
      location: "Ward 12, Primary Health Center",
      image: "https://media.istockphoto.com/id/1735900356/photo/portrait-of-indian-young-woman-crossed-hands-wear-sari-isolated-over-white-background-stock.jpg",
      rating: 4.8,
      isVerified: true,
    },
    {
      id: "m2",
      name: "Geeta Sharma",
      type: "mitanin",
      specialization: "Preventive Health Care",
      distance: "1.7 km away",
      price: "Free",
      bio: "Dedicated Mitanin serving the community for 6 years. Expert in preventive health care and nutrition counseling.",
      availability: "Available Daily, 8 AM - 4 PM",
      location: "Ward 8, Community Health Center",
      image: "https://media.istockphoto.com/id/1366376755/photo/indian-young-woman-stock-photo.jpg",
      rating: 4.9,
      isVerified: true,
    },
    {
      id: "m3",
      name: "Meera Patel",
      type: "mitanin",
      specialization: "Women's Health",
      distance: "3.1 km away",
      price: "Free",
      bio: "Compassionate health worker with 10 years experience. Focuses on women's health and family planning services.",
      availability: "Available Mon-Fri, 10 AM - 6 PM",
      location: "Ward 15, Sub-Health Center",
      image: "https://media.istockphoto.com/id/1486375692/photo/white-background-studio-shoot-of-happy-indian-woman.jpg",
      rating: 4.7,
      isVerified: true,
    },
  ];

  const privateCaregivers: Caregiver[] = [
    {
      id: "n1",
      name: "Dr. Priya Reddy",
      type: "nurse",
      specialization: "Postnatal Care",
      distance: "1.2 km away",
      price: "₹500/day",
      bio: "Certified postnatal care specialist with 12 years experience. Expert in newborn care and maternal recovery.",
      availability: "24/7 Available",
      image: "https://media.istockphoto.com/id/2155531264/photo/smiling-medical-professional-in-scrubs-holding-a-clipboard-in-hospital-setting.jpg",
      rating: 4.9,
      isVerified: true,
    },
    {
      id: "n2",
      name: "Nurse Anjali Kumar",
      type: "nurse",
      specialization: "IV / Infusion",
      distance: "2.1 km away",
      price: "₹700/visit",
      bio: "Skilled IV therapy specialist. Trained in administering medications and fluids with care and precision.",
      availability: "Mon-Sat, 8 AM - 8 PM",
      image: "https://media.istockphoto.com/id/1295878605/photo/our-hospital-provides-the-best-care-for-you-and-your-family.jpg",
      rating: 4.8,
      isVerified: true,
    },
    {
      id: "n3",
      name: "Therapist Rahul Singh",
      type: "nurse",
      specialization: "Physiotherapy Support",
      distance: "1.8 km away",
      price: "₹600/day",
      bio: "Licensed physiotherapist specializing in post-surgery rehabilitation and elderly mobility support.",
      availability: "Daily, 9 AM - 7 PM",
      image: "https://media.istockphoto.com/id/1193353861/photo/indian-female-doctor-portrait-stock-photo.jpg",
      rating: 4.7,
      isVerified: true,
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  const handleSymptomChange = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleCaregiverSelect = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setIsBookingModalOpen(true);
  };



  const handleSubmitReport = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom before submitting.");
      return;
    }

    toast.success(
      `Report submitted successfully! Selected symptoms: ${selectedSymptoms.join(
        ", "
      )}. Our team will contact you shortly.`
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-green-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white text-lg" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                AyurSutra
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  EN
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  HI
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.user_metadata?.first_name?.[0] || "P"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.user_metadata?.first_name || "Patient"}{" "}
                    {user?.user_metadata?.last_name || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Symptoms Section */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="text-amber-600 mr-2" />
              Select Symptoms
            </h3>
            <p className="text-gray-600 mb-4">
              Check all symptoms that apply to your current condition
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {symptoms.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom.id)}
                    onChange={() => handleSymptomChange(symptom.id)}
                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    {symptom.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Government Mitanin Section */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="text-green-600 mr-2" />
                  Government Mitanin
                </h3>
                <p className="text-gray-600 mt-1">
                  Select a Mitanin to view details and book
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mitaninCaregivers.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={caregiver.image}
                        alt={caregiver.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate">
                            {caregiver.name}
                          </h4>
                          {caregiver.isVerified && (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-green-600 text-sm font-medium mb-1">
                          {caregiver.distance}
                        </p>
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(caregiver.rating)}
                          <span className="text-xs text-gray-600 ml-1">
                            {caregiver.rating}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-2">
                          {caregiver.bio}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCaregiverSelect(caregiver)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private Nurses Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="text-teal-600 mr-2" />
              Private Nurses
            </h3>
            <p className="text-gray-600 mb-4">
              Choose private nursing options based on your needs
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateCaregivers.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="p-5">
                    <div className="mb-4">
                      <img
                        src={caregiver.image}
                        alt={caregiver.name}
                        className="w-full h-32 object-cover rounded-xl mb-3"
                      />
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {caregiver.specialization}
                        </h4>
                        {caregiver.isVerified && (
                          <Shield className="w-4 h-4 text-teal-500" />
                        )}
                      </div>
                      <p className="text-teal-600 font-semibold mb-1">
                        {caregiver.name}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-amber-600 font-bold text-lg">
                          {caregiver.price}
                        </p>
                        <div className="flex items-center space-x-1">
                          {renderStars(caregiver.rating)}
                          <span className="text-xs text-gray-600 ml-1">
                            {caregiver.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {caregiver.bio}
                    </p>
                    <button
                      onClick={() => handleCaregiverSelect(caregiver)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              <span className="text-amber-500 mr-1">💡</span>
              Tip: Check all symptoms before requesting help
            </div>
            <div>
              <button
                onClick={handleSubmitReport}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-2xl text-base font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 w-full md:w-auto"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        caregiver={selectedCaregiver}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedCaregiver(null);
        }}
      />

      {/* Medical Disclaimer */}
      <section className="py-12 bg-amber-50/50 border-t border-amber-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-amber-100/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-start space-x-4">
              <Shield className="text-amber-600 text-xl mt-1 flex-shrink-0 w-7 h-7" />
              <div>
                <h4 className="font-semibold text-amber-800 text-xl mb-3">
                  Medical Disclaimer
                </h4>
                <p className="text-sm text-amber-700 leading-relaxed">
                  This service is for informational purposes only and should not
                  replace professional medical consultation.
                </p>
                <p className="text-sm text-amber-700 mt-3 leading-relaxed">
                  In case of emergency, please call 102 or visit the nearest
                  hospital immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-2">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            &copy; 2025 AyurSutra Team Blue Boon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}