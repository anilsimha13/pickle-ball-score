'use client'

import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="border-t-4 border-t-kitchen">
      <p className="text-net mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} data-testid="confirm-cancel">
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
          data-testid="confirm-ok"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
