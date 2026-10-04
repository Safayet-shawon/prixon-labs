const base = import.meta.env.VITE_API_URL || ''

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
