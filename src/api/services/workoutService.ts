import { supabase } from '../core/supabaseClient'

export interface Guide {
  id: string
  title: string
  image_url: string
  created_at: string
  updated_at: string
  weeks?: Week[]
}

export interface Week {
  id: string
  guide_id: string
  week_index: number
  week_description: string
  created_at: string
  updated_at: string
  sessions?: Session[]
}

export interface Session {
  id: string
  week_id: string
  session_index: number
  session_description: string
  created_at: string
  updated_at: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  title: string
  exercise_description: string
  exercise_type: string
  video_url?: string
  created_at: string
  updated_at: string
  sets: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  exercise_id: string
  set_series: string
  set_reps: string
  set_rest: string
  created_at: string
  updated_at: string
}

export const workoutService = {
  // Get all guides
  async getGuides() {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase Response:', { data, error })
      if (error) throw error
      
      // Check if data is undefined or empty
      if (!data || data.length === 0) {
        console.log('No guides found in database')
      }
      
      return data
    } catch (error) {
      console.error('Error fetching guides:', error)
      throw error
    }
  },

  // Get a specific guide with its weeks
  async getGuide(id: string) {
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .single()

    if (guideError) throw guideError

    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('*')
      .eq('guide_id', id)
      .order('week_index')

    if (weeksError) throw weeksError

    const guideWithWeeks = {
      ...guide,
      weeks: weeks
    }

    return guideWithWeeks
  },

  // Get a specific week with its sessions
  async getWeek(id: string) {
    const { data: week, error: weekError } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single()

    if (weekError) throw weekError

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('week_id', id)
      .order('day_number')

    if (sessionsError) throw sessionsError

    return { week, sessions }
  },

  // Get a specific session with its exercises and sets
  async getSession(id: string) {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (sessionError) throw sessionError

    // Get exercises for this session through session_exercises pivot table, ordered by order_in_session
    const { data: sessionExercises, error: sessionExercisesError } = await supabase
      .from('session_exercises')
      .select('exercise_id, order_in_session')
      .eq('session_id', id)
      .order('order_in_session', { ascending: true })

    if (sessionExercisesError) throw sessionExercisesError

    // Get all exercises
    const exerciseIds = sessionExercises.map(se => se.exercise_id)
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .in('id', exerciseIds)

    if (exercisesError) throw exercisesError

    // Create a map of exercise ID to its order_in_session
    const exerciseOrderMap = new Map(
      sessionExercises.map(se => [se.exercise_id, se.order_in_session])
    )

    // Get all sets for all exercises in this session in a single query
    const { data: allExerciseSets, error: allExerciseSetsError } = await supabase
      .from('exercise_sets')
      .select('exercise_id, set_id, order_in_exercise')
      .in('exercise_id', exerciseIds)
      .eq('session_id', id)
      .order('exercise_id')
      .order('order_in_exercise')

    if (allExerciseSetsError) throw allExerciseSetsError

    // Get all set IDs and fetch all sets in a single query
    const setIds = allExerciseSets.map(es => es.set_id)
    const { data: allSets, error: allSetsError } = await supabase
      .from('sets')
      .select('*')
      .in('id', setIds)

    if (allSetsError) throw allSetsError

    // Create a map of set_id to set data for quick lookup
    const setsMap = new Map(allSets.map(set => [set.id, set]))

    // Group sets by exercise_id with proper ordering
    const setsByExercise = new Map<string, ExerciseSet[]>()
    for (const es of allExerciseSets) {
      const setData = setsMap.get(es.set_id)
      if (setData) {
        const exerciseSets = setsByExercise.get(es.exercise_id) || []
        exerciseSets.push(setData)
        setsByExercise.set(es.exercise_id, exerciseSets)
      }
    }

    // Add order information and sets to each exercise
    const exercisesWithSets = exercises.map(exercise => {
      const exerciseWithOrder = {
        ...exercise,
        order_in_session: exerciseOrderMap.get(exercise.id) || 0,
        sets: setsByExercise.get(exercise.id) || []
      }
      return exerciseWithOrder
    })

    // Sort exercises by order_in_session
    exercisesWithSets.sort((a, b) => a.order_in_session - b.order_in_session)

    return {
      ...session,
      exercises: exercisesWithSets
    }
  },

  // Get a specific exercise with its sets
  async getExercise(id: string) {
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (exerciseError) throw exerciseError

    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('exercise_id', id)

    if (setsError) throw setsError

    return { exercise, sets }
  }
}