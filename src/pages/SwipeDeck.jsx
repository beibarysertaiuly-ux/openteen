import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'
import { generateMatchMessage, findSharedInterests } from '../utils/mockData'

const SwipeDeck = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const {
    currentUser,
    getSwipeUsers,
    addMatch,
    addFriendRequest,
    matches,
    sentFriendRequests,
    blockUser,
    reportUser
  } = useStore()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragDirection, setDragDirection] = useState(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedUser, setMatchedUser] = useState(null)

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  // Get swipe users (only real users, no bots)
  const swipeUsers = useMemo(() => {
    const users = getSwipeUsers()
    // Sort by shared interests
    if (currentUser?.interests) {
      return users.sort((a, b) => {
        const aShared = a.interests?.filter(i => currentUser.interests.includes(i)).length || 0
        const bShared = b.interests?.filter(i => currentUser.interests.includes(i)).length || 0
        return bShared - aShared
      })
    }
    return users
  }, [getSwipeUsers, currentUser])

  // ✅ THIS is the ONLY correct place for currentUserCard
  const currentUserCard = swipeUsers[currentIndex]

  const handleSwipe = (direction) => {
    if (!currentUserCard) return

    if (direction === 'right') {
      // Heart icon always sends friend request - no immediate match
      // Match only happens when the other person also sends a friend request
      if (!sentFriendRequests.includes(currentUserCard.id)) {
        addFriendRequest({
          id: `request-${Date.now()}`,
          user: currentUserCard,
          message: generateMatchMessage(currentUser, currentUserCard),
        })
        alert(`Friend request sent to ${currentUserCard.name}! Wait for them to accept.`)
      } else {
        alert('You already sent a friend request to this user.')
      }
    }

    setCurrentIndex(prev => {
      const next = prev + 1
      // Loop back to first user if no users left
      return next >= swipeUsers.length ? 0 : next
    })
  }

  const handleDragEnd = (event, info) => {
    const threshold = 100
    if (Math.abs(info.offset.x) > threshold) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
    setDragDirection(null)
  }

  const handleBlock = (userId) => {
    if (window.confirm('Are you sure you want to block this user? You won\'t see them anymore.')) {
      blockUser(userId)
      setCurrentIndex(prev => {
        const next = prev + 1
        return next >= swipeUsers.length ? prev : next
      })
    }
  }

  const handleReport = (userId) => {
    const reason = prompt('Please describe the issue:')
    if (reason) {
      reportUser(userId, reason)
      alert('Thank you for reporting. We will review this report.')
      setCurrentIndex(prev => {
        const next = prev + 1
        return next >= swipeUsers.length ? prev : next
      })
    }
  }

  // ❗ FIXED: No duplicate declaration here

  if (!currentUserCard || swipeUsers.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center px-6 pb-24`}>
        <div className="text-center">
          <p className="text-xl mb-4">No users available</p>
          <p className="opacity-70">Check back later for more matches.</p>
        </div>
      </div>
    )
  }

  const sharedInterests = findSharedInterests(currentUser, currentUserCard)

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} px-6 py-8 pb-24`}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>

        <div className="relative h-[600px] mb-8">
          <AnimatePresence>
            <motion.div
              key={currentUserCard.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDrag={(e, info) => {
                setDragDirection(info.offset.x > 0 ? 'right' : 'left')
              }}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: dragDirection === 'right' ? 300 : -300 }}
              className={`absolute inset-0 ${cardBg} rounded-2xl overflow-hidden border-2 border-accent`}
            >
              <div className="relative h-full flex flex-col">
                <div className="relative flex-1">
                  <button
                    onClick={() => navigate(`/profile/${currentUserCard.id}`)}
                    className="w-full h-full cursor-pointer"
                  >
                    <img
                      src={currentUserCard.profilePic}
                      alt={currentUserCard.name}
                      className="w-full h-full object-cover hover:opacity-90 transition"
                    />
                  </button>
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBlock(currentUserCard.id)
                      }}
                      className="px-3 py-1 rounded-lg bg-red-500 bg-opacity-90 text-white text-sm font-medium"
                    >
                      Block
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReport(currentUserCard.id)
                      }}
                      className="px-3 py-1 rounded-lg bg-accent bg-opacity-90 text-white text-sm font-medium"
                    >
                      Report
                    </button>
                  </div>
                </div>

                <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h2 className={`text-2xl font-bold mb-1 ${textColor}`}>
                    {currentUserCard.name}, {currentUserCard.age}
                  </h2>
                  <p className={`text-sm opacity-70 mb-2 ${textColor}`}>{currentUserCard.country}</p>
                  <p className={`text-sm mb-3 ${textColor}`}>{currentUserCard.bio}</p>

                  {sharedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sharedInterests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 rounded-full bg-accent bg-opacity-20 text-accent text-xs border border-accent"
                        >
                          {interest}
                        </span>
                      ))}
                      {sharedInterests.length > 3 && (
                        <span className="px-2 py-1 rounded-full bg-accent bg-opacity-20 text-accent text-xs border border-accent">
                          +{sharedInterests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => handleSwipe('left')}
            className={`w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-2xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl text-white hover:opacity-90 transition"
          >
            ❤️
          </button>
        </div>
      </div>

      {showMatchModal && matchedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${cardBg} rounded-2xl p-6 max-w-sm w-full text-center border-2 border-accent`}
          >
            <h2 className="text-3xl font-bold mb-4">It's a Match! 🎉</h2>
            <p className="mb-4 opacity-80">
              {generateMatchMessage(currentUser, matchedUser)}
            </p>

            <div className="flex gap-4 mb-6">
              <img
                src={currentUser.profilePic}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <img
                src={matchedUser.profilePic}
                alt={matchedUser.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowMatchModal(false)
                  navigate('/chat')
                }}
                className="w-full py-3 px-6 rounded-lg bg-accent text-white font-medium"
              >
                Start Chatting
              </button>

              <button
                onClick={() => setShowMatchModal(false)}
                className={`w-full py-3 px-6 rounded-lg border-2 border-accent ${textColor} font-medium`}
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SwipeDeck
