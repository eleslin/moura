export interface ExerciseCompletion {
  exerciseId: string
  sessionId: string
  completedAt: string
  isCompleted: boolean
}

export interface SessionCompletion {
  sessionId: string
  completedAt: string
  totalExercises: number
  completedExercises: number
  isCompleted: boolean
}

const EXERCISE_COMPLETION_KEY = "workout_exercise_completions"
const SESSION_COMPLETION_KEY = "workout_session_completions"

export const exerciseStorage = {
  // Get all exercise completions
  getExerciseCompletions(): ExerciseCompletion[] {
    const stored = localStorage.getItem(EXERCISE_COMPLETION_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // Get completion status for a specific exercise
  getExerciseCompletion(exerciseId: string, sessionId: string): boolean {
    const completions = this.getExerciseCompletions()
    const completion = completions.find((c) => c.exerciseId === exerciseId && c.sessionId === sessionId)
    return completion?.isCompleted || false
  },

  // Set completion status for an exercise
  setExerciseCompletion(exerciseId: string, sessionId: string, isCompleted: boolean): void {
    const completions = this.getExerciseCompletions()
    const existingIndex = completions.findIndex((c) => c.exerciseId === exerciseId && c.sessionId === sessionId)

    const completion: ExerciseCompletion = {
      exerciseId,
      sessionId,
      completedAt: new Date().toISOString(),
      isCompleted,
    }

    if (existingIndex >= 0) {
      completions[existingIndex] = completion
    } else {
      completions.push(completion)
    }

    localStorage.setItem(EXERCISE_COMPLETION_KEY, JSON.stringify(completions))
  },

  // Update session completion status based on exercise completions and total exercises
  updateSessionCompletion(sessionId: string, totalExercisesInSession: number): void {
    const exerciseCompletions = this.getExerciseCompletions()
    const sessionExercises = exerciseCompletions.filter((c) => c.sessionId === sessionId)

    const completedExercises = sessionExercises.filter((c) => c.isCompleted).length

    // Only mark as completed if we have completions for ALL exercises in the session
    const isCompleted = completedExercises === totalExercisesInSession && totalExercisesInSession > 0

    const sessionCompletions = this.getSessionCompletions()
    const existingIndex = sessionCompletions.findIndex((c) => c.sessionId === sessionId)

    const completion: SessionCompletion = {
      sessionId,
      completedAt: new Date().toISOString(),
      totalExercises: totalExercisesInSession,
      completedExercises,
      isCompleted,
    }

    if (existingIndex >= 0) {
      sessionCompletions[existingIndex] = completion
    } else {
      sessionCompletions.push(completion)
    }

    localStorage.setItem(SESSION_COMPLETION_KEY, JSON.stringify(sessionCompletions))
  },

  // Get all session completions
  getSessionCompletions(): SessionCompletion[] {
    const stored = localStorage.getItem(SESSION_COMPLETION_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // Get completion status for a specific session
  getSessionCompletion(sessionId: string): SessionCompletion | null {
    const completions = this.getSessionCompletions()
    return completions.find((c) => c.sessionId === sessionId) || null
  },

  // Get completion stats for a session
  getSessionStats(sessionId: string): { completed: number; total: number; percentage: number } {
    const sessionCompletion = this.getSessionCompletion(sessionId)

    if (sessionCompletion) {
      const { completedExercises, totalExercises } = sessionCompletion
      const percentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
      return { completed: completedExercises, total: totalExercises, percentage }
    }

    return { completed: 0, total: 0, percentage: 0 }
  },

  // Initialize session with total exercise count
  initializeSession(sessionId: string, totalExercises: number): void {
    const existingCompletion = this.getSessionCompletion(sessionId)
    if (!existingCompletion) {
      this.updateSessionCompletion(sessionId, totalExercises)
    }
  },
}
