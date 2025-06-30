import { useEffect, useState } from 'react'
import { Guide, Week, Session } from '../services/workoutService'
import { workoutService } from '../services/workoutService'
import { Link } from 'react-router-dom'
import '../styles/global.css'

export default function GuideList() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({})
  const [loadingWeeks, setLoadingWeeks] = useState<Record<string, boolean>>({})
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({})
  const [weeksData, setWeeksData] = useState<Record<string, Week[]>>({})
  const [sessionsData, setSessionsData] = useState<Record<string, Session[]>>({})
  const [loading, setLoading] = useState(true)

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
        // Inicializar el estado de expansión para cada semana
        setExpandedWeeks(prev => ({
          ...prev,
          ...weeks.reduce((acc, week) => ({
            ...acc,
            [week.id]: false
          }), {})
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
    return <div className="loading">Cargando guías...</div>
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Guías de Entrenamiento</h2>
        <div className="grid grid-cols-1 gap-4">
          {guides.map((guide) => (
            <div key={guide.id} className="card">
              <div className="flex justify-between items-center">
                <h3 className="subtitle cursor-pointer" onClick={() => toggleGuide(guide.id)}>
                  {guide.title}
                  <span className="ml-2">
                    {expandedGuides[guide.id] ? '▼' : '▶'}
                  </span>
                </h3>
              </div>
              {expandedGuides[guide.id] && (
                <div className="mt-4">
                  {loadingWeeks[guide.id] ? (
                    <div className="text-center">Cargando semanas...</div>
                  ) : (
                    <>
                      {weeksData[guide.id]?.map((week) => (
                        <div key={week.id} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleWeek(week.id)}>
                            <span>Semana {week.week_index}</span>
                            <span className="ml-2">
                              {expandedWeeks[week.id] ? '▼' : '▶'}
                            </span>
                          </div>
                          {expandedWeeks[week.id] && (
                            <div className="ml-4">
                              {loadingSessions[week.id] ? (
                                <div className="text-center">Cargando sesiones...</div>
                              ) : (
                                <div className="space-y-2">
                                  {sessionsData[week.id]?.map((session) => (
                                    <Link
                                      key={session.id}
                                      to={`/exercise/${session.id}`}
                                      className="block hover:bg-primary-dark p-2 rounded"
                                    >
                                      Sesión {session.session_index}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
