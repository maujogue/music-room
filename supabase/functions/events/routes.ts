import { Hono } from "@hono/hono";
import {
  addUserToEvent,
  createEvent,
  deleteEventById,
  editUserInEvent,
  fetchEvent,
  getEventsByCoordinates,
  removeUserFromEvent,
  startEvent,
  stopEvent,
  updateEventById,
} from "./controller.ts";

const router = new Hono();

router.post("/", createEvent);

router.get("/radar", getEventsByCoordinates);

router.get("/:id", fetchEvent);

router.delete("/:id", deleteEventById);

router.put("/:id", updateEventById);
router.post("/:id/start", startEvent);
router.post("/:id/stop", stopEvent);

router.post("/:id/invite", addUserToEvent);

router.put("/:id/invite", editUserInEvent);

router.delete("/:id/invite", removeUserFromEvent);

export default router;
