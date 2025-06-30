import { supabase } from '../lib/supabaseClient'

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
  exercise_name: string
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

    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('session_id', id)

    if (exercisesError) throw exercisesError

    // Get sets for each exercise
    const exercisesWithSets = await Promise.all(
      exercises.map(async (exercise) => {
        const { data: sets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('exercise_id', exercise.id)

        if (setsError) throw setsError
        return { ...exercise, sets }
      })
    )

    return { session, exercises: exercisesWithSets }
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
