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
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
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
// IMAGE UPLOAD (SUPABASE STORAGE)
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
// GET ALL POSTS (WITH PROFILE JOIN)
// =====================================
export const getAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      )
    `
    )
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
// LIKE POST + CREATE NOTIFICATION
// =====================================
export const toggleLikePost = async (postId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const userId = userData.user.id;

  // Get post owner
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  const postOwnerId = post?.user_id;

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingLike) {
    // Unlike
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    await supabase.rpc("decrement_likes_count", { post_id: postId });

  } else {
    // Like
    await supabase.from("likes").insert([
      {
        post_id: postId,
        user_id: userId,
      },
    ]);

    await supabase.rpc("increment_likes_count", { post_id: postId });

    // 🔔 CREATE NOTIFICATION
    if (postOwnerId && postOwnerId !== userId) {
      await supabase.from("notifications").insert([
        {
          user_id: postOwnerId,
          actor_id: userId,
          type: "like",
          message: "Someone liked your post",
          post_id: postId,
        },
      ]);
    }
  }
};

// =====================================
// INCREMENT SHARE COUNT
// =====================================
export const incrementShareCount = async (postId: string) => {
  const { error } = await supabase.rpc("increment_shares_count", {
    post_id: postId,
  });

  if (error) throw error;
};