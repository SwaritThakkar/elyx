
"use client"

import { useState } from "react"
import { SidebarProfile } from "@/components/sidebar-profile"
import { TimelineView } from "@/components/timeline-view"
import { DetailPanel } from "@/components/detail-panel"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import type { TimelineEvent } from "@/lib/sample-data"

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  // Month slider state (sync with TimelineView logic)
  const [selectedMonth, setSelectedMonth] = useState(4)

  return (
    <div className="h-screen overflow-hidden bg-background flex gap-4 p-4">
      {/* Left Sidebar */}
      <div className="w-80 glass rounded-smooth-lg overflow-hidden h-screen">
        <div className="h-full overflow-y-auto scroll-smooth-panel">
          <SidebarProfile selectedMonth={selectedMonth} />
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col gap-4 h-screen">
        <header className="h-16 glass rounded-smooth flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold font-space-grotesk text-neon-cyan">Elyx Life Analytics</h1>
            <p className="text-sm text-muted-foreground">8-Month Health Journey Visualization</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Member: <span className="text-neon-green font-medium">Rohan Patel</span>
            </div>
            <Link href="/chat">
              <Button
                variant="outline"
                size="sm"
                className="text-neon-green border-neon-green/30 hover:bg-neon-green/10 bg-transparent rounded-smooth"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Full Chat
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 glass rounded-smooth-lg overflow-hidden h-full">
          <div className="h-full overflow-y-auto scroll-smooth-panel">
            <TimelineView onEventSelect={setSelectedEvent} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          </div>
        </div>
      </div>

  {/* Right Detail Panel */}
  <div className="w-96 glass rounded-smooth-lg overflow-hidden h-screen">
        <div className="h-full">
          <DetailPanel selectedEvent={selectedEvent} />
        </div>
      </div>
    </div>
  )
}
