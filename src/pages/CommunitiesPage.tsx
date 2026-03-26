import { useEffect, useState } from "react"
import { getCommunities } from "@/services/communityServices"

import CommunityCard from "@/components/CommunityCard"
import CommunityChat from "@/components/CommunityChat"
import CreateCommunityModal from "@/components/CreateCommunityModal"

import { ArrowLeft, Plus, Search } from "lucide-react"

const CommunitiesPage = () => {

  const [communities, setCommunities] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  const loadCommunities = async () => {
    const data = await getCommunities()
    setCommunities(data)
  }

  useEffect(() => {
    loadCommunities()
  }, [])

  /* -------------------------------- */
  /* Community Chat View */
  /* -------------------------------- */

  if (selected) {
    return (
      <div className="h-screen flex flex-col bg-background">

        {/* Header */}
        <div className="border-b bg-card px-6 py-4 flex items-center gap-4">

          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="h-6 w-px bg-border" />

          <div>
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="text-xs text-muted-foreground">
              Community Chat
            </p>
          </div>

        </div>

        {/* Chat Container */}
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <div className="bg-card border rounded-xl shadow-sm h-full p-6 flex flex-col">
            <CommunityChat communityId={selected.id} />
          </div>
        </div>

      </div>
    )
  }

  /* -------------------------------- */
  /* Communities List Page */
  /* -------------------------------- */

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b bg-card">

        <div className="max-w-6xl mx-auto px-6 py-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Communities
              </h1>

              <p className="text-muted-foreground mt-1 text-sm">
                Discover and join communities across your campus.
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm"
            >
              <Plus size={18} />
              Create Community
            </button>

          </div>

          {/* Search */}
          <div className="mt-6 relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

          </div>

        </div>

      </div>

      {/* Community Grid */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {filtered.length === 0 && (
          <div className="text-center py-20">

            <p className="text-muted-foreground text-sm">
              No communities found.
            </p>

          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {filtered.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              onView={() => setSelected(c)}
            />
          ))}

        </div>

      </div>

      {/* Create Modal */}

      {showModal && (
        <CreateCommunityModal
          onClose={() => setShowModal(false)}
          refresh={loadCommunities}
        />
      )}

    </div>
  )
}

export default CommunitiesPage