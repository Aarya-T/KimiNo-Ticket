"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface Movie {
  id: string
  title: string
  image_url: string | null
  rating: number | null
  genres: string[] | null
  duration: number | null
}

export default function LatestMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('id, title, image_url, rating, genres, duration, is_active, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8)

        if (error) throw error
        setMovies((data || []) as unknown as Movie[])
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchLatest()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[360px] bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!movies.length) {
    return <p className="text-muted-foreground">No recent movies yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="group">
          <div className="rounded-lg overflow-hidden bg-muted relative mb-3 aspect-[2/3]">
            <img
              src={movie.image_url || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button asChild>
                <Link
                  href={`/booking/1?time=7:30 PM&date=2024-03-20&movieId=${movie.id}&movieTitle=${encodeURIComponent(movie.title)}`}
                >
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <Link href={`/movies/${movie.id}`} className="block">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{movie.title}</h3>
            </Link>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{movie.rating ?? 'N/A'}</span>
              <span className="text-muted-foreground text-sm mx-2">•</span>
              <span className="text-sm text-muted-foreground">{movie.duration ? `${movie.duration} min` : '—'}</span>
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="font-normal">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


