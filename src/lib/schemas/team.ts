import { z } from 'zod'

export const teamSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, 'Name must be 2–40 characters')
    .max(40, 'Name must be 2–40 characters'),
  photo: z.string().optional(),
  playerIds: z.tuple([z.string(), z.string()]),
  createdAt: z.string(),
})

export const createTeamSchema = teamSchema.omit({ id: true, createdAt: true })

export type Team = z.infer<typeof teamSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
