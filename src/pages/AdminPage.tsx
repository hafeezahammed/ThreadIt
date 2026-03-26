import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

type ViewMode =
  | "dashboard"
  | "users"
  | "posts"
  | "ads"
  | "placements"
  | "communities";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  banned?: boolean;
}

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

interface Ad {
  id: string;
  headline: string;
  content: string;
  organization_name: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  is_approved?: boolean;
}

const AdminDashboard = () => {
  const [view, setView] = useState<ViewMode>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    ads: 0,
    placements: 0,
    communities: 0,
  });

  const [users, setUsers] = useState<Profile[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [accountChart, setAccountChart] = useState<any[]>([]);
  const [viewsChart, setViewsChart] = useState<any[]>([]);

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
        fetchStats();
        fetchAnalytics();
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  /* ================= STATS ================= */

  const fetchStats = async () => {
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: postsCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    const { count: adsCount } = await supabase
      .from("ads")
      .select("*", { count: "exact", head: true });

    const { count: placementsCount } = await supabase
      .from("placements")
      .select("*", { count: "exact", head: true });

    const { count: communitiesCount } = await supabase
      .from("communities")
      .select("*", { count: "exact", head: true });

    setStats({
      users: usersCount || 0,
      posts: postsCount || 0,
      ads: adsCount || 0,
      placements: placementsCount || 0,
      communities: communitiesCount || 0,
    });
  };

  /* ================= ANALYTICS ================= */

  const fetchAnalytics = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("created_at");

    const monthly: Record<string, number> = {};

    profiles?.forEach((p: any) => {
      const month = new Date(p.created_at).toLocaleString("default", {
        month: "short",
      });

      monthly[month] = (monthly[month] || 0) + 1;
    });

    setAccountChart(
      Object.entries(monthly).map(([name, value]) => ({
        name,
        value,
      }))
    );
  };

  /* ================= USERS ================= */

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  };

  const banUser = async (id: string, banned: boolean) => {
    await supabase
      .from("profiles")
      .update({ banned: !banned })
      .eq("id", id);

    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;

    await supabase.from("profiles").delete().eq("id", id);
    fetchUsers();
  };

  useEffect(() => {
    if (view === "users") fetchUsers();
  }, [view]);

  /* ================= ADS ================= */

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    setAds(data || []);
  };

  const approveAd = async (id: string) => {
    await supabase.from("ads").update({ is_approved: true }).eq("id", id);
    fetchAds();
  };

  const rejectAd = async (id: string) => {
    if (!confirm("Delete this ad?")) return;

    await supabase.from("ads").delete().eq("id", id);
    fetchAds();
  };

  useEffect(() => {
    if (view === "ads") fetchAds();
  }, [view]);

  /* ================= COMMUNITIES ================= */

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    setCommunities(data || []);
  };

  const approveCommunity = async (id: string) => {
    await supabase
      .from("communities")
      .update({ status: "approved" })
      .eq("id", id);

    fetchCommunities();
  };

  const deleteCommunity = async (id: string) => {
    if (!confirm("Delete this community?")) return;

    await supabase.from("communities").delete().eq("id", id);

    fetchCommunities();
  };

  useEffect(() => {
    if (view === "communities") fetchCommunities();
  }, [view]);

  /* ================= UI ================= */

  if (loading) return <div className="p-10">Checking access...</div>;

  if (!isAdmin)
    return (
      <div className="p-10 text-red-500 font-bold">
        Access Denied
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      <h1 className="text-3xl font-bold">
        Enterprise Admin Dashboard
      </h1>

      {/* STAT CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <StatCard title="Users" value={stats.users} onClick={() => setView("users")} />
        <StatCard title="Posts" value={stats.posts} onClick={() => setView("posts")} />
        <StatCard title="Ads" value={stats.ads} onClick={() => setView("ads")} />
        <StatCard title="Placements" value={stats.placements} onClick={() => setView("placements")} />
        <StatCard title="Communities" value={stats.communities} onClick={() => setView("communities")} />
      </div>

      {/* DASHBOARD */}

      {view === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PremiumChart title="Accounts Created" data={accountChart} />
          <PremiumChart title="Views Analytics" data={viewsChart} />
        </div>
      )}

      {/* USERS PANEL */}
      {view === "users" && (
        <div className="space-y-6">
          <button
            onClick={() => setView("dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-xl"
          >
            Back
          </button>

          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="glass-card p-6 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => banUser(user.id, !!user.banned)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                  >
                    Ban
                  </button>

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADS PANEL */}
      {view === "ads" && (
        <div className="space-y-6">
          <button
            onClick={() => setView("dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-xl"
          >
            Back
          </button>

          {ads.map((ad) => (
            <div key={ad.id} className="glass-card p-6 rounded-2xl flex justify-between">
              <div>
                <h3 className="font-semibold">{ad.headline}</h3>
                <p className="text-sm">{ad.organization_name}</p>
              </div>

              <div className="flex gap-2">
                {!ad.is_approved && (
                  <button
                    onClick={() => approveAd(ad.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={() => rejectAd(ad.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMMUNITIES PANEL */}
      {view === "communities" && (
        <div className="space-y-6">

          <button
            onClick={() => setView("dashboard")}
            className="px-4 py-2 bg-primary text-white rounded-xl"
          >
            Back
          </button>

          {communities.map((c) => (
            <div
              key={c.id}
              className="glass-card p-6 rounded-2xl flex justify-between items-center"
            >

              <div>
                <h3 className="font-semibold text-lg">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.category}</p>
                <p className="text-sm mt-2">{c.description}</p>

                <p className="text-xs mt-2">
                  Status: {c.status}
                </p>
              </div>

              <div className="flex gap-2">

                {c.status !== "approved" && (
                  <button
                    onClick={() => approveCommunity(c.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={() => deleteCommunity(c.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

/* ================= CHART ================= */

const PremiumChart = ({ title, data }: { title: string; data: any[] }) => (
  <div className="glass-card p-6 rounded-3xl">
    <h3 className="font-semibold mb-4">{title}</h3>

    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={0.3}
          fill="#10b981"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

/* ================= STAT CARD ================= */

const StatCard = ({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="glass-card p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-[1.03] transition-all"
  >
    <p className="text-muted-foreground text-sm">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default AdminDashboard;