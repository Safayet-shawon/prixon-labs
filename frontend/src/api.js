const base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

// Server-side matrix computation (memoised on the API). Callers fall back to the
// identical local implementation if this fails.
export async function computeScenario(kind, input, signal) {
  const response = await fetch(`${base}/api/matrix/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
    signal,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Calculation failed.')
    error.status = response.status
    throw error
  }
  return data
}

export async function sendContact(payload) {
  let response
  try {
    response = await fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('The contact service is temporarily unavailable. Please email us directly.')
  }

  let data = {}
  try {
    data = await response.json()
  } catch {
    /* The server may have no JSON body. */
  }
  if (!response.ok)
    throw new Error(data.message || 'We could not send your message. Please email us directly.')
  return data
}
