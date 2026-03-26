import { Home, Users, Megaphone, TrendingUp, User, Settings, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const mainNav = [
  { title: "Home", icon: Home, path: "/home" },
  { title: "Communities", icon: Users, path: "/communities" },
  { title: "Ads & Placements", icon: Megaphone, path: "/ads" },
  { title: "Trending", icon: TrendingUp, path: "/trending" },
  { title: "Profile", icon: User, path: "/profile" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const bottomNav: any[] = [];

const SidebarLink = ({ item }: { item: { title: string; icon: React.ElementType; path: string } }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "gradient-primary text-primary-foreground shadow-glow"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span>{item.title}</span>
    </NavLink>
  );
};

const AppSidebar = () => {
  const navigate = useNavigate();

  // 🔐 Logout function
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      // Replace history so back button can't return
      navigate("/", { replace: true });

      // Clear browser history (extra safety)
      window.history.pushState(null, "", "/");

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card p-4">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-3 mb-6">
        <img src="/favicon.ico" alt="Threadit Logo" className="w-8 h-8" />
        <span className="font-display font-bold text-lg text-foreground">
          Threadit
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {mainNav.map((item) => (
          <SidebarLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-1 pt-4 border-t border-border">

        {bottomNav.map((item) => (
          <SidebarLink key={item.path} item={item} />
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>

      </div>
    </aside>
  );
};

export default AppSidebar;