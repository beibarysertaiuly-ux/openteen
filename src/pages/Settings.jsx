import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const Settings = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const {
    currentUser,
    aiGrammarAssist,
    showInSwipe,
    setAiGrammarAssist,
    setShowInSwipe,
    logout,
  } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
      navigate('/')
    }
  }


  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Account Info */}
        <div className={`${cardBg} rounded-lg p-4 mb-6`}>
          <h2 className="font-medium mb-4">Account</h2>
          {currentUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/profile/${currentUser.id}`)}
                  className="cursor-pointer"
                >
                  <img
                    src={currentUser.profilePic}
                    alt={currentUser.displayName || currentUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-accent hover:opacity-80 transition"
                  />
                </button>
                <div className="flex-1">
                  <p className="font-medium">{currentUser.displayName || currentUser.name}</p>
                  <p className="text-sm opacity-70">@{currentUser.username}</p>
                  {currentUser.bio && (
                    <p className="text-sm opacity-70 mt-1">{currentUser.bio}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/edit-profile`)}
                className={`w-full py-2 px-4 rounded-lg border-2 border-accent text-accent font-medium hover:opacity-80 transition`}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className={`${cardBg} rounded-lg p-4 mb-6`}>
          <h2 className="font-medium mb-4">Preferences</h2>
          
          {/* AI Grammar Assist */}
          <div className="flex items-center justify-between py-3 border-b border-gray-300 dark:border-gray-700">
            <div>
              <p className="font-medium">AI Grammar Assist</p>
              <p className="text-sm opacity-70">
                Get private grammar corrections for your messages
              </p>
            </div>
            <button
              onClick={() => setAiGrammarAssist(!aiGrammarAssist)}
              className={`w-12 h-6 rounded-full transition-colors ${
                aiGrammarAssist ? 'bg-accent' : 'bg-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  aiGrammarAssist ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Show in Swipe */}
          <div className="flex items-center justify-between py-3 border-b border-gray-300 dark:border-gray-700">
            <div>
              <p className="font-medium">Show me to others</p>
              <p className="text-sm opacity-70">
                {showInSwipe 
                  ? 'You appear in the swipe deck' 
                  : 'You are hidden from the swipe deck'}
              </p>
            </div>
            <button
              onClick={() => setShowInSwipe(!showInSwipe)}
              className={`w-12 h-6 rounded-full transition-colors ${
                showInSwipe ? 'bg-accent' : 'bg-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  showInSwipe ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm opacity-70">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-accent' : 'bg-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Safety */}
        <div className={`${cardBg} rounded-lg p-4 mb-6`}>
          <h2 className="font-medium mb-4">Safety</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/blocked-users')}
              className={`w-full py-3 px-4 rounded-lg border-2 ${borderColor} text-left hover:opacity-80 transition`}
            >
              <p className="font-medium">Blocked Users</p>
              <p className="text-sm opacity-70">Manage blocked accounts</p>
            </button>
            <button 
              onClick={() => navigate('/report')}
              className={`w-full py-3 px-4 rounded-lg border-2 ${borderColor} text-left hover:opacity-80 transition`}
            >
              <p className="font-medium">Report a Problem</p>
              <p className="text-sm opacity-70">Report inappropriate behavior</p>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Settings

