// Deterministic interest aliases; this does not call an AI model.
export const correctInterest = (input) => {
  const corrections = {
    'fotbal': 'football',
    'futbol': 'football',
    'soccer': 'football',
    'guitar': 'music',
    'piano': 'music',
    'singing': 'music',
    'books': 'reading',
    'novels': 'reading',
    'videogames': 'gaming',
    'video games': 'gaming',
    'games': 'gaming',
    'traveling': 'travel',
    'travelling': 'travel',
    'drawing': 'art',
    'painting': 'art',
    'films': 'movies',
    'cinema': 'movies',
    'movy': 'movies',
    'movie': 'movies',
    'working out': 'fitness',
    'exercise': 'fitness',
  }

  const lower = input.toLowerCase().trim()
  return corrections[lower] || input.trim()
}

// Demonstration phrase filter. Not comprehensive moderation or an AI model.
export const moderateMessage = (message) => {
  const dangerousPhrases = [
    'meet me',
    'send nudes',
    'show me',
    'where do you live',
    'what school',
    'your address',
  ]

  const severePhrases = [
    'pedophil',
    'pedo',
    'kill you',
    'hurt you',
    'threat',
  ]

  const lower = message.toLowerCase()
  const hasSevere = severePhrases.some(phrase => lower.includes(phrase))
  const hasDanger = dangerousPhrases.some(phrase => lower.includes(phrase))
  
  return {
    isSafe: !hasDanger && !hasSevere,
    isSevere: hasSevere,
    reason: hasSevere 
      ? 'Severe violation detected - immediate action required' 
      : hasDanger 
        ? 'Potentially unsafe content detected' 
        : null,
    shouldBan: hasSevere,
  }
}

// Find shared interests
export const findSharedInterests = (user1, user2) => {
  if (!user1?.interests || !user2?.interests) return []
  return user1.interests.filter(i => user2.interests.includes(i))
}

// Generate match message
export const generateMatchMessage = (user1, user2) => {
  const shared = findSharedInterests(user1, user2)
  
  if (shared.length >= 2) {
    return `You both love ${shared[0]} and are a fan of ${shared[1]}.`
  } else if (shared.length === 1) {
    return `You both love ${shared[0]}.`
  } else {
    return `You both seem curious to learn about new cultures.`
  }
}

