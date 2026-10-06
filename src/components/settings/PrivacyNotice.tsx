import { ShieldCheck } from 'lucide-react'

export function PrivacyNotice() {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-muted bg-bg px-4 py-3"
      data-testid="privacy-notice"
    >
      <ShieldCheck className="h-5 w-5 flex-shrink-0 text-muted mt-0.5" aria-hidden="true" />
      <p className="text-sm text-muted">
        All data is stored only in this browser and stays here after you log out. Use{' '}
        <span className="font-medium text-net">Reset all data</span> to remove it.
      </p>
    </div>
  )
}
