import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Guide, Week } from '../../frontend/src/services/workoutService'
import { workoutService } from '../../frontend/src/services/workoutService'
import { Link } from 'react-router-dom'

export default function WeekList() {
  const { id } = useParams()
  const [data, setData] = useState<{ guide: Guide; weeks: Week[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const result = await workoutService.getGuide(id || '')
        setData(result)
      } catch (error) {
        console.error('Error fetching weeks:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWeeks()
    }
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  if (!data) {
    return <div className="text-red-500">No se encontró la guía</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{data.guide.title}</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Volver
        </button>
      </div>
      
      <div className="space-y-4">
        {data.weeks.map((week) => (
          <div key={week.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Semana {week.week_index}</h2>
              <Link 
                to={`/week/${week.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ver Sesiones
              </Link>
            </div>
            <p className="text-gray-600">{week.week_description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
