'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import type { CreateTournamentInput } from '@/types'

export function PrizeFields({ readOnly = false }: { readOnly?: boolean }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateTournamentInput>()

  const prizeErrors = errors.prizes as
    | { champion?: { message?: string }; runnerUp?: { message?: string }; thirdPlace?: { message?: string } }
    | undefined

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-net">Prize Money (₹ INR)</legend>

      <Controller
        control={control}
        name="prizes.champion"
        render={({ field }) => (
          <Input
            id="prize-champion"
            label="Champion (₹)"
            type="number"
            min={1}
            inputMode="numeric"
            readOnly={readOnly}
            error={prizeErrors?.champion?.message}
            data-testid="prize-champion"
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
        )}
      />

      <Controller
        control={control}
        name="prizes.runnerUp"
        render={({ field }) => (
          <Input
            id="prize-runner-up"
            label="Runner-up (₹)"
            type="number"
            min={1}
            inputMode="numeric"
            readOnly={readOnly}
            error={prizeErrors?.runnerUp?.message}
            data-testid="prize-runner-up"
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
        )}
      />

      <Controller
        control={control}
        name="prizes.thirdPlace"
        render={({ field }) => (
          <Input
            id="prize-third-place"
            label="3rd Place (₹)"
            type="number"
            min={1}
            inputMode="numeric"
            readOnly={readOnly}
            error={prizeErrors?.thirdPlace?.message}
            data-testid="prize-third-place"
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
        )}
      />
    </fieldset>
  )
}
