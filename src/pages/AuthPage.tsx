import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  ShieldCheck, Globe, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "@/services/authService";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => setMounted(true), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle Sign In
        const loginData = await signIn(formData.email, formData.password);

if (loginData.session) {
  navigate("/home");
}
      } else {
        // Handle Sign Up
        if (!formData.fullName) throw new Error("Full name is required");
        
        const signUpData = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName
        );

        // If your Supabase has "Confirm Email" ON, session will be null
        if (signUpData?.session) {
          navigate("/home");
        } else {
          alert("Account created! Please check your email for a verification link before signing in.");
          setIsLogin(true); // Switch to login view so they can sign in after verifying
          setFormData(prev => ({ ...prev, password: "" })); // Clear password for security
        }
      }
    } catch (error: any) {
      // Handle specific Supabase error messages for better UX
      const message = error.message || "An error occurred during authentication";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-[#FAFAFA] overflow-hidden font-sans selection:bg-primary/10">
      
      {/* --- LEFT SECTION: BRANDING --- */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-center px-12 lg:px-24 z-10 border-b md:border-b-0 md:border-r border-zinc-200/60">
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="text-white font-bold text-3xl tracking-tighter">T</span>
            </div>
            <div className="h-10 w-[1px] bg-zinc-200" />
            <span className="text-zinc-400 font-medium tracking-widest text-xs uppercase">Premium Campus Network</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-zinc-900 tracking-tight leading-[0.9]">
            ThreadIt<span className="text-primary">.</span>
          </h1>
          
          <p className="mt-6 text-lg text-zinc-500 max-w-md leading-relaxed">
            Where campus conversations find their home. Join thousands of students sharing ideas in a secure, verified environment.
          </p>

          <div className="mt-12 flex items-center gap-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400 font-medium">
              Join <span className="text-zinc-900 font-bold">2,400+</span> active students
            </p>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SECTION: AUTH FORM --- */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div 
          className="absolute inset-0 opacity-[0.4] pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[400px] relative"
        >
          <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                {isLogin ? "Welcome back to your academic community." : "Start your journey with ThreadIt today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative"
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required={!isLogin}
                      className="pl-12 h-14 rounded-2xl bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-primary/10 text-zinc-900 transition-all shadow-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="College Email"
                  required
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-primary/10 text-zinc-900 transition-all shadow-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="pl-12 pr-12 h-14 rounded-2xl bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-primary/10 text-zinc-900 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 rounded-full bg-[#2D44E7] hover:bg-[#1E33C9] text-white font-bold text-base shadow-xl shadow-[#2D44E7]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Continue" : "Join ThreadIt"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="h-[1px] flex-1 bg-zinc-100" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Or use</span>
              <div className="h-[1px] flex-1 bg-zinc-100" />
            </div>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium">Google Account</span>
            </Button>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
              >
                {isLogin ? (
                  <>New to the campus? <span className="text-primary font-bold ml-1">Create Account</span></>
                ) : (
                  <>Already registered? <span className="text-primary font-bold ml-1">Sign In</span></>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Campus Only</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;