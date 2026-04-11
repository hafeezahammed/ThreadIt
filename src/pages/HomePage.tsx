import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Send, Sparkles, Plus, 
  Image as ImageIcon, Link as LinkIcon, Loader2,
  UserCircle
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { cn } from "@/lib/utils";
import { 
  getAllPosts, createPost, deletePost, uploadPostImage, type Post 
} from "@/services/postService";
import { supabase } from "@/lib/supabaseClient"; // Ensure your client is exported here

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile State
  const [userName, setUserName] = useState<string | null>(null);

  // Form States
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data) setUserName(data.full_name);
        if (error) console.error("Profile fetch error:", error);
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

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
    fetchProfile();
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
      if (imageFile) uploadedImageUrl = await uploadPostImage(imageFile);
      await createPost(content, uploadedImageUrl, link || null);
      
      setContent("");
      setLink("");
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
      await fetchPosts();
    } catch (error: any) {
      alert(`Failed to post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const previousPosts = [...posts];
    setPosts(posts.filter(p => p.id !== postId));
    try {
      await deletePost(postId);
    } catch (err) {
      setPosts(previousPosts);
      alert("Could not delete post.");
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      {/* Main Content Wrapper */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section with Greeting */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Campus Feed</h1>
            <p className="text-muted-foreground text-sm font-medium">Discover what's happening around you.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex items-center bg-card border border-border/60 rounded-2xl px-4 shadow-sm w-full md:w-64 focus-within:w-full md:focus-within:w-80 transition-all duration-300">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input 
                placeholder="Search..." 
                className="w-full h-11 pl-3 bg-transparent outline-none text-sm" 
              />
            </div>

            {/* Greeting Section */}
            <div className="flex items-center gap-3 pl-4 border-l border-border/60 h-10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Welcome,</p>
                <p className="text-sm font-semibold truncate max-w-[120px]">
                  {userName || "Student"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Pinterest-Style Masonry Grid */}
        <section className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <p className="text-muted-foreground font-medium">Refreshing feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-border rounded-[2.5rem] bg-card/30">
              <p className="text-muted-foreground italic">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="break-inside-avoid transition-transform duration-300 hover:scale-[1.01]"
                >
                  <PostCard 
                    post={post} 
                    onDelete={() => handleDeletePost(post.id)} 
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:shadow-primary/20 transition-all"
        >
          <Plus className="w-6 h-6" /> 
          <span className="font-bold text-sm text-white">Create Post</span>
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
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-[2rem] p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" /> 
                  New Post
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?" 
                className="w-full bg-muted/30 border border-border/50 rounded-xl p-4 min-h-[120px] outline-none focus:ring-2 ring-primary/20 transition-all resize-none text-base"
              />

              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <input 
                    placeholder="Add link..." 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    className="bg-transparent w-full text-sm outline-none" 
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
                  >
                    <ImageIcon className="w-4 h-4" /> 
                    {imageFile ? "Change image" : "Add photo"}
                  </button>
                  <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />

                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-border/50 group max-h-48">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {setImageFile(null); setImagePreview(null);}} 
                        className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  disabled={!content.trim() || isSubmitting} 
                  onClick={handlePost}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                    content.trim() && !isSubmitting ? "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                  Post
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