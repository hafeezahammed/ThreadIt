import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/feed/PostCard";

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // =============================
  // GET CURRENT USER
  // =============================
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  // =============================
  // FETCH PROFILE
  // =============================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, [id]);

  // =============================
  // FETCH POSTS
  // =============================
  useEffect(() => {
    const fetchPosts = async () => {
      if (!id) return;

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    fetchPosts();
  }, [id]);

  // =============================
  // FETCH FOLLOW STATUS + COUNT
  // =============================
  useEffect(() => {
    const fetchFollowData = async () => {
      if (!id) return;

      // Followers count
      const { data: followers } = await supabase
        .from("follows")
        .select("id")
        .eq("following_id", id);

      setFollowersCount(followers?.length || 0);

      // Check if current user follows this profile
      if (currentUserId) {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", id)
          .maybeSingle();

        setIsFollowing(!!data);
      }

      setLoading(false);
    };

    fetchFollowData();
  }, [id, currentUserId]);

  // =============================
  // FOLLOW / UNFOLLOW
  // =============================
  const handleFollow = async () => {
    if (!currentUserId || !id) return;

    if (isFollowing) {
      // Optimistic UI
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);

      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", id);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);

      await supabase.from("follows").insert([
        {
          follower_id: currentUserId,
          following_id: id,
        },
      ]);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      {/* ================= PROFILE HEADER ================= */}
      <div className="bg-card rounded-3xl p-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              profile.full_name?.charAt(0) || "U"
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            <p className="text-muted-foreground text-sm">
              {profile.bio || "No bio yet"}
            </p>

            <p className="text-sm mt-2 font-medium">
              {followersCount} Followers
            </p>
          </div>
        </div>

        {/* FOLLOW BUTTON */}
        {currentUserId !== id && (
          <button
            onClick={handleFollow}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              isFollowing
                ? "bg-muted text-foreground"
                : "bg-primary text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* ================= POSTS ================= */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No posts yet.
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PublicProfile;