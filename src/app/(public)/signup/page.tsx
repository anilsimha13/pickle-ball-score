'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { signupSchema, type SignupInput } from '@/lib/schemas/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  function onSubmit() {
    setSubmitted(true)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card kitchenStrip className="w-full max-w-sm p-8">
        <h1 className="font-heading text-3xl text-net mb-6">Sign Up</h1>
        {submitted ? (
          <div className="text-center py-4" data-testid="signup-notice">
            <p className="text-net">
              New registrations open soon. Please use the test account to explore.
            </p>
            <Link href="/login" className="mt-4 inline-block text-court hover:underline">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(() => onSubmit())} noValidate className="flex flex-col gap-4">
            <Input id="name" label="Full Name" {...register('name')} error={errors.name?.message} data-testid="signup-name" />
            <Input id="email" type="email" label="Email" {...register('email')} error={errors.email?.message} data-testid="signup-email" />
            <Input id="phone" type="tel" label="Phone" {...register('phone')} error={errors.phone?.message} data-testid="signup-phone" />
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                {...register('password')}
                error={errors.password?.message}
                data-testid="signup-password"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password" className="absolute right-3 top-8 text-muted hover:text-net">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                label="Confirm Password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                data-testid="signup-confirm-password"
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password" className="absolute right-3 top-8 text-muted hover:text-net">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" variant="primary" className="w-full" data-testid="signup-submit">
              Sign Up
            </Button>
          </form>
        )}
        <p className="mt-4 text-sm text-center text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-court hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  )
}
