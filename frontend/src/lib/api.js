import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL

// OCR scan via backend
export async function scanImage(file, token) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Scan failed')
  }

  return res.json() // expected: { name, expiry_date }
}

// Fridge items via Supabase
export async function getItems(userId) {
  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })

  if (error) throw error
  return data
}

export async function addItem({ userId, name, expiryDate }) {
  const { data, error } = await supabase
    .from('fridge_items')
    .insert([{ user_id: userId, name, expiry_date: expiryDate }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from('fridge_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
