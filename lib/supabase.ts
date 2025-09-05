import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          backdrop_url: string | null
          trailer_url: string | null
          duration: number | null
          rating: number | null
          release_date: string | null
          director: string | null
          cast: string[] | null
          genres: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          backdrop_url?: string | null
          trailer_url?: string | null
          duration?: number | null
          rating?: number | null
          release_date?: string | null
          director?: string | null
          cast?: string[] | null
          genres?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          backdrop_url?: string | null
          trailer_url?: string | null
          duration?: number | null
          rating?: number | null
          release_date?: string | null
          director?: string | null
          cast?: string[] | null
          genres?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      theaters: {
        Row: {
          id: string
          name: string
          location: string
          address: string | null
          distance: string | null
          total_seats: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          address?: string | null
          distance?: string | null
          total_seats?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          address?: string | null
          distance?: string | null
          total_seats?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      showtimes: {
        Row: {
          id: string
          movie_id: string
          theater_id: string
          show_date: string
          show_time: string
          ticket_price: number
          available_seats: number
          screen_type: 'standard' | 'imax' | '3d' | 'vip'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          movie_id: string
          theater_id: string
          show_date: string
          show_time: string
          ticket_price: number
          available_seats?: number
          screen_type?: 'standard' | 'imax' | '3d' | 'vip'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          movie_id?: string
          theater_id?: string
          show_date?: string
          show_time?: string
          ticket_price?: number
          available_seats?: number
          screen_type?: 'standard' | 'imax' | '3d' | 'vip'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_reference: string
          user_id: string | null
          showtime_id: string | null
          movie_title: string
          theater_name: string
          show_date: string
          show_time: string
          seats: string[]
          ticket_count: number
          ticket_total: number
          snacks_total: number
          booking_fee: number
          tax_amount: number
          grand_total: number
          customer_email: string | null
          customer_phone: string | null
          booking_status: 'confirmed' | 'cancelled' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_reference: string
          user_id?: string | null
          showtime_id?: string | null
          movie_title: string
          theater_name: string
          show_date: string
          show_time: string
          seats: string[]
          ticket_count: number
          ticket_total: number
          snacks_total?: number
          booking_fee?: number
          tax_amount: number
          grand_total: number
          customer_email?: string | null
          customer_phone?: string | null
          booking_status?: 'confirmed' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_reference?: string
          user_id?: string | null
          showtime_id?: string | null
          movie_title?: string
          theater_name?: string
          show_date?: string
          show_time?: string
          seats?: string[]
          ticket_count?: number
          ticket_total?: number
          snacks_total?: number
          booking_fee?: number
          tax_amount?: number
          grand_total?: number
          customer_email?: string | null
          customer_phone?: string | null
          booking_status?: 'confirmed' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      snacks: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_emoji: string | null
          category: 'snack' | 'drink' | 'combo'
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_emoji?: string | null
          category?: 'snack' | 'drink' | 'combo'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_emoji?: string | null
          category?: 'snack' | 'drink' | 'combo'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      booking_snacks: {
        Row: {
          id: string
          booking_id: string
          snack_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          snack_id?: string | null
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          snack_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}