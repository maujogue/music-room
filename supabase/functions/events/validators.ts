export function validateEventPayload(
  payload: unknown,
  opts: {
    requireName: boolean;
    requireDateTime?: boolean;
    requireLocation?: boolean;
    requirePlaylist?: boolean;
  } = { requireName: true },
): { valid: boolean; message?: string } {
  const p = payload as any;
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid payload" };
  }
  if (opts.requireName) {
    if (!p.name || typeof p.name !== "string" || p.name.trim().length < 3) {
      return {
        valid: false,
        message: "Event name must be at least 3 characters long",
      };
    }
  } else if (p.name !== undefined) {
    if (
      p.name !== null &&
      (typeof p.name !== "string" || p.name.trim().length < 3)
    ) {
      return {
        valid: false,
        message: "If provided, name must be at least 3 characters long",
      };
    }
  }

  if (opts.requireLocation && !p.location.coordinates) {
    return {
      valid: false,
      message: "Coordinates is required",
    };
  }

  if (opts.requirePlaylist && !p.playlist_id) {
    return {
      valid: false,
      message: "Playlist is required",
    };
  }

  if (opts.requireDateTime) {
    if (!p.beginning_at) {
      return { valid: false, message: "beginning_at is required" };
    }
  }

  const begin = p.beginning_at;
  if (begin !== undefined && begin !== null && begin !== "") {
    const b = Date.parse(begin);
    if (isNaN(b)) {
      return {
        valid: false,
        message: "beginning_at must be a valid ISO date string",
      };
    }
  }

  if (
    p.playlist_id !== undefined && p.playlist_id !== null &&
    p.playlist_id !== ""
  ) {
    if (typeof p.playlist_id !== "string") {
      return { valid: false, message: "playlist_id must be a string or null" };
    }
  }

  if (p.location !== undefined && p.location !== null) {
    if (typeof p.location !== "object") {
      return { valid: false, message: "location must be an object" };
    }
  }

  if (p.description !== undefined && p.description !== null) {
    if (typeof p.description !== "string") {
      return { valid: false, message: "description must be a string or null" };
    }
  }

  if (p.image !== undefined && p.image !== null) {
    if (!(p.image instanceof File)) {
      return { valid: false, message: "image must be a File or null" };
    }
  }

  if (p.is_private !== undefined && p.is_private !== null) {
    if (typeof p.is_private !== "boolean") {
      return { valid: false, message: "is_private must be a boolean or null" };
    }
  }

  if (p.everyone_can_vote !== undefined && p.everyone_can_vote !== null) {
    if (typeof p.everyone_can_vote !== "boolean") {
      return {
        valid: false,
        message: "everyone_can_vote must be a boolean or null",
      };
    }
  }

  if (p.done !== undefined && p.done !== null) {
    if (typeof p.done !== "boolean") {
      return { valid: false, message: "done must be a boolean or null" };
    }
  }

  if (p.spatio_licence !== undefined && p.spatio_licence !== null) {
    if (typeof p.spatio_licence !== "boolean") {
      return {
        valid: false,
        message: "spatio_licence must be a boolean or null",
      };
    }
  }

  return { valid: true };
}

export function validateAddUserPayload(payload: unknown) {
  const p = payload as any;
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid payload" };
  }

  if (
    !p.user_id || typeof p.user_id !== "string" || p.user_id.trim().length === 0
  ) {
    return {
      valid: false,
      message: "user_id is required and must be a non-empty string",
    };
  }

  if (
    !p.role || typeof p.role !== "string" ||
    !["inviter", "voter", "member", "collaborator"].includes(p.role)
  ) {
    return {
      valid: false,
      message:
        "role is required and must be one of 'inviter', 'voter', 'member', or 'collaborator'",
    };
  }

  return { valid: true };
}

export function validateRemoveUserPayload(payload: unknown) {
  const p = payload as any;
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid payload" };
  }
  if (typeof p.user_id !== "string") {
    return { valid: false, message: "user_id must be a string" };
  }

  return { valid: true };
}

export function validateEditUserPayload(payload: unknown) {
  const p = payload as any;
  if (!payload || typeof payload !== "object") {
    return { valid: false, message: "Invalid payload" };
  }

  if (
    !p.user_id || typeof p.user_id !== "string" || p.user_id.trim().length === 0
  ) {
    return {
      valid: false,
      message: "user_id is required and must be a non-empty string",
    };
  }

  if (
    !p.role || typeof p.role !== "string" ||
    !["inviter", "voter", "member", "collaborator"].includes(p.role)
  ) {
    return {
      valid: false,
      message:
        "role is required and must be one of 'inviter', 'voter', 'member', or 'collaborator'",
    };
  }

  return { valid: true };
}
