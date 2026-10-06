import { z } from 'zod'
import { sponsorSchema } from './sponsor'

export const prizesSchema = z
  .object({
    champion: z.number().int().min(1, 'Prize must be at least ₹1').max(10000000),
    runnerUp: z.number().int().min(1, 'Prize must be at least ₹1').max(10000000),
    thirdPlace: z.number().int().min(1, 'Prize must be at least ₹1').max(10000000),
  })
  .refine((d) => d.champion >= d.runnerUp, {
    message: "Runner-up prize can't exceed the Champion prize",
    path: ['runnerUp'],
  })
  .refine((d) => d.runnerUp >= d.thirdPlace, {
    message: "3rd Place prize can't exceed the Runner-up prize",
    path: ['thirdPlace'],
  })

export const matchSchema = z.object({
  id: z.string(),
  round: z.number().int(),
  position: z.number().int(),
  type: z.enum(['Knockout', 'ThirdPlace']),
  isBye: z.boolean(),
  isWalkover: z.boolean(),
  teamAId: z.string().nullable(),
  teamBId: z.string().nullable(),
  games: z.array(z.object({ teamA: z.number(), teamB: z.number() })),
  winnerId: z.string().optional(),
  status: z.enum(['Scheduled', 'Live', 'Completed']),
})

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be 3–80 characters').max(80, 'Name must be 3–80 characters'),
  bannerImage: z.string().optional(),
  venue: z.string().min(2, 'Venue must be 2–100 characters').max(100, 'Venue must be 2–100 characters'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  pointsPerGame: z.union([z.literal(11), z.literal(15), z.literal(21)]),
  bestOf: z.union([z.literal(1), z.literal(3)]),
  prizes: prizesSchema,
  sponsors: z.array(sponsorSchema).max(20),
  teamIds: z.array(z.string()),
  status: z.enum(['Draft', 'Drawn', 'InProgress', 'Completed', 'Announced']),
  matches: z.array(matchSchema),
  results: z
    .object({
      championId: z.string(),
      runnerUpId: z.string(),
      thirdPlaceId: z.string(),
      announcedAt: z.string(),
    })
    .optional(),
  createdAt: z.string(),
})

export const createTournamentSchema = tournamentSchema
  .omit({ id: true, createdAt: true, matches: true, results: true, status: true })
  .extend({
    sponsors: z.array(sponsorSchema).max(20),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date can't be before the start date",
    path: ['endDate'],
  })

export type Prizes = z.infer<typeof prizesSchema>
export type Match = z.infer<typeof matchSchema>
export type Tournament = z.infer<typeof tournamentSchema>
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
