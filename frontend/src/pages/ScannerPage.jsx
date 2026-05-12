import React, { useState, useRef } from 'react'
import { Upload, Camera } from 'lucide-react'
import { scanImage, addItem } from '../lib/api'
import Spinner from '../components/Spinner'

export default function ScannerPage({ session }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setResult(null)
    setSaved(false)
    setError('')
    setPreview(URL.createObjectURL(f))
  }

  function onInputChange(e) {
    handleFile(e.target.files[0])
  }

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
      const token = session.access_token
      const data = await scanImage(file, token)
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
      await addItem({
        userId: session.user.id,
        name: result.name,
        expiryDate: result.expiry_date,
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800">Scan Label</h1>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors
          ${dragOver ? 'border-fresh-400 bg-fresh-50' : 'border-fresh-200 bg-white hover:bg-fresh-50'}`}
      >
        <div className="flex gap-3 text-fresh-400">
          <Upload size={28} />
          <Camera size={28} />
        </div>
        <p className="text-sm text-slate-500 text-center">
          Drag & drop or <span className="text-fresh-600 font-medium">click to upload</span>
          <br />
          <span className="text-xs text-slate-400">Supports camera capture on mobile</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white border border-fresh-100 rounded-2xl overflow-hidden shadow-sm">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
        </div>
      )}

      {/* Scan button */}
      {file && !scanning && (
        <button
          onClick={handleScan}
          className="w-full py-2.5 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-xl text-sm transition-colors"
        >
          Scan for Expiry Date
        </button>
      )}

      {/* Spinner */}
      {scanning && (
        <div className="py-6">
          <Spinner />
          <p className="text-center text-sm text-slate-500 mt-3">Reading label...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white border border-fresh-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-slate-700">Scan Result</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wide">Item</span>
              <p className="font-medium text-slate-800 mt-0.5">{result.name}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wide">Expiry Date</span>
              <p className="font-medium text-slate-800 mt-0.5">{result.expiry_date}</p>
            </div>
          </div>
          {saved ? (
            <p className="text-fresh-600 text-sm font-medium">Saved to your fridge!</p>
          ) : (
            <button
              onClick={handleSave}
              className="w-full py-2 bg-fresh-500 hover:bg-fresh-600 text-white font-medium rounded-lg text-sm transition-colors"
            >
              Save to Fridge
            </button>
          )}
        </div>
      )}
    </div>
  )
}
