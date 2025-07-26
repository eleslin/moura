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

    // Update session completion status
    this.updateSessionCompletion(sessionId)
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

  // Update session completion status based on exercise completions
  updateSessionCompletion(sessionId: string): void {
    const exerciseCompletions = this.getExerciseCompletions()
    const sessionExercises = exerciseCompletions.filter((c) => c.sessionId === sessionId)

    if (sessionExercises.length === 0) return

    const completedExercises = sessionExercises.filter((c) => c.isCompleted).length
    const totalExercises = sessionExercises.length
    const isCompleted = completedExercises === totalExercises && totalExercises > 0

    const sessionCompletions = this.getSessionCompletions()
    const existingIndex = sessionCompletions.findIndex((c) => c.sessionId === sessionId)

    const completion: SessionCompletion = {
      sessionId,
      completedAt: new Date().toISOString(),
      totalExercises,
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

  // Get completion stats for a session
  getSessionStats(sessionId: string): { completed: number; total: number; percentage: number } {
    const exerciseCompletions = this.getExerciseCompletions()
    const sessionExercises = exerciseCompletions.filter((c) => c.sessionId === sessionId)
    const completed = sessionExercises.filter((c) => c.isCompleted).length
    const total = sessionExercises.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  },
}
