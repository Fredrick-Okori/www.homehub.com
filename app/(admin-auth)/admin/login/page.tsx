"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - replace with real API
    if (email === "admin@homehub.com" && password === "admin123") {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password. Try admin@homehub.com / admin123")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
              <Home className="h-5 w-5 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">
              Home<span className="text-zinc-400">Hub</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-zinc-400">Admin Dashboard Login</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@homehub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-600 bg-zinc-800"
                  />
                  Remember me
                </label>
                <Link href="#" className="text-sm text-zinc-400 hover:text-white">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="w-full h-11 bg-white text-black hover:bg-zinc-200" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link
                href="/"
                className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 rounded-lg bg-zinc-800">
              <p className="text-xs text-zinc-400 text-center">
                <strong className="text-zinc-300">Demo Credentials:</strong>
                <br />
                Email: admin@homehub.com
                <br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          © 2024 HomeHub. All rights reserved.
        </p>
      </div>
    </div>
  )
}

