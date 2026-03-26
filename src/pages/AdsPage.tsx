import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  ExternalLink,
  X,
  ImagePlus,
  Phone,
  Mail,
  Globe,
  Building2,
  Type,
  AlignLeft,
  Sparkles,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { createAd, getApprovedAds } from "@/services/adService"; // Adjust path as needed
import { toast } from "sonner"; // Optional: for better error feedback

interface Ad {
  id?: string;
  headline: string;
  content: string;
  organization_name: string;
  image_url?: string;
  external_link?: string;
  phone_number?: string;
  email?: string;
}

const AdsPage = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
 const [form, setForm] = useState({
  headline: "",
  content: "",
  organizationName: "",
  externalLink: "",
  phoneNumber: "",
  email: "",
  startDate: "",
  endDate: ""
});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 1. Fetch Ads from Backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getApprovedAds();
        setAds(data || []);
      } catch (error) {
        console.error("Error loading ads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Efficient preview
    }
  };

  // 2. Submit to Backend
  const handleSubmit = async () => {
    if (!form.headline || !form.content || !form.organizationName || !imageFile) {
      alert("Please fill in required fields and upload an image.");
      return;
    }

    setSubmitting(true);
    try {
      await createAd(
  imageFile,
  {
    headline: form.headline,
    content: form.content,
    organizationName: form.organizationName,
    externalLink: form.externalLink,
    phoneNumber: form.phoneNumber,
    email: form.email,
    startDate: form.startDate,
    endDate: form.endDate
  }
);
      
      // Success Cleanup
      setOpen(false);
      setForm({
  headline: "",
  content: "",
  organizationName: "",
  externalLink: "",
  phoneNumber: "",
  email: "",
  startDate: "",
  endDate: ""
});
      setImageFile(null);
      setPreviewUrl("");
      
      alert("Ad submitted for approval!");
    } catch (error: any) {
      alert(error.message || "Failed to create ad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContact = (ad: Ad) => {
    if (ad.external_link) window.open(ad.external_link, "_blank");
    else if (ad.email) window.location.href = `mailto:${ad.email}`;
    else if (ad.phone_number) window.location.href = `tel:${ad.phone_number}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-background min-h-screen text-foreground">
      {/* --- Premium Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Campus Ads & Placements</h1>
          </div>
          <p className="text-muted-foreground text-sm">Promote events, sales, Placement Offers and student services to the whole campus.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Create New Ad
        </motion.button>
      </div>

      {/* --- Ads Feed --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Loading campus feed...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex flex-col bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                    <Megaphone className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border/50">
                    Sponsored
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">{ad.headline}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">{ad.content}</p>
                
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Advertiser</span>
                    <span className="text-xs font-semibold">{ad.organization_name}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleContact(ad)}
                    className="bg-foreground text-background p-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- Create Ad Modal --- */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-border/60 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">New Ad Campaign</h2>
                    <p className="text-sm text-muted-foreground">Reach your campus audience effectively.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  disabled={submitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Visual Section */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Visual Preview</label>
                  <div className="relative group overflow-hidden rounded-3xl border-2 border-dashed border-border hover:border-primary/50 transition-all aspect-video flex flex-col items-center justify-center bg-muted/20">
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setImageFile(null); setPreviewUrl(""); }}
                          className="absolute top-4 right-4 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
                          <ImagePlus className="w-6 h-6 text-primary/60" />
                        </div>
                        <p className="text-sm font-medium">Add a cover image</p>
                        <p className="text-xs text-muted-foreground mt-1">Drag and drop or click to upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ad Content</label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="headline" placeholder="Catchy Headline" value={form.headline} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="relative">
                      <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                      <textarea name="content" placeholder="What's the offer or event?" value={form.content} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm h-32 resize-none focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Sponsorship</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="organizationName" placeholder="Organization Name" value={form.organizationName} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">External Link</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="externalLink" placeholder="https://campus-sale.com" value={form.externalLink} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="phoneNumber" placeholder="+1 (555) 000-0000" value={form.phoneNumber} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input name="email" placeholder="hello@campus.edu" value={form.email} onChange={handleChange} className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
    Start Date
  </label>

  <input
    type="date"
    name="startDate"
    value={form.startDate}
    onChange={handleChange}
    className="w-full bg-muted/50 border border-border rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-all"
  />
</div>

<div className="space-y-4">
  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
    End Date
  </label>

  <input
    type="date"
    name="endDate"
    value={form.endDate}
    onChange={handleChange}
    className="w-full bg-muted/50 border border-border rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-all"
  />
</div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-border/60 bg-muted/30 flex items-center justify-end gap-4">
                <button
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.headline || !form.content || !imageFile}
                  className="bg-primary text-primary-foreground px-10 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Uploading..." : "Publish Campaign"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdsPage;