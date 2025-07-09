import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task, SmartSuggestion } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID(): string {
  // Modern UUID v4 generation
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Tomorrow"
  } else if (diffDays === -1) {
    return "Yesterday"
  } else if (diffDays > 1) {
    return `In ${diffDays} days`
  } else {
    return `${Math.abs(diffDays)} days ago`
  }
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}

export function getPriorityColor(priority: Task["priority"]): string {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800"
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800"
    case "low":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800"
  }
}

export function generateSmartSuggestions(tasks: Task[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []
  const now = new Date()

  // Check for overdue tasks
  const overdueTasks = tasks.filter((task) => !task.completed && task.dueDate && isOverdue(task.dueDate))

  if (overdueTasks.length > 0) {
    suggestions.push({
      id: "overdue-tasks",
      type: "overdue",
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""}`,
      description: "You have tasks that are past their due date. Consider prioritizing these items.",
    })
  }

  // Check for high priority incomplete tasks
  const highPriorityTasks = tasks.filter((task) => !task.completed && task.priority === "high")

  if (highPriorityTasks.length > 0) {
    suggestions.push({
      id: "high-priority",
      type: "priority",
      title: `${highPriorityTasks.length} High Priority Task${highPriorityTasks.length > 1 ? "s" : ""}`,
      description: "Focus on completing your high priority tasks first for maximum impact.",
    })
  }

  // Check completion rate
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (totalTasks > 5 && completionRate > 80) {
    suggestions.push({
      id: "great-progress",
      type: "completion",
      title: "Great Progress!",
      description: `You've completed ${completionRate.toFixed(0)}% of your tasks. Keep up the excellent work!`,
    })
  }

  // Suggest organization for many tasks
  const activeTasks = tasks.filter((task) => !task.completed).length
  if (activeTasks > 10) {
    suggestions.push({
      id: "organize-tasks",
      type: "organization",
      title: "Consider Task Organization",
      description: "You have many active tasks. Consider breaking them down or grouping similar ones.",
    })
  }

  return suggestions
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
