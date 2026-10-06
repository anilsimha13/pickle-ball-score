'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { CreateTournamentInput } from '@/types'

const TIER_OPTIONS = [
  { value: 'Title', label: 'Title' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
]

export function SponsorFields({ readOnly = false }: { readOnly?: boolean }) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateTournamentInput>()

  const { fields, append, remove } = useFieldArray({ control, name: 'sponsors' })

  const sponsorErrors = (errors.sponsors ?? []) as Array<
    { name?: { message?: string }; website?: { message?: string } } | undefined
  >

  function addSponsor() {
    append({ id: crypto.randomUUID(), name: '', tier: 'Gold', logo: undefined, website: '' })
  }

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-net">Sponsors (0–20)</legend>
        {!readOnly && fields.length < 20 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSponsor}
            data-testid="add-sponsor"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Sponsor
          </Button>
        )}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted">No sponsors yet.</p>
      )}

      {fields.map((field, i) => {
        const logo = watch(`sponsors.${i}.logo`)
        return (
          <div
            key={field.id}
            className="relative rounded-lg border border-muted bg-bg p-4 space-y-3"
            data-testid={`sponsor-row-${i}`}
          >
            {!readOnly && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove sponsor ${i + 1}`}
                className="absolute top-3 right-3 text-danger hover:text-danger/80"
                data-testid={`sponsor-remove-${i}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id={`sponsor-name-${i}`}
                label="Sponsor Name"
                readOnly={readOnly}
                error={sponsorErrors[i]?.name?.message}
                data-testid={`sponsor-name-${i}`}
                {...register(`sponsors.${i}.name`)}
              />

              <Select
                id={`sponsor-tier-${i}`}
                label="Tier"
                options={TIER_OPTIONS}
                disabled={readOnly}
                data-testid={`sponsor-tier-${i}`}
                {...register(`sponsors.${i}.tier`)}
              />
            </div>

            <Input
              id={`sponsor-website-${i}`}
              label="Website (optional)"
              type="url"
              placeholder="https://"
              readOnly={readOnly}
              error={sponsorErrors[i]?.website?.message}
              data-testid={`sponsor-website-${i}`}
              {...register(`sponsors.${i}.website`)}
            />

            {!readOnly && (
              <ImageUpload
                label="Logo"
                value={logo}
                maxPx={800}
                onChange={(url) => setValue(`sponsors.${i}.logo`, url)}
                data-testid={`sponsor-logo-${i}`}
              />
            )}
          </div>
        )
      })}
    </fieldset>
  )
}
