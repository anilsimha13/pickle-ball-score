import { z } from 'zod'

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Sponsor name must be 2–60 characters').max(60, 'Sponsor name must be 2–60 characters'),
  logo: z.string().optional(),
  website: z
    .string()
    .url('Enter a valid website URL')
    .optional()
    .or(z.literal('')),
  tier: z.enum(['Title', 'Gold', 'Silver']),
})

export type Sponsor = z.infer<typeof sponsorSchema>
