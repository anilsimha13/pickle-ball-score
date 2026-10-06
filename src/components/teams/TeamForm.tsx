'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTeamSchema, type CreateTeamInput } from '@/lib/schemas/team'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { PlayerPicker, type PendingPlayer } from '@/components/players/PlayerPicker'
import { usePlayerStore } from '@/store/usePlayerStore'

interface TeamFormProps {
  defaultValues?: Partial<CreateTeamInput>
  onSubmit: (data: CreateTeamInput) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
  lockPlayers?: boolean
}

export function TeamForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Team',
  isSubmitting,
  lockPlayers = false,
}: TeamFormProps) {
  const { addPlayer } = usePlayerStore()
  const [pending1, setPending1] = useState<PendingPlayer | null>(null)
  const [pending2, setPending2] = useState<PendingPlayer | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: defaultValues ?? { playerIds: ['' as string, '' as string] },
  })

  const player1Id = watch('playerIds.0')
  const player2Id = watch('playerIds.1')

  async function handleFormSubmit(data: CreateTeamInput) {
    if (data.playerIds[0] === data.playerIds[1]) {
      setError('playerIds', { message: 'Pick two different players' })
      return
    }
    // Commit pending (inline-created) players before submitting
    let finalP1 = data.playerIds[0]
    let finalP2 = data.playerIds[1]
    try {
      if (pending1 && finalP1 === pending1.tempId) {
        const saved = addPlayer(pending1.input)
        finalP1 = saved.id
      }
      if (pending2 && finalP2 === pending2.tempId) {
        const saved = addPlayer(pending2.input)
        finalP2 = saved.id
      }
      await onSubmit({ ...data, playerIds: [finalP1, finalP2] })
    } catch (err) {
      throw err
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        id="team-name"
        label="Team Name"
        {...register('name')}
        error={errors.name?.message}
        data-testid="team-name"
      />
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value}
            onChange={field.onChange}
            maxPx={800}
            label="Team Photo (optional)"
            data-testid="team-photo"
          />
        )}
      />
      <Controller
        name="playerIds.0"
        control={control}
        render={({ field }) =>
          lockPlayers ? (
            <div>
              <p className="text-sm font-medium text-net mb-1">Player 1</p>
              <p className="text-sm text-muted italic">Locked — team is in a drawn tournament.</p>
            </div>
          ) : (
            <PlayerPicker
              value={field.value || null}
              onChange={(id, pending) => {
                field.onChange(id)
                setPending1(pending ?? null)
              }}
              excludeId={player2Id || undefined}
              label="Player 1"
              error={errors.playerIds?.[0]?.message ?? (errors.playerIds as { message?: string } | undefined)?.message}
              data-testid="team-player1"
            />
          )
        }
      />
      <Controller
        name="playerIds.1"
        control={control}
        render={({ field }) =>
          lockPlayers ? (
            <div>
              <p className="text-sm font-medium text-net mb-1">Player 2</p>
              <p className="text-sm text-muted italic">Locked — team is in a drawn tournament.</p>
            </div>
          ) : (
            <PlayerPicker
              value={field.value || null}
              onChange={(id, pending) => {
                field.onChange(id)
                setPending2(pending ?? null)
              }}
              excludeId={player1Id || undefined}
              label="Player 2"
              error={errors.playerIds?.[1]?.message}
              data-testid="team-player2"
            />
          )
        }
      />
      <Button type="submit" variant="primary" disabled={isSubmitting} data-testid="team-submit">
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
