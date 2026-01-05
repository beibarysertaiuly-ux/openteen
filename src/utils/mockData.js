// AI interest auto-correct simulation
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

// AI moderation simulation
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
  
  // Allow casual swearing (like "that's f***ing crazy")
  const casualSwearing = /that'?s?\s+(f\*{1,3}|fuck|damn|hell)\s+/i
  const hasCasualSwearing = casualSwearing.test(message)
  
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

// Calculate ban duration based on strikes
export const calculateBanDuration = (strikes) => {
  // 1st strike: 2 days, 2nd: 5 days, 3rd: 14 days, 4th+: 30 days
  const durations = [2, 5, 14, 30]
  const index = Math.min(strikes - 1, durations.length - 1)
  return durations[index] * 24 * 60 * 60 * 1000 // Convert to milliseconds
}

// AI grammar correction simulation with detailed explanations (async)
export const analyzeGrammar = async (message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const originalMessage = message
      let corrected = message
      const explanations = []
      const errors = []

      const applyRule = (type, wrong, right, explanation) => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
        if (regex.test(corrected)) {
          corrected = corrected.replace(regex, right)
          explanations.push({ type, original: wrong, corrected: right, explanation })
          errors.push(`${wrong} → ${right}`)
        }
      }

      // Capitalization for pronoun I
      applyRule(
        'Capitalization',
        'i',
        'I',
        'The pronoun "I" must always be capitalized in English, regardless of its position.'
      )

      // Contractions
      const contractions = {
        dont: "don't",
        wont: "won't",
        cant: "can't",
        isnt: "isn't",
        arent: "aren't",
        wasnt: "wasn't",
        werent: "weren't",
        havent: "haven't",
        hasnt: "hasn't",
        hadnt: "hadn't",
        wouldnt: "wouldn't",
        couldnt: "couldn't",
        shouldnt: "shouldn't",
        its: "it's",
        lets: "let's",
        thats: "that's",
        whats: "what's",
        wheres: "where's",
        whos: "who's",
        youre: "you're",
        theyre: "they're",
        were: "we're",
        im: "I'm",
        hes: "he's",
        shes: "she's",
      }

      Object.entries(contractions).forEach(([wrong, right]) => {
        applyRule(
          'Contraction',
          wrong,
          right,
          `The contraction "${wrong}" is missing an apostrophe. It should be written as "${right}".`
        )
      })

      // Subject-verb agreement
      const agreementErrors = {
        'they is': 'they are',
        'they was': 'they were',
        'we is': 'we are',
        'we was': 'we were',
        'you is': 'you are',
        'you was': 'you were',
      }

      Object.entries(agreementErrors).forEach(([wrong, right]) => {
        applyRule(
          'Subject-Verb Agreement',
          wrong,
          right,
          `Plural subjects like "${wrong.split(' ')[0]}" require plural verbs like "${right.split(' ')[1]}".`
        )
      })

      // Double negatives
      const doubleNegativeRegex =
        /(don't|doesn't|didn't|won't|can't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|couldn't|shouldn't)\s+\w+\s+(no|not|nothing|nobody|nowhere|never)/gi
      if (doubleNegativeRegex.test(corrected)) {
        explanations.push({
          type: 'Double Negative',
          original: 'Double negative detected',
          corrected: 'Single negative',
          explanation:
            'Double negatives are avoided in standard English. Use a single negative (e.g., "I don’t have anything" instead of "I don’t have nothing").',
        })
        errors.push('Double negative detected')
      }

      // Spelling corrections
      const spelling = {
        recieve: 'receive',
        seperate: 'separate',
        definately: 'definitely',
        occured: 'occurred',
        begining: 'beginning',
        accomodate: 'accommodate',
      }

      Object.entries(spelling).forEach(([wrong, right]) => {
        applyRule('Spelling', wrong, right, `The correct spelling is "${right}".`)
      })

      const hasChanges = corrected !== originalMessage || explanations.length > 0
      resolve({
        correctedText: corrected,
        hasErrors: hasChanges,
        explanations,
        errors,
        originalText: originalMessage,
      })
    }, 400)
  })
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

