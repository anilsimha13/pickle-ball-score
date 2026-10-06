'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Mail, MailOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useContactStore } from '@/store/useContactStore'
import { SUBJECT_LABELS } from '@/lib/schemas/contact'
import { cn } from '@/lib/utils'
import type { ContactMessage } from '@/lib/schemas/contact'

export function ContactMessagesTable() {
  const messages = useContactStore((s) => s.messages)
  const markRead = useContactStore((s) => s.markRead)
  const deleteMessage = useContactStore((s) => s.deleteMessage)
  const { toast } = useToast()

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sorted = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  function handleDelete() {
    if (!deleteId) return
    try {
      deleteMessage(deleteId)
      toast('Message deleted.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  function handleToggleRead(msg: ContactMessage) {
    try {
      markRead(msg.id, !msg.read)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed.', 'error')
    }
  }

  if (sorted.length === 0) {
    return <EmptyState title="No messages yet." description="Messages from the Contact page will appear here." />
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow-sm" data-testid="contact-messages-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-court text-line">
              <th className="px-4 py-3 text-left font-medium w-10">Read</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-left font-medium">Message</th>
              <th className="px-4 py-3 text-left font-medium w-10">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((msg, i) => (
              <tr
                key={msg.id}
                className={cn(
                  i % 2 === 0 ? 'bg-surface' : 'bg-bg',
                  !msg.read && 'font-medium',
                )}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleRead(msg)}
                    aria-label={msg.read ? 'Mark as unread' : 'Mark as read'}
                    className="text-muted hover:text-court transition-colors"
                    data-testid={`toggle-read-${msg.id}`}
                  >
                    {msg.read ? (
                      <MailOpen className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Mail className="h-4 w-4 text-court" aria-hidden="true" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">
                  {format(new Date(msg.createdAt), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-3">{msg.name}</td>
                <td className="px-4 py-3 text-muted">{msg.email}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {SUBJECT_LABELS[msg.subject]}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-muted" title={msg.message}>
                  {msg.message}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteId(msg.id)}
                    aria-label="Delete message"
                    className="text-muted hover:text-danger transition-colors"
                    data-testid={`delete-msg-${msg.id}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </>
  )
}
