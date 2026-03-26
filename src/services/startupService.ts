import { supabase } from "@/lib/supabaseClient"

export const createStartup = async (
  startupName: string,
  description: string,
  websiteUrl: string
) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("startups").insert([
    {
      owner_id: userData.user.id,
      startup_name: startupName,
      description,
      website_url: websiteUrl
    }
  ])

  if (error) throw error
  return data
}

export const getStartups = async () => {
  const { data, error } = await supabase
    .from("startups")
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}