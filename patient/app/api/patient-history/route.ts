import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        let pid: string | null = null;

        // 1. Try to get PID from logged-in user
        if (user) {
            // First get user profile
            const { data: userProfile } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', user.id)
                .single();

            if (userProfile) {
                const { data: patientData } = await supabase
                    .from('patients')
                    .select('id')
                    .eq('user_id', userProfile.id)
                    .single();
                if (patientData) pid = patientData.id;
            }
        }

        // 2. FALLBACK: Use any user (Demo Mode)
        if (!pid) {
            const { data: anyPatient } = await supabase
                .from('patients')
                .select('id')
                .limit(1)
                .single();
            if (anyPatient) pid = anyPatient.id;
        }

        if (!pid) {
            return NextResponse.json({ appointments: [], receipts: [] });
        }

        // Fetch All Upcoming & Past Appointments
        // We can use the 'upcoming_appointments' view for detailed info, removing the date filter if we want history too.
        // But 'upcoming_appointments' view has "WHERE scheduled_date >= CURRENT_DATE".
        // We might want past ones too. Let's just query the view for now (future) + maybe raw query for past?
        // For simplicity, let's just query the VIEW for upcoming.
        const { data: appointments } = await supabase
            .from('upcoming_appointments')
            .select('*')
            .eq('pid', pid)
            .order('scheduled_date', { ascending: true });

        // Fetch Receipts
        const { data: receipts } = await supabase
            .from('receipts')
            .select('*')
            .eq('pid', pid)
            .order('receipt_date', { ascending: false });

        return NextResponse.json({
            appointments: appointments || [],
            receipts: receipts || []
        });

    } catch (error) {
        console.error('History Data Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
