import { useState } from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { LoginFormData, AuthError } from "@/types/auth.types"

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const login = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw signInError
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "An error occurred during login"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
    error,
  }
} 