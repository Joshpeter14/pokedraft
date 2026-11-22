import { MoveModel } from '../models/moveModel.js'

export const MoveController = {
  async getAll(req, res) {
    try {
      res.json(await MoveModel.getAll())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}
