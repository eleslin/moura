import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GuideList from './components/GuideList'
import WeekList from './components/WeekList'
import SessionList from './components/SessionList'
import ExerciseList from './components/ExerciseList'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<GuideList />} />
          <Route path="/week/:id" element={<WeekList />} />
          <Route path="/session/:id" element={<SessionList />} />
          <Route path="/exercise/:id" element={<ExerciseList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
