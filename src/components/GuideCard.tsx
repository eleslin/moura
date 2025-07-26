"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "./ui/Card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronDown, ChevronRight, BookOpen, Dumbbell } from "lucide-react"
import WeekCard from "./WeekCard"
import { Skeleton } from "./ui/Skeleton"
import { workoutService } from "@/api/services/workoutService"
import { useAppState } from "./core/AppStateProvider"
import { Badge } from "./ui/Badge"

interface Guide {
  id: string
  title: string
  image_url: string
  type: number // 0 = Guide, 1 = Training
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
    setExpandedGuides((prev) => ({
      ...prev,
      [guide.id]: newExpanded,
    }))

    if (newExpanded && weeks.length === 0) {
      setLoading(true)
      try {
        const guideData = await workoutService.getGuide(guide.id)
        setWeeksData((prev) => ({
          ...prev,
          [guide.id]: guideData.weeks || [],
        }))
      } catch (error) {
        console.error("Error fetching weeks:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const getGuideTypeInfo = (type: number) => {
    return type === 0
      ? {
          label: "Guía",
          icon: BookOpen,
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
        }
      : {
          label: "Entrenamiento",
          icon: Dumbbell,
          color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
        }
  }

  const typeInfo = getGuideTypeInfo(guide.type)
  const TypeIcon = typeInfo.icon

  return (
    <div className="transform transition-all duration-300 hover:scale-[1.02] h-full">
      <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <Collapsible open={isExpanded} onOpenChange={toggleGuide}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-all duration-300 border-b border-border flex-shrink-0">
              <div className="flex items-start justify-between p-2">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative group flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-muted shadow-sm overflow-hidden">
                      <img
                        src={guide.image_url || "/placeholder.svg?height=80&width=80&query=workout guide"}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={typeInfo.color}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-card-foreground leading-tight hover:text-primary transition-colors duration-200 line-clamp-2">
                      {guide.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">Toca para expandir</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <div className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 flex-1">
            <CardContent className="pt-4 flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Skeleton className="h-16 w-full bg-muted rounded-lg" />
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
