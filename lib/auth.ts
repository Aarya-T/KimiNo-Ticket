"use client"

import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string
    phone?: string
    role?: 'user' | 'admin'
  } & Record<string, any>
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  static async signUp({ email, password, fullName, phone }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: 'user'
          }
        }
      })

      if (error) throw error

      // Create user profile in public.users table
      if (data.user && !data.user.identities?.length) {
        // User already exists, just return the data
        return { data, error: null }
      }
      
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              phone: phone || null,
              role: 'user'
            })

          if (profileError) {
            console.warn('Error creating user profile:', profileError)
            // Don't throw here as the auth user was created successfully
            // The profile will be created on first login via getCurrentUser
          }
        } catch (profileError) {
          console.warn('Error creating user profile:', profileError)
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  static async getCurrentUser() {
    try {
      // Avoid calling getUser when there is no session (prevents AuthSessionMissingError)
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        return { user: null, profile: null, error: null }
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        // Get user profile from public.users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.warn('Profile query failed:', profileError)
          
          // If profile doesn't exist, try to create it
          if (profileError.code === 'PGRST116') { // No rows returned
            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email!,
                  full_name: user.user_metadata?.full_name || null,
                  phone: user.user_metadata?.phone || null,
                  role: user.user_metadata?.role || 'user'
                })
              
              if (insertError) {
                console.warn('Failed to create profile:', insertError)
                // Return user with basic profile from metadata
                return {
                  user,
                  profile: {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || null,
                    phone: user.user_metadata?.phone || null,
                    role: user.user_metadata?.role || 'user'
                  },
                  error: null
                }
              }
              
              // Try to fetch the profile again
              const { data: newProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()
              
              return { user, profile: newProfile, error: null }
            } catch (createError) {
              console.warn('Error creating profile:', createError)
            }
          }
          
          // Fallback: return user with basic profile from metadata
          return {
            user,
            profile: {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
              phone: user.user_metadata?.phone || null,
              role: user.user_metadata?.role || 'user'
            },
            error: null
          }
        }

        return { user, profile, error: null }
      }

      return { user: null, profile: null, error: null }
    } catch (error: any) {
      const message = String(error?.message || '')
      if (message.includes('User from sub claim in JWT does not exist')) {
        try {
          await supabase.auth.signOut()
        } catch {}
        // Return logged-out state without surfacing an error to avoid UI loops
        return { user: null, profile: null, error: null }
      }
      console.error('Error in getCurrentUser:', error)
      return { user: null, profile: null, error }
    }
  }

  static async updateProfile(updates: { full_name?: string; phone?: string }) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw userError || new Error('No user found')

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      })

      if (authError) throw authError

      // Update user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (profileError) throw profileError

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  static async isAdmin() {
    try {
      const { user, profile } = await this.getCurrentUser()
      return user && profile?.role === 'admin'
    } catch (error) {
      return false
    }
  }
}

// Auth state management hook
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user, profile } = await AuthService.getCurrentUser()
        setUser(user as AuthUser)
        setProfile(profile)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { user, profile } = await AuthService.getCurrentUser()
            setUser(user as AuthUser)
            setProfile(profile)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp: AuthService.signUp,
    signIn: AuthService.signIn,
    signOut: AuthService.signOut,
    updateProfile: AuthService.updateProfile,
    resetPassword: AuthService.resetPassword
  }
}