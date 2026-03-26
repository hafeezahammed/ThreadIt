import { Megaphone } from "lucide-react";

const AdCard = ({ ad }: any) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Megaphone className="w-4 h-4" />
        Sponsored
      </div>

      <h3 className="font-semibold">{ad.title}</h3>

      <p className="text-sm text-muted-foreground mt-1">
        {ad.description}
      </p>

      <button className="mt-3 text-sm text-primary font-medium">
        Learn More →
      </button>
    </div>
  );
};

export default AdCard;