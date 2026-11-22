import { Router } from 'express'
import { RosterController } from '../controllers/rosterController.js'

const router = Router()

router.get('/', RosterController.getAll)
router.get('/:id/moves', RosterController.getMoves)
router.get('/:id', RosterController.getById)

export default router
