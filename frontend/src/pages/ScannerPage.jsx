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
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  async function handleSave() {
    if (!result) return
    try {
      await addItem({ userId: session.user.id, name: result.name, expiryDate: result.expiry_date })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  // Find which of the user's allergens appear in the scan result
  const allergenMatches = result?.allergens
    ? userAllergens.filter(ua =>
        result.allergens.some(ra => ra.toLowerCase().includes(ua.toLowerCase()) || ua.toLowerCase().includes(ra.toLowerCase()))
      )
    : []

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

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Allergen alert — shown first and prominently */}
          <AllergyAlert matches={allergenMatches} />

          <div className="bg-white dark:bg-slate-800 border border-fresh-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            {/* Name + expiry */}
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Scan Result</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Item</span>
                  <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{result.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">Expiry Date</span>
                  <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{result.expiry_date}</p>
                </div>
              </div>
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

            {/* Nutrition facts */}
            {result.nutrition && Object.keys(result.nutrition).length > 0 && (
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wide">Nutrition Facts</span>
                <div className="mt-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(result.nutrition).map(([key, val], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-white dark:bg-slate-800'}>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300 capitalize">{key.replace(/_/g, ' ')}</td>
                          <td className="px-3 py-2 text-slate-800 dark:text-slate-100 font-medium text-right">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Save button */}
            {saved ? (
              <p className="text-fresh-600 dark:text-fresh-400 text-sm font-medium">Saved to your fridge!</p>
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
