import { assertStrictEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";

import {
  ROLES,
  PERMISSIONS,
  canUserPerformAction,
} from "../../functions/events/permissions.ts";


Deno.test("READ_EVENT - public event - anyone can read", () => {
  const event = { is_private: false };
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_EVENT, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_EVENT, event), true);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.READ_EVENT, event), true);
});

Deno.test("READ_EVENT - private event - only anonymous can read", () => {
  const event = { is_private: true };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.READ_EVENT, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.READ_EVENT, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.READ_EVENT, event), false);
});

Deno.test("VOTE - everyone can vote", () => {
  const event = { everyone_can_vote: true };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.VOTE, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.VOTE, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.VOTE, event), true);
});

Deno.test("VOTE - restricted vote", () => {
  const event = { everyone_can_vote: false };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.VOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.VOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.INVITER, PERMISSIONS.VOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.VOTE, event), true);
});

Deno.test("DELETE_EVENT - only owner can delete", () => {
  const event = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.DELETE_EVENT, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.DELETE_EVENT, event), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.DELETE_EVENT, event), false);
});

Deno.test("ADD_USER - public event - anyone can add", () => {
  const event = { is_private: false };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_USER, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, event), true);
});

Deno.test("ADD_USER - private event - only inviter/owner can add", () => {
  const event = { is_private: true };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.ADD_USER, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.ADD_USER, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.VOTER, PERMISSIONS.ADD_USER, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.INVITER, PERMISSIONS.ADD_USER, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.ADD_USER, event), true);
});

Deno.test("UNVOTE - everyone can vote => anyone can unvote", () => {
  const event = { everyone_can_vote: true };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.UNVOTE, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UNVOTE, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.UNVOTE, event), true);
});

Deno.test("UNVOTE - restricted vote => only certain roles can unvote", () => {
  const event = { everyone_can_vote: false };
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.UNVOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UNVOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.INVITER, PERMISSIONS.UNVOTE, event), false);
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.UNVOTE, event), true);
});

Deno.test("UPDATE_USER_ROLE - only owner", () => {
  const event = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.UPDATE_USER_ROLE, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.UPDATE_USER_ROLE, event), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.UPDATE_USER_ROLE, event), false);
});

Deno.test("REMOVE_USER - only owner", () => {
  const event = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.REMOVE_USER, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.INVITER, PERMISSIONS.REMOVE_USER, event), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.REMOVE_USER, event), false);
});

Deno.test("EDIT_EVENT - only owner", () => {
  const event = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, PERMISSIONS.EDIT_EVENT, event), true);
  assertStrictEquals(canUserPerformAction(ROLES.MEMBER, PERMISSIONS.EDIT_EVENT, event), false);
  assertStrictEquals(canUserPerformAction(null, PERMISSIONS.EDIT_EVENT, event), false);
});

Deno.test("Unknown permission returns false", () => {
  const event = {};
  assertStrictEquals(canUserPerformAction(ROLES.OWNER, "unknown_permission", event), false);
});
