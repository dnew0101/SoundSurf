import { useCallback, useRef, useState } from 'react'
import useStore from '../shared/store'

export const AudioUploader = () => {
  const setSelectedTrack = useStore((s) => s.setSelectedTrack)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef(null)

  const onFile = useCallback((file) => {
    if (!file) return
    setFileName(file.name)
    setSelectedTrack({ name: file.name, file })
  }, [setSelectedTrack])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files && e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  const handleSelect = useCallback((e) => {
    const file = e.target.files && e.target.files[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div className="mx-auto w-full max-w-xl">
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-linear-to-b from-black/30 to-black/10 p-6"
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleSelect}
        />
        <div className="text-slate-300">Drop a music file here or click to select</div>
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          className="mt-3 rounded-md bg-[#33E0D7] px-4 py-2 font-semibold text-black"
        >
          Choose File
        </button>
        {fileName && <div className="mt-2 text-sm text-slate-200">Selected: {fileName}</div>}
      </label>
    </div>
  )
}

export default AudioUploader
