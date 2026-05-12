import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { getItems, addItem, deleteItem } from '../lib/api'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'

export default function ItemsPage({ session }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add form state
  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  const userId = session.user.id

  useEffect(() => {
    getItems(userId)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim() || !expiryDate) return
    setFormError('')
    setAdding(true)
    try {
      const newItem = await addItem({ userId, name: name.trim(), expiryDate })
      setItems(prev => [...prev, newItem].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)))
      setName('')
      setExpiryDate('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-800">My Fridge</h1>

      {/* Add item form */}
      <div className="bg-white border border-fresh-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Add Item Manually</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fresh-300"
          />
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fresh-300"
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 shrink-0"
          >
            <Plus size={16} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        {formError && <p className="mt-2 text-red-600 text-sm">{formError}</p>}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="py-12"><Spinner /></div>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-4xl block mb-3">🧊</span>
          Your fridge is empty. Add items above or use the Scanner.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''} in your fridge</p>
          {items.map(item => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
