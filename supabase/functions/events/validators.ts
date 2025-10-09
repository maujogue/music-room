export function validateEventPayload(payload: any, opts: { requireName: boolean, requireDateTime?: boolean } = { requireName: true }): { valid: boolean, message?: string } {
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

  if (opts.requireDateTime) {
    if (!payload.beginning_at) {
      return { valid: false, message: 'beginning_at is required' }
    }
  }

  const begin = payload.beginning_at
  if (begin !== undefined && begin !== null && begin !== '') {
    const b = Date.parse(begin)
    if (isNaN(b)) return { valid: false, message: 'beginning_at must be a valid ISO date string' }
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

  if (!payload.role || typeof payload.role !== 'string' || !['inviter', 'voter', 'member', 'collaborator'].includes(payload.role)) {
    return { valid: false, message: "role is required and must be one of 'inviter', 'voter', 'member', or 'collaborator'" }
  }

  return { valid: true }
}

export function validateRemoveUserPayload(payload: any) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Invalid payload' }
  }

  if (typeof payload.user_id !== 'string') {
    return { valid: false, message: 'user_id must be a string' }
  }

  return { valid: true }
}

export function validateEditUserPayload(payload: any) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Invalid payload' }
  }

  if (!payload.user_id || typeof payload.user_id !== 'string' || payload.user_id.trim().length === 0) {
    return { valid: false, message: 'user_id is required and must be a non-empty string' }
  }

  if (!payload.role || typeof payload.role !== 'string' || !['inviter', 'voter', 'member', 'collaborator'].includes(payload.role)) {
    return { valid: false, message: "role is required and must be one of 'inviter', 'voter', 'member', or 'collaborator'" }
  }

  return { valid: true }
}
