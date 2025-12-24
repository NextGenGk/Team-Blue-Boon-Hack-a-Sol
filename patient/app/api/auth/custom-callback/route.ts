import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

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
      console.log('Processing auth callback with code:', code.substring(0, 10) + '...')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      if (!data.user) {
        console.error('No user data received')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
      }

      console.log('Auth successful for user:', data.user.email)

      // Create admin client to handle user creation
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

      // Try to create user in our database
      try {
        console.log('Ensuring user exists in database...')
        
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('auth_id', data.user.id)
          .single()

        if (existingUser) {
          console.log('User already exists in database:', existingUser.email)
        } else if (checkError?.code === 'PGRST116') {
          // User doesn't exist, create them
          console.log('Creating new user in database...')
          
          const userData = {
            auth_id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
            last_name: data.user.user_metadata?.last_name || '',
            phone: data.user.user_metadata?.phone || data.user.phone || '',
            role: 'patient'
          }

          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert(userData)
            .select('id, email')
            .single()

          if (createError) {
            console.error('Failed to create user in database:', createError)
            // Don't fail the auth process, just log the error
          } else {
            console.log('User created successfully:', newUser.email)
            
            // Create patient record
            const { error: patientError } = await supabaseAdmin
              .from('patients')
              .insert({
                user_id: newUser.id,
                allergies: [],
                current_medications: []
              })

            if (patientError) {
              console.error('Failed to create patient record:', patientError)
            } else {
              console.log('Patient record created for:', newUser.email)
            }
          }
        } else {
          console.error('Error checking for existing user:', checkError)
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        // Don't fail auth, just log the error
      }

      // Redirect to success page regardless of database operations
      console.log('Redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)

    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('callback_processing_failed')}`)
    }
  }

  // No code provided
  console.error('No auth code provided')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}