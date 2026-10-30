const avatar = (initial, color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="${color}"/><circle cx="240" cy="200" r="100" fill="white" opacity=".14"/><text x="240" y="275" font-family="sans-serif" font-size="140" text-anchor="middle" fill="white">${initial}</text></svg>`)}`

// Fictional profiles for a repeatable walkthrough; these are not real users.
export const demoUsers = [
  { id: 'demo-alex', name: 'Alex', country: 'Kazakhstan', interests: ['music', 'reading', 'coding', 'football', 'movies'], bio: 'I want to practise English and talk about books and coding.', color: '#7a38cb' },
  { id: 'demo-sam', name: 'Sam', country: 'Canada', interests: ['music', 'reading', 'coding', 'art', 'travel'], bio: 'I enjoy sharing music and learning about other cultures.', color: '#236b79' },
  { id: 'demo-jamie', name: 'Jamie', country: 'United Kingdom', interests: ['music', 'football', 'movies', 'gaming', 'travel'], bio: 'Always happy to discuss a film or a football match.', color: '#956032' },
  { id: 'demo-robin', name: 'Robin', country: 'Japan', interests: ['art', 'reading', 'photography', 'cooking', 'travel'], bio: 'Looking for conversations about art, books, and food.', color: '#3e667b' },
].map(user => ({ ...user, username: user.name.toLowerCase(), displayName: user.name, age: 17,
  gender: 'Prefer not to say', location: { country: user.country, city: 'Demo' },
  profilePic: avatar(user.name[0], user.color), email: `${user.name.toLowerCase()}@example.invalid`, isFictional: true }))

export const demoConversation = [
  { id: 'sample-1', senderId: 'demo-sam', text: 'Hello! What music do you enjoy?', reactions: [], timestamp: '2026-01-01T12:00:00Z' },
  { id: 'sample-2', senderId: 'demo-alex', text: 'I like film soundtracks. Do you have a favourite?', reactions: [], timestamp: '2026-01-01T12:01:00Z' },
]
