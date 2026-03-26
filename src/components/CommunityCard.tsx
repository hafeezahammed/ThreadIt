import { Users, ChevronRight } from "lucide-react"

interface Props {
  community: any
  onView: () => void
}

const CommunityCard = ({ community, onView }: Props) => {

  return (
    <div className="
      group
      bg-card
      border
      border-border
      rounded-2xl
      p-6
      flex
      flex-col
      justify-between
      transition
      duration-300
      hover:shadow-xl
      hover:-translate-y-1
    ">

      {/* Top Section */}
      <div>

        <div className="flex items-start justify-between mb-4">

          {/* Avatar + Name */}
          <div className="flex items-center gap-3">

            <div className="
              w-12
              h-12
              rounded-xl
              bg-gradient-to-br
              from-primary/20
              to-primary/40
              flex
              items-center
              justify-center
              text-primary
              font-semibold
            ">
              <Users size={20} />
            </div>

            <div>

              <h3 className="font-semibold text-base leading-none">
                {community.name}
              </h3>

              <span className="
                inline-block
                mt-1
                text-[10px]
                font-medium
                px-2
                py-[2px]
                rounded
                bg-primary/10
                text-primary
                uppercase
                tracking-wide
              ">
                {community.category}
              </span>

            </div>

          </div>

        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {community.description || "No description available for this community."}
        </p>

      </div>

      {/* Bottom Section */}
      <div className="mt-6 flex items-center justify-between">

        {/* Members */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">

          <Users size={14} />

          <span>
            {community.members ?? 0} members
          </span>

        </div>

        {/* View Button */}
        <button
          onClick={onView}
          className="
            flex
            items-center
            gap-1
            text-sm
            font-medium
            text-primary
            hover:underline
          "
        >
          View
          <ChevronRight size={16} />
        </button>

      </div>

    </div>
  )
}

export default CommunityCard