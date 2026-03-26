import { supabase } from '@/lib/supabaseClient'

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle() // Prevents crashing if the row doesn't exist yet

  if (error) throw error
  return data
}

export const updateProfile = async (updates: {
  full_name?: string
  bio?: string
  department?: string
  year_of_study?: string
  avatar_url?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // upsert acts as "Create if missing, Update if exists"
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}