import { AppointmentsList } from '@/components/AppointmentsList';

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AppointmentsList />
      </div>
    </div>
  );
}