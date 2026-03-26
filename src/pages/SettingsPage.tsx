import { User, Bell, Shield, Info, Palette, Sun, Moon, Laptop, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const sections = [
  { title: "Account", icon: User },
  { title: "Preferences", icon: Palette },
  { title: "Privacy", icon: Shield },
  { title: "About ThreadIt", icon: Info },
];

const SettingsPage = () => {
const [active, setActive] = useState(0);
const [theme, setTheme] = useState("system");
const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

// ================= CHECK ADMIN =================
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, []);

  // Apply theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (mode: string) => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      systemDark
        ? root.classList.add("dark")
        : root.classList.remove("dark");
    }
  };

  const changeTheme = (mode: string) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyTheme(mode);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <h1 className="font-display font-bold text-2xl text-foreground mb-6">
        Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-56 flex-shrink-0 space-y-1">
          {sections.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                i === active
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <s.icon className="w-4 h-4" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-6">
          {/* ================= ACCOUNT ================= */}
          {active === 0 && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-foreground">
                Account Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Display Name
                  </label>
                  <input
                    className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    defaultValue="Your Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Email
                  </label>
                  <input
                    className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    defaultValue="you@college.edu"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Bio
                  </label>
                  <textarea
                    className="w-full h-20 px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                    defaultValue="Full-stack developer · Open source enthusiast"
                  />
                </div>

                <button className="gradient-primary-hover text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold">
                  Save Changes
                </button>
              </div>
            </div>
          )}
            {/* ================= ADMIN SECTION ================= */}
              {isAdmin && (
                <div className="border-t pt-8">
                  <h3 className="font-display font-bold text-foreground mb-4">
                    Administration
                  </h3>

                  <div
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer p-6 rounded-2xl gradient-primary text-primary-foreground shadow-lg flex items-center justify-between transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <LayoutDashboard className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">
                          Enterprise Admin Panel
                        </p>
                        <p className="text-xs opacity-80">
                          Manage users, posts, ads, placements & analytics
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                      ADMIN
                    </span>
                  </div>
                </div>
              )}
            

          {/* ================= PREFERENCES ================= */}
          {active === 1 && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-foreground">
                Preferences
              </h3>

              {/* Language */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Language
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred language
                  </p>
                </div>
                <select className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Theme Mode
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light */}
                  <button
                    onClick={() => changeTheme("light")}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      theme === "light"
                        ? "border-primary shadow-md bg-primary/10"
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-medium">Light</span>
                  </button>

                  {/* Dark */}
                  <button
                    onClick={() => changeTheme("dark")}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      theme === "dark"
                        ? "border-primary shadow-md bg-primary/10"
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>

                  {/* System */}
                  <button
                    onClick={() => changeTheme("system")}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      theme === "system"
                        ? "border-primary shadow-md bg-primary/10"
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    <Laptop className="w-5 h-5" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Sections */}
          {active >= 2 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">
                Coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;