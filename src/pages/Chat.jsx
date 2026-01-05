import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import useStore from '../store/useStore'
import { moderateMessage } from '../utils/mockData'
// correct import for the ai helper
import { getAiGrammarCorrection } from '../utils/aiGrammar'

const Chat = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const {
    matches,
    aiGrammarAssist,
    blockUser,
    reportUser,
    messages,
    setMessages,
    addMessage,
    allFriendRequests,
    currentUser,
    acceptFriendRequest,
    declineFriendRequest,
    selectedChatUserId,
  } = useStore()
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [selectedWord, setSelectedWord] = useState(null)
  const [wordPosition, setWordPosition] = useState({ x: 0, y: 0 })
  const [wordTranslation, setWordTranslation] = useState('')
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [longPressMessage, setLongPressMessage] = useState(null)
  const [showSafetyMenu, setShowSafetyMenu] = useState(false)
  const [showGrammarPopup, setShowGrammarPopup] = useState(false)
  const [grammarData, setGrammarData] = useState(null) // { original, corrected, explanation, hasErrors }
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const messagesEndRef = useRef(null)
  const recordingTimerRef = useRef(null)

  const isDark = theme === 'dark'
  const bgColor = isDark ? 'bg-dark' : 'bg-white'
  const textColor = isDark ? 'text-white' : 'text-black'
  const inputBg = isDark ? 'bg-gray-800' : 'bg-gray-100'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300'
  const chatBg = isDark ? 'bg-gray-800' : 'bg-gray-50'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

  const { blockedUsers } = useStore.getState()
  const isCurrentMatch = selectedChat ? matches.some(m => m.id === selectedChat.id) : false

  useEffect(() => {
    const { blockedUsers } = useStore.getState()
    const availableMatches = matches.filter(m => !blockedUsers.includes(m.id))

    // If a chat user was selected (e.g., from accepting friend request), select it
    if (selectedChatUserId) {
      const selectedMatch = availableMatches.find(m => m.id === selectedChatUserId)
      if (selectedMatch) {
        setSelectedChat(selectedMatch)
        useStore.setState({ selectedChatUserId: null }) // Clear the selection flag
        return
      }
    }

    if (availableMatches.length > 0 && !selectedChat) {
      setSelectedChat(availableMatches[0])
    } else if (selectedChat && blockedUsers.includes(selectedChat.id)) {
      setSelectedChat(null)
    }
  }, [matches, selectedChat, selectedChatUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSafetyMenu && !event.target.closest('.safety-menu-container')) {
        setShowSafetyMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSafetyMenu])

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const sendFinalMessage = (messageText) => {
    if (!messageText || !messageText.trim() || !selectedChat) return

    const message = {
      id: Date.now(),
      text: messageText,
      sender: 'me',
      timestamp: new Date(),
      reactions: [],
    }

    addMessage(selectedChat.id, message)
    setNewMessage('')
    setShowGrammarPopup(false)
    setGrammarData(null)
  }

  const handleSendMessage = async () => {
    // Guard: must have text and a selected chat
    if (!newMessage.trim()) return
    if (!selectedChat) {
      alert('Please select a chat first.')
      return
    }
    if (isCorrecting) return
    if (showGrammarPopup) return

    // Check if chat allowed
    // if (!isCurrentMatch) {
    //   alert('You can only message users who have accepted your friend request.')
    //   return
    // }

    // Check ban
    const { checkBanStatus, addBanStrike } = useStore.getState()
    const banStatus = checkBanStatus()
    if (banStatus.isBanned) {
      const days = Math.ceil(banStatus.remainingTime / (24 * 60 * 60 * 1000))
      alert(`You are temporarily banned from chatting. Ban expires in ${days} day(s).`)
      return
    }

    // Moderation
    const moderation = moderateMessage(newMessage)
    if (!moderation.isSafe) {
      if (moderation.shouldBan) {
        const { banStrikes } = useStore.getState()
        const newStrikes = banStrikes + 1
        const banDays = newStrikes === 1 ? 2 : newStrikes === 2 ? 5 : newStrikes === 3 ? 14 : 30

        const confirmed = window.confirm(
          `⚠️ WARNING: Severe violation detected!\n\n` +
          `This is strike ${newStrikes}.\n` +
          `You will be banned from chatting for ${banDays} day(s).\n\n` +
          `Do you want to proceed?`
        )

        if (confirmed) {
          addBanStrike()
          alert(`You have been banned for ${banDays} day(s) due to a severe violation.`)
        }
      } else {
        alert(`Message blocked: ${moderation.reason}`)
      }
      return
    }

    // AI grammar assistance path
    let finalMessage = newMessage
    if (aiGrammarAssist) {
      console.log('[Chat] AI Grammar Assist is ENABLED')
      setIsCorrecting(true)
      try {
        console.log('[Chat] Requesting AI grammar correction for:', newMessage)
        console.log('[Chat] Calling getAiGrammarCorrection...')

        const aiResult = await getAiGrammarCorrection(newMessage)

        console.log('[Chat] ✅ AI result received:', aiResult)
        console.log('[Chat] AI result type:', typeof aiResult)
        console.log('[Chat] AI result keys:', aiResult ? Object.keys(aiResult) : 'null')

        // Defensive checks: ensure aiResult is an object and has expected fields
        if (!aiResult || typeof aiResult !== 'object') {
          console.error('[Chat] ❌ Invalid AI result format:', aiResult)
          setIsCorrecting(false)
          // Continue with sending original message
          sendFinalMessage(finalMessage)
          return
        }

        const correctedText = aiResult.correctedText ? String(aiResult.correctedText).trim() : newMessage.trim()
        const originalText = newMessage.trim()
        const explanation = aiResult.explanation ? String(aiResult.explanation) : 'No explanation provided.'

        // Show popup if corrected text differs from original (regardless of hasChanges flag)
        const hasChanges = correctedText !== originalText

        console.log('[Chat] Grammar check result:', {
          hasChanges,
          originalText,
          correctedText,
          explanationLength: explanation.length,
          willShowPopup: hasChanges
        })

        if (hasChanges) {
          console.log('[Chat] ✅ Showing grammar popup with changes')
          setGrammarData({
            original: newMessage,
            corrected: correctedText,
            explanation,
            hasErrors: true
          })
          setShowGrammarPopup(true)
          setIsCorrecting(false)
          return // wait for user to choose Send Corrected or Send Original
        } else {
          console.log('[Chat] No changes detected, sending original message')
          // No changes detected, send original message
          finalMessage = newMessage
        }
      } catch (err) {
        console.error('[Chat] ❌ AI grammar correction error:', err)
        console.error('[Chat] Error stack:', err?.stack)
        // Show error in popup for debugging
        setGrammarData({
          original: newMessage,
          corrected: newMessage,
          explanation: `Error: ${err?.message || String(err)}. Please check console for details.`,
          hasErrors: false
        })
        setShowGrammarPopup(true)
        setIsCorrecting(false)
        return
      } finally {
        setIsCorrecting(false)
      }
    } else {
      console.log('[Chat] AI Grammar Assist is DISABLED')
    }

    // If AI assist off or no change found, send directly
    sendFinalMessage(finalMessage)
  }

  const handleWordClick = (word, event) => {
    const rect = event.target.getBoundingClientRect()
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase()
    const translations = {
      'hello': 'hola',
      'hi': 'hola',
      'how': 'cómo',
      'are': 'estás',
      'you': 'tú',
      'goodbye': 'adiós',
      'thanks': 'gracias',
      'please': 'por favor',
      'yes': 'sí',
      'no': 'no',
    }
    const translation = translations[cleanWord] || `[${cleanWord}]`
    setSelectedWord(word)
    setWordTranslation(translation)
    setWordPosition({ x: rect.left + rect.width / 2, y: rect.top - 30 })
    setTimeout(() => {
      setSelectedWord(null)
      setWordTranslation('')
    }, 3000)
  }

  const handleBlock = () => {
    if (selectedChat && window.confirm(`Are you sure you want to block ${selectedChat.name}?`)) {
      blockUser(selectedChat.id)
      const { matches } = useStore.getState()
      useStore.setState({ matches: matches.filter(m => m.id !== selectedChat.id) })
      setSelectedChat(null)
      setShowSafetyMenu(false)
    }
  }

  const handleReport = () => {
    if (selectedChat) {
      const reason = prompt('Please describe the issue:')
      if (reason) {
        reportUser(selectedChat.id, reason)
        alert('Thank you for reporting. We will review this report.')
        setShowSafetyMenu(false)
      }
    }
  }

  const handleLongPress = (messageId, event) => {
    const timer = setTimeout(() => {
      setLongPressMessage(messageId)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const addReaction = (messageId, emoji) => {
    if (!selectedChat) return
    const chatMessages = messages[selectedChat.id] || []
    const updatedMessages = chatMessages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || []
        if (!reactions.includes(emoji)) {
          return { ...msg, reactions: [...reactions, emoji] }
        }
      }
      return msg
    })
    setMessages({
      ...messages,
      [selectedChat.id]: updatedMessages
    })
    setLongPressMessage(null)
  }

  const reactions = ['❤️', '😂', '😮', '👍', '😢']

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    if (!selectedChat) return
    if (!isCurrentMatch) {
      alert('You can only send voice messages to users who have accepted your friend request.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const duration = recordingDuration

        const voiceMessage = {
          id: Date.now(),
          text: '',
          sender: 'me',
          timestamp: new Date(),
          reactions: [],
          isVoiceMessage: true,
          voiceDuration: duration,
          audioUrl: audioUrl,
        }

        addMessage(selectedChat.id, voiceMessage)
        setRecordingDuration(0)
        setAudioChunks([])
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      recorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone permission denied. Please allow microphone access to send voice messages.')
      } else {
        alert('Failed to access microphone. Please check your device settings.')
      }
    }
  }

  const stopRecording = () => {
    if (!isRecording || !selectedChat || !mediaRecorder) return
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    mediaRecorder.stop()
    setIsRecording(false)
  }

  const availableMatches = matches.filter(m => !blockedUsers.includes(m.id))
  const receivedRequests = allFriendRequests.filter(
    req => req.toUserId === currentUser?.id
  )

  // Get requests that were shown in popup but not accepted (pending requests)
  const { shownFriendRequestPopups } = useStore.getState()
  const pendingRequests = receivedRequests.filter(
    req => shownFriendRequestPopups.includes(req.id)
  )

  if (!selectedChat) {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} pb-24`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between p-6">
            <h1 className="text-2xl font-bold">Chats</h1>
            {receivedRequests.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowRequests(!showRequests)}
                  className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium relative"
                >
                  Requests ({receivedRequests.length})
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                {showRequests && (
                  <div className={`absolute right-0 top-12 ${cardBg} rounded-lg border-2 border-accent shadow-lg z-50 min-w-[300px] max-h-[400px] overflow-y-auto`}>
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="font-bold">Friend Requests</h3>
                        <button
                          onClick={() => setShowRequests(false)}
                          className="text-xl opacity-70 hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                      {receivedRequests.map((request) => {
                        const sender = request.fromUser || request.user
                        const isPending = pendingRequests.some(r => r.id === request.id)
                        return (
                          <div
                            key={request.id}
                            className={`p-3 mb-2 rounded-lg border ${isPending ? 'border-accent bg-accent bg-opacity-10' : borderColor}`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={sender.profilePic}
                                alt={sender.displayName || sender.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{sender.displayName || sender.name}</p>
                                {isPending && (
                                  <p className="text-xs opacity-70">Pending</p>
                                )}
                              </div>
                            </div>
                            {request.message && (
                              <p className="text-xs opacity-70 mb-2">{request.message}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const matchedUser = acceptFriendRequest(request.id)
                                  setShowRequests(false)
                                  if (matchedUser) {
                                    // Find the match and set it as selected chat
                                    const newMatch = matches.find(m => m.id === matchedUser.id) || matchedUser
                                    setSelectedChat(newMatch)
                                  }
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  declineFriendRequest(request.id)
                                }}
                                className={`flex-1 py-1.5 px-3 rounded-lg border ${borderColor} text-xs font-medium hover:opacity-80 transition`}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      {receivedRequests.length > 3 && (
                        <button
                          onClick={() => {
                            setShowRequests(false)
                            navigate('/friend-requests')
                          }}
                          className="w-full py-2 mt-2 rounded-lg border-2 border-accent text-accent font-medium hover:bg-accent hover:bg-opacity-10 transition"
                        >
                          View All Requests
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {availableMatches.length === 0 && receivedRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl mb-2">No matches yet</p>
              <p className="opacity-70">Start swiping to find people to chat with!</p>
            </div>
          )}

          <div className="space-y-2 px-4">
            {availableMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedChat(match)}
                className={`w-full p-4 rounded-lg ${chatBg} flex items-center gap-4 text-left`}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/profile/${match.id}`)
                  }}
                  className="cursor-pointer"
                >
                  <img
                    src={match.profilePic}
                    alt={match.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-accent hover:opacity-80 transition"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{match.name}</h3>
                  <p className="text-sm opacity-70">
                    {messages[match.id]?.[messages[match.id].length - 1]?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const chatMessages = messages[selectedChat.id] || []

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col pb-24`}>
      <div className={`${chatBg} p-4 flex items-center gap-4 border-b-2 border-accent relative`}>
        <button onClick={() => setSelectedChat(null)} className="text-xl">
          ←
        </button>
        <button
          onClick={() => navigate(`/profile/${selectedChat.id}`)}
          className="cursor-pointer"
        >
          <img
            src={selectedChat.profilePic}
            alt={selectedChat.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-accent hover:opacity-80 transition"
          />
        </button>
        <div className="flex-1">
          <h2 className="font-medium">{selectedChat.name}</h2>
          <p className="text-xs opacity-70">{selectedChat.country}</p>
        </div>
        <div className="relative safety-menu-container">
          <button
            onClick={() => setShowSafetyMenu(!showSafetyMenu)}
            className="text-accent text-xl"
          >
            ⚠️
          </button>
          {showSafetyMenu && (
            <div className={`absolute right-0 top-10 ${cardBg} rounded-lg border-2 border-accent p-2 min-w-[150px] z-50`}>
              <button
                onClick={handleBlock}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-500 hover:bg-opacity-20 text-red-500 font-medium"
              >
                Block
              </button>
              <button
                onClick={handleReport}
                className="w-full text-left px-3 py-2 rounded hover:bg-accent hover:bg-opacity-20 text-accent font-medium"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            onMouseDown={(e) => handleLongPress(msg.id, e)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={(e) => handleLongPress(msg.id, e)}
            onTouchEnd={handleLongPressEnd}
          >
            <div className={`max-w-xs rounded-lg p-3 ${msg.sender === 'me'
              ? 'bg-accent text-white'
              : `${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${textColor}`
              }`}>
              {msg.isVoiceMessage ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎤</span>
                  <div className="flex-1">
                    <p className="font-medium">Voice message</p>
                    <p className="text-sm opacity-80">{formatDuration(msg.voiceDuration || 0)}</p>
                    {msg.audioUrl && (
                      <audio controls className="mt-2 w-full" style={{ maxWidth: '200px' }}>
                        <source src={msg.audioUrl} type="audio/webm" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">
                  {msg.text.split(' ').map((word, i) => (
                    <span
                      key={i}
                      onClick={(e) => handleWordClick(word, e)}
                      className="cursor-pointer hover:underline"
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              )}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {msg.reactions.map((emoji, i) => (
                    <span key={i} className="text-sm">{emoji}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {longPressMessage && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full p-2 flex gap-2 z-50">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(longPressMessage, emoji)}
              className="text-2xl hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {selectedWord && (
        <div
          className="fixed bg-accent text-white px-4 py-2 rounded-lg border-2 border-accent z-50"
          style={{
            left: `${wordPosition.x}px`,
            top: `${wordPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-sm font-medium">{selectedWord}</p>
          <p className="text-xs opacity-90">{wordTranslation}</p>
        </div>
      )}

      {showGrammarPopup && grammarData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg border-2 border-accent max-w-2xl w-full max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b-2 border-accent">
              <h2 className="text-xl font-bold">✨ AI Grammar Review</h2>
              <button
                onClick={() => {
                  setShowGrammarPopup(false)
                  setGrammarData(null)
                }}
                className="text-2xl hover:opacity-70 transition"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <div className="mb-4 p-3 border rounded-lg bg-red-500 bg-opacity-10 border-red-500">
                <p className="font-medium text-sm mb-1 text-red-500">Original Message:</p>
                <p className="opacity-70 italic text-red-500">{grammarData.original}</p>
              </div>

              <div className="mb-4 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-500">
                <p className="font-medium text-sm mb-1 text-green-800 dark:text-green-300">Corrected Message:</p>
                <p className="font-medium text-green-800 dark:text-green-300">{grammarData.corrected}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2 border-b pb-1">Detailed AI Explanation</h3>
                <p className="text-sm whitespace-pre-wrap">{grammarData.explanation}</p>
              </div>
            </div>

            <div className="p-4 border-t-2 border-accent flex justify-end gap-3">
              <button
                onClick={() => sendFinalMessage(grammarData.corrected)}
                className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 transition"
              >
                Send Corrected Message
              </button>
              <button
                onClick={() => sendFinalMessage(grammarData.original)}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:bg-opacity-10 transition"
              >
                Send Original Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${chatBg} p-4 border-t ${borderColor}`}>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isCorrecting ? "Checking grammar with AI..." : "Type a message..."}
            disabled={isCorrecting || showGrammarPopup}
            className={`flex-1 py-2 px-4 rounded-lg ${inputBg} ${textColor} border ${borderColor} ${isCorrecting || showGrammarPopup ? 'opacity-50' : ''}`}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-3 py-2 rounded-lg border-2 ${isRecording ? 'border-red-500 text-red-500' : 'border-accent text-accent'} font-medium`}
            disabled={isCorrecting || showGrammarPopup}
          >
            {isRecording ? `Stop (${formatDuration(recordingDuration)})` : '🎤'}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isCorrecting || showGrammarPopup}
            className="px-4 py-2 rounded-lg bg-accent text-white font-medium"
          >
            {isCorrecting ? "Checking..." : "Send"}
          </button>
        </div>
        {aiGrammarAssist && (
          <p className="text-xs opacity-70 mt-2 flex items-center gap-1">
            <span className="text-accent">✨</span> AI Grammar Assist is ON
          </p>
        )}
      </div>
    </div>
  )
}

export default Chat
