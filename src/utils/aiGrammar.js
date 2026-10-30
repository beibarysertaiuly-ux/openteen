// The browser never receives the model API key. A local server handles the request.
export async function getAiGrammarCorrection(text) {
  const response = await fetch('/api/grammar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }), signal: AbortSignal.timeout(25000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Grammar assistance is unavailable. You can send the original message.')
  return data
}
