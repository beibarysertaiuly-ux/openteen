import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Splash = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center px-6`}>
      <div className="text-center">
        <h1 className={`text-5xl font-bold mb-4 ${textColor}`}>OpenTeens</h1>
        <p className={`text-xl mb-12 ${textColor} opacity-80`}>Meet. Chat. Improve.</p>
        
        <div className="space-y-4 w-full max-w-xs">
          <button
            onClick={() => navigate('/signup')}
            className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-3 px-6 rounded-lg border-2 border-accent ${textColor} font-medium hover:opacity-80 transition`}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}

export default Splash

