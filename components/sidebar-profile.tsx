import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin, Plane, Activity } from "lucide-react"

export function SidebarProfile() {
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

      {/* Care Pillars */}
      <Card className="glass">
        <CardHeader>
          <h3 className="font-semibold font-space-grotesk text-neon-cyan">Care Pillars</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Chassis", desc: "Physical", color: "text-ruby" },
            { name: "Fuel", desc: "Nutrition", color: "text-warren" },
            { name: "Battery", desc: "Energy", color: "text-rachel" },
            { name: "Software", desc: "Mind", color: "text-advik" },
            { name: "Networking", desc: "Social", color: "text-carla" },
          ].map((pillar) => (
            <div key={pillar.name} className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${pillar.color}`}>{pillar.name}</div>
                <div className="text-xs text-muted-foreground">{pillar.desc}</div>
              </div>
              <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full bg-current ${pillar.color} opacity-60`} style={{ width: "50%" }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
