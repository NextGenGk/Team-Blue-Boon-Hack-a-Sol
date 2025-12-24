import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        let did: string | null = null;
        let doctorName = "Doctor";
        let isDemoMode = false;

        // 1. Try to get Doctor ID from logged-in user
        if (user) {
            const { data: doctorData } = await supabase
                .from('doctors')
                .select('did, users(name)')
                .eq('uid', user.id)
                .single();

            if (doctorData) {
                did = doctorData.did;
                // @ts-ignore
                doctorName = doctorData.users?.name || user.user_metadata?.last_name || "Doctor";
            }
        }

        // 2. FALLBACK: Use ANY Doctor (Demo Mode)
        if (!did) {
            const { data: anyDoctor } = await supabase
                .from('doctors')
                .select('did, users(name)')
                .limit(1)
                .single();

            if (anyDoctor) {
                did = anyDoctor.did;
                // @ts-ignore
                doctorName = anyDoctor.users?.name || "Demo Doctor";
                isDemoMode = true;
            }
        }

        if (!did) {
            return NextResponse.json({
                stats: { patients: 0, appointments: 0, earnings: 0 },
                upcomingAppointments: [],
                recentPatients: [],
                doctorName: "Guest"
            });
        }

        // 3. Fetch Stats
        // Total Appointments (All time)
        const { count: totalAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('did', did);

        // Total Patients (Unique PIDs in appointments) - Hard to do distinct count efficiently in one query without RPC, 
        // so we'll just count appointments or fetch unique PIDs if small scale. 
        // For now, let's just count DISTINCT patients using a simple query if possible, or approximate.
        // Instead of complex SQL, let's fetch latest 100 appointments and count unique PIDs (good enough for demo).
        const { data: recentApts } = await supabase
            .from('appointments')
            .select('pid')
            .eq('did', did)
            .limit(500);

        // @ts-ignore
        const uniquePatients = new Set(recentApts?.map(a => a.pid)).size;

        // Total Earnings (Sum of payment_amount for completed appointments)
        const { data: earningsData } = await supabase
            .from('appointments')
            .select('payment_amount')
            .eq('did', did)
            .eq('status', 'completed');

        // @ts-ignore
        const totalEarnings = earningsData?.reduce((sum, item) => sum + (item.payment_amount || 0), 0) || 0;


        // 4. Fetch Upcoming Appointments
        // We can use 'appointments' table joined with 'patients' and 'users' to get patient name.
        const { data: upcomingData } = await supabase
            .from('appointments')
            .select(`
            *,
            patients (
                users (
                    name,
                    email
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

        return NextResponse.json({
            stats: {
                patients: uniquePatients,
                appointments: totalAppointments || 0,
                earnings: totalEarnings
            },
            upcomingAppointments,
            doctorName,
            isDemoMode
        });

    } catch (error) {
        console.error('Doctor Dashboard Data Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
