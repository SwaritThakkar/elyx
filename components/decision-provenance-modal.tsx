"use client"

import { useState } from "react"
import type { DecisionProvenanceData, DecisionNode } from "@/lib/sample-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Activity,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
} from "lucide-react"

// use types from lib/sample-data

interface DecisionProvenanceModalProps {
  isOpen: boolean
  onClose: () => void
  decision: DecisionProvenanceData | null
}

export function DecisionProvenanceModal({ isOpen, onClose, decision }: DecisionProvenanceModalProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  if (!decision) return null

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderDecisionNode = (node: DecisionNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    const getNodeIcon = () => {
      switch (node.type) {
        case "condition":
          return <AlertTriangle className="h-4 w-4 text-neon-orange" />
        case "action":
          return <Target className="h-4 w-4 text-neon-cyan" />
        case "evidence":
          return <FileText className="h-4 w-4 text-neon-green" />
        case "outcome":
          return <CheckCircle className="h-4 w-4 text-neon-purple" />
        default:
          return <Brain className="h-4 w-4" />
      }
    }

    const getNodeColor = () => {
      switch (node.type) {
        case "condition":
          return "border-neon-orange/30 bg-neon-orange/10"
        case "action":
          return "border-neon-cyan/30 bg-neon-cyan/10"
        case "evidence":
          return "border-neon-green/30 bg-neon-green/10"
        case "outcome":
          return "border-neon-purple/30 bg-neon-purple/10"
        default:
          return "border-border bg-secondary/50"
      }
    }

    return (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div
          className={`
            p-3 rounded-lg border glass transition-all duration-200 hover:shadow-lg cursor-pointer
            ${getNodeColor()}
          `}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              {getNodeIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm text-foreground">{node.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {Math.round(node.confidence ?? 0)}% confidence
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{node.description}</p>

              {(node.evidence ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(node.evidence ?? []).map((evidence, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {evidence}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2 border-l-2 border-border/30 ml-6 pl-4">
            {node.children!.map((child) => renderDecisionNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-neon-green"
    if (confidence >= 60) return "text-neon-cyan"
    if (confidence >= 40) return "text-neon-orange"
    return "text-red-400"
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "lab":
        return <Activity className="h-4 w-4 text-neon-cyan" />
      case "symptom":
        return <AlertTriangle className="h-4 w-4 text-neon-orange" />
      case "history":
        return <Clock className="h-4 w-4 text-neon-purple" />
      case "literature":
        return <FileText className="h-4 w-4 text-neon-green" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Brain className="h-6 w-6 text-neon-cyan" />
            Decision Provenance: {decision.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reasoning">Reasoning Tree</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="glass p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-neon-cyan" />
                    <span className="font-medium text-sm">Decision Maker</span>
                  </div>
                  <p className="text-foreground">{decision.decisionMaker}</p>
                </div>

                <div className="glass p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-neon-purple" />
                    <span className="font-medium text-sm">Timestamp</span>
                  </div>
                  <p className="text-foreground">{decision.timestamp.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="glass p-4 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-neon-green" />
                      <span className="font-medium text-sm">Confidence Level</span>
                    </div>
                    <span className={`font-bold ${getConfidenceColor(Math.round((decision.confidence ?? 0) * (decision.confidence > 1 ? 1 : 100)))}`}>
                          {typeof decision.confidence === "number" && decision.confidence <= 1
                            ? Math.round((decision.confidence ?? 0) * 100)
                            : Math.round(decision.confidence ?? 0)}%
                        </span>
                      </div>
                      <Progress
                        value={typeof decision.confidence === "number" && decision.confidence <= 1 ? (decision.confidence ?? 0) * 100 : (decision.confidence ?? 0)}
                        className="h-2"
                      />
                </div>

                {decision.outcome && (
                  <div className="glass p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-neon-green" />
                      <span className="font-medium text-sm">Outcome Status</span>
                    </div>
                    <Badge
                      variant={decision.outcome.status === "successful" ? "default" : "secondary"}
                      className="mb-2"
                    >
                      {decision.outcome.status.replace("_", " ")}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{decision.outcome.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-neon-orange" />
                <span className="font-medium">Reasoning Summary</span>
              </div>
              <p className="text-foreground leading-relaxed">{decision.reasoning}</p>
            </div>
          </TabsContent>

          <TabsContent value="reasoning" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">{renderDecisionNode(decision.decisionTree)}</div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {decision.evidenceSources.map((evidence, index) => (
                  <div key={index} className="glass p-4 rounded-lg border border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getEvidenceIcon(evidence.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm capitalize">{evidence.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {typeof evidence.relevance === "number" && evidence.relevance <= 1
                                ? Math.round(evidence.relevance * 100)
                                : Math.round(evidence.relevance)}% relevance
                            </Badge>
                          </div>
                          <p className="text-foreground text-sm">{evidence.source}</p>
                          <p className="text-xs text-muted-foreground mt-1">{evidence.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Progress
                        value={typeof evidence.relevance === "number" && evidence.relevance <= 1 ? evidence.relevance * 100 : evidence.relevance}
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {decision.alternatives.map((alternative, index) => (
                  <div
                    key={index}
                    className={`
                      glass p-4 rounded-lg border transition-all duration-200
                      ${
                        alternative.rejected ? "border-red-500/30 bg-red-500/5" : "border-neon-green/30 bg-neon-green/5"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{alternative.option}</span>
                          <Badge variant={alternative.rejected ? "destructive" : "default"} className="text-xs">
                            {alternative.rejected ? "Rejected" : "Considered"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{alternative.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold ${getConfidenceColor(
                            Math.round((alternative.confidence ?? 0) * (alternative.confidence > 1 ? 1 : 100)),
                          )}`}
                        >
                          {typeof alternative.confidence === "number" && alternative.confidence <= 1
                            ? Math.round((alternative.confidence ?? 0) * 100)
                            : Math.round(alternative.confidence ?? 0)}%
                        </span>
                        <Progress
                          value={typeof alternative.confidence === "number" && alternative.confidence <= 1 ? (alternative.confidence ?? 0) * 100 : (alternative.confidence ?? 0)}
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
