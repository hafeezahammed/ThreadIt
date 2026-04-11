import { useState, useEffect } from "react"
import { createCommunity } from "@/services/communityServices"
import { supabase } from "@/lib/supabaseClient"

interface Props {
  onClose: () => void
  refresh: () => void
}

const CreateCommunityModal = ({ onClose, refresh }: Props) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔍 USER CHECK (IMPORTANT DEBUG)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      console.log("USER:", data.user)
    }
    checkUser()
  }, [])

  const handleCreate = async () => {
    setLoading(true)

    try {
      // 🔑 Check if user logged in
      const { data: { user } } = await supabase.auth.getUser()

      console.log("CURRENT USER:", user)

      if (!user) {
        alert("Pehle login karo! 🔐")
        setLoading(false)
        return
      }

      // ⚠️ Validation
      if (!name.trim() || !category.trim()) {
        alert("Name aur category required hai")
        setLoading(false)
        return
      }

      console.log("CREATE CLICKED")

      // 🏗️ Create community
      const res = await createCommunity(name, description, category)

      console.log("SUCCESS:", res)

      alert("Community created successfully ✅")

      // 🔄 Refresh + close
      refresh()
      onClose()

      // reset fields
      setName("")
      setDescription("")
      setCategory("")

    } catch (err: any) {
      console.error("CREATE ERROR:", err)

      // 🔥 Better error messages
      if (err.message?.includes("permission denied")) {
        alert("❌ Permission issue (RLS problem)")
      } else if (err.message?.includes("not authenticated")) {
        alert("❌ Login required")
      } else {
        alert("❌ Community create failed")
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-[400px] space-y-4">
        <h2 className="text-lg font-bold">Create Community</h2>

        <input
          placeholder="Community name"
          className="w-full border rounded-md p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Category"
          className="w-full border rounded-md p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border rounded-md p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  )
}

export default CreateCommunityModal