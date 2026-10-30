import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { demoUsers, demoConversation } from '../utils/demoData.js'

const pairKey = (a, b) => [a, b].sort().join(':')
const defaults = () => ({ blockedUsers: [], blockedUsersData: [], reportedUsers: [], reports: [],
  banStrikes: 0, banUntil: null, aiGrammarAssist: false, showInSwipe: true, lastUsernameChange: null })
const publicUser = ({ password, email, ...user }) => ({ ...user,
  name: user.displayName || user.name, country: user.location?.country || user.country })

// Reconstruct an account's view from shared, browser-local records.
function view(state, user) {
  if (!user) return { ...defaults(), currentUser: null, isAuthenticated: false, isOnboarded: false,
    matches: [], messages: {}, friendRequests: [], sentFriendRequests: [], selectedChatUserId: null }
  const prefs = { ...defaults(), ...state.accounts[user.id] }
  const blocked = id => prefs.blockedUsers.includes(id) || state.accounts[id]?.blockedUsers?.includes(user.id)
  const matches = state.allUsers.filter(peer => state.friendships.includes(pairKey(user.id, peer.id)) && !blocked(peer.id))
  return { ...prefs, currentUser: user, isAuthenticated: true,
    isOnboarded: Boolean(user.interests?.length === 5 && user.profilePic), matches,
    blockedUsersData: state.allUsers.filter(u => prefs.blockedUsers.includes(u.id)),
    messages: Object.fromEntries(matches.map(peer => [peer.id,
      (state.conversations[pairKey(user.id, peer.id)] || []).map(m => ({ ...m, sender: m.senderId === user.id ? 'me' : 'them' }))])),
    friendRequests: state.allFriendRequests.filter(r => r.toUserId === user.id && !blocked(r.fromUserId)),
    sentFriendRequests: state.allFriendRequests.filter(r => r.fromUserId === user.id).map(r => r.toUserId),
    selectedChatUserId: null }
}

