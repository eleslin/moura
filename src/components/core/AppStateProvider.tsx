import { createContext, useContext, useState } from 'react'

interface AppState {
  expandedGuides: Record<string, boolean>
  expandedWeeks: Record<string, boolean>
  weeksData: Record<string, any[]>
  sessionsData: Record<string, any[]>
}

interface AppStateContextType {
  state: AppState
  setExpandedGuides: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setExpandedWeeks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setWeeksData: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
  setSessionsData: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({})
  const [weeksData, setWeeksData] = useState<Record<string, any[]>>({})
  const [sessionsData, setSessionsData] = useState<Record<string, any[]>>({})

  const state = {
    expandedGuides,
    expandedWeeks,
    weeksData,
    sessionsData
  }

  return (
    <AppStateContext.Provider value={{
      state,
      setExpandedGuides,
      setExpandedWeeks,
      setWeeksData,
      setSessionsData
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}