'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
import { login, safeRedirect } from '@/lib/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSession } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const result = login(data.email, data.password, data.rememberMe ?? false)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setSession(result.session)
    const redirect = searchParams.get('redirect')
    router.push(safeRedirect(redirect))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card kitchenStrip className="w-full max-w-sm p-8">
        <h1 className="font-heading text-3xl text-net mb-6">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            data-testid="login-email"
          />
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
              data-testid="login-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-8 text-muted hover:text-net"
              data-testid="login-toggle-password"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-net cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-muted text-court focus:ring-court"
              data-testid="login-remember"
            />
            Remember me (30 days)
          </label>
          {serverError && (
            <p className="text-sm text-danger" role="alert" data-testid="login-error">
              {serverError}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
            data-testid="login-submit"
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-court hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
