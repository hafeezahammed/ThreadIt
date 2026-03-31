import { useState } from "react";
import { Plus, Image, FileText, Smile, Hash, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const CreatePostButton = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

const handlePost = async () => {

  if (!text.trim()) {
    alert("Post empty nahi ho sakta");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Login karo pehle");
    return;
  }

  const { error } = await supabase.from("posts").insert({
    content: text,
    user_id: user.id
  });

  if (error) {
    alert(error.message);
  } else {
    setText("");
    setOpen(false);
  }
};
  return (
    <>
      <button onClick={() => setOpen(true)} className="fab">
        <Plus className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-foreground">Create Post</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
<textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="What's on your mind?"
  className="w-full h-32 bg-muted/50 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
/>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <FileText className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Hash className="w-5 h-5" />
                  </button>
                </div>
                <Button 
                 onClick={handlePost}
                 className="gradient-primary-hover text-primary-foreground rounded-xl px-6 border-0">
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatePostButton;
