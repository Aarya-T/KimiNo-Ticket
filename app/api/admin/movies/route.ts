import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch all movies
export async function GET(request: NextRequest) {
  try {
    const { data: movies, error } = await supabaseAdmin
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

// POST - Create new movie
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/movies - Starting movie creation')
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
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
      movie_cast, // Prioritize the correct field name
      genres
    } = body

    // Validate required fields
    if (!title || title.trim() === '') {
      console.log('Validation failed: Title is required')
      return NextResponse.json({ 
        error: 'Title is required and cannot be empty',
        field: 'title'
      }, { status: 400 })
    }

    // Validate URLs if provided
    const urlFields = ['image_url', 'backdrop_url', 'trailer_url']
    for (const field of urlFields) {
      const url = body[field]
      if (url && url.trim() !== '' && !isValidUrl(url)) {
        console.log(`Validation failed: Invalid ${field}`)
        return NextResponse.json({ 
          error: `${field.replace('_', ' ')} must be a valid URL (include http:// or https://)`,
          field
        }, { status: 400 })
      }
    }

    // Parse and validate duration
    let parsedDuration = null
    if (duration !== undefined && duration !== null && `${duration}`.trim() !== '') {
      parsedDuration = Number.parseInt(`${duration}`, 10)
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        return NextResponse.json({ 
          error: 'Duration must be a positive number (in minutes)',
          field: 'duration'
        }, { status: 400 })
      }
    }

    // Parse and validate rating
    let parsedRating = null
    if (rating !== undefined && rating !== null && `${rating}`.trim() !== '') {
      parsedRating = Number.parseFloat(`${rating}`)
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return NextResponse.json({ 
          error: 'Rating must be a number between 0 and 5',
          field: 'rating'
        }, { status: 400 })
      }
    }

    // Handle movie_cast
    const castArray = movie_cast || []
    const processedCast = Array.isArray(castArray) ? 
      castArray.filter(member => member && String(member).trim() !== '') : 
      []

    // Handle genres
    const processedGenres = Array.isArray(genres) ? 
      genres.filter(genre => genre && String(genre).trim() !== '') : 
      []

    const movieData = {
      title: title.trim(),
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      backdrop_url: backdrop_url?.trim() || null,
      trailer_url: trailer_url?.trim() || null,
      duration: parsedDuration,
      rating: parsedRating,
      release_date: release_date || null,
      director: director?.trim() || null,
      movie_cast: processedCast, 
      genres: processedGenres,
      is_active: true
    }
    
    console.log('Inserting movie data:', JSON.stringify(movieData, null, 2))

    const { data: movie, error } = await supabaseAdmin
      .from('movies')
      .insert(movieData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error.details || 'Please check your data and try again'
      }, { status: 500 })
    }

    console.log('Movie created successfully:', movie)
    return NextResponse.json({ movie }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: `Server error: ${error.message}`,
      details: 'Please try again later'
    }, { status: 500 })
  }
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}