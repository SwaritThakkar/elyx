"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, MoreVertical, Phone, Video, Info } from "lucide-react"
import { type ChatMessage, roleColors, roleAvatars, sampleChatMessages } from "@/lib/sample-data"

interface ChatViewProps {
  messages?: ChatMessage[]
  currentUser?: string
  onSendMessage?: (content: string) => void
  className?: string
}

export function ChatView({
  messages = sampleChatMessages,
  currentUser = "Rohan",
  onSendMessage,
  className = "",
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // normalize timestamps to Date objects and ensure safe sender strings
  const normalizedMessages = useMemo(() => {
    return (messages || []).map((m) => {
      const ts = (m as any).timestamp ?? (m as any).date ?? null
      const date = ts instanceof Date ? ts : ts ? new Date(ts) : new Date(NaN)
      return { ...m, timestamp: date, sender: (m.sender ?? "").toString() }
    })
  }, [messages])

  // Auto-scroll to bottom when new messages arrive — scroll the inner container to avoid page-level jumps
  useEffect(() => {
    const container = scrollAreaRef.current
    if (container) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
        return
      } catch (e) {
        // fall through to element scrollIntoView as a safe fallback
      }
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [normalizedMessages.length])

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  // Group messages by date using normalizedMessages
  const groupedMessages = normalizedMessages.reduce((groups, message) => {
    const ts = message.timestamp instanceof Date && !isNaN(message.timestamp.getTime()) ? message.timestamp : new Date(NaN)
    const dateKey = isNaN(ts.getTime()) ? "Unknown" : ts.toDateString()
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(message)
    return groups
  }, {} as Record<string, ChatMessage[]>)

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-neon-cyan/30">
            <AvatarImage src="/elyx-team.png" />
            <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan font-bold">ET</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Elyx Care Team</h3>
            <p className="text-xs text-muted-foreground">Dr. Warren, Ruby, Rachel, Carla, Advik, Neel, Suzane</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-smooth">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-smooth">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-smooth">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-smooth">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
  <div ref={scrollAreaRef} className="flex-1 overflow-y-auto scroll-smooth-panel p-4">
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground px-3 py-1 rounded-smooth">
                  {formatDate(new Date(dateKey))}
                </Badge>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {dayMessages.map((message, index) => {
                  // safe sender name and comparison
                  const senderName = (message.sender ?? "").toString().trim()
                  const normSender = senderName.toLowerCase()
                  const normCurrent = (currentUser ?? "").toString().trim().toLowerCase()
                  const isCurrentUser = normSender && normCurrent && (normSender === normCurrent || normSender.includes(normCurrent) || normCurrent.includes(normSender))

                  const senderColor = roleColors[senderName as keyof typeof roleColors] || "text-foreground"
                  const senderAvatar = (roleAvatars && roleAvatars[senderName as keyof typeof roleAvatars]) || (senderName ? senderName.slice(0, 2).toUpperCase() : "U")

                  // Check if we should show avatar (first message from sender in a sequence)
                  const showAvatar = index === 0 || dayMessages[index - 1].sender !== message.sender
                  const showSenderName = showAvatar && !isCurrentUser

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      {/* Avatar for team members */}
                      {!isCurrentUser && (
                        <Avatar className={`h-8 w-8 ${showAvatar ? "opacity-100" : "opacity-0"} transition-opacity`}>
                          <AvatarFallback
                            className={`text-xs font-bold ${senderColor.replace("text-", "bg-")}/20 ${senderColor}`}
                          >
                            {senderAvatar}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                        {/* Sender name */}
                        {showSenderName && (
                          <span className={`text-xs font-medium mb-1 px-1 ${senderColor}`}>{message.sender}</span>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`
                            relative px-4 py-2 rounded-3xl max-w-full break-words
                            ${
                              isCurrentUser
                                ? "bg-neon-cyan/20 text-foreground rounded-br-lg"
                                : "bg-secondary/80 text-foreground rounded-bl-lg"
                            }
                            ${message.type === "system" ? "bg-muted/50 text-muted-foreground italic" : ""}
                            transition-all duration-200 hover:shadow-lg
                            ${isCurrentUser ? "hover:bg-neon-cyan/30" : "hover:bg-secondary"}
                          `}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>

                          {/* Message timestamp and status */}
                          <div
                            className={`flex items-center gap-1 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <span className="text-xs text-muted-foreground opacity-70">
                              {message.timestamp instanceof Date && !isNaN(message.timestamp.getTime()) ? formatTime(message.timestamp) : ""}
                            </span>
                            {isCurrentUser && message.status && (
                              <div className="flex">
                                {message.status === "sent" && (
                                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                )}
                                {message.status === "delivered" && (
                                  <div className="flex gap-0.5">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/70" />
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/70" />
                                  </div>
                                )}
                                {message.status === "read" && (
                                  <div className="flex gap-0.5">
                                    <div className="w-1 h-1 rounded-full bg-neon-cyan" />
                                    <div className="w-1 h-1 rounded-full bg-neon-cyan" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Spacer for current user messages */}
                      {isCurrentUser && <div className="w-8" />}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-neon-green/20 text-neon-green text-xs font-bold">ET</AvatarFallback>
              </Avatar>
              <div className="bg-secondary/80 px-4 py-2 rounded-3xl rounded-bl-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 bg-secondary/50 border-border/50 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 rounded-smooth"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-neon-cyan/30 rounded-smooth"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
