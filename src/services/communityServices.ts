import { supabase } from "@/lib/supabaseClient"

/* ------------------------------------------------ */
/* ---------------- Get Communities ---------------- */
/* ------------------------------------------------ */

export const getCommunities = async () => {

  const { data, error } = await supabase
    .from("communities")
    .select(`
      id,
      name,
      description,
      category,
      creator_id,
      status,
      created_at
    `)
    .eq("status", "approved") // only approved communities visible
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching communities:", error)
    throw error
  }

  return data || []
}

/* ------------------------------------------------ */
/* ---------------- Create Community --------------- */
/* ------------------------------------------------ */

export const createCommunity = async (
  name: string,
  description: string,
  category: string
) => {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("communities")
    .insert({
      name,
      description,
      category,
      creator_id: user.id,   // ✅ FIXED
      status: "pending"
    })
    .select()
    .single()

  if (error) {
    console.error("❌ CREATE ERROR:", error)
    alert(error.message)
    throw error
  }

  return data
}


/* ------------------------------------------------ */
/* ---------------- Join Community ----------------- */
/* ------------------------------------------------ */

export const joinCommunity = async (communityId: string) => {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not logged in")

  const { error } = await supabase
    .from("community_members")
    .upsert({
      community_id: communityId,
      user_id: user.id
    })

  if (error) {
    console.error("❌ Error joining community:", error)
    throw error
  }

  return true
}


/* ------------------------------------------------ */
/* -------- Get Pending Communities (Admin) -------- */
/* ------------------------------------------------ */

export const getPendingCommunities = async () => {

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("❌ Error fetching pending communities:", error)
    throw error
  }

  return data || []
}


/* ------------------------------------------------ */
/* --------------- Approve Community --------------- */
/* ------------------------------------------------ */

export const approveCommunity = async (communityId: string) => {

  const { error } = await supabase
    .from("communities")
    .update({ status: "approved" })
    .eq("id", communityId)

  if (error) {
    console.error("❌ Error approving community:", error)
    throw error
  }

  return true
}


/* ------------------------------------------------ */
/* ---------------- Get Messages ------------------- */
/* ------------------------------------------------ */

export const getCommunityMessages = async (communityId: string) => {

  const { data, error } = await supabase
    .from("community_messages")
    .select(`
      id,
      message,
      created_at,
      sender_id,
      profiles!community_messages_sender_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("community_id", communityId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("❌ Error fetching messages:", error)
    throw error
  }

  return data || []
}


/* ------------------------------------------------ */
/* ---------------- Send Message ------------------- */
/* ------------------------------------------------ */

export const sendCommunityMessage = async (
  communityId: string,
  message: string
) => {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not logged in")

  const { data, error } = await supabase
    .from("community_messages")
    .insert({
      community_id: communityId,
      sender_id: user.id,
      message
    })
    .select()
    .single()

  if (error) {
    console.error("❌ Error sending message:", error)
    throw error
  }

  return data
}