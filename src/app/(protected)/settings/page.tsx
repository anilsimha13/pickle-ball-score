'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HydrationGate } from '@/components/ui/HydrationGate'
import { Card } from '@/components/ui/Card'
import { PrivacyNotice } from '@/components/settings/PrivacyNotice'
import { ExportButton } from '@/components/settings/ExportButton'
import { ImportButton } from '@/components/settings/ImportButton'
import { SampleDataButton } from '@/components/settings/SampleDataButton'
import { ResetDataButton } from '@/components/settings/ResetDataButton'
import { ContactMessagesTable } from '@/components/settings/ContactMessagesTable'
import { useContactStore } from '@/store/useContactStore'
import { cn } from '@/lib/utils'

type Tab = 'data' | 'messages'

function SettingsContent() {
  const [tab, setTab] = useState<Tab>('data')
  const unread = useContactStore((s) => s.getUnreadCount())

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-muted mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'data'}
          onClick={() => setTab('data')}
          data-testid="tab-data"
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'data'
              ? 'border-court text-court'
              : 'border-transparent text-muted hover:text-net',
          )}
        >
          Data Management
        </button>
        <button
          role="tab"
          aria-selected={tab === 'messages'}
          onClick={() => setTab('messages')}
          data-testid="tab-messages"
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
            tab === 'messages'
              ? 'border-court text-court'
              : 'border-transparent text-muted hover:text-net',
          )}
        >
          Contact Messages
          {unread > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-kitchen text-net text-xs font-bold w-5 h-5">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </div>

      {/* Data Management tab */}
      {tab === 'data' && (
        <div className="space-y-6" role="tabpanel" aria-label="Data Management">
          <PrivacyNotice />

          <Card kitchenStrip className="p-6">
            <h2 className="font-heading text-xl text-net mb-1">Export</h2>
            <p className="text-sm text-muted mb-4">
              Download all your data as a JSON backup file.
            </p>
            <ExportButton />
          </Card>

          <Card kitchenStrip className="p-6">
            <h2 className="font-heading text-xl text-net mb-1">Import</h2>
            <p className="text-sm text-muted mb-4">
              Restore from a backup file. Existing records with the same ID will be replaced.
            </p>
            <ImportButton />
          </Card>

          <Card kitchenStrip className="p-6">
            <h2 className="font-heading text-xl text-net mb-1">Sample Data</h2>
            <p className="text-sm text-muted mb-4">
              Load sample players, teams and tournaments to explore the app.
            </p>
            <SampleDataButton />
          </Card>

          <Card className="p-6 border border-danger/30">
            <h2 className="font-heading text-xl text-danger mb-1">Danger Zone</h2>
            <p className="text-sm text-muted mb-4">
              Permanently delete all players, teams, tournaments and contact messages.
            </p>
            <ResetDataButton />
          </Card>
        </div>
      )}

      {/* Contact Messages tab */}
      {tab === 'messages' && (
        <div role="tabpanel" aria-label="Contact Messages">
          <ContactMessagesTable />
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Settings" subtitle="Manage your data and view contact messages." />
      <HydrationGate>
        <SettingsContent />
      </HydrationGate>
    </div>
  )
}
