# KimiNo-Ticket Setup Instructions

## New Features Added

### 1. Authentication System (Supabase)
- User registration and login
- Role-based access control (user/admin)
- Protected routes and API endpoints
- User profile management

### 2. Database Integration
- Complete Supabase schema with proper relationships
- Row Level Security (RLS) policies
- Comprehensive movie, theater, booking, and user management

### 3. Admin Dashboard
- Movie CRUD operations (Create, Read, Update, Delete)
- Admin-only access control
- Movie status management (active/inactive)
- Rich movie form with cast, genres, and media URLs

## Setup Instructions

### 1. Install Dependencies

You need to install the new Supabase dependencies:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the entire content from `supabase-schema.sql` and run it
5. This will create all tables, policies, and sample data

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create an Admin User

1. Sign up through the normal registration flow (`/auth/sign-up`)
2. After signing up, go to your Supabase dashboard
3. Navigate to Authentication > Users
4. Copy your user ID
5. Go to Table Editor > users table
6. Find your user and change the `role` from `'user'` to `'admin'`

### 5. Start the Development Server

```bash
npm run dev
```

## New Routes Added

### Authentication
- `/auth/sign-in` - User login page
- `/auth/sign-up` - User registration page

### Admin Dashboard (Admin Only)
- `/admin` - Main admin dashboard with movie management
- `/admin/movies/new` - Add new movie form
- `/admin/movies/[id]/edit` - Edit existing movie

### API Routes (Admin Only)
- `GET /api/admin/movies` - Fetch all movies
- `POST /api/admin/movies` - Create new movie
- `GET /api/admin/movies/[id]` - Fetch single movie
- `PUT /api/admin/movies/[id]` - Update movie
- `DELETE /api/admin/movies/[id]` - Soft delete movie

## Features

### Authentication Features
- ✅ Email/password registration and login
- ✅ User profile management
- ✅ Role-based access control
- ✅ Protected admin routes
- ✅ Automatic navbar updates based on auth state

### Admin Features
- ✅ Movie CRUD operations
- ✅ Rich movie form with validation
- ✅ Cast and genre management
- ✅ Movie status toggle (active/inactive)
- ✅ Movie statistics dashboard
- ✅ Responsive admin interface

### Database Features
- ✅ Complete relational schema
- ✅ Row Level Security policies
- ✅ User roles and permissions
- ✅ Sample data included
- ✅ Proper data types and constraints

## Important Notes

1. **Email Configuration**: The email system still uses the existing mock setup for development
2. **SMS Configuration**: SMS features still use the existing mock setup for development
3. **File Uploads**: Movie images use URLs (not file uploads) - you can implement file upload later
4. **Booking Integration**: The existing booking system will need to be updated to use the database (not implemented yet)

## Next Steps (Optional)

1. Update the existing booking flow to use the database
2. Implement file upload for movie posters
3. Add theater and showtime management to admin
4. Implement real-time booking seat availability
5. Add booking history for users
6. Implement email templates for better notifications

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**: Make sure your environment variables are correct and the project is active
2. **Admin Access Denied**: Ensure you've updated your user role to 'admin' in the database
3. **Build Errors**: Make sure all dependencies are installed with `npm install`

### Database Issues

If you need to reset the database:
1. Go to Supabase Dashboard > Settings > Database
2. Reset your database
3. Re-run the SQL schema from `supabase-schema.sql`

## Security Notes

- All admin routes are protected with proper authentication checks
- Row Level Security is enabled on all tables
- API routes validate admin permissions before allowing operations
- Passwords are hashed by Supabase Auth automatically
- SQL injection is prevented by using Supabase's query builder