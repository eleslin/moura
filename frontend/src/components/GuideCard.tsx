import { Guide } from '../services/workoutService'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface GuideCardProps {
  guide: Guide
}

export default function GuideCard({ guide }: GuideCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={guide.image_url} 
        alt={guide.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{guide.title}</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>
      {expanded && (
        <Link 
          to={`/guide/${guide.id}`}
          className="block w-full text-center py-2 bg-blue-500 text-white hover:bg-blue-600"
        >
          Ver Semanas
        </Link>
      )}
    </div>
  )
}
