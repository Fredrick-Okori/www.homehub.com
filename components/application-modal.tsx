"use client"

import type React from "react"

import { useState } from "react"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ApplicationModalProps {
  isOpen: boolean
  listingId: number | null
  listings: Array<{ id: number; title: string }>
  onClose: () => void
}

export function ApplicationModal({ isOpen, listingId, listings, onClose }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const listing = listings.find((l) => l.id === listingId)

  if (!isOpen || !listing) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ fullName: "", email: "", phone: "", message: "" })
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    if (!submitted) {
      setFormData({ fullName: "", email: "", phone: "", message: "" })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md mx-4 shadow-xl animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-300">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={handleClose}
            disabled={submitted}
            className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Apply Now</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{listing.title}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Phone</label>
                  <Input
                    type="tel"
                    placeholder="(555) 000-0000"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Message</label>
                  <textarea
                    placeholder="Tell us about your interest in this property..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 transition-all duration-200 active:scale-95"
                >
                  Submit Application
                </Button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center animate-in fade-in duration-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 animate-in scale-in-95 duration-300">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Application Sent!</h3>
              <p className="mt-2 text-sm text-muted-foreground">We{"'"}ll contact you soon about this property.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
