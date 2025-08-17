"use client"

import { ChatView } from "@/components/chat-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"

export default function ChatPage() {
  return (
  
    <div className="min-h-screen bg-background flex flex-col gap-4 p-4">
      {/* Header */}
      <header className="h-16 glass rounded-smooth flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-smooth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Timeline
            </Button>
            <Analytics/>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-space-grotesk text-neon-cyan">Chat View</h1>
            <p className="text-sm text-muted-foreground">Full conversation history</p>
          </div>
        </div>
      </header>

      {/* Full Chat Interface */}
      <div className="flex-1 glass rounded-smooth-lg overflow-hidden">
        <ChatView />
      </div>
    </div>
  )
}
