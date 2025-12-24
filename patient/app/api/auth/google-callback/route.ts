import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  console.log('Google OAuth callback triggered with code:', code ? 'present' : 'missing')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      console.log('Exchanging code for session...')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      if (!data.user) {
        console.error('No user data received from Google OAuth')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
      }

      console.log('Google OAuth successful for user:', data.user.email)
      console.log('User metadata:', data.user.user_metadata)

      // Create admin client to ensure user exists in our database
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )

      // Ensure user exists in our database
      await ensureGoogleUserInDatabase(supabaseAdmin, data.user)

      // Redirect to success page
      console.log('Redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)

    } catch (error) {
      console.error('Google OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('google_oauth_failed')}`)
    }
  }

  console.error('No auth code provided in Google OAuth callback')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}

async function ensureGoogleUserInDatabase(supabaseAdmin: any, authUser: any) {
  try {
    console.log('Ensuring Google user exists in database:', authUser.email)

    // Check if user already exists by auth_id
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('auth_id', authUser.id)
      .single()

    if (existingUser) {
      console.log('Google user already exists in database:', existingUser.email)
      return existingUser
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing Google user:', checkError)
      throw checkError
    }

    // Check if user exists by email (in case auth_id is missing)
    const { data: userByEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('id, email, auth_id')
      .eq('email', authUser.email)
      .single()

    if (userByEmail && !userByEmail.auth_id) {
      console.log('Updating existing user with Google auth_id:', userByEmail.email)
      
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ auth_id: authUser.id })
        .eq('id', userByEmail.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user with Google auth_id:', updateError)
        throw updateError
      }

      return updatedUser
    }

    // Create new user from Google OAuth data
    console.log('Creating new Google user in database...')
    
    const userData = {
      auth_id: authUser.id,
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || 
                  authUser.user_metadata?.given_name || 
                  authUser.email?.split('@')[0] || '',
      last_name: authUser.user_metadata?.last_name || 
                 authUser.user_metadata?.family_name || '',
      phone: authUser.user_metadata?.phone || authUser.phone || '',
      role: 'patient',
      image_url: authUser.user_metadata?.avatar_url || 
                 authUser.user_metadata?.picture || null
    }

    console.log('Google user data to insert:', userData)

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating Google user:', createError)
      
      // Handle constraint violations
      if (createError.code === '23505') {
        console.log('Google user already exists (constraint violation), trying to find them...')
        
        const { data: conflictUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`email.eq.${authUser.email},auth_id.eq.${authUser.id}`)
          .single()
        
        if (conflictUser) {
          console.log('Found existing Google user after conflict:', conflictUser.email)
          return conflictUser
        }
      }
      
      throw createError
    }

    console.log('Google user created successfully:', newUser.email)

    // Create patient record for Google user
    const { data: newPatient, error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        user_id: newUser.id,
        allergies: [],
        current_medications: []
      })
      .select()
      .single()

    if (patientError) {
      console.error('Error creating patient record for Google user:', patientError)
      // Don't fail the whole process
    } else {
      console.log('Patient record created for Google user:', newPatient.id)
    }

    return newUser

  } catch (error) {
    console.error('Failed to ensure Google user in database:', error)
    // Don't fail the auth process, just log the error
    throw error
  }
}