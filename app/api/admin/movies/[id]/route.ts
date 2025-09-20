import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch single movie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    return NextResponse.json({ movie })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update movie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      genres,
      is_active
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const updateData: any = {
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
    }

    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active
    }

    const { data: movie, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ movie })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting is_active to false
    const { data: movie, error } = await supabase
      .from('movies')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ movie })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}