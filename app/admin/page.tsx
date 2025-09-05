"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Eye, EyeOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Movie {
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

export default function AdminDashboard() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?redirect=/admin')
      return
    }

    if (!loading && user && !isAdmin) {
      router.push('/')
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      })
      return
    }

    if (isAdmin) {
      fetchMovies()
    }
  }, [user, loading, isAdmin, router, toast])

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/admin/movies')
      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json()
      setMovies(data.movies || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch movies: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoadingMovies(false)
    }
  }

  const toggleMovieStatus = async (movieId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update movie status')
      }

      // Update local state
      setMovies(prev => 
        prev.map(movie => 
          movie.id === movieId 
            ? { ...movie, is_active: !currentStatus }
            : movie
        )
      )

      toast({
        title: "Success",
        description: `Movie ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update movie status: " + error.message,
        variant: "destructive"
      })
    }
  }

  const deleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete movie')
      }

      // Update local state
      setMovies(prev => 
        prev.map(movie => 
          movie.id === movieId 
            ? { ...movie, is_active: false }
            : movie
        )
      )

      toast({
        title: "Success",
        description: "Movie deleted successfully."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete movie: " + error.message,
        variant: "destructive"
      })
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage movies and content</p>
          </div>
          <Button onClick={() => router.push('/admin/movies/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Movie
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movies.filter(movie => movie.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movies.filter(movie => !movie.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movies.length > 0 
                  ? (movies.reduce((sum, movie) => sum + (movie.rating || 0), 0) / movies.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Movies</CardTitle>
            <CardDescription>
              Manage your movie collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMovies ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading movies...</span>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No movies found.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push('/admin/movies/new')}
                >
                  Add your first movie
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movies.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {movie.image_url && (
                            <img 
                              src={movie.image_url} 
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{movie.title}</div>
                            {movie.genres && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {movie.genres.slice(0, 2).map((genre) => (
                                  <Badge key={genre} variant="secondary" className="text-xs">
                                    {genre}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{movie.director || 'N/A'}</TableCell>
                      <TableCell>
                        {movie.rating ? `${movie.rating}/5` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {movie.duration ? `${movie.duration} min` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {movie.release_date 
                          ? new Date(movie.release_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={movie.is_active ? "default" : "secondary"}>
                          {movie.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/movies/${movie.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMovieStatus(movie.id, movie.is_active)}
                          >
                            {movie.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMovie(movie.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}