export function validateEventPayload(payload: any, opts: { requireName: boolean }) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Invalid payload' }
  }

  if (opts.requireName) {
    if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 3) {
      return { valid: false, message: 'Event name must be at least 3 characters long' }
    }
  } else if (payload.name !== undefined) {
    if (payload.name !== null && (typeof payload.name !== 'string' || payload.name.trim().length < 3)) {
      return { valid: false, message: 'If provided, name must be at least 3 characters long' }
    }
  }

  const begin = payload.beginning_at
  const end = payload.ending_at
  if (begin !== undefined && begin !== null && begin !== '') {
    const b = Date.parse(begin)
    if (isNaN(b)) return { valid: false, message: 'beginning_at must be a valid ISO date string' }
  }
  if (end !== undefined && end !== null && end !== '') {
    const e = Date.parse(end)
    if (isNaN(e)) return { valid: false, message: 'ending_at must be a valid ISO date string' }
  }
  if (begin && end) {
    const b = Date.parse(begin)
    const e = Date.parse(end)
    if (!isNaN(b) && !isNaN(e) && e < b) return { valid: false, message: 'ending_at must be after beginning_at' }
  }

  if (payload.playlist_id !== undefined && payload.playlist_id !== null && payload.playlist_id !== '') {
    if (typeof payload.playlist_id !== 'string') return { valid: false, message: 'playlist_id must be a string or null' }
  }

  if (payload.location !== undefined && payload.location !== null) {
    if (typeof payload.location !== 'object') return { valid: false, message: 'location must be an object' }
  }

  return { valid: true }
}

