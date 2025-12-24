import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Fetch all caregivers (doctors, nurses, therapists)
        const { data: caregivers, error } = await supabase
            .from('caregivers')
            .select('*')
            .eq('is_active', true)
            .eq('is_verified', true)
            .order('rating', { ascending: false });

        if (error) {
            console.error('Error fetching caregivers:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            caregivers: caregivers || [],
            total: caregivers?.length || 0,
        });
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
