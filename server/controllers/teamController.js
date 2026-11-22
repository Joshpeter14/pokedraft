import { TeamModel } from '../models/teamModel.js'
import { validateTeam } from '../utils/validateTeam.js'

const NOT_FOUND = { error: 'Tim tidak ditemukan' }

// 23503 = roster_id tidak ada di tabel rosters, 22P02 = bukan UUID
const isBadRosterId = (err) => err.code === '23503' || err.code === '22P02'
const saveError = (res, err) =>
  isBadRosterId(err)
    ? res.status(400).json({ error: 'roster_id tidak valid' })
    : res.status(500).json({ error: err.message })

export const TeamController = {
  async getAll(req, res) {
    try {
      res.json(await TeamModel.getAll())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async getById(req, res) {
    try {
      const team = await TeamModel.getById(req.params.id)
      if (!team) return res.status(404).json(NOT_FOUND)
      res.json(team)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  async create(req, res) {
    const { error, value } = validateTeam(req.body)
    if (error) return res.status(400).json({ error })
    try {
      res.status(201).json(await TeamModel.create(value.team, value.members))
    } catch (err) {
      saveError(res, err)
    }
  },

  async update(req, res) {
    const { error, value } = validateTeam(req.body)
    if (error) return res.status(400).json({ error })
    try {
      const team = await TeamModel.update(req.params.id, value.team, value.members)
      if (!team) return res.status(404).json(NOT_FOUND)
      res.json(team)
    } catch (err) {
      saveError(res, err)
    }
  },

  async remove(req, res) {
    try {
      const removed = await TeamModel.remove(req.params.id)
      if (!removed) return res.status(404).json(NOT_FOUND)
      res.status(204).end()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
}
