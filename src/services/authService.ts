import { supabase } from '@/lib/supabaseClient'

/**
 * Sign Up User
 * - Creates user in Supabase Auth
 * - Profile is automatically created via DB trigger
 */
export const signUp = async (
  email: string,
  password: string,
  fullName: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Used by DB trigger
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign In User
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign Out User
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get Current Logged-In User
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}