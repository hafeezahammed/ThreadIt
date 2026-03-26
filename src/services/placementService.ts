import { supabase } from "@/lib/supabaseClient"

export const createPlacement = async (
  companyName: string,
  jobRole: string,
  eligibility: string,
  deadline: string
) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("placements").insert([
    {
      posted_by: userData.user.id,
      company_name: companyName,
      job_role: jobRole,
      eligibility,
      deadline
    }
  ])

  if (error) throw error
  return data
}

export const getPlacements = async () => {
  const { data, error } = await supabase
    .from("placements")
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