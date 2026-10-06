import { z } from 'zod'

export const SUBJECT_LABELS = {
  General: 'General',
  TournamentEnquiry: 'Tournament Enquiry',
  Sponsorship: 'Sponsorship',
  Support: 'Support',
} as const

export const contactMessageSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be 2–50 characters').max(50, 'Name must be 2–50 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  subject: z.enum(['General', 'TournamentEnquiry', 'Sponsorship', 'Support'], {
    message: 'Select a subject',
  }),
  message: z
    .string()
    .min(10, 'Message must be 10–1000 characters')
    .max(1000, 'Message must be 10–1000 characters'),
  read: z.boolean(),
  createdAt: z.string(),
})

export const createContactMessageSchema = contactMessageSchema.omit({
  id: true,
  read: true,
  createdAt: true,
})

export type ContactMessage = z.infer<typeof contactMessageSchema>
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>
