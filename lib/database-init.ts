import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    // Check if users table exists and is accessible
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.warn('Users table not accessible:', error)
      return false
    }

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    return false
  }
}

export async function ensureUserProfile(userId: string, userData: {
  email: string
  full_name?: string
  phone?: string
  role?: string
}) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return true // Profile already exists
    }

    // Create profile
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: userData.email,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
        role: userData.role || 'user'
      })

    if (error) {
      console.error('Failed to create user profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return false
  }
}