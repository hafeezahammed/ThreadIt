import { supabase } from "@/lib/supabaseClient";

// =====================================
// TYPES
// =====================================
export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  link: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
}

// =====================================
// CREATE POST
// =====================================
export const createPost = async (
  content: string,
  image_url?: string | null,
  link?: string | null
) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        user_id: userData.user.id,
        content,
        image_url: image_url || null,
        link: link || null,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// =====================================
// IMAGE UPLOAD
// =====================================
export const uploadPostImage = async (file: File) => {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file);

  if (error) {
    console.error("Storage Error:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("post-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// =====================================
// GET ALL POSTS (FIXED 🚀)
// =====================================
export const getAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*") // ✅ FIX: no profiles join
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Post[];
};

// =====================================
// DELETE POST
// =====================================
export const deletePost = async (postId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userData.user.id);

  if (error) throw error;
};

// =====================================
// LIKE POST
// =====================================
export const toggleLikePost = async (postId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const userId = userData.user.id;

  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingLike) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    await supabase.rpc("decrement_likes_count", { post_id: postId });
  } else {
    await supabase.from("likes").insert([
      {
        post_id: postId,
        user_id: userId,
      },
    ]);

    await supabase.rpc("increment_likes_count", { post_id: postId });
  }
};