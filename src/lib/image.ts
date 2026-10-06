const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export function checkImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
    return { ok: false, error: 'Use a JPEG, PNG or WebP image under 5 MB' }
  }
  return { ok: true }
}

export async function compressImage(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        let w = width
        let h = height
        if (w > maxPx) {
          h = Math.round((h * maxPx) / w)
          w = maxPx
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
