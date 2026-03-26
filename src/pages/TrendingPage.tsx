import { useState, useEffect, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { cn } from "@/lib/utils";
import { getAllPosts, deletePost, Post } from "@/services/postService";

const tabs = ["Today", "This Week", "This Month", "By Community"];

const TrendingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH POSTS ================= */

  const loadPosts = async () => {
    try {
      const data = await getAllPosts();
      setPosts(data || []);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ================= TIME FILTER ================= */

  const filteredPosts = useMemo(() => {
    const now = new Date();

    // TODAY = last 24 hours
    if (activeTab === 0) {
      return posts.filter((p) => {
        const postDate = new Date(p.created_at);
        const diffHours =
          (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

        return diffHours <= 24;
      });
    }

    // THIS WEEK = last 7 days
    if (activeTab === 1) {
      return posts.filter((p) => {
        const postDate = new Date(p.created_at);
        const diffDays =
          (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays <= 7;
      });
    }

    // THIS MONTH = last 30 days
    if (activeTab === 2) {
      return posts.filter((p) => {
        const postDate = new Date(p.created_at);
        const diffDays =
          (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);

        return diffDays <= 30;
      });
    }

    // BY COMMUNITY (for future feature)
    return posts;
  }, [posts, activeTab]);

  /* ================= TRENDING SCORE ================= */

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const scoreA =
        (a.likes_count || 0) * 3 +
        (a.comments_count || 0) * 2 +
        (a.shares_count || 0);

      const scoreB =
        (b.likes_count || 0) * 3 +
        (b.comments_count || 0) * 2 +
        (b.shares_count || 0);

      return scoreB - scoreA;
    });
  }, [filteredPosts]);

  /* ================= FALLBACK (avoid empty feed) ================= */

  const displayPosts =
    sortedPosts.length === 0 ? posts : sortedPosts;

  /* ================= UI ================= */

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h1 className="font-bold text-2xl text-foreground">
          Trending
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              i === activeTab
                ? "gradient-primary text-primary-foreground shadow-glow"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading && (
          <p className="text-center text-muted-foreground">
            Loading posts...
          </p>
        )}

        {!loading && displayPosts.length === 0 && (
          <p className="text-center text-muted-foreground">
            No posts available.
          </p>
        )}

        {displayPosts.map((post, index) => (
          <div key={post.id}>
            {/* Top 3 badges */}
            {index < 3 && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-lg",
                    index === 0
                      ? "bg-warning/10 text-warning"
                      : index === 1
                      ? "bg-info/10 text-info"
                      : "bg-success/10 text-success"
                  )}
                >
                  {index === 0 && "🔥 Trending #1"}
                  {index === 1 && "🚀 Rising"}
                  {index === 2 && "⭐ Most Helpful"}
                </span>
              </div>
            )}

            <PostCard post={post} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPage;