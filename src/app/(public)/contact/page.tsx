'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Phone, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useContactStore } from '@/store/useContactStore'
import { createContactMessageSchema, SUBJECT_LABELS } from '@/lib/schemas/contact'
import type { CreateContactMessageInput } from '@/lib/schemas/contact'

const SUBJECT_OPTIONS = (Object.keys(SUBJECT_LABELS) as (keyof typeof SUBJECT_LABELS)[]).map(
  (k) => ({ value: k, label: SUBJECT_LABELS[k] }),
)

export default function ContactPage() {
  const searchParams = useSearchParams()
  const addMessage = useContactStore((s) => s.addMessage)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactMessageInput>({
    resolver: zodResolver(createContactMessageSchema),
    defaultValues: { subject: 'General', phone: '' },
  })

  const message = watch('message') ?? ''

  // Pre-select subject from ?subject= query param
  useEffect(() => {
    const subject = searchParams.get('subject')
    const validSubjects = Object.keys(SUBJECT_LABELS)
    if (subject && validSubjects.includes(subject)) {
      setValue('subject', subject as CreateContactMessageInput['subject'])
    }
  }, [searchParams, setValue])

  function onSubmit(data: CreateContactMessageInput) {
    addMessage(data)
    setSubmitted(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl text-net mb-2">Contact Us</h1>
      <p className="text-muted mb-8">Get in touch with the tournament organizer.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact form */}
        <div className="lg:col-span-2">
          <Card kitchenStrip className="p-6">
            {submitted ? (
              <div className="py-8 text-center" data-testid="contact-success">
                <p className="font-heading text-2xl text-court-green mb-2">
                  Thanks! Your message has been received.
                </p>
                <p className="text-sm text-muted">
                  We&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-court underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Input
                  id="contact-name"
                  label="Name"
                  error={errors.name?.message}
                  data-testid="contact-name"
                  {...register('name')}
                />
                <Input
                  id="contact-email"
                  type="email"
                  label="Email"
                  error={errors.email?.message}
                  data-testid="contact-email"
                  {...register('email')}
                />
                <Input
                  id="contact-phone"
                  type="tel"
                  label="Phone (optional)"
                  error={errors.phone?.message}
                  data-testid="contact-phone"
                  {...register('phone')}
                />
                <Select
                  id="contact-subject"
                  label="Subject"
                  options={SUBJECT_OPTIONS}
                  error={errors.subject?.message}
                  data-testid="contact-subject"
                  {...register('subject')}
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor="contact-message" className="text-sm font-medium text-net">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    aria-invalid={errors.message ? true : undefined}
                    data-testid="contact-message"
                    className="w-full rounded-lg border border-muted bg-surface px-3 py-2 text-net placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-court focus:border-court resize-none"
                    {...register('message')}
                  />
                  <div className="flex justify-between items-center">
                    {errors.message ? (
                      <p id="contact-message-error" className="text-xs text-danger" role="alert">
                        {errors.message.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted">{message.length}/1000</span>
                  </div>
                </div>

                <p className="text-xs text-muted">
                  Demo: messages are stored on this device only.
                </p>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="contact-submit"
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Contact info side panel */}
        <div>
          <Card className="bg-court text-line p-6 h-full border border-line/20">
            <h2 className="font-heading text-2xl text-line mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5 text-ball" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-line">Email</p>
                  <p className="text-sm text-line/70">organizer@pickleballscore.in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5 text-ball" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-line">Phone</p>
                  <p className="text-sm text-line/70">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-ball" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-line">Address</p>
                  <p className="text-sm text-line/70">
                    Pickleball Court,<br />
                    Sports Complex,<br />
                    Hyderabad, India
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
