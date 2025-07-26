import { useEffect, useState } from 'react'
import { Card } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import GuideCard from './GuideCard'
import { workoutService } from '@/api/services/workoutService'
import { ThemeToggle } from './core/ThemeToggle'

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
  day_number: number
  title: string
  name: string
}

export default function GuideList() {
  const [guides, setGuides] = useState<Guide[]>([])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-32 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-500">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Guías de Entrenamiento
          </h1>
        </div>

        <div className="space-y-3">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </div>
  )
}