"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Skeleton } from "./ui/Skeleton"
import { ArrowLeft, Dumbbell, Clock, Repeat, CheckCircle2, Circle, Play } from "lucide-react"
import { workoutService } from "@/api/services/workoutService"
import { ThemeToggle } from "./core/ThemeToggle"
import { Button } from "./ui/Button"
import { exerciseStorage } from "@/utils/exerciseStorage"

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

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return

      try {
        const sessionData = await workoutService.getSession(sessionId)
        setSession(sessionData)

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
    if (!sessionId) return

    const newStatus = !exerciseCompletions[exerciseId]
    setExerciseCompletions((prev) => ({
      ...prev,
      [exerciseId]: newStatus,
    }))

    exerciseStorage.setExerciseCompletion(exerciseId, sessionId, newStatus)
  }

  const getSessionProgress = () => {
    if (!session?.exercises) return { completed: 0, total: 0, percentage: 0 }

    const total = session.exercises.length
    const completed = Object.values(exerciseCompletions).filter(Boolean).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  const VideoPlayer = ({ videoUrl, title }: { videoUrl: string; title: string }) => {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
      <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 mb-4">
        <video
          className="w-full h-48 object-cover"
          controls
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster="/placeholder.svg?height=192&width=400"
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ThemeToggle />
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-slate-700" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-800/80">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-48 w-full mb-4 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-20 w-full bg-slate-200 dark:bg-slate-700" />
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
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ThemeToggle />
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Sesión no encontrada</h2>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-500">
      <ThemeToggle />
      <div className="w-full px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  Día {session.day_number}
                </Badge>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{session.name}</h1>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {progress.completed} de {progress.total} ejercicios
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{progress.percentage}% completado</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500 dark:text-green-400"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progress.percentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300">{session.title}</p>
          </div>

          <div className="space-y-6">
            {session.exercises?.map((exercise, index) => (
              <div
                key={exercise.id}
                className="animate-in slide-in-from-bottom-2 fade-in-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-700/80 dark:to-slate-600/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">{exercise.title}</CardTitle>
                          {exercise.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{exercise.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Dumbbell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <button
                          onClick={() => toggleExerciseCompletion(exercise.id)}
                          className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors duration-200"
                        >
                          {exerciseCompletions[exercise.id] ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {/* Video player */}
                    {exercise.video_url && <VideoPlayer videoUrl={exercise.video_url} title={exercise.title} />}

                    {/* Sets */}
                    <div className="grid gap-3">
                      {exercise.sets?.map((set, setIndex) => (
                        <div
                          key={set.id}
                          className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              Serie {setIndex + 1}
                            </span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Repeat className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  {set.set_series} × {set.set_reps}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  {set.set_rest} descanso
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {session.exercises?.length === 0 && (
            <Card className="text-center py-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent>
                <Dumbbell className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">No hay ejercicios</h3>
                <p className="text-slate-600 dark:text-slate-300">Esta sesión no tiene ejercicios configurados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
