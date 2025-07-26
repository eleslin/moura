import { Card, CardHeader } from './ui/Card'
import { Play, ArrowRight } from 'lucide-react'
import { Badge } from './ui/Badge'
import { useNavigate } from 'react-router-dom'

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

  const handleSessionClick = () => {
    navigate(`/session/${session.id}`)
  }

  return (
    <Card className="bg-slate-50/80 dark:bg-slate-600/80 hover:bg-slate-100/80 dark:hover:bg-slate-500/80 backdrop-blur-sm transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-sm hover:shadow-md" onClick={handleSessionClick}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Play className="w-4 h-4 text-green-500 dark:text-green-400" />
            <div>
              <h4 className="font-medium text-sm text-slate-800 dark:text-slate-100">{session.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  Día {session.day_number}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {session.title}
                </span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </CardHeader>
    </Card>
  )
}
