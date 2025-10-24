import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  getUserRoleInEvent,
} from "../../functions/events/permissions.ts";

Deno.test("returns OWNER if userId is the event's owner", () => {
  const ownerId = "owner123";
  const event = {
    owner: { id: ownerId },
    members: [
      { id: "member123", role: "member" },
      { id: "voter123", role: "voter" },
    ],
  };

  const role = getUserRoleInEvent(event, ownerId);
  assertStrictEquals(role, ROLES.OWNER);
});

Deno.test("returns MEMBER if userId is a member with role 'member'", () => {
  const userId = "member123";
  const event = {
    owner: { id: "owner123" },
    members: [{ id: userId, role: "member" }],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, ROLES.MEMBER);
});

Deno.test("returns VOTER if userId is a member with role 'voter'", () => {
  const userId = "voter123";
  const event = {
    owner: { id: "owner123" },
    members: [{ id: userId, role: "voter" }],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, ROLES.VOTER);
});

Deno.test("returns INVITER if userId is a member with role 'inviter'", () => {
  const userId = "inviter123";
  const event = {
    owner: { id: "owner123" },
    members: [{ id: userId, role: "inviter" }],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, ROLES.INVITER);
});

Deno.test("returns COLLABORATOR if userId is a member with role 'collaborator'", () => {
  const userId = "collab123";
  const event = {
    owner: { id: "owner123" },
    members: [{ id: userId, role: "collaborator" }],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, ROLES.COLLABORATOR);
});

Deno.test("returns null if userId is a member with unknown role", () => {
  const userId = "unknownRole123";
  const event = {
    owner: { id: "owner123" },
    members: [{ id: userId, role: "unknown_role" }],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, null);
});

Deno.test("returns null if userId is not found in event", () => {
  const userId = "notfound123";
  const event = {
    owner: { id: "owner123" },
    members: [
      { id: "member123", role: "member" },
      { id: "voter123", role: "voter" },
    ],
  };

  const role = getUserRoleInEvent(event, userId);
  assertStrictEquals(role, null);
});
