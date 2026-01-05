import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const BottomNav = () => {
  const location = useLocation()
  const { theme } = useTheme()
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const activeColor = 'text-accent'

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${bgColor} border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} z-50`}>
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/chat" 
          className={`flex flex-col items-center justify-center ${location.pathname === '/chat' ? activeColor : textColor}`}
        >
          <span className="text-2xl">💬</span>
          <span className="text-xs mt-1">Chats</span>
        </Link>
        <Link 
          to="/swipe" 
          className={`flex flex-col items-center justify-center ${location.pathname === '/swipe' ? activeColor : textColor}`}
        >
          <span className="text-2xl">🔁</span>
          <span className="text-xs mt-1">Swipe</span>
        </Link>
        <Link 
          to="/settings" 
          className={`flex flex-col items-center justify-center ${location.pathname === '/settings' ? activeColor : textColor}`}
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNav

