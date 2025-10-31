import { Hono } from '@hono/hono'
import {
	createEvent,
	fetchEvent,
	deleteEventById,
	updateEventById,
	addUserToEvent,
	removeUserFromEvent,
	editUserInEvent,
	getEventsByCoordinates,
	startEvent,
	stopEvent
} from './controller.ts'

const router = new Hono()

router.post('/', createEvent)

router.get('/radar', getEventsByCoordinates)

router.get('/:id', fetchEvent)

router.delete('/:id', deleteEventById)

router.put('/:id', updateEventById)
router.put('/:id/start', startEvent)
router.put('/:id/stop', stopEvent)

router.post('/:id/invite', addUserToEvent)

router.put('/:id/invite', editUserInEvent)

router.delete('/:id/invite', removeUserFromEvent)


export default router
