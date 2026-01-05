import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // User data
      currentUser: null,
      isAuthenticated: false,
      isOnboarded: false,
      selectedChatUserId: null, // Temporary flag to select a chat user (e.g., after accepting friend request)

      // Authentication
      users: [], // Sanitized registered users (no large media)
      registerUser: (user) => set((state) => {
        const sanitizedUser = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          password: user.password,
          age: user.age,
          location: user.location,
          gender: user.gender || '',
          bio: user.bio || '',
          interests: user.interests || [],
          profilePic: user.profilePic,
        }
        return {
          users: [...state.users, sanitizedUser],
          currentUser: user,
          isAuthenticated: true,
        }
      }),
      loginUser: (user) => set({ currentUser: user, isAuthenticated: true }),

      // User profile
      setUser: (user) => set((state) => {
        // Update both currentUser and users array to keep them in sync
        const sanitizedUser = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          password: user.password,
          age: user.age,
          location: user.location,
          gender: user.gender || '',
          bio: user.bio || '',
          interests: user.interests || [],
          profilePic: user.profilePic,
        }
        const updatedUsers = state.users.map(u =>
          u.id === user.id ? sanitizedUser : u
        )
        // If user not found in users array, add them
        const finalUsers = state.users.some(u => u.id === user.id)
          ? updatedUsers
          : [...state.users, sanitizedUser]

        return {
          currentUser: user,
          isAuthenticated: true,
          users: finalUsers
        }
      }),
      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),

      // Username change tracking
      lastUsernameChange: null,
      changeDisplayName: (newDisplayName) => set((state) => {
        const now = Date.now()
        const oneWeek = 7 * 24 * 60 * 60 * 1000

        if (state.lastUsernameChange && (now - state.lastUsernameChange) < oneWeek) {
          const daysLeft = Math.ceil((oneWeek - (now - state.lastUsernameChange)) / (24 * 60 * 60 * 1000))
          throw new Error(`You can change your display name again in ${daysLeft} day(s)`)
        }

        const updatedUser = {
          ...state.currentUser,
          displayName: newDisplayName,
          name: newDisplayName, // For compatibility
        }

        // Update sanitized users array
        const updatedUsers = state.users.map(u =>
          u.id === updatedUser.id ? { ...u, displayName: newDisplayName, name: newDisplayName } : u
        )

        return {
          currentUser: updatedUser,
          users: updatedUsers,
          lastUsernameChange: now,
        }
      }),

      // Matches and friends
      matches: [],
      friendRequests: [], // Requests received FROM others
      sentFriendRequests: [], // Track requests we sent TO others
      allFriendRequests: [], // All friend requests in the system (for simulation)
      shownFriendRequestPopups: [], // Track which request IDs have been shown in popup
      addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
      addFriendRequest: (request) => set((state) => {
        // When you send a request, it goes to the recipient
        // request.user is the person you're sending TO
        // state.currentUser is the person sending FROM
        const newRequest = {
          ...request,
          fromUser: state.currentUser, // The sender (you)
          fromUserId: state.currentUser.id,
          toUserId: request.user.id, // The recipient
          timestamp: Date.now(), // Add timestamp when request is created
        }
        return {
          allFriendRequests: [...state.allFriendRequests, newRequest],
          sentFriendRequests: [...state.sentFriendRequests, request.user.id],
          // Don't add to current user's friendRequests - it goes to the recipient
        }
      }),
      markFriendRequestPopupShown: (requestId) => set((state) => ({
        shownFriendRequestPopups: [...state.shownFriendRequestPopups, requestId]
      })),
      // Update friend requests when user changes (simulate receiving requests)
      updateFriendRequests: () => {
        const state = get()
        if (!state.currentUser) return
        // Find all requests sent TO the current user
        const receivedRequests = state.allFriendRequests.filter(
          req => req.toUserId === state.currentUser.id
        )
        set({ friendRequests: receivedRequests })
      },
      acceptFriendRequest: (requestId) => {
        const state = get()
        const request = state.allFriendRequests.find(r => r.id === requestId)
        if (!request) return null
        const sender = request.fromUser || request.user
        set({
          matches: [...state.matches, sender],
          allFriendRequests: state.allFriendRequests.filter(r => r.id !== requestId),
          friendRequests: state.friendRequests.filter(r => r.id !== requestId),
          shownFriendRequestPopups: state.shownFriendRequestPopups.filter(id => id !== requestId),
        })
        return sender // Return the matched user so we can navigate to chat
      },
      declineFriendRequest: (requestId) => set((state) => ({
        friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        allFriendRequests: state.allFriendRequests.filter(r => r.id !== requestId),
      })),

      // Settings
      aiGrammarAssist: false,
      showInSwipe: true,
      setAiGrammarAssist: (value) => set({ aiGrammarAssist: value }),
      setShowInSwipe: (value) => set({ showInSwipe: value }),

      // All users (real users only, no bots)
      allUsers: [],
      addUser: (user) => set((state) => {
        // Don't add if user already exists
        if (state.allUsers.some(u => u.id === user.id)) {
          return state
        }
        return { allUsers: [...state.allUsers, user] }
      }),
      getSwipeUsers: () => {
        const state = get()
        const currentUser = state.currentUser
        if (!currentUser) return []

        // Helper function to normalize country names
        const normalizeCountry = (country) => {
          if (!country || country === 'Unknown') return 'Unknown'
          return country.trim()
        }

        // Check if a country is English-speaking (case-insensitive, with variations)
        const isEnglishCountry = (country) => {
          const normalized = normalizeCountry(country).toLowerCase().trim()
          if (!normalized || normalized === 'unknown') return false

          // English-speaking countries (case-insensitive, with variations)
          const englishCountryVariations = [
            'united states', 'usa', 'us', 'america', 'united states of america',
            'united kingdom', 'uk', 'britain', 'great britain', 'england',
            'canada',
            'australia',
            'new zealand'
          ]

          // Check if normalized country matches any English variation
          // Use exact match or check if country contains the variant (for "United States of America" matching "united states")
          return englishCountryVariations.some(variant => {
            const variantLower = variant.toLowerCase()
            // Exact match
            if (normalized === variantLower) return true
            // Country contains variant (e.g., "united states of america" contains "united states")
            if (normalized.includes(variantLower)) return true
            // Variant contains country (e.g., "united states" contains "us")
            if (variantLower.includes(normalized)) return true
            return false
          })
        }

        const currentUserCountry = normalizeCountry(currentUser.location?.country)
        const isCurrentUserEnglish = isEnglishCountry(currentUserCountry)

        // Debug logging (can be removed in production)
        console.log('[getSwipeUsers] Current user:', {
          country: currentUserCountry,
          isEnglish: isCurrentUserEnglish,
          allUsersCount: state.allUsers.length
        })

        // Filter out: current user, blocked users, already matched users, users we already swiped on
        // Note: Unblocked users can appear again (they're not in blockedUsers anymore)
        // IMPORTANT: Non-English can ONLY match with English, and vice versa
        const filteredUsers = state.allUsers.filter(user => {
          console.log('[DEBUG] Checking user:', user.username)
          // Skip if it's the current user
          // if (user.id === currentUser.id) return false

          // Skip blocked users
          if (state.blockedUsers.includes(user.id)) return false

          // Skip already matched users
          // if (state.matches.some(m => m.id === user.id)) return false

          // Skip users we already sent friend requests to
          // if (state.sentFriendRequests.includes(user.id)) return false

          // Skip if user has disabled showing in swipe
          if (user.showInSwipe === false && state.showInSwipe) return false

          // Check country matching rule: English <-> Non-English only
          // const userCountry = normalizeCountry(user.location?.country)
          // const isUserEnglish = isEnglishCountry(userCountry)

          // Both must be different types (one English, one non-English)
          // if (isCurrentUserEnglish === isUserEnglish) {
          //   return false // Both same type - no match
          // }

          return true
        })

        console.log('[getSwipeUsers] Filtered users:', filteredUsers.length)
        return filteredUsers
      },

      // Safety features
      blockedUsers: [],
      blockedUsersData: [], // Store full user data for blocked users page
      reportedUsers: [],
      reports: [], // General reports (not user-specific)
      banStrikes: 0,
      banUntil: null,
      blockUser: (userId) => set((state) => {
        const userToBlock = state.allUsers.find(u => u.id === userId) ||
          state.matches.find(m => m.id === userId)
        return {
          blockedUsers: [...state.blockedUsers, userId],
          blockedUsersData: userToBlock
            ? [...state.blockedUsersData, userToBlock]
            : state.blockedUsersData,
          matches: state.matches.filter(m => m.id !== userId),
        }
      }),
      unblockUser: (userId) => set((state) => {
        const unblockedUser = state.blockedUsersData.find(u => u.id === userId)
        return {
          blockedUsers: state.blockedUsers.filter(id => id !== userId),
          blockedUsersData: state.blockedUsersData.filter(u => u.id !== userId),
          // Allow them to see and message the unblocked user again
          // They can appear in swipe deck and can be messaged if they're a match
        }
      }),
      reportUser: (userId, reason) => set((state) => ({
        reportedUsers: [...state.reportedUsers, { userId, reason, timestamp: Date.now() }]
      })),
      submitReport: (report) => set((state) => ({
        reports: [...state.reports, { ...report, timestamp: Date.now(), id: Date.now() }]
      })),
      addBanStrike: () => set((state) => {
        const newStrikes = state.banStrikes + 1
        const banDuration = newStrikes === 1 ? 2 * 24 * 60 * 60 * 1000 : // 2 days
          newStrikes === 2 ? 5 * 24 * 60 * 60 * 1000 : // 5 days
            newStrikes === 3 ? 14 * 24 * 60 * 60 * 1000 : // 14 days
              30 * 24 * 60 * 60 * 1000 // 30 days
        return {
          banStrikes: newStrikes,
          banUntil: Date.now() + banDuration
        }
      }),
      checkBanStatus: () => {
        const state = get()
        if (state.banUntil && Date.now() < state.banUntil) {
          return {
            isBanned: true,
            banUntil: state.banUntil,
            remainingTime: state.banUntil - Date.now()
          }
        }
        return { isBanned: false }
      },

      // Chat messages (persistent)
      messages: {},
      setMessages: (messages) => set({ messages }),
      addMessage: (chatId, message) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message]
        }
      })),

      // Logout
      logout: () => set({
        currentUser: null,
        isAuthenticated: false,
        isOnboarded: false,
        matches: [],
        friendRequests: [],
        sentFriendRequests: []
      }),
    }),
    {
      name: 'openteen-storage',
    }
  )
)

export default useStore

