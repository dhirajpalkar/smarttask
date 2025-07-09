"use client"

import { useTaskContext } from "@/lib/task-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Lightbulb, TrendingUp, Target, X } from "lucide-react"
import { generateSmartSuggestions } from "@/lib/utils"
import { useState } from "react"

export function SmartSuggestions() {
  const { state } = useTaskContext()
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  const suggestions = generateSmartSuggestions(state.tasks).filter(
    (suggestion) => !dismissedSuggestions.includes(suggestion.id),
  )

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions((prev) => [...prev, suggestionId])
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return AlertTriangle
      case "priority":
        return Target
      case "completion":
        return TrendingUp
      case "organization":
        return Lightbulb
      default:
        return Lightbulb
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"
      case "priority":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800"
      case "completion":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
      case "organization":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800"
    }
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Smart Suggestions</h3>
        <Badge variant="secondary" className="text-xs">
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const Icon = getSuggestionIcon(suggestion.type)
          const colorClass = getSuggestionColor(suggestion.type)

          return (
            <div key={suggestion.id} className={`p-3 rounded-lg border ${colorClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs opacity-80 mt-1">{suggestion.description}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {suggestion.action && (
                <div className="mt-2 pl-7">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-transparent"
                    onClick={suggestion.action}
                  >
                    Take Action
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
