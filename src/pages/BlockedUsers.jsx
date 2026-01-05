import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const BlockedUsers = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { blockedUsersData, unblockUser } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  const handleUnblock = (userId) => {
    if (window.confirm('Are you sure you want to unblock this user?')) {
      unblockUser(userId)
    }
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/settings')} className="text-xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">Blocked Users</h1>
        </div>

        {blockedUsersData.length === 0 ? (
          <div className={`${cardBg} rounded-lg p-6 text-center`}>
            <p className="opacity-70">No blocked users</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsersData.map((user) => (
              <div
                key={user.id}
                className={`${cardBg} rounded-lg p-4 border-2 ${borderColor} flex items-center gap-4`}
              >
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm opacity-70">{user.bio || 'No bio'}</p>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockedUsers


