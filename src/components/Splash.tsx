import { useNavigate } from 'react-router-dom'
import mouraLogo from '../assets/moura-logo.png'
import moura from '../assets/moura.png'
import trainingApp from '../assets/training-app.png'
import { ChevronRight } from 'lucide-react'
import '../styles/animations.css'
import { Button } from './ui/button-new'
import { useEffect, useState } from 'react'

export default function Splash() {
  const navigate = useNavigate()

  // Estado para controlar el evento de instalación PWA y mostrar modal
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)

  useEffect(() => {
    // Comprobar si está en modo standalone (ya instalada)
    const isInStandaloneMode = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    // Comprobar si el modal ya fue cerrado
    const modalClosed = localStorage.getItem('pwaInstallModalClosed') === 'true'

    if (isInStandaloneMode() || modalClosed) {
      // No mostramos modal si ya instalada o cerrado antes
      return
    }

    // Escuchar evento beforeinstallprompt
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallModal(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  // Función para manejar la instalación cuando el usuario pulsa instalar
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      setShowInstallModal(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwaInstallModalClosed', 'true') // Evitar que salga más tarde
    } else {
      // Si rechaza, también podemos cerrarlo y recordar para no molestar
      setShowInstallModal(false)
      localStorage.setItem('pwaInstallModalClosed', 'true')
    }
  }

  // Cerrar modal sin instalar
  const handleCloseModal = () => {
    setShowInstallModal(false)
    localStorage.setItem('pwaInstallModalClosed', 'true')
  }

  return (
    <div className="min-h-screen bg-[#171A29] flex flex-col items-center justify-center px-4 relative">
      <img
        src={mouraLogo}
        alt="Moura Logo"
        className="w-40 h-auto animate-fadeInUp delay-0"
      />

      <img
        src={moura}
        alt="Moura Meditation"
        className="w-48 h-auto animate-fadeInUp delay-1"
      />

      <img
        src={trainingApp}
        alt="Training App"
        className="w-40 h-auto animate-fadeInUp delay-2"
      />

      <Button
        variant="outline"
        onClick={() => navigate('/guides')}
        className="mt-24 rounded-full bg-primary/70! p-4 hover:bg-gray-200 transition flex items-center justify-center animate-fadeInUp delay-3"
      >
        <ChevronRight className="text-white" size={24} />
      </Button>

      {/* Bottom sheet modal para instalar PWA */}
      {showInstallModal && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-6 rounded-t-2xl shadow-xl animate-slideUp z-50">
          <h2 className="text-white text-lg font-semibold mb-4">
            ¿Quieres instalar la app?
          </h2>
          <p className="text-gray-300 mb-6">
            Instala esta aplicación en tu dispositivo para una mejor experiencia.
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={handleCloseModal} className="text-gray-400">
              No, gracias
            </Button>
            <Button onClick={handleInstallClick}>Instalar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
