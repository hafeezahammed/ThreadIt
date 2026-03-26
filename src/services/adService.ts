import { supabase } from "@/lib/supabaseClient"

/* ------------------------------------------------ */
/* Upload Ad Image */
/* ------------------------------------------------ */

export const uploadAdImage = async (file: File) => {

  const fileExt = file.name.split(".").pop()

  const fileName = `${Math.random()
    .toString(36)
    .substring(2)}-${Date.now()}.${fileExt}`

  const filePath = `ad-images/${fileName}`

  const { error } = await supabase.storage
    .from("ads")
    .upload(filePath, file)

  if (error) {
    console.error("Upload Error:", error)
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data } = supabase.storage
    .from("ads")
    .getPublicUrl(filePath)

  return data.publicUrl
}

/* ------------------------------------------------ */
/* Create Ad */
/* ------------------------------------------------ */

export const createAd = async (
  imageFile: File,
  adDetails: {
    headline: string
    content: string
    organizationName: string
    externalLink?: string
    phoneNumber?: string
    email?: string
    startDate?: string
    endDate?: string
  }
) => {

  /* Get authenticated user */

  const { data: { session } } = await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()

  const currentUser = user || session?.user

  if (!currentUser) {
    throw new Error("Authentication required. Please log in again.")
  }

  /* Upload image */

  const imageUrl = await uploadAdImage(imageFile)

  /* Insert ad */

  const { data, error } = await supabase
    .from("ads")
    .insert([
      {
        user_id: currentUser.id,
        image_url: imageUrl,
        headline: adDetails.headline,
        content: adDetails.content,
        organization_name: adDetails.organizationName,
        external_link: adDetails.externalLink || null,
        phone_number: adDetails.phoneNumber || null,
        email: adDetails.email || null,
        start_date: adDetails.startDate || null,
        end_date: adDetails.endDate || null,
        is_approved: false
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Database Insert Error:", error)
    throw new Error(`Failed to create ad record: ${error.message}`)
  }

  return data
}

/* ------------------------------------------------ */
/* Get Approved Ads */
/* ------------------------------------------------ */

export const getApprovedAds = async () => {

  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("is_approved", true)
    .lte("start_date", today)   // ad already started
    .gte("end_date", today)     // ad not expired
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fetch Ads Error:", error)
    throw error
  }

  return data
}