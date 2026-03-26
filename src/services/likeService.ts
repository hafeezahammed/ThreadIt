import { supabase } from "@/lib/supabaseClient"

export const toggleLike = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if like exists
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    // JUST DELETE: The trigger in Step 2 will automatically decrease the count
    const { error } = await supabase.from("likes").delete().eq("id", existingLike.id);
    if (error) throw error;
    return "unliked";
  } else {
    // JUST INSERT: The trigger in Step 2 will automatically increase the count
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id 
    });
    if (error) throw error;
    return "liked";
  }
};