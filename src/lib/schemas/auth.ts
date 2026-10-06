import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be 2–50 characters').max(50, 'Name must be 2–50 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    password: z
      .string()
      .min(8, 'Use 8+ characters with upper & lower case, a number and a symbol')
      .regex(/[A-Z]/, 'Use 8+ characters with upper & lower case, a number and a symbol')
      .regex(/[a-z]/, 'Use 8+ characters with upper & lower case, a number and a symbol')
      .regex(/[0-9]/, 'Use 8+ characters with upper & lower case, a number and a symbol')
      .regex(/[^A-Za-z0-9]/, 'Use 8+ characters with upper & lower case, a number and a symbol'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
