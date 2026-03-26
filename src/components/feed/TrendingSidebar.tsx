import { TrendingUp, Users, Flame } from "lucide-react";

const trendingTopics = [
  { tag: "#Placements2026", posts: 342, hot: true },
  { tag: "#MidSemNotes", posts: 218, hot: false },
  { tag: "#HackathonResults", posts: 156, hot: true },
  { tag: "#CampusFest", posts: 134, hot: false },
  { tag: "#InternshipTips", posts: 98, hot: false },
];

const suggestedCommunities = [
  { name: "CS Batch 2026", members: 1240 },
  { name: "Placement Prep", members: 890 },
  { name: "Campus Events", members: 654 },
];

const TrendingSidebar = () => {
  return (
    <aside className="hidden xl:block w-80 h-screen sticky top-0 p-4 space-y-4 overflow-y-auto">
      {/* Trending */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Trending Now</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <button key={topic.tag} className="w-full text-left group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {topic.tag}
                </span>
                {topic.hot && <Flame className="w-3.5 h-3.5 text-warning" />}
              </div>
              <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Communities */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">Suggested Communities</h3>
        </div>
        <div className="space-y-3">
          {suggestedCommunities.map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.members} members</p>
              </div>
              <button className="chip-primary text-[10px] hover:opacity-80 transition-opacity cursor-pointer">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default TrendingSidebar;
