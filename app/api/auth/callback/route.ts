import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Create admin client to save user to database
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

      // Save user to database
      try {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_id', data.user.id)
          .single()

        if (!existingUser) {
          console.log('Creating user in database:', data.user.email)
          
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              auth_id: data.user.id,
              email: data.user.email,
              first_name: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
              last_name: data.user.user_metadata?.last_name || '',
              phone: data.user.user_metadata?.phone || data.user.phone || '',
              role: 'patient'
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating user in database:', createError)
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
              console.error('Error creating patient record:', patientError)
            } else {
              console.log('Patient record created for:', newUser.email)
            }
          }
        } else {
          console.log('User already exists in database')
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}