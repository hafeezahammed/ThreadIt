import { useState } from "react"
import { createCommunity } from "@/services/communityServices"

interface Props {
  onClose: () => void
  refresh: () => void
}

const CreateCommunityModal = ({ onClose, refresh }: Props) => {

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  const handleCreate = async () => {

    await createCommunity(name, description, category)

    refresh()

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-card p-6 rounded-xl w-[400px] space-y-4">

        <h2 className="text-lg font-bold">Create Community</h2>

        <input
          placeholder="Community name"
          className="w-full border rounded-md p-2"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Category"
          className="w-full border rounded-md p-2"
          onChange={(e) => setCategory(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border rounded-md p-2"
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md"
        >
          Create
        </button>

      </div>

    </div>
  )
}

export default CreateCommunityModal