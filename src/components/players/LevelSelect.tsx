import { forwardRef } from 'react'
import { Select } from '@/components/ui/Select'

const LEVEL_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Pro', label: 'Pro' },
]

interface LevelSelectProps {
  id?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  error?: string
  'data-testid'?: string
  name?: string
}

export const LevelSelect = forwardRef<HTMLSelectElement, LevelSelectProps>(
  ({ id, error, 'data-testid': testId, ...props }, ref) => (
    <Select
      ref={ref}
      id={id}
      label="Level"
      options={LEVEL_OPTIONS}
      placeholder="Select a level"
      error={error}
      data-testid={testId ?? 'player-level'}
      {...props}
    />
  ),
)

LevelSelect.displayName = 'LevelSelect'
