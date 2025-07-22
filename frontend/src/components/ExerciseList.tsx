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
      
      <div className="space-y-6">
        {data.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
              {exercise.video_url && (
                <div className="flex justify-center mb-4">
                  <a 
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Video
                  </a>
                </div>
              )}
              <div className="mt-4 space-y-3">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className='flex '>
                          <div className="mt-1 flex flex-col items-center justify-center">
                            <div className="text-gray-800">Series</div>
                            <div className="text-gray-800">{set.set_series}</div>
                          </div>
                          <div className="mt-1 flex flex-col items-center justify-center">
                            <div className="text-gray-800">Reps</div>
                            <div className="text-gray-800">{set.set_reps}</div>
                          </div>
                          <div className="mt-1 flex flex-col items-center justify-center">
                            <div className="text-gray-800">Rest</div>
                            <div className="text-gray-800">{set.set_rest}</div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
