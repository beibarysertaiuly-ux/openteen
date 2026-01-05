import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'

const FriendRequestNotification = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { 
    friendRequests, 
    allFriendRequests, 
    currentUser, 
    acceptFriendRequest, 
    declineFriendRequest,
    shownFriendRequestPopups,
    markFriendRequestPopupShown
  } = useStore()
  
  const [visibleRequestId, setVisibleRequestId] = useState(null)
  const [isDismissing, setIsDismissing] = useState(false)
  
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'

  // Get requests sent TO the current user (from others) that haven't been shown in popup yet
  const receivedRequests = allFriendRequests.filter(
    req => req.toUserId === currentUser?.id && !shownFriendRequestPopups.includes(req.id)
  )

  // Show popup for the latest unshown request
  useEffect(() => {
    if (receivedRequests.length > 0 && !visibleRequestId) {
      const latestRequest = receivedRequests[receivedRequests.length - 1]
      setVisibleRequestId(latestRequest.id)
      markFriendRequestPopupShown(latestRequest.id)
      
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsDismissing(true)
        setTimeout(() => {
          setVisibleRequestId(null)
          setIsDismissing(false)
        }, 300) // Fade out animation
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [receivedRequests, visibleRequestId, markFriendRequestPopupShown])

  if (receivedRequests.length === 0 || !visibleRequestId) return null

  const currentRequest = receivedRequests.find(r => r.id === visibleRequestId)
  if (!currentRequest) return null
  
  const sender = currentRequest.fromUser || currentRequest.user

  const handleAccept = () => {
    const matchedUser = acceptFriendRequest(currentRequest.id)
    setVisibleRequestId(null)
    setIsDismissing(false)
    
    // Navigate to chat with the matched user
    if (matchedUser) {
      useStore.setState({ selectedChatUserId: matchedUser.id })
      navigate('/chat')
    }
  }

  const handleDecline = () => {
    declineFriendRequest(currentRequest.id)
    setVisibleRequestId(null)
    setIsDismissing(false)
  }

  const handleDismiss = () => {
    setIsDismissing(true)
    setTimeout(() => {
      setVisibleRequestId(null)
      setIsDismissing(false)
    }, 300)
  }

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ${
        isDismissing ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className={`${bgColor} ${textColor} rounded-lg border-2 border-accent p-4 shadow-lg`}>
        <div className="flex items-start justify-between mb-2">
          <p className="font-medium text-lg">
            {sender?.displayName || sender?.name} sent you a friend request!
          </p>
          <button
            onClick={handleDismiss}
            className="text-xl opacity-70 hover:opacity-100 transition"
          >
            ×
          </button>
        </div>
        {currentRequest.message && (
          <p className="text-sm opacity-70 mb-4">
            {currentRequest.message}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-4 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
          >
            Accept ✅
          </button>
          <button
            onClick={handleDecline}
            className={`flex-1 py-2 px-4 rounded-lg border-2 ${borderColor} ${textColor} font-medium hover:opacity-80 transition`}
          >
            Decline ❌
          </button>
        </div>
      </div>
    </div>
  )
}

export default FriendRequestNotification

