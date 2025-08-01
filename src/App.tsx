import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/core/ThemeProvider'
import { AppStateProvider } from './components/core/AppStateProvider'
import GuideList from './components/GuideList'
import SessionDetail from './components/SessionDetail'
import Splash from './components/Splash' // <-- nuevo

function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/guides" element={<GuideList />} />
              <Route path="/session/:sessionId" element={<SessionDetail />} />
            </Routes>
          </div>
        </Router>
      </AppStateProvider>
    </ThemeProvider>
  )
}

export default App
