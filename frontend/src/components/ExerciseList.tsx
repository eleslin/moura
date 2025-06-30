import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Session, Exercise, ExerciseSet } from '../services/workoutService'
import { workoutService } from '../services/workoutService'

export default function ExerciseList() {
  const { id } = useParams()
  const [data, setData] = useState<{ session: Session; exercises: Exercise[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const result = await workoutService.getSession(id || '')
        setData(result)
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchExercises()
    }
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  if (!data) {
    return <div className="text-red-500">No se encontró la sesión</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{data.session.session_description}</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Volver
        </button>
      </div>
      
      <div className="space-y-4">
        {data.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{exercise.exercise_name}</h2>
              {exercise.video_url && (
                <a 
                  href={exercise.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Ver Video
                </a>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {exercise.sets.map((set) => (
                <div key={set.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Serie {set.set_series}</span>
                  <span>{set.set_reps} repeticiones</span>
                  <span>{set.set_rest} descanso</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
