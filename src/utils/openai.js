// OpenAI API integration for grammar correction
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function correctWithAI(text) {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found. Falling back to original text.')
    return { corrected: text, hasChanges: false }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Correct grammar, vocabulary, and spelling. Keep the exact same meaning and tone. Return ONLY the corrected text with no explanations, no additional text, no markdown, just the corrected version.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return { corrected: text, hasChanges: false }
    }

    const data = await response.json()
    const corrected = data.choices[0]?.message?.content?.trim() || text
    
    return {
      corrected: corrected,
      hasChanges: corrected !== text,
      original: text
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return { corrected: text, hasChanges: false }
  }
}


