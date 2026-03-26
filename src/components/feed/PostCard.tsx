import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Share2,
  Bookmark,
  ArrowBigUp,
  Trash2,
  X,
  Send,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/services/likeService";
import { addComment, getComments } from "@/services/commentService";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: any;
  onDelete: (postId: string) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  const handleLike = async () => {
    try {
      const result = await toggleLike(post.id);
      setLiked(result === "liked");
      setLikeCount(prev => (result === "liked" ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  const loadComments = async () => {
    const data = await getComments(post.id);
    setComments(data);
  };

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const inserted = await addComment(post.id, newComment, replyTo);
    setComments(prev => [...prev, inserted]);
    setNewComment("");
    setReplyTo(null);
  };
   /* =============================== */
  /* LOAD USER + CHECK SAVED */
  /* =============================== */

  useEffect(() => {

    const init = async () => {

      const { data } = await supabase.auth.getUser();

      const userId = data.user?.id || null;

      setCurrentUserId(userId);

      if (userId) {
        checkSaved(userId);
      }

    };

    init();

  }, []);

  const checkSaved = async (userId: string) => {

    const { data } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", post.id)
      .maybeSingle();

    if (data) setSaved(true);

  };

  /* =============================== */
  /* SAVE / UNSAVE */
  /* =============================== */

  const toggleSavePost = async () => {

    if (!currentUserId) return;

    try {

      if (saved) {

        await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);

        setSaved(false);

      } else {

        await supabase
          .from("saved_posts")
          .insert({
            user_id: currentUserId,
            post_id: post.id
          });

        setSaved(true);

      }

    } catch (error) {
      console.error("Save post error:", error);
    }

  };


  return (
    <div className="relative group">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-5 shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20"
      >
        {/* TOP DECORATIVE GRADIENT */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/profile/${post.user_id}`)}
              className="relative p-[2px] rounded-full bg-gradient-to-tr from-primary to-orange-500 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-background border-2 border-background overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary bg-primary/5 text-lg">
                    {post.profiles?.full_name?.charAt(0)}
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <h4 
                onClick={() => navigate(`/profile/${post.user_id}`)}
                className="font-bold text-[15px] tracking-tight cursor-pointer hover:text-primary transition-colors"
              >
                {post.profiles?.full_name}
              </h4>
              <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUserId === post.user_id && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(post.id)}
                className="p-2 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
            <button className="p-2 text-muted-foreground/50 hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* POST CONTENT */}
        <div className="px-1">
          <p className="text-[16px] text-foreground/80 leading-relaxed mb-4 font-medium">
            {post.content}
          </p>

          {post.image_url && (
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative rounded-[1.8rem] overflow-hidden border border-white/5 shadow-inner"
            >
              <img
                src={post.image_url}
                className="w-full object-cover max-h-[450px] hover:scale-105 transition-transform duration-700"
                alt="post content"
              />
            </motion.div>
          )}
        </div>

        {/* INTERACTION BAR */}
        <div className="flex items-center justify-between mt-6 px-1">
          <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-md p-1.5 rounded-full border border-white/5">
            {/* LIKE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                liked ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground"
              )}
            >
              <ArrowBigUp className={cn("w-5 h-5", liked && "fill-current")} />
              <span className="text-xs font-bold">{likeCount}</span>
            </motion.button>

            {/* COMMENT BUTTON */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 text-muted-foreground transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-bold">{post.comments_count || 0}</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              className="p-3 rounded-full hover:bg-secondary/50 text-muted-foreground"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            
             <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={toggleSavePost}
              className={cn(
                "p-3 rounded-full transition-all",
                saved
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Bookmark className={cn("w-5 h-5", saved && "fill-current")} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* REFINED COMMENT DRAWER */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-card border-t border-white/10 rounded-t-[3rem] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="w-12 h-1.5 bg-muted/50 mx-auto mt-4 rounded-full" />
              
              <div className="flex justify-between items-center px-8 py-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Discussions</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                    {comments.length} Thoughts
                  </p>
                </div>
                <button onClick={() => setShowComments(false)} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-32">
                {comments.map((comment) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={comment.id} className="group/item">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center font-bold text-primary border border-primary/20">
                        {comment.profiles?.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-secondary/40 p-4 rounded-2xl rounded-tl-none border border-white/5">
                          <p className="text-sm font-bold mb-1">{comment.profiles?.full_name}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                        </div>
                        <button onClick={() => setReplyTo(comment.id)} className="text-[11px] font-bold text-muted-foreground hover:text-primary mt-2 ml-1 transition-colors">
                          REPLY
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* INPUT BAR */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-card via-card to-transparent">
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-secondary/80 backdrop-blur-md border border-white/10 p-2 pl-5 rounded-full shadow-xl">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? "Write a reply..." : "Add to the discussion..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-muted-foreground/60"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-primary text-primary-foreground p-3 rounded-full disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;