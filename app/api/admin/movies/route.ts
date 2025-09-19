import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// GET - Fetch all movies (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    const parsedDuration = duration !== undefined && duration !== null && `${duration}`.trim() !== ''
      ? Number.parseInt(`${duration}`, 10)
      : null
    const parsedRating = rating !== undefined && rating !== null && `${rating}`.trim() !== ''
      ? Number.parseFloat(`${rating}`)
      : null

    const { data: movie, error } = await supabase
      .from('movies')
      .insert({
        title,
        description,
        image_url,
        backdrop_url,
        trailer_url,
        duration: parsedDuration,
        rating: parsedRating,
        release_date,
        director,
        cast: Array.isArray(cast) ? cast : (cast ? [String(cast)] : []),
        genres: Array.isArray(genres) ? genres : (genres ? [String(genres)] : []),
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