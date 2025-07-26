"use client"

import { useEffect, useState } from "react"
import { Card } from "./ui/Card"
import { Skeleton } from "./ui/Skeleton"
import GuideCard from "./GuideCard"
import { workoutService } from "@/api/services/workoutService"
import { ThemeToggle } from "./core/ThemeToggle"
import { BookOpen, Dumbbell } from "lucide-react"

interface Guide {
  id: string
  title: string
  image_url: string
  type: number // 0 = Guide, 1 = Training
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
        console.error("Error fetching guides:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  // Separate guides by type
  const guideTypeGuides = guides.filter((guide) => guide.type === 0)
  const trainingTypeGuides = guides.filter((guide) => guide.type === 1)

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <ThemeToggle />
        <div className="w-full px-6 py-8">
          <div className="space-y-8">
            {/* Loading skeleton for sections */}
            {[...Array(2)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                <Skeleton className="h-8 w-48 bg-muted" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-card border-border">
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-4 bg-muted" />
                        <Skeleton className="h-32 w-full bg-muted" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const SectionHeader = ({ title, icon: Icon, count }: { title: string; icon: any; count: number }) => (
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{count} elementos disponibles</p>
      </div>
    </div>
  )

  const GuideSection = ({ guides, title, icon }: { guides: Guide[]; title: string; icon: any }) => {
    if (guides.length === 0) return null

    return (
      <div className="space-y-6">
        <SectionHeader title={title} icon={icon} count={guides.length} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {guides.map((guide, index) => (
            <div
              key={guide.id}
              className="animate-in slide-in-from-bottom-2 fade-in-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GuideCard guide={guide} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background transition-colors duration-500">
      <ThemeToggle />
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mi Entrenamiento</h1>
          <p className="text-muted-foreground">
            Descubre guías y entrenamientos personalizados para alcanzar tus objetivos
          </p>
        </div>

        <div className="space-y-12">
          <GuideSection guides={guideTypeGuides} title="Guías de Entrenamiento" icon={BookOpen} />

          <GuideSection guides={trainingTypeGuides} title="Entrenamientos" icon={Dumbbell} />
        </div>

        {guides.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No hay contenido disponible</h3>
            <p className="text-muted-foreground">Aún no tienes guías o entrenamientos configurados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
