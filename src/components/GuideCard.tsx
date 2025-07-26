import { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import WeekCard from './WeekCard'
import { Skeleton } from './ui/Skeleton'
import { workoutService } from '@/api/services/workoutService'
import { useAppState } from './core/AppStateProvider'

interface Guide {
  id: string
  title: string
  image_url: string
}

interface Week {
  id: string
  week_index: number
  week_title: string
}

interface GuideCardProps {
  guide: Guide
}

export default function GuideCard({ guide }: GuideCardProps) {
  const { state, setExpandedGuides, setWeeksData } = useAppState()
  const [loading, setLoading] = useState(false)

  const isExpanded = state.expandedGuides[guide.id] || false
  const weeks = state.weeksData[guide.id] || []

  const toggleGuide = async () => {
    const newExpanded = !isExpanded
    setExpandedGuides(prev => ({
      ...prev,
      [guide.id]: newExpanded
    }))

    if (newExpanded && weeks.length === 0) {
      setLoading(true)
      try {
        const guideData = await workoutService.getGuide(guide.id)
        setWeeksData(prev => ({
          ...prev,
          [guide.id]: guideData.weeks || []
        }))
      } catch (error) {
        console.error('Error fetching weeks:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="transform transition-all duration-300 hover:scale-[1.01]">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <Collapsible open={isExpanded} onOpenChange={toggleGuide}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-600 shadow-sm overflow-hidden">
                      <img
                        src={guide.image_url || "/placeholder.svg"}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                      {guide.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Toca para expandir</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors duration-200">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
            <CardContent className="pt-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Skeleton className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {weeks.map((week, index) => (
                    <div 
                      key={week.id} 
                      className="animate-in slide-in-from-top-2 fade-in-0"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <WeekCard week={week} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}