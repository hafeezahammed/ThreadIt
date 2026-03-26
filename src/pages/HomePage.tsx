import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Send, Sparkles, Plus, AlignLeft, 
  Image as ImageIcon, Link as LinkIcon, Loader2 
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import TrendingSidebar from "@/components/feed/TrendingSidebar";
import ClickSpark from '@/components/ClickSpark';
import { cn } from "@/lib/utils";
import { 
  getAllPosts, createPost, deletePost, uploadPostImage, type Post 
} from "@/services/postService";


const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const data = await getAllPosts();
      setPosts(data || []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let uploadedImageUrl = null;

      // 1. Handle Image Upload if exists
      if (imageFile) {
        uploadedImageUrl = await uploadPostImage(imageFile);
      }

      // 2. Create the post in Database
      // Matches service: createPost(content, image_url, link)
      await createPost(content, uploadedImageUrl, link || null);

      // 3. Reset UI State
      setContent("");
      setLink("");
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
      
      // 4. Refresh Feed
      await fetchPosts();
      
    } catch (error: any) {
      console.error("Post failed details:", error);
      // Detailed error reporting for debugging
      const errorMsg = error.message || "Unknown error";
      if (errorMsg.includes("row-level security")) {
        alert("Permission Denied: Please check your Supabase RLS policies for the 'posts' table.");
      } else if (errorMsg.includes("Bucket not found")) {
        alert("Storage Error: Ensure you have created a public bucket named 'post-images' in Supabase.");
      } else {
        alert(`Failed to post: ${errorMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Optimistic Update: Remove from UI immediately
    const previousPosts = [...posts];
    setPosts(posts.filter(p => p.id !== postId));

    try {
      await deletePost(postId);
    } catch (err) {
      console.error("Delete failed:", err);
      setPosts(previousPosts); // Rollback if server fails
      alert("Could not delete post. Check your RLS policies.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background/50 relative">
      <div className="flex-1 max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative flex items-center bg-card border border-border/50 rounded-2xl px-4 shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search posts..." 
            className="w-full h-12 pl-3 bg-transparent outline-none text-sm" 
          />
        </div>

        {/* Feed Area */}
        <div className="space-y-4 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <p className="text-muted-foreground text-sm">Loading campus feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl opacity-50 italic text-muted-foreground">
              No posts found. Start the conversation!
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => handleDeletePost(post.id)} 
              />
            ))
          )}
        </div>
      </div>

      <TrendingSidebar />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-[2rem] shadow-xl hover:bg-primary/90 transition-all"
        >
          <Plus className="w-6 h-6" /> 
          <span className="font-bold text-sm">Create Post</span>
        </motion.button>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-[2.5rem] p-6 space-y-4 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" /> 
                  New Discussion
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind, student?" 
                className="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 min-h-[140px] outline-none focus:ring-2 ring-primary/20 transition-all resize-none text-[15px]"
              />

              <div className="space-y-3">
                {/* Link Attachment */}
                <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <input 
                    placeholder="Add a link (optional)" 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    className="bg-transparent w-full text-sm outline-none" 
                  />
                </div>

                {/* Image Upload Area */}
                <div className="flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-2 text-sm text-primary font-bold hover:opacity-80 transition-opacity w-fit"
                  >
                    <ImageIcon className="w-4 h-4" /> 
                    {imageFile ? "Change attached image" : "Attach an image"}
                  </button>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={handleFileChange} 
                    accept="image/*" 
                  />

                  {imagePreview && (
                    <div className="relative w-full aspect-video max-h-40 rounded-2xl overflow-hidden border border-border/50 group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {setImageFile(null); setImagePreview(null);}} 
                        className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <button 
                  disabled={!content.trim() || isSubmitting} 
                  onClick={handlePost}
                  className={cn(
                    "px-10 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all",
                    content.trim() && !isSubmitting 
                      ? "bg-primary text-white hover:scale-105 active:scale-95" 
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post to Feed
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;