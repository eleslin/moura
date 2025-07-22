import { useEffect, useState } from 'react'
import { workoutService } from '../services/workoutService'
import { Link } from 'react-router-dom'
import '../styles/global.css'

interface Guide {
  id: string
  title: string
  image_url: string
  weeks: Week[]
}

interface Week {
  id: string
  week_index: number
  sessions: Session[]
  week_title: string
}

interface Session {
  id: string
  session_index: number
  exercises: Exercise[]
  name: string
}

interface Exercise {
  id: string
  name: string
  description: string
  sets: number
  reps: number
}

interface Guide {
  id: string
  title: string
  image_url: string
  weeks: Week[]
}

interface Week {
  id: string
  week_index: number
  sessions: Session[]
  name: string
}

interface Session {
  id: string
  session_index: number
  exercises: any[]
  name: string
}

export default function GuideList() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({})
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})
  const [loadingWeeks, setLoadingWeeks] = useState<Record<string, boolean>>({})
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({})
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({})
  const [weeksData, setWeeksData] = useState<Record<string, Week[]>>({})
  const [sessionsData, setSessionsData] = useState<Record<string, Session[]>>({})
  const [exercisesData, setExercisesData] = useState<Record<string, Exercise[]>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await workoutService.getGuides()
        setGuides(data)
      } catch (error) {
        console.error('Error fetching guides:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await workoutService.getGuides()
        setGuides(data)
      } catch (error) {
        console.error('Error fetching guides:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  const toggleWeek = async (weekId: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }))

    if (!sessionsData[weekId] && !loadingSessions[weekId]) {
      setLoadingSessions(prev => ({
        ...prev,
        [weekId]: true
      }))

      try {
        const week = await workoutService.getWeek(weekId)
        setSessionsData(prev => ({
          ...prev,
          [weekId]: week.sessions || []
        }))
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setLoadingSessions(prev => ({
          ...prev,
          [weekId]: false
        }))
      }
    }
  }

  // const toggleSession = async (sessionId: string) => {
  //   setExpandedSessions(prev => ({
  //     ...prev,
  //     [sessionId]: !prev[sessionId]
  //   }))

  //   if (!exercisesData[sessionId] && !loadingExercises[sessionId]) {
  //     setLoadingExercises(prev => ({
  //       ...prev,
  //       [sessionId]: true
  //     }))

  //     try {
  //       const session = await workoutService.getSession(sessionId)
  //       setExercisesData(prev => ({
  //         ...prev,
  //         [sessionId]: session.exercises || []
  //       }))
  //     } catch (error) {
  //       console.error('Error fetching exercises:', error)
  //     } finally {
  //       setLoadingExercises(prev => ({
  //         ...prev,
  //         [sessionId]: false
  //       }))
  //     }
  //   }
  // }

  const toggleGuide = async (guideId: string) => {
    setExpandedGuides(prev => ({
      ...prev,
      [guideId]: !prev[guideId]
    }))

    if (!weeksData[guideId] && !loadingWeeks[guideId]) {
      setLoadingWeeks(prev => ({
        ...prev,
        [guideId]: true
      }))

      try {
        const guide = await workoutService.getGuide(guideId)
        const weeks = guide.weeks || []
        setWeeksData(prev => ({
          ...prev,
          [guideId]: weeks
        }))
        setExpandedWeeks(prev => ({
          ...prev,
          ...weeks.reduce((acc, week) => ({
            ...acc,
            [week.id]: false
          }), {} as Record<string, boolean>)
        }))
      } catch (error) {
        console.error('Error fetching weeks:', error)
      } finally {
        setLoadingWeeks(prev => ({
          ...prev,
          [guideId]: false
        }))
      }
    }
  }

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await workoutService.getGuides()
        setGuides(data)
      } catch (error) {
        console.error('Error fetching guides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

 if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Guías de Entrenamiento</h1>
        <p className="text-gray-600">Selecciona una guía para ver sus semanas y sesiones</p>
      </div>

      <div className="space-y-4">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden">
            <Collapsible open={expandedGuides[guide.id]} onOpenChange={() => toggleGuide(guide.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={guide.image_url || "/placeholder.svg"}
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{guide.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Dumbbell className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Guía de entrenamiento</span>
                        </div>
                      </div>
                    </div>
                    {expandedGuides[guide.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {loadingWeeks[guide.id] ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weeksData[guide.id]?.map((week) => (
                        <Card key={week.id} className="border-l-4 border-l-blue-500">
                          <Collapsible open={expandedWeeks[week.id]} onOpenChange={() => toggleWeek(week.id)}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div>
                                      <h3 className="font-medium">{week.week_title}</h3>
                                      <p className="text-sm text-gray-500">Semana {week.week_index}</p>
                                    </div>
                                  </div>
                                  {expandedWeeks[week.id] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                {loadingSessions[week.id] ? (
                                  <div className="space-y-2">
                                    {[...Array(2)].map((_, i) => (
                                      <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {sessionsData[week.id]?.map((session) => (
                                      <Card key={session.id} className="bg-gray-50">
                                        <Collapsible
                                          open={expandedSessions[session.id]}
                                          onOpenChange={() => toggleSession(session.id)}
                                        >
                                          <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-gray-100 transition-colors py-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <Play className="w-4 h-4 text-green-500" />
                                                  <div>
                                                    <h4 className="font-medium text-sm">{session.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                      <Badge variant="secondary" className="text-xs">
                                                        Sesión {session.session_index}
                                                      </Badge>
                                                      <span className="text-xs text-gray-500">
                                                        {session.exercises?.length || 0} ejercicios
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                                {expandedSessions[session.id] ? (
                                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                                )}
                                              </div>
                                            </CardHeader>
                                          </CollapsibleTrigger>

                                          <CollapsibleContent>
                                            <CardContent className="pt-0">
                                              <div className="space-y-2">
                                                {session.exercises?.map((exercise) => (
                                                  <div
                                                    key={exercise.id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                                  >
                                                    <span className="font-medium text-sm">{exercise.name}</span>
                                                    <Badge variant="outline">
                                                      {exercise.sets} × {exercise.reps}
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  )
}
