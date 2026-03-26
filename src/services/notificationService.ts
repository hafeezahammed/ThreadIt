import { supabase } from "@/lib/supabaseClient";

export const getNotifications = async () => {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
};

export const markNotificationRead = async (id: string) => {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
};