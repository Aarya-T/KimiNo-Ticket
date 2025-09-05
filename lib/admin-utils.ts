import { supabase } from './supabase'

export async function makeUserAdmin(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)

    if (error) {
      console.error('Error making user admin:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error making user admin:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserRole(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user role:', error)
      return { role: null, error: error.message }
    }

    return { role: data?.role || 'user', error: null }
  } catch (error: any) {
    console.error('Error getting user role:', error)
    return { role: null, error: error.message }
  }
}

export async function listAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error listing users:', error)
      return { users: [], error: error.message }
    }

    return { users: data || [], error: null }
  } catch (error: any) {
    console.error('Error listing users:', error)
    return { users: [], error: error.message }
  }
}