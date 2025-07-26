import { useState } from 'react'
import { Card, CardHeader, CardContent } from './ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import SessionCard from './SessionCard'
import { Skeleton } from './ui/Skeleton'
import { useAppState } from './core/AppStateProvider'
import { workoutService } from '@/api/services/workoutService'

interface Week {
  id: string
  week_index: number
  week_title: string
}

interface Session {
  id: string
  day_number: number
  title: string
  name: string
}

interface WeekCardProps {
  week: Week
}

export default function WeekCard({ week }: WeekCardProps) {
  const { state, setExpandedWeeks, setSessionsData } = useAppState()
  const [loading, setLoading] = useState(false)

  const isExpanded = state.expandedWeeks[week.id] || false
  const sessions = state.sessionsData[week.id] || []

  const toggleWeek = async () => {
    const newExpanded = !isExpanded
    setExpandedWeeks(prev => ({
      ...prev,
      [week.id]: newExpanded
    }))

    if (newExpanded && sessions.length === 0) {
      setLoading(true)
      try {
        const weekData = await workoutService.getWeek(week.id)
        setSessionsData(prev => ({
          ...prev,
          [week.id]: weekData.sessions || []
        }))
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
      <Collapsible open={isExpanded} onOpenChange={toggleWeek}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-600/50 transition-colors duration-300 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{week.week_title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Semana {week.week_index}</p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-12 w-full bg-slate-200 dark:bg-slate-600 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session, index) => (
                  <div 
                    key={session.id}
                    className="animate-in slide-in-from-top-1 fade-in-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SessionCard session={session} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}