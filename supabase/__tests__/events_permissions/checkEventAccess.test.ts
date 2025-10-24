import { assertRejects, assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { HTTPException } from 'https://deno.land/x/hono@v3.2.3/http-exception.ts'
import { checkEventAccess } from "../../functions/events/permissions.ts";

const valid_event = {
  id: "eventId",
  name: "evenName",
  image_url: "",
  owner: "SpotifyOwner",
  is_private: false,
  everyone_can_vote: true,
  description: "The best event",
  playlist_id: "",
  location: "MusicEventLocation",
  beginning_at: "2025-09-15T19:30:00Z"
};


Deno.test("throws 404 if event is null", async () => {
  await assertRejects(
    () => checkEventAccess(null as any, "user123"),
    HTTPException,
    "Event not found"
  );
});


Deno.test("returns event if it is public", async () => {
  const result = await checkEventAccess(valid_event as any, "user123");
  assertStrictEquals(result, valid_event);
});

Deno.test("throws 403 if access is denied", async () => {
	
  const tmp_event = {
    id: "eventId",
    name: "evenName",
    image_url: "",
    owner: "SpotifyOwner",
    is_private: true,
    everyone_can_vote: true,
    description: "The best event",
    playlist_id: "",
    location: "MusicEventLocation",
    beginning_at: "2025-09-15T19:30:00Z"
  };

  await assertRejects(
    () => checkEventAccess(tmp_event as any, "user123"),
    HTTPException,
    "Access denied to private event"
  );
});
