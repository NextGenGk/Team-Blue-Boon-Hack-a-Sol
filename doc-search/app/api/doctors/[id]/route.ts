import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { data: doctor, error } = await supabase
            .from('doctors')
            .select(`
        *,
        users:uid (
          name,
          email,
          phone,
          profile_image_url,
          is_active
        )
      `)
            .eq('did', id)
            .eq('users.is_active', true)
            .single();

        if (error || !doctor) {
            if (error && error.code !== 'PGRST116') console.error(error); // PGRST116 is code for no rows returned

            return NextResponse.json(
                {
                    success: false,
                    error: 'Doctor not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            doctor: {
                id: doctor.did,
                name: doctor.users?.name,
                specialization: doctor.specialization,
                qualification: doctor.qualification,
                experience: doctor.years_of_experience,
                consultationFee: parseFloat(doctor.consultation_fee),
                bio: doctor.bio,
                clinicName: doctor.clinic_name,
                address: {
                    line1: doctor.address_line1,
                    line2: doctor.address_line2,
                    city: doctor.city,
                    state: doctor.state,
                    postalCode: doctor.postal_code
                },
                languages: doctor.languages,
                verified: doctor.is_verified,
                profileImage: doctor.users?.profile_image_url,
                email: doctor.users?.email,
                phone: doctor.users?.phone
            }
        });
    } catch (error: any) {
        console.error('❌ Error fetching doctor:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch doctor details'
            },
            { status: 500 }
        );
    }
}
