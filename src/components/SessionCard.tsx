"use client"

import { Card, CardHeader } from "./ui/Card"
import { Play, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "./ui/Badge"
import { useNavigate } from "react-router-dom"
import { exerciseStorage } from "@/utils/exerciseStorage"
import { useEffect, useState } from "react"

interface Session {
  id: string
  day_number: number
  title: string
  name: string
}

interface SessionCardProps {
  session: Session
}

export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate()
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0, percentage: 0 })

  useEffect(() => {
    const stats = exerciseStorage.getSessionStats(session.id)
    setCompletionStats(stats)
  }, [session.id])

  const handleSessionClick = () => {
    navigate(`/session/${session.id}`)
  }

  const isCompleted = completionStats.total > 0 && completionStats.percentage === 100

  return (
    <Card
      className={`bg-card border-border hover:bg-muted/30 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-sm hover:shadow-md ${isCompleted ? "ring-2 ring-green-500/20" : ""}`}
      onClick={handleSessionClick}
    >
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Play className="w-4 h-4 text-green-500" />
              {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-500 absolute -top-1 -right-1" />}
            </div>
            <div>
              <h4 className="font-medium text-sm text-card-foreground">{session.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Día {session.day_number}
                </Badge>
                <span className="text-xs text-muted-foreground">{session.title}</span>
                {completionStats.total > 0 && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      isCompleted
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
                    }`}
                  >
                    {completionStats.percentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
    </Card>
  )
}
