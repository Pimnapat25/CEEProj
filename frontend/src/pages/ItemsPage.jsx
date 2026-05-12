import React, { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { getItems, addItem, deleteItem, getUserAllergens, saveUserAllergens } from '../lib/api'
import ItemCard from '../components/ItemCard'
import Spinner from '../components/Spinner'

const COMMON_ALLERGENS = [
  'Milk', 'Eggs', 'Peanuts', 'Tree Nuts', 'Wheat', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Gluten',
]

export default function ItemsPage({ session }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  // Allergen state
  const [myAllergens, setMyAllergens] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [savingAllergens, setSavingAllergens] = useState(false)

  const userId = session.user.id

  useEffect(() => {
    getItems(userId)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    getUserAllergens().then(setMyAllergens)
  }, [userId])

  function toggleAllergen(allergen) {
    setMyAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  function addCustom() {
    const val = customInput.trim()
    if (!val || myAllergens.map(a => a.toLowerCase()).includes(val.toLowerCase())) return
    setMyAllergens(prev => [...prev, val])
    setCustomInput('')
  }

  async function handleSaveAllergens() {
    setSavingAllergens(true)
    try {
      await saveUserAllergens(myAllergens)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAllergens(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setFormError('')
    setAdding(true)
    try {
      const newItem = await addItem({
        userId,
        name: name.trim(),
        expiryDate: expiryDate || null,
        ingredients: ingredients.trim() || null,
      })
      setItems(prev => [...prev, newItem].sort((a, b) => {
        const da = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
        const db = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
        return da - db
      }))
      setName('')
      setExpiryDate('')
      setIngredients('')
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
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">My Fridge</h1>

      {/* Allergen settings */}
      <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">My Allergens</h2>
        <p className="text-xs text-slate-400 mb-4">Select anything you're allergic to — you'll get a warning when scanning labels.</p>

        {/* Common allergen chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_ALLERGENS.map(a => (
            <button
              key={a}
              onClick={() => toggleAllergen(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${myAllergens.includes(a)
                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-fresh-300'}`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Custom allergen input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add custom allergen..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fresh-300"
          />
          <button
            onClick={addCustom}
            className="px-3 py-2 bg-fresh-100 dark:bg-fresh-900/20 text-fresh-700 dark:text-fresh-300 rounded-lg text-sm font-medium hover:bg-fresh-200 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Active allergens pills */}
        {myAllergens.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {myAllergens.map(a => (
              <span key={a} className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full border border-red-200 dark:border-red-700">
                {a}
                <button onClick={() => toggleAllergen(a)} className="hover:text-red-900 dark:hover:text-red-100">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSaveAllergens}
          disabled={savingAllergens}
          className="px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {savingAllergens ? 'Saving...' : 'Save Allergens'}
        </button>
      </div>

      {/* Add item form */}
      <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">Add Item Manually</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Item name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fresh-300"
            />
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fresh-300"
            />
          </div>
          <textarea
            placeholder="Ingredients (optional)"
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            rows={3}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fresh-300 resize-y"
          />
          <p className="text-xs text-slate-400 -mt-1">Leave expiry date empty for non-expiring items.</p>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            <Plus size={16} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        {formError && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{formError}</p>}
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
          <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''} in your fridge</p>
          {items.map(item => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
