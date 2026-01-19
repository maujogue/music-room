import type { ProfilePayload } from "@profile";

export function validateUpdateProfilePayload(body: unknown): {
  valid: boolean;
  errors: string[];
  profilePayload: ProfilePayload;
} {
  const allowedKeys = [
    "username",
    "email",
    "avatar_url",
    "bio",
    "music_genre",
    "privacy_setting",
  ];
  const errors: string[] = [];
  const profilePayload: ProfilePayload = {};

  if (!body || typeof body !== "object") {
    errors.push("Payload must be an object");
    return { valid: false, errors, profilePayload };
  }

  for (const key of Object.keys(body as object)) {
    if (!allowedKeys.includes(key)) continue;
    const value = (body as any)[key];
    switch (key) {
      case "username":
      case "email":
        if (typeof value === "string") profilePayload[key] = value.trim();
        else errors.push(`${key} must be a string`);
        break;
      case "avatar_url":
        if (value === null || typeof value === "string") {
          profilePayload.avatar_url = value;
        } else errors.push("avatar_url must be a string or null");
        break;
      case "bio":
        if (value === null || typeof value === "string") {
          profilePayload.bio = value;
        } else errors.push("bio must be a string or null");
        break;
      case "music_genre":
        if (
          value === null ||
          (Array.isArray(value) && value.every((v) => typeof v === "string"))
        ) {
          profilePayload.music_genre = value;
        } else errors.push("music_genre must be an array of strings or null");
        break;
      case "privacy_setting":
        if (["public", "friends", "private"].includes(value)) {
          profilePayload.privacy_setting = value;
        } else {errors.push(
            "privacy_setting must be public, friends ou private",
          );}
        break;
    }
  }

  return { valid: errors.length === 0, errors, profilePayload };
}
