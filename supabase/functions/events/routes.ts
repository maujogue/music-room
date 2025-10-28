import { Hono } from '@hono/hono'
import {
	createEvent,
	fetchEvent,
	deleteEventById,
	updateEventById,
	addUserToEvent,
	removeUserFromEvent,
	editUserInEvent
} from './controller.ts'

const router = new Hono()

router.post('/', createEvent)

router.get('/:id', fetchEvent)

router.delete('/:id', deleteEventById)

router.put('/:id', updateEventById)

router.post('/:id/invite', addUserToEvent)

router.put('/:id/invite', editUserInEvent)

router.delete('/:id/invite', removeUserFromEvent)


export default router
