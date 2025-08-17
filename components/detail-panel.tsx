"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Clock, MapPin, TrendingUp, Users, Brain } from "lucide-react"
import { type TimelineEvent, roleColors, sampleChatMessages, sampleDecisionProvenance } from "@/lib/sample-data"
import { ChatView } from "./chat-view"
import { DecisionProvenanceModal } from "./decision-provenance-modal"

interface DetailPanelProps {
  selectedEvent?: TimelineEvent | null
}

export function DetailPanel({ selectedEvent }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "provenance" | "context">("chat")

  // Check if selected event has decision provenance data
  const findProvKeyForEvent = (evt?: TimelineEvent): string | undefined => {
    if (!evt) return undefined
    if (sampleDecisionProvenance[evt.id]) return evt.id
    const byDay = (d: Date) => d.toDateString()
    const entries = Object.entries(sampleDecisionProvenance)
    const sameDay = entries.find(([_k, prov]) => prov.timestamp instanceof Date && evt.date instanceof Date && byDay(prov.timestamp) === byDay(evt.date))
    if (sameDay) return sameDay[0]
  const fourteenDays = 14 * 24 * 60 * 60 * 1000
  const near = entries.find(([_k, prov]) => prov.timestamp instanceof Date && evt.date instanceof Date && Math.abs(prov.timestamp.getTime() - evt.date.getTime()) <= fourteenDays)
    if (near) return near[0]
    const title = evt.title?.toLowerCase() || ""
    const fuzzy = entries.find(([_k, prov]) => (prov.title || "").toLowerCase().includes(title) || title.includes((prov.title || "").toLowerCase()))
    if (fuzzy) return fuzzy[0]
    return undefined
  }

  const provKeyForSelected = findProvKeyForEvent(selectedEvent ?? undefined)
  const provForSelected = provKeyForSelected ? sampleDecisionProvenance[provKeyForSelected] : undefined
  const hasProvenance = !!provForSelected

  // Always show all messages. If event selected, scroll to first message from that date.
  const messagesToShow = sampleChatMessages;
  let scrollToDate: string | undefined = undefined;
  if (selectedEvent && selectedEvent.date) {
    scrollToDate = selectedEvent.date instanceof Date ? selectedEvent.date.toDateString() : selectedEvent.date;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Always show header/tabs/content */}
      <div className="flex flex-col h-full">
        {/* Header / summary - stays on top */}
        <div className="sticky top-0 z-20 bg-background">
          <div className="flex-none p-6 border-b border-border/50">
            <div className="space-y-3">
              {selectedEvent ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedEvent.date && typeof selectedEvent.date !== "string"
                        ? selectedEvent.date.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground">{selectedEvent.title}</h3>
                  {selectedEvent.sender && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`text-sm font-medium ${roleColors[selectedEvent.sender as keyof typeof roleColors] || "text-foreground"}`}
                      >
                        {selectedEvent.sender}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">All messages</span>
              )}
            </div>
          </div>
          {/* Tabs - also fixed under header */}
          <div className="flex-none border-b border-border/50">
            <div className="flex">
              {[
                { id: "chat", label: "Messages", icon: MessageCircle },
                { id: "provenance", label: "Provenance", icon: TrendingUp, disabled: !hasProvenance },
                { id: "context", label: "Context", icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === (tab.id as any);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={tab.disabled}
                    className={`px-4 py-3 text-sm flex items-center gap-2 ${active ? "font-semibold" : "text-muted-foreground"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Content area: always internally scrollable */}
        <div className="flex-1 overflow-auto">
          {activeTab === "chat" ? (
            <div className="h-full">
              <ChatView messages={messagesToShow} scrollToDate={scrollToDate} className="h-full" />
            </div>
          ) : (
            <div className="p-6">
              {activeTab === "provenance" && provForSelected ? (
                <DecisionProvenanceModal isOpen={!!provForSelected} onClose={() => setActiveTab("chat")} decision={provForSelected} />
              ) : activeTab === "context" ? (
                <ScrollArea className="h-full">
                  {/* context content */}
                </ScrollArea>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