const useStore = create(persist((set, get) => {
  const update = (change, userId) => set(state => {
    const next = { ...state, ...change(state) }
    return { ...next, ...view(next, userId ? next.users.find(u => u.id === userId) : next.currentUser) }
  })
  const preference = patch => update(state => ({ accounts: { ...state.accounts,
    [state.currentUser.id]: { ...defaults(), ...state.accounts[state.currentUser.id], ...patch } } }))
  const saveUser = user => update(state => ({
    users: [...state.users.filter(u => u.id !== user.id), user],
    allUsers: [...state.allUsers.filter(u => u.id !== user.id), publicUser(user)],
  }), user.id)
  return {
    ...view({}, null), users: [], allUsers: [], accounts: {}, friendships: [], conversations: {},
    allFriendRequests: [], shownFriendRequestPopups: [], isDemo: false,
    registerUser: saveUser, setUser: saveUser, addUser: saveUser,
    loginUser: user => update(() => ({}), user.id),
    setOnboarded: value => set({ isOnboarded: value }),
    startDemo: () => set(state => {
      const ids = new Set(demoUsers.map(u => u.id))
      const next = { ...state, users: [...state.users.filter(u => !ids.has(u.id)), ...demoUsers],
        allUsers: [...state.allUsers.filter(u => !ids.has(u.id)), ...demoUsers.map(publicUser)],
        accounts: { ...state.accounts, ...Object.fromEntries(demoUsers.map(u => [u.id, defaults()])) },
        friendships: [...state.friendships.filter(k => !k.includes('demo-')), pairKey('demo-alex', 'demo-sam')],
        conversations: { ...Object.fromEntries(Object.entries(state.conversations).filter(([k]) => !k.includes('demo-'))),
          [pairKey('demo-alex', 'demo-sam')]: demoConversation },
        allFriendRequests: state.allFriendRequests.filter(r => !ids.has(r.fromUserId) && !ids.has(r.toUserId)),
        shownFriendRequestPopups: [], isDemo: true }
      return { ...next, ...view(next, demoUsers[0]) }
    }),
    switchDemoUser: id => { if (get().isDemo && demoUsers.some(u => u.id === id)) update(() => ({}), id) },
    changeDisplayName: name => {
      if (get().lastUsernameChange && Date.now() - get().lastUsernameChange < 7 * 86400000)
        throw new Error('Please wait seven days between name changes.')
      saveUser({ ...get().currentUser, displayName: name, name })
      preference({ lastUsernameChange: Date.now() })
    },
    getSwipeUsers: () => {
      const s = get()
      return s.allUsers.filter(u => u.id !== s.currentUser?.id && !s.blockedUsers.includes(u.id) &&
        !s.accounts[u.id]?.blockedUsers?.includes(s.currentUser?.id) && !s.matches.some(m => m.id === u.id) &&
        !s.sentFriendRequests.includes(u.id) && s.accounts[u.id]?.showInSwipe !== false)
    },
    addFriendRequest: request => update(s => {
      const from = s.currentUser, to = s.allUsers.find(u => u.id === request.user.id)
      if (!from || !to || from.id === to.id || s.blockedUsers.includes(to.id) ||
        s.accounts[to.id]?.blockedUsers?.includes(from.id) || s.friendships.includes(pairKey(from.id, to.id)) ||
        s.allFriendRequests.some(r => pairKey(r.fromUserId, r.toUserId) === pairKey(from.id, to.id))) return {}
      return { allFriendRequests: [...s.allFriendRequests, { ...request,
        fromUser: publicUser(from), fromUserId: from.id, toUserId: to.id, timestamp: Date.now() }] }
    }),
    acceptFriendRequest: id => {
      const request = get().friendRequests.find(r => r.id === id)
      if (!request) return null
      update(s => ({ friendships: [...new Set([...s.friendships, pairKey(request.fromUserId, request.toUserId)])],
        allFriendRequests: s.allFriendRequests.filter(r => r.id !== id) }))
      return get().allUsers.find(u => u.id === request.fromUserId)
    },
    declineFriendRequest: id => update(s => ({ allFriendRequests: s.allFriendRequests.filter(r =>
      !(r.id === id && r.toUserId === s.currentUser.id)) })),
    markFriendRequestPopupShown: id => set(s => ({ shownFriendRequestPopups: [...new Set([...s.shownFriendRequestPopups, id])] })),
    updateFriendRequests: () => update(() => ({})),
    setAiGrammarAssist: value => preference({ aiGrammarAssist: value }),
    setShowInSwipe: value => preference({ showInSwipe: value }),
    blockUser: id => {
      if (id === get().currentUser?.id) return
      preference({ blockedUsers: [...new Set([...get().blockedUsers, id])] })
      update(s => ({ allFriendRequests: s.allFriendRequests.filter(r =>
        pairKey(r.fromUserId, r.toUserId) !== pairKey(s.currentUser.id, id)) }))
    },
    unblockUser: id => preference({ blockedUsers: get().blockedUsers.filter(u => u !== id) }),
    reportUser: (id, reason) => preference({ reportedUsers: [...get().reportedUsers, { userId: id, reason, timestamp: Date.now() }] }),
    submitReport: report => preference({ reports: [...get().reports, { ...report, timestamp: Date.now(), id: Date.now() }] }),
    addBanStrike: () => {
      const strikes = get().banStrikes + 1
      preference({ banStrikes: strikes, banUntil: Date.now() + [2, 5, 14, 30][Math.min(strikes - 1, 3)] * 86400000 })
    },
    checkBanStatus: () => ({ isBanned: get().banUntil > Date.now(), banUntil: get().banUntil,
      remainingTime: Math.max(0, (get().banUntil || 0) - Date.now()) }),
    addMessage: (peerId, message) => update(s => {
      if (!s.matches.some(u => u.id === peerId) || s.banUntil > Date.now()) return {}
      const key = pairKey(s.currentUser.id, peerId)
      const { sender, ...content } = message
      return { conversations: { ...s.conversations, [key]: [...(s.conversations[key] || []),
        { ...content, senderId: s.currentUser.id }] } }
    }),
    setMessages: messages => update(s => ({ conversations: { ...s.conversations,
      ...Object.fromEntries(s.matches.map(peer => [pairKey(s.currentUser.id, peer.id),
        (messages[peer.id] || []).map(({ sender, ...m }) => m)])) } })),
    logout: () => set({ ...view({}, null), isDemo: false }),
  }
}, { name: 'openteen-prototype-v2' }))

export default useStore
