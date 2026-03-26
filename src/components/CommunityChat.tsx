import { useEffect, useRef, useState } from "react"
import {
  getCommunityMessages,
  sendCommunityMessage
} from "@/services/communityServices"

import { Send } from "lucide-react"

const CommunityChat = ({ communityId }: any) => {

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const loadMessages = async () => {
    const data = await getCommunityMessages(communityId)
    setMessages(data)
  }

  useEffect(() => {
    loadMessages()
  }, [communityId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {

    if (!text.trim()) return

    await sendCommunityMessage(communityId, text)

    setText("")
    loadMessages()
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-xl border">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages.map((m) => (

          <div key={m.id} className="flex items-start gap-3">

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">

              {m.profiles?.avatar_url ? (
                <img
                  src={m.profiles.avatar_url}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                m.profiles?.full_name?.charAt(0) || "U"
              )}

            </div>

            {/* Message Bubble */}
            <div className="bg-background border rounded-xl px-4 py-2 max-w-[70%] shadow-sm">

              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {m.profiles?.full_name || "Anonymous"}
              </p>

              <p className="text-sm leading-relaxed">
                {m.message}
              </p>

            </div>

          </div>

        ))}

        <div ref={bottomRef} />

      </div>

      {/* Input */}
      <div className="border-t bg-background p-4 flex items-center gap-3">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <button
          onClick={send}
          className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition"
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  )
}

export default CommunityChat