'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
})

export default function SetupPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      setupSchema.parse({ email, password, fullName })

      // Log the request parameters
      console.log('Sending request with:', {
        email,
        full_name: fullName,
        // Don't log the actual password
        hasPassword: !!password
      })

      const rpcResponse = await supabase
        .rpc('create_first_superadmin', {
          email,
          password,
          full_name: fullName,
        })

      // Log the full RPC response
      console.log('RPC Response:', JSON.stringify(rpcResponse, null, 2))

      if (rpcResponse.error) {
        console.error('RPC Error Details:', {
          message: rpcResponse.error.message,
          details: rpcResponse.error.details,
          hint: rpcResponse.error.hint,
          code: rpcResponse.error.code
        })
        setError(`Failed to create superadmin: ${rpcResponse.error.message || 'Unknown error'}`)
        return
      }

      // Sign in the superadmin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Sign In Error:', signInError)
        setError(signInError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Setup Error:', err)
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSetup} className="space-y-4 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">Setup Superadmin</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Create Superadmin Account
        </Button>
      </form>
    </div>
  )
} 