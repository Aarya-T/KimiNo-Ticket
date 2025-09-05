import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AuthService } from '@/lib/auth'

// GET - Fetch all movies (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await AuthService.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ movies })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new movie (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await AuthService.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      image_url,
      backdrop_url,
      trailer_url,
      duration,
      rating,
      release_date,
      director,
      cast,
      genres
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data: movie, error } = await supabase
      .from('movies')
      .insert({
        title,
        description,
        image_url,
        backdrop_url,
        trailer_url,
        duration: duration ? parseInt(duration) : null,
        rating: rating ? parseFloat(rating) : null,
        release_date,
        director,
        cast: Array.isArray(cast) ? cast : [],
        genres: Array.isArray(genres) ? genres : [],
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ movie }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}