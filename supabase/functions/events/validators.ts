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

  if (payload.description !== undefined && payload.description !== null) {
    if (typeof payload.description !== 'string') return { valid: false, message: 'description must be a string or null' }
  }

  if (payload.image !== undefined && payload.image !== null) {
    if (!(payload.image instanceof File)) return { valid: false, message: 'image must be a File or null' }
  }

  if (payload.is_private !== undefined && payload.is_private !== null) {
    if (typeof payload.is_private !== 'boolean') return { valid: false, message: 'is_private must be a boolean or null' }
  }

  if (payload.everyone_can_vote !== undefined && payload.everyone_can_vote !== null) {
    if (typeof payload.everyone_can_vote !== 'boolean') return { valid: false, message: 'everyone_can_vote must be a boolean or null' }
  }

  return { valid: true }
}

export function validateAddUserPayload(payload: any) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Invalid payload' }
  }

  if (!payload.user_id || typeof payload.user_id !== 'string' || payload.user_id.trim().length === 0) {
    return { valid: false, message: 'user_id is required and must be a non-empty string' }
  }

  if (!payload.role || typeof payload.role !== 'string' || !['inviter', 'voter', 'member'].includes(payload.role)) {
    return { valid: false, message: "role is required and must be one of 'inviter', 'voter', or 'member'" }
  }

  return { valid: true }
}
