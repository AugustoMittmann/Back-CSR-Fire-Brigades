import { Router } from 'express'
import { supabase } from '../supabase.js'

const router = Router()

// GET /brigades
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('Brigades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

// POST /brigades
router.post('/', async (req, res) => {
  const {
    name,
    phone_number,
    email,
    acting_area,
    volunteers,
    address,
    pix,
    presentation,
    instagram,
    foundation
  } = req.body

  const { data, error } = await supabase
    .from('Brigades')
    .insert([{
      name,
      phone_number,
      email,
      acting_area,
      volunteers,
      address,
      pix,
      presentation,
      instagram,
      foundation
    }])
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json(data)
})

// PUT /brigades/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const payload = req.body

  const { data, error } = await supabase
    .from('Brigades')
    .update(payload)
    .eq('brigade_id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
})

export default router