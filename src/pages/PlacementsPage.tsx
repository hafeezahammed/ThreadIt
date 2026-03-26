import { motion } from "framer-motion";
import { Search, MapPin, IndianRupee, Briefcase, Bookmark, ExternalLink, Flame } from "lucide-react";

const jobs = [
  { company: "Microsoft", role: "SDE Intern", salary: "₹1.2L/mo", location: "Hyderabad", type: "Internship", hot: true },
  { company: "Google", role: "Software Engineer", salary: "₹45 LPA", location: "Bangalore", type: "Full-time", hot: true },
  { company: "Amazon", role: "SDE-1", salary: "₹38 LPA", location: "Hyderabad", type: "Full-time", hot: false },
  { company: "Flipkart", role: "Product Intern", salary: "₹80K/mo", location: "Bangalore", type: "Internship", hot: false },
  { company: "Razorpay", role: "Backend Engineer", salary: "₹28 LPA", location: "Remote", type: "Full-time", hot: true },
];

const filters = ["All", "Internship", "Full-time", "On-campus", "Off-campus"];

const PlacementsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
      <h1 className="font-display font-bold text-2xl text-foreground">Placements</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search roles, companies..."
          className="w-full h-11 pl-11 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f, i) => (
          <button
            key={f}
            className={i === 0 ? "chip-primary" : "chip hover:bg-muted transition-colors cursor-pointer"}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground">{job.role}</h3>
                    {job.hot && <Flame className="w-3.5 h-3.5 text-warning" />}
                  </div>
                  <p className="text-sm text-primary font-medium">{job.company}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IndianRupee className="w-3 h-3" />{job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                    <span className="chip text-[10px] py-0.5">{job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="gradient-primary-hover text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  Apply <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlacementsPage;
