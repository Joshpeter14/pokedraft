import { Router } from 'express'
import { MoveController } from '../controllers/moveController.js'

const router = Router()

router.get('/', MoveController.getAll)

export default router
