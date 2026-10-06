import { z } from 'zod'

export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be 2–50 characters').max(50, 'Name must be 2–50 characters'),
  age: z.number().int().min(5, 'Age must be between 5 and 99').max(99, 'Age must be between 5 and 99'),
  place: z.string().min(2, 'Place must be 2–50 characters').max(50, 'Place must be 2–50 characters'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Pro']).refine((v) => v !== undefined, { message: 'Select a level' }),
  photo: z.string().optional(),
  createdAt: z.string(),
})

export const createPlayerSchema = playerSchema.omit({ id: true, createdAt: true })

export type Player = z.infer<typeof playerSchema>
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
