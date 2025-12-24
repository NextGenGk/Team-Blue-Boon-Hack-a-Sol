import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // With Supabase client, aggregating counts is a bit different.
        // We can fetch all doctors and aggregate in JS, or use a view/rpc.
        // For simplicity and to stick to client-side logic:

        const { data: doctorsData, error } = await supabase
            .from('doctors')
            .select(`
        specialization,
        users:uid (is_active)
      `)
            .eq('users.is_active', true);

        if (error) {
            throw error;
        }

        // Aggregate in JS
        const counts: Record<string, number> = {};
        (doctorsData || []).forEach((doc: any) => {
            if (doc.specialization) {
                counts[doc.specialization] = (counts[doc.specialization] || 0) + 1;
            }
        });

        const specializations = Object.entries(counts)
            .map(([specialization, count]) => ({ specialization, doctor_count: count }))
            .sort((a, b) => b.doctor_count - a.doctor_count || a.specialization.localeCompare(b.specialization));

        return NextResponse.json({
            success: true,
            specializations
        });
    } catch (error: any) {
        console.error('❌ Error fetching specializations:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch specializations'
            },
            { status: 500 }
        );
    }
}
