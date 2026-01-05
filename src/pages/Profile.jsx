import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { allUsers, currentUser, matches, addFriendRequest, sentFriendRequests } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  // Find the user profile
  const profileUser = allUsers.find(u => u.id === userId) || 
                     matches.find(m => m.id === userId) ||
                     (userId === currentUser?.id ? currentUser : null)

  if (!profileUser) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center px-6 pb-24`}>
        <div className="text-center">
          <p className="text-xl mb-4">User not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-accent text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isMatch = matches.some(m => m.id === profileUser.id)
  const alreadySentRequest = sentFriendRequests.includes(profileUser.id)
  const isOwnProfile = profileUser.id === currentUser?.id

  const handleSendFriendRequest = () => {
    if (alreadySentRequest) {
      alert('You already sent a friend request to this user.')
      return
    }
    
    const { generateMatchMessage } = require('../utils/mockData')
    addFriendRequest({
      id: `request-${Date.now()}`,
      user: profileUser,
      message: generateMatchMessage(currentUser, profileUser),
    })
    alert(`Friend request sent to ${profileUser.displayName || profileUser.name}!`)
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className={`${cardBg} rounded-lg p-6 border-2 border-accent`}>
          <div className="flex flex-col items-center mb-6">
            <img
              src={profileUser.profilePic}
              alt={profileUser.displayName || profileUser.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-accent mb-4"
            />
            <h2 className="text-2xl font-bold">{profileUser.displayName || profileUser.name}</h2>
            <p className="text-sm opacity-70">@{profileUser.username}</p>
            {profileUser.age && (
              <p className="text-sm opacity-70">{profileUser.age} years old</p>
            )}
            {profileUser.location && (
              <p className="text-sm opacity-70">{profileUser.location.city}, {profileUser.location.country}</p>
            )}
          </div>

          {profileUser.bio && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Bio</h3>
              <p className="opacity-80">{profileUser.bio}</p>
            </div>
          )}

          {profileUser.interests && profileUser.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-full bg-accent bg-opacity-20 text-accent border border-accent text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isOwnProfile ? (
            <button
              onClick={() => navigate(`/edit-profile`)}
              className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-y-3">
              {isMatch ? (
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium"
                >
                  Send Message
                </button>
              ) : alreadySentRequest ? (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-lg bg-gray-400 text-white font-medium opacity-50"
                >
                  Friend Request Sent
                </button>
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium"
                >
                  Send Friend Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

