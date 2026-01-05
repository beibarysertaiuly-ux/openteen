import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'
import { useState } from 'react'

const FriendRequests = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { allFriendRequests, currentUser, acceptFriendRequest, declineFriendRequest } = useStore()

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  // Get requests sent TO the current user (from others)
  const receivedRequests = allFriendRequests.filter(
    req => req.toUserId === currentUser?.id
  )

  const handleAccept = (requestId) => {
    const matchedUser = acceptFriendRequest(requestId)
    if (matchedUser) {
      // Navigate to chat and select the matched user
      navigate('/chat')
      // Set the matched user as selected chat after navigation
      setTimeout(() => {
        const { matches } = useStore.getState()
        const newMatch = matches.find(m => m.id === matchedUser.id) || matchedUser
        // We'll need to handle this in Chat component - for now just navigate
        useStore.setState({ selectedChatUserId: matchedUser.id })
      }, 100)
    }
  }

  const handleDecline = (requestId) => {
    declineFriendRequest(requestId)
    // Remove from allFriendRequests
    const { allFriendRequests: allReqs } = useStore.getState()
    useStore.setState({
      allFriendRequests: allReqs.filter(r => r.id !== requestId)
    })
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">Friend Requests</h1>
        </div>

        {receivedRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-2">No friend requests</p>
            <p className="opacity-70">When someone sends you a request, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedRequests.map((request) => {
              const sender = request.fromUser || request.user
              return (
                <div
                  key={request.id}
                  className={`${cardBg} rounded-lg p-4 border-2 border-accent`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => navigate(`/profile/${sender.id}`)}
                      className="cursor-pointer"
                    >
                      <img
                        src={sender.profilePic}
                        alt={sender.displayName || sender.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                      />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{sender.displayName || sender.name}</h3>
                      <p className="text-sm opacity-70">@{sender.username}</p>
                      {sender.age && (
                        <p className="text-sm opacity-70">{sender.age} years old</p>
                      )}
                    </div>
                  </div>
                  
                  {request.message && (
                    <p className="text-sm opacity-80 mb-4">{request.message}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 py-2 px-4 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
                    >
                      Accept ✅
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 ${borderColor} ${textColor} font-medium hover:opacity-80 transition`}
                    >
                      Decline ❌
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendRequests


