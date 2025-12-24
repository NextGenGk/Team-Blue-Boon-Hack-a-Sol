import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        let pid: string | null = null;
        let userName = "Guest";
        let isDemoMode = false;

        // 1. Try to get PID from logged-in user
        if (user) {
            // First get user profile
            const { data: userProfile } = await supabase
                .from('users')
                .select('id, first_name, last_name')
                .eq('auth_id', user.id)
                .single();

            if (userProfile) {
                const { data: patientData } = await supabase
                    .from('patients')
                    .select('id')
                    .eq('user_id', userProfile.id)
                    .single();

                if (patientData) {
                    pid = patientData.id;
                    userName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() ||
                        user.user_metadata?.first_name || "User";
                }
            }
        }

        // 2. FALLBACK: "Use any user from database" (Hackathon Mode)
        if (!pid) {
            const { data: anyPatient } = await supabase
                .from('patients')
                .select('id, users!inner(first_name, last_name)')
                .limit(1)
                .single();

            if (anyPatient) {
                pid = anyPatient.id;
                // @ts-ignore - users is a joined object from Supabase
                const userInfo = anyPatient.users as { first_name: string; last_name: string } | null;
                if (userInfo) {
                    userName = `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || "Demo User";
                } else {
                    userName = "Demo User";
                }
                isDemoMode = true;
            }
        }

        if (!pid) {
            // No users in DB at all? Return empty.
            return NextResponse.json({
                isPatient: false,
                medicines: [],
                finance: [],
                adherence: 0,
                upcomingAppointment: null,
                userName: "Guest"
            });
        }

        // 3. Fetch Medicines (Latest Active Prescription)
        const { data: prescriptionData } = await supabase
            .from('active_prescriptions')
            .select('medicines, doctor_name')
            .eq('pid', pid)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let medicines: any[] = [];
        if (prescriptionData && prescriptionData.medicines) {
            const meds = Array.isArray(prescriptionData.medicines) ? prescriptionData.medicines : [];
            medicines = meds.map((m: any) => ({
                name: m.name,
                dose: m.dosage || m.dose,
                time: m.frequency || m.time,
                checked: false
            }));
        }

        // 4. Fetch Finance Logs
        const { data: financeData } = await supabase
            .from('finance_transactions')
            .select('description, transaction_type, amount, created_at, status')
            .eq('pid', pid)
            .order('created_at', { ascending: false })
            .limit(3);

        const finance = (financeData || []).map(t => ({
            desc: t.description || t.transaction_type,
            type: t.transaction_type,
            date: new Date(t.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: t.transaction_type === 'refund' ? `+$${t.amount}` : `-$${t.amount}`,
            status: t.status
        }));

        // 5. Fetch Adherence (Health Goal)
        const { data: adherenceData } = await supabase
            .from('adherence_progress')
            .select('adherence_percentage')
            .eq('pid', pid);

        let adherenceScore = 0;
        if (adherenceData && adherenceData.length > 0) {
            const total = adherenceData.reduce((acc, curr) => acc + (curr.adherence_percentage || 0), 0);
            adherenceScore = Math.round(total / adherenceData.length);
        }

        // 6. Fetch Upcoming Appointment
        const { data: appointmentData } = await supabase
            .from('upcoming_appointments')
            .select('*')
            .eq('pid', pid)
            .order('scheduled_date', { ascending: true })
            .limit(1)
            .single();

        return NextResponse.json({
            isPatient: true,
            medicines,
            finance,
            adherence: adherenceScore,
            upcomingAppointment: appointmentData || null,
            userName,
            isDemoMode
        });

    } catch (error) {
        console.error('Dashboard Data Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
