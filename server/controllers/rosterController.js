import { RosterModel } from '../models/rosterModel.js'

export const RosterController = {
  async getAll(req, res) {
    try {
      res.json(await RosterModel.getAll())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getById(req, res) {
    try {
      const roster = await RosterModel.getById(req.params.id)
      if (!roster) return res.status(404).json({ error: 'Roster tidak ditemukan' })
      res.json(roster)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getMoves(req, res) {
    try {
      const moves = await RosterModel.getMoves(req.params.id)
      if (!moves) return res.status(404).json({ error: 'Roster tidak ditemukan' })
      res.json(moves)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}
