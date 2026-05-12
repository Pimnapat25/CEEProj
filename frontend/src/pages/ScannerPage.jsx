import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera } from 'lucide-react'
import { scanImage, addItem, getUserAllergens } from '../lib/api'
import Spinner from '../components/Spinner'
import AllergyAlert from '../components/AllergyAlert'

export default function ScannerPage({ session }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [userAllergens, setUserAllergens] = useState([])
  const inputRef = useRef(null)

  // Editable fields populated from the scan result
  const [editName, setEditName] = useState('')
  const [editExpiry, setEditExpiry] = useState('')
  const [editIngredients, setEditIngredients] = useState('')

  useEffect(() => {
    getUserAllergens().then(setUserAllergens)
  }, [])

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setResult(null)
    setSaved(false)
    setError('')
    setPreview(URL.createObjectURL(f))
  }

  function onInputChange(e) { handleFile(e.target.files[0]) }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleScan() {
    if (!file) return
    setScanning(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const data = await scanImage(file, session.access_token)
      setResult(data)
      setEditName(data.name || '')
      setEditExpiry(data.expiry_date || '')
      setEditIngredients(data.ingredients || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  async function handleSave() {
    if (!result) return
    if (!editName.trim()) {
      setError('Item name is required')
      return
    }
    try {
      await addItem({
        userId: session.user.id,
        name: editName.trim(),
        expiryDate: editExpiry || null,
        ingredients: editIngredients || null,
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const allergenMatches = result?.allergens
    ? userAllergens.filter(ua =>
        result.allergens.some(ra => ra.toLowerCase().includes(ua.toLowerCase()) || ua.toLowerCase().includes(ra.toLowerCase()))
      )
    : []

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fresh-400"

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Scan Label</h1>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors
          ${dragOver
            ? 'border-fresh-400 bg-fresh-50 dark:bg-fresh-900/10'
            : 'border-fresh-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-fresh-50 dark:hover:bg-slate-700'}`}
      >
        <div className="flex gap-3 text-fresh-400">
          <Upload size={28} />
          <Camera size={28} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Drag & drop or <span className="text-fresh-600 dark:text-fresh-400 font-medium">click to upload</span>
          <br />
          <span className="text-xs text-slate-400">Supports camera capture on mobile</span>
        </p>
        <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} className="hidden" />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
        </div>
      )}

      {/* Scan button */}
      {file && !scanning && (
        <button
          onClick={handleScan}
          className="w-full py-2.5 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-xl text-sm transition-colors"
        >
          Scan for Expiry Date & Nutrition
        </button>
      )}

      {scanning && (
        <div className="py-6">
          <Spinner />
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">Reading label...</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Result — editable */}
      {result && (
        <div className="flex flex-col gap-4">
          <AllergyAlert matches={allergenMatches} />

          <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Scan Result</h2>
              <p className="text-xs text-slate-400">Review and edit before saving to your fridge.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Item Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className={inputCls}
                placeholder="Product name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                Expiry Date <span className="text-slate-400 normal-case">(leave blank if non-expiring)</span>
              </label>
              <input
                type="date"
                value={editExpiry || ''}
                onChange={e => setEditExpiry(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Ingredients</label>
              <textarea
                value={editIngredients}
                onChange={e => setEditIngredients(e.target.value)}
                rows={4}
                className={inputCls + ' resize-y'}
                placeholder="Ingredients list (editable)"
              />
            </div>

            {/* Allergens on label */}
            {result.allergens && result.allergens.length > 0 && (
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wide">Contains</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {result.allergens.map(a => (
                    <span
                      key={a}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${allergenMatches.some(m => m.toLowerCase() === a.toLowerCase())
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            {saved ? (
              <p className="text-fresh-600 dark:text-fresh-400 text-sm font-medium">✓ Saved to your fridge!</p>
            ) : (
              <button
                onClick={handleSave}
                className="w-full py-2 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Save to Fridge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
