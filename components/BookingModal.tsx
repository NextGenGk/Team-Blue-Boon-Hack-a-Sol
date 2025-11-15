"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  CreditCard,
  Shield,
  X,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

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
  consultation_fee?: number;
  home_visit_fee?: number;
}

interface BookingModalProps {
  caregiver: Caregiver | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ caregiver, isOpen, onClose }: BookingModalProps) {
  const { user } = useEnhancedSupabase();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<"online" | "home_visit" | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!isOpen || !caregiver) return null;

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book an appointment");
      router.push("/sign-in");
      return;
    }

    if (!selectedMode || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedMode === "home_visit" && !address) {
      toast.error("Please provide your address for home visit");
      return;
    }

    setIsBooking(true);

    try {
      // Get patient ID
      const { data: patient } = await fetch("/api/patients/me").then(res => res.json());
      
      if (!patient) {
        toast.error("Patient profile not found. Please complete your profile.");
        router.push("/complete-profile");
        return;
      }

      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const bookingData = {
        caregiverId: caregiver.id,
        patientId: patient.id,
        mode: selectedMode,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        symptoms: symptoms.split(",").map(s => s.trim()).filter(Boolean),
        ...(selectedMode === "home_visit" && {
          homeVisitAddress: address,
        }),
        notes: `Booking via patient dashboard. Symptoms: ${symptoms}`,
      };

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to book appointment");
      }

      if (result.paymentRequired) {
        // Show payment modal
        setShowPayment(true);
        await handlePayment(result.appointment.id, result.paymentAmount);
      } else {
        // Free service - booking complete
        toast.success("Appointment booked successfully! You will receive a confirmation call within 30 minutes.");
        onClose();
        resetForm();
      }

    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const handlePayment = async (appointmentId: string, amount: number) => {
    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          appointmentId,
          userId: user?.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AyurSutra",
        description: `Payment for ${caregiver.specialization} appointment`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId,
                userId: user?.id,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success("Payment successful! Your appointment is confirmed.");
              onClose();
              resetForm();
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.user_metadata?.first_name || "",
          email: user?.email || "",
          contact: user?.user_metadata?.phone || "",
        },
        theme: {
          color: "#10B981",
        },
      };

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const resetForm = () => {
    setSelectedMode(null);
    setSelectedDate("");
    setSelectedTime("");
    setAddress("");
    setSymptoms("");
    setShowPayment(false);
  };

  const getPrice = () => {
    if (caregiver.type === "mitanin") return "Free";
    if (selectedMode === "online") return `₹${caregiver.consultation_fee || 0}`;
    if (selectedMode === "home_visit") return `₹${caregiver.home_visit_fee || 0}`;
    return caregiver.price;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {caregiver.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Caregiver Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <img
              src={caregiver.image}
              alt={caregiver.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{caregiver.name}</h3>
                {caregiver.isVerified && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">{caregiver.specialization}</p>
              <p className="text-sm text-gray-500">{caregiver.distance}</p>
            </div>
          </div>

          {/* Service Type Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Select Service Type</h4>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedMode("home_visit")}
                className={`w-full border-2 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                  selectedMode === "home_visit"
                    ? caregiver.type === "mitanin"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <Home className="text-xl mr-3" />
                <div className="text-left">
                  <div className="font-bold">Home Visit</div>
                  <div className="text-sm font-normal">
                    {caregiver.type === "mitanin" ? "Free home visit" : "At-home service"}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode("online")}
                className={`w-full border-2 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                  selectedMode === "online"
                    ? caregiver.type === "mitanin"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <Video className="text-xl mr-3" />
                <div className="text-left">
                  <div className="font-bold">Online Consultation</div>
                  <div className="text-sm font-normal">Video call consultation</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date and Time Selection */}
          {selectedMode && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Select Date & Time</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getTomorrowDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Address for Home Visit */}
          {selectedMode === "home_visit" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms (optional)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Price Display */}
          {selectedMode && (
            <div className={`mb-6 p-4 rounded-xl border ${
              caregiver.type === "mitanin"
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}>
              <p className={`text-sm ${
                caregiver.type === "mitanin" ? "text-green-800" : "text-amber-800"
              }`}>
                {caregiver.type === "mitanin" ? (
                  <>
                    <Shield className="inline w-4 h-4 mr-2" />
                    Government Mitanin services are <strong>FREE</strong>
                  </>
                ) : (
                  <>
                    <CreditCard className="inline w-4 h-4 mr-2" />
                    Service Cost: <strong>{getPrice()}</strong>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedMode || !selectedDate || !selectedTime || isBooking}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
              !selectedMode || !selectedDate || !selectedTime || isBooking
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : caregiver.type === "mitanin"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {isBooking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Booking...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}