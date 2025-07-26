"use client"

import { Card, CardHeader } from "./ui/Card"
import { Play, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "./ui/Badge"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { exerciseStorage } from "@/utils/exerciseStorage"

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
      className={`bg-slate-50/80 dark:bg-slate-600/80 hover:bg-slate-100/80 dark:hover:bg-slate-500/80 backdrop-blur-sm transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-sm hover:shadow-md ${isCompleted ? "ring-2 ring-green-500/20 dark:ring-green-400/20" : ""}`}
      onClick={handleSessionClick}
    >
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Play className="w-4 h-4 text-green-500 dark:text-green-400" />
              {isCompleted && (
                <CheckCircle2 className="w-3 h-3 text-green-500 dark:text-green-400 absolute -top-1 -right-1" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-800 dark:text-slate-100">{session.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                >
                  Día {session.day_number}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">{session.title}</span>
                {completionStats.total > 0 && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      isCompleted
                        ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                        : "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    {completionStats.percentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </CardHeader>
    </Card>
  )
}
