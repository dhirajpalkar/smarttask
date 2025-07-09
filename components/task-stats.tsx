"use client"

import { useTaskContext } from "@/lib/task-context"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, Target } from "lucide-react"
import { isOverdue } from "@/lib/utils"

export function TaskStats() {
  const { state } = useTaskContext()

  const totalTasks = state.tasks.length
  const completedTasks = state.tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks
  const overdueTasks = state.tasks.filter((task) => !task.completed && task.dueDate && isOverdue(task.dueDate)).length
  const highPriorityTasks = state.tasks.filter((task) => !task.completed && task.priority === "high").length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Active",
      value: activeTasks,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        )
      })}

      {/* Completion Progress */}
      {totalTasks > 0 && (
        <Card className="p-4 col-span-2 lg:col-span-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </Card>
      )}
    </div>
  )
}
