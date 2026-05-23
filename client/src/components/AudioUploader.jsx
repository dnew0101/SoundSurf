
import { useCallback, useState, useRef } from 'react'
import useStore from '../shared/store'

export const AudioUploader = () => {
    const setSelectedTrack = useStore((s) => s.setSelectedTrack)
    const [fileName, setFileName] = useState(null)
    const inputRef = useRef(null)

    const onFile = useCallback((file) => {
        if (!file) return
        setFileName(file.name)
        // store minimal file info; actual audio processing will read from the file
        setSelectedTrack({ name: file.name, file })
    }, [setSelectedTrack])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        const f = e.dataTransfer.files && e.dataTransfer.files[0]
        if (f) onFile(f)
    }, [onFile])

    const handleSelect = useCallback((e) => {
        const f = e.target.files && e.target.files[0]
        if (f) onFile(f)
    }, [onFile])

    return (
        <div className="w-full max-w-xl mx-auto">
            <label
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-lg bg-gradient-to-b from-black/30 to-black/10 cursor-pointer"
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
                    className="mt-3 px-4 py-2 bg-orange-500 text-black rounded-md font-semibold"
                >
                    Choose File
                </button>
                {fileName && <div className="mt-2 text-sm text-slate-200">Selected: {fileName}</div>}
            </label>
        </div>
    )
}

export default AudioUploader