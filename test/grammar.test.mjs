import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createGrammarServer } from '../server/grammar.mjs'

async function withServer(options, check) {
  const server = createGrammarServer(options)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api/grammar`
  const post = (body, headers = {}) => fetch(url, { method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  try { await check(post, url) } finally { await new Promise(resolve => server.close(resolve)) }
}
test('missing key returns an explicit unavailable response', () => withServer({ apiKey: '' }, async post => {
  const response = await post({ text: 'Hello' })
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /not configured/)
}))
test('valid model response becomes a grammar suggestion (mocked provider)', () => withServer({
  generate: async () => JSON.stringify({ correctedText: 'They are happy.', explanation: 'Use are with they.' }),
}, async post => {
  const response = await post({ text: 'They is happy.' })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { correctedText: 'They are happy.', explanation: 'Use are with they.', hasChanges: true })
}))
test('invalid input, foreign origins, and wrong methods are rejected', () => withServer({ apiKey: '' }, async (post, url) => {
  assert.equal((await post({ text: '' })).status, 400)
  assert.equal((await post({ text: 'x'.repeat(2001) })).status, 400)
  assert.equal((await post({ text: 'hello' }, { Origin: 'https://unrelated.example' })).status, 403)
  assert.equal((await fetch(url)).status, 405)
}))
test('malformed provider output and provider failure do not masquerade as corrections', async () => {
  for (const generate of [async () => 'not JSON', async () => '{}', async () => { throw new Error('provider failure') }]) {
    await withServer({ generate }, async post => assert.equal((await post({ text: 'Hello' })).status, 502))
  }
})
