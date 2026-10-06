'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { PrizeFields } from './PrizeFields'
import { SponsorFields } from './SponsorFields'
import { createTournamentSchema } from '@/lib/schemas/tournament'
import { canEditMeta, canEditField, isFullyReadOnly } from '@/lib/tournament'
import type { CreateTournamentInput, Tournament } from '@/types'

const POINTS_OPTIONS = [
  { value: '11', label: '11 points' },
  { value: '15', label: '15 points' },
  { value: '21', label: '21 points' },
]

const BEST_OF_OPTIONS = [
  { value: '1', label: 'Best of 1' },
  { value: '3', label: 'Best of 3' },
]

interface TournamentFormProps {
  defaultValues?: Partial<CreateTournamentInput>
  tournament?: Tournament
  onSubmit: (data: CreateTournamentInput) => Promise<void> | void
  submitLabel?: string
}

export function TournamentForm({
  defaultValues,
  tournament,
  onSubmit,
  submitLabel = 'Save',
}: TournamentFormProps) {
  const status = tournament?.status
  const fullyReadOnly = status ? isFullyReadOnly({ status } as Tournament) : false
  const metaEditable = !status || canEditMeta('name', status)
  const structureEditable = !status || canEditField('pointsPerGame', status)

  const methods = useForm<CreateTournamentInput>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: '',
      venue: '',
      startDate: '',
      endDate: '',
      pointsPerGame: 11,
      bestOf: 1,
      prizes: { champion: 1000, runnerUp: 500, thirdPlace: 250 },
      sponsors: [],
      bannerImage: undefined,
      ...defaultValues,
    },
  })

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods

  const bannerImage = watch('bannerImage')

  async function handleFormSubmit(data: CreateTournamentInput) {
    await onSubmit(data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
        <Card kitchenStrip className="p-6 space-y-4">
          <h2 className="font-heading text-xl text-net">Tournament Details</h2>

          <Input
            id="tournament-name"
            label="Tournament Name"
            readOnly={!metaEditable}
            error={errors.name?.message}
            data-testid="tournament-name"
            {...register('name')}
          />

          <Input
            id="tournament-venue"
            label="Venue"
            readOnly={!metaEditable}
            error={errors.venue?.message}
            data-testid="tournament-venue"
            {...register('venue')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="tournament-start-date"
              label="Start Date"
              type="date"
              readOnly={!metaEditable}
              error={errors.startDate?.message}
              data-testid="tournament-start-date"
              {...register('startDate')}
            />
            <Input
              id="tournament-end-date"
              label="End Date"
              type="date"
              readOnly={!metaEditable}
              error={errors.endDate?.message}
              data-testid="tournament-end-date"
              {...register('endDate')}
            />
          </div>

          <ImageUpload
            label="Banner Image (optional)"
            value={bannerImage}
            maxPx={1600}
            onChange={(url) => setValue('bannerImage', url)}
            data-testid="tournament-banner"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="tournament-points"
              label="Points per Game"
              options={POINTS_OPTIONS}
              disabled={!structureEditable}
              error={errors.pointsPerGame?.message}
              data-testid="tournament-points"
              {...register('pointsPerGame', { valueAsNumber: true })}
            />
            <Select
              id="tournament-best-of"
              label="Best of"
              options={BEST_OF_OPTIONS}
              disabled={!structureEditable}
              error={errors.bestOf?.message}
              data-testid="tournament-best-of"
              {...register('bestOf', { valueAsNumber: true })}
            />
          </div>
        </Card>

        <Card kitchenStrip className="p-6">
          <PrizeFields readOnly={!metaEditable} />
        </Card>

        <Card kitchenStrip className="p-6">
          <SponsorFields readOnly={fullyReadOnly} />
        </Card>

        {!fullyReadOnly && (
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              data-testid="tournament-submit"
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}
