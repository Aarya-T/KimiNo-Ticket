"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface MovieFormData {
  title: string
  description: string
  image_url: string
  backdrop_url: string
  trailer_url: string
  duration: string
  rating: string
  release_date: string
  director: string
  cast: string[]
  genres: string[]
  is_active: boolean
}

export default function EditMoviePage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMovie, setIsLoadingMovie] = useState(true)
  const [castInput, setCastInput] = useState("")
  const [genreInput, setGenreInput] = useState("")
  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    description: "",
    image_url: "",
    backdrop_url: "",
    trailer_url: "",
    duration: "",
    rating: "",
    release_date: "",
    director: "",
    cast: [],
    genres: [],
    is_active: true
  })
  const [errors, setErrors] = useState<Partial<MovieFormData>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?redirect=/admin')
      return
    }

    if (!loading && user && !isAdmin) {
      router.push('/')
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      })
      return
    }

    if (isAdmin && params.id) {
      fetchMovie()
    }
  }, [user, loading, isAdmin, router, toast, params.id])

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/admin/movies/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch movie')
      }
      const data = await response.json()
      const movie = data.movie
      
      setFormData({
        title: movie.title || "",
        description: movie.description || "",
        image_url: movie.image_url || "",
        backdrop_url: movie.backdrop_url || "",
        trailer_url: movie.trailer_url || "",
        duration: movie.duration ? movie.duration.toString() : "",
        rating: movie.rating ? movie.rating.toString() : "",
        release_date: movie.release_date || "",
        director: movie.director || "",
        cast: movie.cast || [],
        genres: movie.genres || [],
        is_active: movie.is_active
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch movie: " + error.message,
        variant: "destructive"
      })
      router.push('/admin')
    } finally {
      setIsLoadingMovie(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<MovieFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = "Duration must be a number"
    }

    if (formData.rating && (isNaN(Number(formData.rating)) || Number(formData.rating) < 0 || Number(formData.rating) > 5)) {
      newErrors.rating = "Rating must be a number between 0 and 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/movies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          rating: formData.rating ? parseFloat(formData.rating) : null,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update movie')
      }

      toast({
        title: "Success",
        description: "Movie updated successfully."
      })

      router.push('/admin')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof MovieFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const addCastMember = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()]
      }))
      setCastInput("")
    }
  }

  const removeCastMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index)
    }))
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }))
      setGenreInput("")
    }
  }

  const removeGenre = (index: number) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter((_, i) => i !== index)
    }))
  }

  if (loading || !user || !isAdmin || isLoadingMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {isLoadingMovie ? "Loading movie..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Movie</h1>
            <p className="text-muted-foreground">Update movie information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic details about the movie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, is_active: checked }))
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="is_active">Movie is active</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      placeholder="Enter movie title"
                      disabled={isLoading}
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      placeholder="Enter movie description"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="director">Director</Label>
                      <Input
                        id="director"
                        value={formData.director}
                        onChange={handleInputChange('director')}
                        placeholder="Enter director name"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="release_date">Release Date</Label>
                      <Input
                        id="release_date"
                        type="date"
                        value={formData.release_date}
                        onChange={handleInputChange('release_date')}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={handleInputChange('duration')}
                        placeholder="e.g., 120"
                        disabled={isLoading}
                      />
                      {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={handleInputChange('rating')}
                        placeholder="e.g., 4.5"
                        disabled={isLoading}
                      />
                      {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media URLs</CardTitle>
                  <CardDescription>
                    Update image and video URLs for the movie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Poster Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange('image_url')}
                      placeholder="https://example.com/poster.jpg"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backdrop_url">Backdrop Image URL</Label>
                    <Input
                      id="backdrop_url"
                      value={formData.backdrop_url}
                      onChange={handleInputChange('backdrop_url')}
                      placeholder="https://example.com/backdrop.jpg"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailer_url">Trailer URL</Label>
                    <Input
                      id="trailer_url"
                      value={formData.trailer_url}
                      onChange={handleInputChange('trailer_url')}
                      placeholder="https://youtube.com/watch?v=..."
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cast</CardTitle>
                  <CardDescription>
                    Update cast members for the movie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={castInput}
                      onChange={(e) => setCastInput(e.target.value)}
                      placeholder="Enter cast member name"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      onClick={addCastMember}
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.cast.map((member, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {member}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeCastMember(index)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Genres</CardTitle>
                  <CardDescription>
                    Update genres for the movie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      placeholder="Enter genre"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      onClick={addGenre}
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.genres.map((genre, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {genre}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeGenre(index)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Updating..." : "Update Movie"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}