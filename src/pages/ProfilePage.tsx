import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Award,
  BookOpen,
  Users,
  Bookmark,
  Camera,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { Megaphone, Trash2 } from "lucide-react";

const tabs = ["Posts",  "Saved", "Ads"];
const tabIcons = [BookOpen, Bookmark, Megaphone];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    "followers" | "following"
  >("followers");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
   const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [userAds, setUserAds] = useState<any[]>([]);
  

  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    bio: "",
    department: "",
    batch: "",
    location: "",
    website: "",
    avatar_url: "",
  });

  // ===============================
  // GET AUTH USER
  // ===============================
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id);
        await fetchUserPosts(currentUser.id);
        await fetchFollowStats(currentUser.id);
      }

      setLoading(false);
    };

    getUser();
  }, []);
   // ===============================
  // FETCH FOLLOW STATS
  // ===============================
  // ================= FETCH FOLLOW STATS =================
  const fetchFollowStats = async (userId: string) => {
    // Followers
    const { data: followers } = await supabase
      .from("follows")
      .select("profiles!follows_follower_id_fkey(*)")
      .eq("following_id", userId);

    // Following
    const { data: following } = await supabase
      .from("follows")
      .select("profiles!follows_following_id_fkey(*)")
      .eq("follower_id", userId);

    const followersProfiles =
      followers?.map((f: any) => f.profiles) || [];
    const followingProfiles =
      following?.map((f: any) => f.profiles) || [];

    setFollowersCount(followersProfiles.length);
    setFollowingCount(followingProfiles.length);

    setFollowersList(followersProfiles);
    setFollowingList(followingProfiles);
  };

  // ================= UNFOLLOW =================
  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;

    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);

    fetchFollowStats(user.id);
  };


 /* ========================= */
  /* FETCH PROFILE */
  /* ========================= */

  const fetchProfile = async (userId: string) => {

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!data) {

      await supabase.from("profiles").insert({
        id: userId,
        full_name: "User",
      });

      return fetchProfile(userId);
    }

    setProfile(data);
  };

  /* ========================= */
  /* FETCH USER POSTS */
  /* ========================= */

  const fetchUserPosts = async (userId: string) => {

    setPostsLoading(true);

    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setUserPosts(data || []);

    setPostsLoading(false);
  };

  /* ========================= */
  /* FETCH SAVED POSTS */
  /* ========================= */

  const fetchSavedPosts = async (userId: string) => {

    setPostsLoading(true);

    const { data } = await supabase
      .from("saved_posts")
      .select(`
        post_id,
        posts (
          *,
          profiles (*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const extracted = data?.map((item: any) => item.posts) || [];

    setSavedPosts(extracted);

    setPostsLoading(false);
  };

  /* ========================= */
  /* FETCH USER ADS */
  /* ========================= */

  const fetchUserAds = async (userId: string) => {

    const { data } = await supabase
      .from("ads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setUserAds(data || []);
  };

  /* ========================= */
  /* DELETE POST */
  /* ========================= */

  const handleDeletePost = async (postId: string) => {

    await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    setUserPosts(prev => prev.filter(p => p.id !== postId));
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
  };

  /* ========================= */
  /* DELETE AD */
  /* ========================= */

  const handleDeleteAd = async (adId: string) => {

    await supabase
      .from("ads")
      .delete()
      .eq("id", adId);

    setUserAds(prev => prev.filter(ad => ad.id !== adId));
  };


  // ===============================
  // TAB SWITCH
  // ===============================
 useEffect(() => {
  if (!user) return;

  if (activeTab === 0) {
    fetchUserPosts(user.id);
  }

  if (activeTab === 1) {
    fetchSavedPosts(user.id);
  }

  if (activeTab === 2) {
    fetchUserAds(user.id);
  }

}, [activeTab]);
  // ===============================
  // UPDATE PROFILE
  // ===============================
  const updateProfile = async () => {
    if (!user) return;

    await supabase.from("profiles").update(profile).eq("id", user.id);

    setIsEditModalOpen(false);
  };

  // ===============================
  // IMAGE UPLOAD
  // ===============================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        avatar_url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (loading)
    return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-8 min-h-screen">
      {/* ================= PROFILE CARD ================= */}
      <div className="relative group">
        <div className="glass-card overflow-hidden border-border/50 shadow-2xl">
          <div className="h-40 gradient-primary relative overflow-hidden" />

          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-[2rem] bg-card border-[6px] border-card shadow-xl flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary-hover flex items-center justify-center text-white">
                      {profile.full_name
                        ? profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "U"}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary font-semibold text-sm border shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            <h2 className="text-2xl font-bold">
              {profile.full_name || "User"}
            </h2>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {profile.department} · {profile.batch}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
              {profile.website && (
                <span className="flex items-center gap-1 text-primary">
                  <LinkIcon className="w-4 h-4" />
                  {profile.website}
                </span>
              )}
            </div>
            {/* FOLLOW STATS */}
       {/* FOLLOW STATS */}
        <div className="flex gap-10 mt-6 text-sm font-semibold">
          <button
            onClick={() => {
              setFollowModalType("followers");
              setIsFollowModalOpen(true);
            }}
          >
            <p>{followersCount}</p>
            <p className="text-muted-foreground text-xs">Followers</p>
          </button>

          <button
            onClick={() => {
              setFollowModalType("following");
              setIsFollowModalOpen(true);
            }}
          >
            <p>{followingCount}</p>
            <p className="text-muted-foreground text-xs">Following</p>
          </button>
        </div>
      </div>
       {/* FOLLOW MODAL */}
      <AnimatePresence>
        {isFollowModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFollowModalOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-md bg-card rounded-3xl p-6"
            >
              <h2 className="text-lg font-bold mb-4 capitalize">
                {followModalType}
              </h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(followModalType === "followers"
                  ? followersList
                  : followingList
                ).map((person: any) => (
                  <div
                    key={person.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {person.full_name?.charAt(0)}
                      </div>
                      <span>{person.full_name}</span>
                    </div>

                    {followModalType === "following" && (
                      <button
                        onClick={() =>
                          handleUnfollow(person.id)
                        }
                        className="text-xs px-3 py-1 bg-muted rounded-full"
                      >
                        Unfollow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b pb-4">
        {tabs.map((tab, i) => {
          const Icon = tabIcons[i];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                activeTab === i
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab}
            </button>
          );
        })}
      </div>

      {/* POSTS TAB */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {postsLoading ? (
            <p className="text-center">Loading posts...</p>
          ) : userPosts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No posts yet.
            </p>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>
      )}

      {/* SAVED TAB */}

      {activeTab === 1 && (

        <div className="space-y-6">

          {postsLoading ? (
            <p className="text-center">Loading saved posts...</p>
          ) : savedPosts.length === 0 ? (
            <p className="text-center text-muted-foreground">No saved posts.</p>
          ) : (
            savedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
              />
            ))
          )}

        </div>
      )}


      {/* ADS TAB */}
{activeTab === 4 && (
  <div className="space-y-6">

    {userAds.length === 0 ? (
      <p className="text-center text-muted-foreground">
        No ads posted yet.
      </p>
    ) : (
      userAds.map((ad) => (
        <div
          key={ad.id}
          className="border rounded-2xl p-4 space-y-3"
        >

          {ad.image_url && (
            <img
              src={ad.image_url}
              className="w-full h-56 object-cover rounded-xl"
            />
          )}

          <h3 className="font-bold text-lg">{ad.headline}</h3>

          <p className="text-sm text-muted-foreground">
            {ad.content}
          </p>

          <div className="flex justify-between items-center">

            <span className="text-xs text-muted-foreground">
              {ad.organization_name}
            </span>

            <button
              onClick={() => handleDeleteAd(ad.id)}
              className="flex items-center gap-1 text-red-500 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

          </div>

        </div>
      ))
    )}

  </div>
)}

      
       {/* ================= EDIT MODAL ================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-xl bg-card rounded-3xl p-8"
            >
              <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

              <div className="space-y-4">
                <input
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Bio"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({ ...profile, department: e.target.value })
                  }
                  placeholder="Department"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={profile.batch}
                  onChange={(e) =>
                    setProfile({ ...profile, batch: e.target.value })
                  }
                  placeholder="Batch"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  placeholder="Location"
                  className="w-full border rounded-xl p-3"
                />

                <input
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                  placeholder="Website"
                  className="w-full border rounded-xl p-3"
                />

                <div>
                  <button
                    onClick={triggerFileInput}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Change Avatar
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  className="bg-primary text-white px-6 py-2 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
       
    </div>
  );
};

export default ProfilePage;