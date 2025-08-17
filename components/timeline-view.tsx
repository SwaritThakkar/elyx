"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, FlaskConical, FileText, Activity, Brain, ZoomIn, ZoomOut } from "lucide-react"
import { sampleEvents, typeColors, sampleDecisionProvenance, type TimelineEvent } from "@/lib/sample-data"
import { DecisionProvenanceModal } from "./decision-provenance-modal"

interface TimelineViewProps {
  onEventSelect?: (event: TimelineEvent) => void
  selectedMonth: number
  setSelectedMonth: (m: number) => void
}

export function TimelineView({ onEventSelect, selectedMonth, setSelectedMonth }: TimelineViewProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false)

  const months = ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025"]

  const filters = [
    { id: "all", label: "All", icon: Activity, color: "text-neon-cyan" },
    { id: "message", label: "Messages", icon: MessageCircle, color: "text-neon-green" },
    { id: "lab", label: "Lab Results", icon: FlaskConical, color: "text-neon-magenta" },
    { id: "plan", label: "Plans", icon: FileText, color: "text-neon-blue" },
    { id: "device", label: "Device Data", icon: Activity, color: "text-rachel" },
    { id: "decision", label: "Decisions", icon: Brain, color: "text-neon-purple" },
  ]

  // Filter events based on active filters and selected month
  const filteredEvents = useMemo(() => {
    let events = sampleEvents

    // Filter by type
    if (!activeFilters.includes("all")) {
      events = events.filter((event) => activeFilters.includes(event.type))
    }

  // Filter to the exact month selected by the slider
  events = events.filter((event) => event.date.getMonth() === selectedMonth)

    return events
  }, [activeFilters, selectedMonth])

  // Group events by type for swimlanes
  const swimlaneData = useMemo(() => {
    const lanes = {
      message: filteredEvents.filter((e) => e.type === "message"),
      lab: filteredEvents.filter((e) => e.type === "lab"),
      plan: filteredEvents.filter((e) => e.type === "plan"),
      device: filteredEvents.filter((e) => e.type === "device"),
      decision: filteredEvents.filter((e) => e.type === "decision"),
    }
    return lanes
  }, [filteredEvents])

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event.id)
    onEventSelect?.(event)

    if (event.type === "decision") {
      const findProvKeyForEvent = (evt: TimelineEvent): string | undefined => {
        // direct id-key (if data uses same ids)
        if (sampleDecisionProvenance[evt.id]) return evt.id

        const entries = Object.entries(sampleDecisionProvenance)
        if (entries.length === 0) return undefined

        // find nearest provenance by timestamp
        if (evt.date instanceof Date) {
          let best: [string, number] | null = null
          entries.forEach(([k, prov]) => {
            if (!(prov.timestamp instanceof Date)) return
            const diff = Math.abs(prov.timestamp.getTime() - evt.date.getTime())
            if (best === null || diff < best[1]) best = [k, diff]
          })
          const maxWindow = 30 * 24 * 60 * 60 * 1000 // 30 days
          if (best && best[1] <= maxWindow) return best[0]
        }

        // fallback: fuzzy title match (either contains the other)
        const title = evt.title?.toLowerCase() || ""
        const fuzzy = entries.find(([_k, prov]) => (prov.title || "").toLowerCase().includes(title) || title.includes((prov.title || "").toLowerCase()))
        if (fuzzy) return fuzzy[0]

        return undefined
      }

      const provKey = findProvKeyForEvent(event)
      if (provKey) {
        setSelectedDecision(provKey)
        setIsDecisionModalOpen(true)
      }
    }
  }

  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      if (direction === "in") return Math.min(3, prev + 0.5)
      return Math.max(0.5, prev - 0.5)
    })
  }

  const handleDecisionModalClose = () => {
    setIsDecisionModalOpen(false)
    setSelectedDecision(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Controls */}
      <div className="p-6 border-b border-border/50">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilters.includes(filter.id)
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (filter.id === "all") {
                      setActiveFilters(["all"])
                    } else {
                      const newFilters = activeFilters.includes(filter.id)
                        ? activeFilters.filter((f) => f !== filter.id)
                        : [...activeFilters.filter((f) => f !== "all"), filter.id]
                      setActiveFilters(newFilters.length ? newFilters : ["all"])
                    }
                  }}
                  className={`${isActive ? "neon-glow-sm" : ""} ${filter.color} transition-all duration-200`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {filter.label}
                </Button>
              )
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Month Slider */}
            <div className="flex-1 max-w-md space-y-2">
              <label className="text-sm font-medium text-foreground">Timeline Focus</label>
              <div className="px-2">
                <Slider
                  value={[selectedMonth]}
                  onValueChange={([m]) => setSelectedMonth(m)}
                  max={7}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {months.map((month, index) => (
                    <span key={month} className={index === selectedMonth ? "text-neon-cyan font-medium" : ""}>
                      {month.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleZoom("out")}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-12 text-center">{zoomLevel}x</span>
              <Button variant="outline" size="sm" onClick={() => handleZoom("in")}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <Card className="glass">
              <CardHeader>
                  <CardTitle className="text-neon-cyan font-space-grotesk flex items-center justify-between">
                  Interactive Timeline - {months[selectedMonth]}
                  <Badge variant="secondary" className="text-neon-cyan">
                    {filteredEvents.length} events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}>
                  {/* Swimlanes */}
                  {Object.entries(swimlaneData).map(([type, events]) => {
                    if (events.length === 0) return null

                    const color = typeColors[type as keyof typeof typeColors]
                    const IconComponent =
                      type === "message"
                        ? MessageCircle
                        : type === "lab"
                          ? FlaskConical
                          : type === "plan"
                            ? FileText
                            : type === "device"
                              ? Activity
                              : Brain

                    return (
                      <div key={type} className="space-y-3">
                        {/* Swimlane Header */}
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${color}`} />
                          <h3 className={`font-semibold capitalize ${color}`}>
                            {type === "message"
                              ? "Messages"
                              : type === "lab"
                                ? "Lab Results"
                                : type === "plan"
                                  ? "Plans"
                                  : type === "device"
                                    ? "Device Data"
                                    : "Decisions"}
                          </h3>
                          <Badge variant="secondary" className={`${color} bg-current/20`}>
                            {events.length}
                          </Badge>
                        </div>

                        {/* Swimlane Content */}
                        <div className="relative">
                          {/* Timeline Track */}
                          <div className="absolute top-6 left-0 right-0 h-0.5 bg-border/30" />

                          {/* Events */}
                          <div className="flex items-center gap-4 pb-4 overflow-x-auto">
                            {events.map((event, index) => {
                              const isSelected = selectedEvent === event.id
                              const severityIntensity =
                                event.severity === "high"
                                  ? "opacity-100"
                                  : event.severity === "medium"
                                    ? "opacity-75"
                                    : "opacity-50"

                              const findProvKeyForEventInline = (evt: TimelineEvent): string | undefined => {
                                if (sampleDecisionProvenance[evt.id]) return evt.id
                                const byDay = (d: Date) => d.toDateString()
                                const entries = Object.entries(sampleDecisionProvenance)
                                const sameDay = entries.find(([_k, prov]) => prov.timestamp instanceof Date && evt.date instanceof Date && byDay(prov.timestamp) === byDay(evt.date))
                                if (sameDay) return sameDay[0]
                                // prefer nearest provenance within 30 days
                                if (evt.date instanceof Date) {
                                  let best: [string, number] | null = null
                                  entries.forEach(([k, prov]) => {
                                    if (!(prov.timestamp instanceof Date)) return
                                    const diff = Math.abs(prov.timestamp.getTime() - evt.date.getTime())
                                    if (best === null || diff < best[1]) best = [k, diff]
                                  })
                                  const maxWindow = 30 * 24 * 60 * 60 * 1000
                                  if (best && best[1] <= maxWindow) return best[0]
                                }
                                const title = evt.title?.toLowerCase() || ""
                                const fuzzy = entries.find(([_k, prov]) => (prov.title || "").toLowerCase().includes(title) || title.includes((prov.title || "").toLowerCase()))
                                if (fuzzy) return fuzzy[0]
                                return undefined
                              }

                              const hasProvenance = event.type === "decision" && !!findProvKeyForEventInline(event)

                              return (
                                <div
                                  key={event.id}
                                  className="flex flex-col items-center cursor-pointer group"
                                  onClick={() => handleEventClick(event)}
                                >
                                  {/* Event Node */}
                                  <div
                                    className={`
                                      w-4 h-4 rounded-full border-2 transition-all duration-200
                                      ${color.replace("text-", "border-")} ${color.replace("text-", "bg-")}
                                      ${severityIntensity}
                                      ${isSelected ? "neon-glow scale-125" : "group-hover:neon-glow-sm group-hover:scale-110"}
                                      ${hasProvenance ? "ring-2 ring-neon-purple/50 ring-offset-2 ring-offset-background" : ""}
                                    `}
                                  />

                                  {/* Event Details */}
                                  <div className="mt-2 text-center min-w-24">
                                    <div className="text-xs font-medium text-foreground truncate">
                                      {event.title}
                                      {hasProvenance && <span className="ml-1 text-neon-purple">*</span>}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </div>
                                    {event.sender && (
                                      <div className={`text-xs ${color} opacity-75`}>{event.sender}</div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Empty State */}
                  {filteredEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or timeline focus to see more data.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      <DecisionProvenanceModal
        isOpen={isDecisionModalOpen}
        onClose={handleDecisionModalClose}
        decision={selectedDecision ? sampleDecisionProvenance[selectedDecision] : null}
      />
    </div>
  )
}
