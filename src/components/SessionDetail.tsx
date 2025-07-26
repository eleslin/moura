import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'
import { ArrowLeft, Dumbbell, Clock, Repeat } from 'lucide-react'
import { workoutService } from '@/api/services/workoutService'
import { ThemeToggle } from './core/ThemeToggle'
import { Button } from './ui/Button'

interface Exercise {
  id: string
  title: string
  description: string
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

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return
      
      try {
        const sessionData = await workoutService.getSession(sessionId)
        setSession(sessionData)
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-slate-700" />
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-800/80">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4 bg-slate-200 dark:bg-slate-700" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-500">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
              Día {session.day_number}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{session.name}</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">{session.title}</p>
        </div>

        <div className="space-y-4">
          {session.exercises?.map((exercise, index) => (
            <div 
              key={exercise.id}
              className="animate-in slide-in-from-bottom-2 fade-in-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-700/80 dark:to-slate-600/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-100">{exercise.title}</CardTitle>
                        {exercise.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{exercise.description}</p>
                        )}
                      </div>
                    </div>
                    <Dumbbell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="grid gap-3">
                    {exercise.sets?.map((set, setIndex) => (
                      <div key={set.id} className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Serie {setIndex + 1}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Repeat className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{set.set_series} × {set.set_reps}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">{set.set_rest} descanso</span>
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
          <Card className="text-center py-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent>
              <Dumbbell className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">No hay ejercicios</h3>
              <p className="text-slate-600 dark:text-slate-300">Esta sesión no tiene ejercicios configurados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}