'use client'

import { useRef, type ChangeEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { checkImageFile, compressImage } from '@/lib/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  maxPx?: number
  label?: string
  error?: string
  'data-testid'?: string
}

export function ImageUpload({
  value,
  onChange,
  maxPx = 800,
  label,
  error,
  'data-testid': testId,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const check = checkImageFile(file)
    if (!check.ok) {
      alert(check.error)
      return
    }
    const dataUrl = await compressImage(file, maxPx)
    onChange(dataUrl)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-net">{label}</span>}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg border-2 border-dashed border-muted bg-bg p-4 cursor-pointer hover:border-court transition-colors',
          error && 'border-danger',
        )}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Upload image'}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        data-testid={testId}
      >
        {value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 rounded-full bg-danger text-line p-0.5"
              data-testid={testId ? `${testId}-remove` : undefined}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <Upload className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs">Click to upload (JPEG, PNG, WebP ≤ 5 MB)</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFile}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
