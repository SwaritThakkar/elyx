"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Clock, MapPin, TrendingUp, Users, Brain } from "lucide-react"
import { type TimelineEvent, roleColors, sampleChatMessages, sampleDecisionProvenance } from "@/lib/sample-data"
import { ChatView } from "./chat-view"

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

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-lg font-bold font-space-grotesk text-neon-cyan">Detail View</h2>
        <p className="text-sm text-muted-foreground">
          {selectedEvent ? "Event details and context" : "Select timeline items to explore"}
        </p>
      </div>

      {selectedEvent ? (
        <div className="flex-1 flex flex-col">
          {/* Event Header */}
          <div className="p-6 border-b border-border/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {selectedEvent.type}
                  </Badge>
                  {hasProvenance && (
                    <Badge variant="outline" className="text-neon-purple border-neon-purple/30">
                      <Brain className="h-3 w-3 mr-1" />
                      Provenance Available
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedEvent.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
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
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border/50">
            <div className="flex">
              {[
                { id: "chat", label: "Messages", icon: MessageCircle },
                { id: "provenance", label: "Provenance", icon: TrendingUp, disabled: !hasProvenance },
                { id: "context", label: "Context", icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    disabled={tab.disabled}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`rounded-none border-b-2 ${
                      activeTab === tab.id ? "border-neon-cyan text-neon-cyan" : "border-transparent"
                    } ${tab.disabled ? "opacity-50" : ""}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" && (
              <ChatView
                messages={sampleChatMessages.filter(
                  (msg) =>
                    // Show messages around the selected event date
                    Math.abs(msg.timestamp.getTime() - selectedEvent.date.getTime()) < 7 * 24 * 60 * 60 * 1000,
                )}
                className="border-0"
              />
            )}

                {activeTab === "provenance" && hasProvenance && provForSelected && (
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-sm text-neon-purple flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Decision Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Decision Maker</span>
                              <span className="text-sm text-foreground">{provForSelected.decisionMaker}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Confidence</span>
                          <Badge variant="outline" className="text-neon-green">
                            {provForSelected.confidence}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{provForSelected.reasoning}</p>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Evidence Sources:</p>
                        <div className="space-y-1">
                          {provForSelected.evidenceSources.slice(0, 3).map((evidence, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                              <span className="text-xs text-foreground">{evidence.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}

            {activeTab === "context" && (
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-sm text-neon-blue">Contextual Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm text-foreground">Singapore</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Travel Status</span>
                        <Badge variant="secondary" className="text-neon-blue">
                          Home Base
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Program Day</span>
                        <span className="text-sm text-foreground">
                          Day{" "}
                          {Math.floor(
                            (selectedEvent.date.getTime() - new Date("2024-01-15").getTime()) / (1000 * 60 * 60 * 24),
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Severity</span>
                        <Badge
                          variant={
                            selectedEvent.severity === "high"
                              ? "destructive"
                              : selectedEvent.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {selectedEvent.severity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {/* Default State */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-neon-green" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click on any event in the timeline to see detailed information, related messages, and decision
                  provenance.
                </p>
                <p className="text-xs text-neon-purple">
                  Decision events marked with * have detailed provenance data available.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm text-neon-magenta">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Messages</span>
                  <span className="text-neon-green">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lab Results</span>
                  <span className="text-neon-magenta">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Decisions Made</span>
                  <span className="text-neon-purple">23</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
