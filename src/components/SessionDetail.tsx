"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Dumbbell, Clock, Repeat, CheckCircle2, Circle, Play, ListChecks, X } from "lucide-react"
import { workoutService } from "@/api/services/workoutService"
import { ThemeToggle } from "./core/ThemeToggle"
import { exerciseStorage } from "@/utils/exerciseStorage"
import { Button } from "./ui/button-new"

interface Exercise {
  id: string
  title: string
  description: string
  video_url?: string
  sets: Set[]
  order_in_session: number
}

interface Set {
  id: string
  set_reps: string
  set_rest: string
  set_series: string
}

interface Session {
  id: string
  day_number: number
  title: string
  name: string
  exercises: Exercise[]
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [exerciseCompletions, setExerciseCompletions] = useState<Record<string, boolean>>({})
  const [modalVideo, setModalVideo] = useState<{ isOpen: boolean; videoUrl: string; exerciseTitle: string }>({
    isOpen: false,
    videoUrl: '',
    exerciseTitle: ''
  })


  useEffect(() => {
    window.scrollTo(0, 0) // Reset scroll position on mount
    const fetchSession = async () => {
      if (!sessionId) return

      try {
        const sessionData = await workoutService.getSession(sessionId)
        setSession(sessionData)

        // Initialize session with total exercise count
        if (sessionData.exercises) {
          exerciseStorage.initializeSession(sessionId, sessionData.exercises.length)
        }

        // Load exercise completions from localStorage
        const completions: Record<string, boolean> = {}
        sessionData.exercises?.forEach((exercise: Exercise) => {
          completions[exercise.id] = exerciseStorage.getExerciseCompletion(exercise.id, sessionId)
        })
        setExerciseCompletions(completions)
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const toggleExerciseCompletion = (exerciseId: string) => {
    if (!sessionId || !session) return

    const newStatus = !exerciseCompletions[exerciseId]
    setExerciseCompletions((prev) => ({
      ...prev,
      [exerciseId]: newStatus,
    }))

    exerciseStorage.setExerciseCompletion(exerciseId, sessionId, newStatus)
    // Update session completion with correct total count
    exerciseStorage.updateSessionCompletion(sessionId, session.exercises.length)
  }

  const openVideoModal = (videoUrl: string, exerciseTitle: string) => {
    setModalVideo({
      isOpen: true,
      videoUrl,
      exerciseTitle
    })
  }

  const closeVideoModal = () => {
    setModalVideo({
      isOpen: false,
      videoUrl: '',
      exerciseTitle: ''
    })
  }

  const getSessionProgress = () => {
    if (!session?.exercises) return { completed: 0, total: 0, percentage: 0 }

    const total = session.exercises.length
    const completed = Object.values(exerciseCompletions).filter(Boolean).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  const VideoModal = () => {
    if (!modalVideo.isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={closeVideoModal}
        />
        
        {/* Modal content */}
        <div className="relative z-10 w-full max-w-4xl mx-4 bg-card rounded-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-semibold text-foreground">{modalVideo.exerciseTitle}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeVideoModal}
              className="p-2 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
          
          {/* Video */}
          <div className="p-4">
            <video
              className="w-full h-auto max-h-[70vh] rounded-lg"
              controls
              autoPlay
              preload="metadata"
              poster="/placeholder.svg?height=400&width=800"
              loop
            >
              <source src={modalVideo.videoUrl} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <ThemeToggle />
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-32 bg-muted" />
            <Skeleton className="h-8 w-64 bg-muted" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4 bg-muted" />
                  <Skeleton className="h-48 w-full mb-4 bg-muted" />
                  <Skeleton className="h-20 w-full bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-background">
        <ThemeToggle />
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Sesión no encontrada</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progress = getSessionProgress()

  return (
    <div className="min-h-screen w-full bg-background transition-colors duration-500">
      <ThemeToggle />
      <div className="w-full px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Día {session.day_number}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground">{session.name}</h1>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {progress.completed} de {progress.total} ejercicios
                  </div>
                  <div className="text-xs text-muted-foreground">{progress.percentage}% completado</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progress.percentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-foreground">{progress.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">{session.title}</p>
          </div>

          <div className="space-y-6">
            {session.exercises?.map((exercise, index) => (
              <div
                key={exercise.id}
                className="animate-in slide-in-from-bottom-2 fade-in-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-card-foreground">{exercise.title}</CardTitle>
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Dumbbell className="w-5 h-5 text-primary" />
                        <button
                          onClick={() => toggleExerciseCompletion(exercise.id)}
                          className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                        >
                          {exerciseCompletions[exercise.id] ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Sets */}
                    <div className="grid gap-3 mb-4">
                      {exercise.sets?.map((set) => (
                        <div key={set.id} className="flex items-center justify-around p-3 bg-muted/50 rounded-lg">
                          {/* Number of Series */}
                          <div className="flex items-center flex-col">
                            <div className="flex items-center space-x-2">
                              <ListChecks className="w-4 h-4 text-chart-3" />
                              <span className="text-sm font-medium text-foreground">
                                Series
                              </span>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                              {set.set_series}
                            </span>
                          </div>
                          {/* Reps */}
                          <div className="flex items-center flex-col">
                            <div className="flex items-center space-x-2">
                              <Repeat className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">
                                Reps
                              </span>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                              {set.set_reps}
                            </span>
                          </div>
                          {/* Rest */}
                          <div className="flex items-center flex-col">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-foreground">
                                Descanso
                              </span>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                              {set.set_rest}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Video button */}
                    {exercise.video_url && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => openVideoModal(exercise.video_url!, exercise.title)}
                          className="flex items-center space-x-2 p-2 bg-primary/10! hover:bg-primary/10 border-primary/20! hover:border-primary/30 transition-all duration-200"
                        >
                          <Play className="w-4 h-4 text-primary" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {session.exercises?.length === 0 && (
            <Card className="text-center py-8 bg-card border-border">
              <CardContent>
                <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay ejercicios</h3>
                <p className="text-muted-foreground">Esta sesión no tiene ejercicios configurados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {modalVideo.isOpen && <VideoModal />}
    </div>
  )
}