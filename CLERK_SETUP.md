# Clerk Authentication Setup Guide

## 1. Create Clerk Account and Application

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Choose your preferred authentication methods:
   - **Email & Password** (recommended)
   - **Phone Number** (for SMS OTP)
   - **Google OAuth** (optional)
   - **Other social providers** (optional)

## 2. Configure Environment Variables

Update your `.env.local` file with your Clerk keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. Configure Clerk Dashboard Settings

### Authentication Methods (Phone Only Setup)
1. Go to **Authentication** → **Email, Phone, Username**
2. **Disable Email**: Turn off "Email address" 
3. **Enable Phone**: Turn on "Phone number" and set as required
4. **Disable Username**: Keep username disabled
5. **Phone Settings**:
   - Set phone number as required identifier
   - Enable SMS verification
   - Configure SMS provider (Twilio recommended)

### Profile Settings
1. Go to **User & Authentication** → **Profile**
2. **Enable Profile Image**: Turn on profile image uploads
3. **Required Fields**: Set first name and last name as required
4. **Optional Fields**: Configure any additional fields you need

### Appearance
- Upload your logo
- Set brand colors to match your app theme (use #10B981 for health-primary)
- Customize sign-in/sign-up forms

### Webhooks (Optional)
Set up webhooks to sync user data:
- Endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

## 4. Database Migration

Run the migration script to update your database:

```sql
-- Run this in your Supabase SQL Editor
-- See migrate_to_clerk.sql for the complete script

-- Add clerk_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Disable RLS (handle permissions in app code)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## 5. Features Included

### ✅ Authentication Pages
- **Sign In**: `/sign-in` - Phone number with OTP verification
- **Sign Up**: `/sign-up` - Phone registration with profile image upload
- **Profile**: `/profile` - User profile management with Clerk UserButton

### ✅ Authentication Features
- **Phone/SMS Only**: OTP verification with phone numbers
- **Profile Image Upload**: Users can upload profile pictures during signup
- **Name Collection**: First name and last name required during signup
- **Session Management**: Automatic session handling
- **Multi-factor Authentication**: Available in Clerk dashboard
- **No Email Required**: Completely phone-based authentication

### ✅ User Management
- **User Sync**: Automatic sync between Clerk and your database
- **Profile Updates**: Real-time profile synchronization
- **User Metadata**: Store additional user data
- **Role-based Access**: Configure in Clerk dashboard

### ✅ Security Features
- **Route Protection**: Middleware-based route protection
- **CSRF Protection**: Built-in security
- **Rate Limiting**: Configurable in Clerk dashboard
- **Audit Logs**: Available in Clerk dashboard

## 6. Usage Examples

### Check Authentication Status
```tsx
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Hello {user.firstName}!</div>;
}
```

### Protect Routes
```tsx
import { auth } from '@clerk/nextjs';

export default function ProtectedPage() {
  const { userId } = auth();
  
  if (!userId) {
    return <div>Access denied</div>;
  }
  
  return <div>Protected content</div>;
}
```

### Sign Out
```tsx
import { useClerk } from '@clerk/nextjs';

function SignOutButton() {
  const { signOut } = useClerk();
  
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
```

## 7. Customization

### Appearance
The app includes custom Clerk styling in `lib/clerk.ts`:
- Matches your app's color scheme
- Custom button styles
- Consistent typography

### Phone Authentication
To enable phone authentication:
1. Go to Clerk Dashboard → Authentication → Phone
2. Enable phone number authentication
3. Configure SMS provider (Twilio recommended)
4. Users can sign up/in with phone + OTP

### Social Providers
To add Google OAuth:
1. Go to Clerk Dashboard → Authentication → Social
2. Enable Google
3. Add your Google OAuth credentials
4. Users will see "Continue with Google" option

## 8. Migration from Supabase Auth

### What Changed
- ❌ Removed: Custom OTP pages (`/auth/login`, `/auth/signup`)
- ❌ Removed: Supabase auth functions
- ❌ Removed: Custom AuthProvider
- ✅ Added: Clerk authentication (`/sign-in`, `/sign-up`)
- ✅ Added: Automatic user sync
- ✅ Added: Route protection middleware

### Benefits
- **Better UX**: Professional, polished auth UI
- **More Features**: MFA, social login, phone auth
- **Better Security**: Enterprise-grade security
- **Less Code**: No custom auth logic to maintain
- **Better Support**: Dedicated auth service with support

## 9. Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign Up" to create a test account
4. Verify email if required
5. Test sign in/out functionality
6. Check that user data syncs to your database

## 10. Production Deployment

1. Update environment variables in production
2. Configure production domain in Clerk dashboard
3. Set up webhooks for user sync (optional)
4. Test authentication flow in production
5. Monitor authentication metrics in Clerk dashboard

## Support

- **Clerk Documentation**: [docs.clerk.com](https://docs.clerk.com)
- **Clerk Discord**: Join their community for support
- **GitHub Issues**: Report bugs in your repository