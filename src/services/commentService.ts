import { supabase } from "@/lib/supabaseClient";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

/* ===============================
   ADD COMMENT / REPLY
================================= */
export const addComment = async (
  postId: string,
  content: string,
  parentId: string | null = null
) => {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user)
    throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: userData.user.id,
      content,
      parent_id: parentId,
    })
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    console.error("Insert error:", error);
    throw error;
  }

  // Optional safe counter increment
  try {
    await supabase.rpc("increment_comments_count", {
      post_id: postId,
    });
  } catch (e) {
    console.warn("Counter failed but comment saved");
  }

  return data;
};

/* ===============================
   GET COMMENTS
================================= */
export const getComments = async (postId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch comments error:", error);
    throw error;
  }

  return data;
};