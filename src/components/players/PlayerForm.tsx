'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPlayerSchema, type CreatePlayerInput } from '@/lib/schemas/player'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LevelSelect } from './LevelSelect'

interface PlayerFormProps {
  defaultValues?: Partial<CreatePlayerInput>
  onSubmit: (data: CreatePlayerInput) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
}

export function PlayerForm({ defaultValues, onSubmit, submitLabel = 'Save Player', isSubmitting }: PlayerFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: defaultValues ?? { level: 'Beginner' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        id="player-name"
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        data-testid="player-name"
      />
      <Input
        id="player-age"
        type="number"
        label="Age"
        {...register('age', { valueAsNumber: true })}
        error={errors.age?.message}
        data-testid="player-age"
        inputMode="numeric"
        min={5}
        max={99}
      />
      <Input
        id="player-place"
        label="Place"
        {...register('place')}
        error={errors.place?.message}
        data-testid="player-place"
      />
      <LevelSelect
        id="player-level"
        {...register('level')}
        error={errors.level?.message}
        data-testid="player-level-select"
      />
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <ImageUpload
            value={field.value}
            onChange={field.onChange}
            maxPx={800}
            label="Photo (optional)"
            data-testid="player-photo"
          />
        )}
      />
      <Button type="submit" variant="primary" disabled={isSubmitting} data-testid="player-submit">
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
