import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin, Plane, Activity, MessageCircle } from "lucide-react"
import { sampleEvents, sampleChatMessages } from "@/lib/sample-data"
export function SidebarProfile({ selectedMonth }: { selectedMonth: number }) {
  // Event category definitions
  const eventTypes = [
    { type: "message", label: "Messages", color: "text-neon-green" },
    { type: "lab", label: "Lab Results", color: "text-neon-magenta" },
    { type: "plan", label: "Plans", color: "text-neon-blue" },
    { type: "device", label: "Device Data", color: "text-rachel" },
    { type: "decision", label: "Decisions", color: "text-neon-purple" },
  ]
  // Get month/year
  const months = [
    { month: 0, year: 2025 },
    { month: 1, year: 2025 },
    { month: 2, year: 2025 },
    { month: 3, year: 2025 },
    { month: 4, year: 2025 },
    { month: 5, year: 2025 },
    { month: 6, year: 2025 },
    { month: 7, year: 2025 },
  ]
  const { month, year } = months[selectedMonth] || months[0]
  // Filter events for selected month
  const monthEvents = sampleEvents.filter(
    (event: any) => event.date.getMonth() === month && event.date.getFullYear() === year
  )
  // Count by type
  const eventCounts: Record<string, number> = {}
  eventTypes.forEach(({ type }) => {
    eventCounts[type] = monthEvents.filter((e: any) => e.type === type).length
  })
  // Count chat messages for the selected month and year
  const monthMessages = sampleChatMessages.filter(
    (msg: any) => {
      const ts = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      return ts.getMonth() === month && ts.getFullYear() === year && msg.type === "text"
    }
  )
  const messageCount = monthMessages.length

  return (
    <div className="p-6 space-y-6">
      {/* Profile Card */}
      <Card className="glass neon-border border-neon-cyan/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-neon-cyan/50">
              <AvatarImage src="/professional-headshot.png" />
              <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan font-bold text-lg">RP</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold font-space-grotesk text-foreground">Rohan Patel</h2>
              <p className="text-sm text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-neon-green" />
            <span className="text-foreground">Singapore</span>
          </div>

          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-neon-blue" />
            <Badge variant="secondary" className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">
              Traveling
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-neon-magenta" />
            <span className="text-sm text-foreground">POTS Management</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Contact Stats */}
        <Card className="glass">
          <CardHeader>
            <h3 className="font-semibold font-space-grotesk text-neon-cyan flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-neon-cyan" />
              Points of Contact
            </h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Only one Messages field, using chat message count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neon-green">Messages</span>
              <Badge variant="secondary" className="bg-neon-green/10 text-neon-green border-neon-green/30">
                {messageCount}
              </Badge>
            </div>
            {/* All other non-message event types from timeline events */}
            {eventTypes
              .filter(et => et.type !== 'message')
              .map(({ type, label, color }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-sm ${color}`}>{label}</span>
                  <Badge variant="secondary" className={`${color} bg-current/10 border-current/30`}>
                    {eventCounts[type]}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
    </div>
  )
}
