"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { TaskItem } from "@/components/task-item"
import { DragDropContainer } from "@/components/drag-drop-container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SortAsc } from "lucide-react"
import type { Task } from "@/lib/types"

export function TaskList() {
  const { state, dispatch } = useTaskContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("created")

  const filteredTasks = state.tasks
    .filter((task) => {
      // Filter by completion status
      if (state.filter === "active" && task.completed) return false
      if (state.filter === "completed" && !task.completed) return false

      // Filter by search term
      if (searchTerm) {
        return (
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()

        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]

        case "created":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    dispatch({ type: "REORDER_TASKS", payload: reorderedTasks })
  }

  if (state.isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading tasks...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={state.filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch({ type: "SET_FILTER", payload: "all" })}
            >
              All
              <Badge variant="secondary" className="ml-2">
                {state.tasks.length}
              </Badge>
            </Button>
            <Button
              variant={state.filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch({ type: "SET_FILTER", payload: "active" })}
            >
              Active
              <Badge variant="secondary" className="ml-2">
                {state.tasks.filter((t) => !t.completed).length}
              </Badge>
            </Button>
            <Button
              variant={state.filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch({ type: "SET_FILTER", payload: "completed" })}
            >
              Done
              <Badge variant="secondary" className="ml-2">
                {state.tasks.filter((t) => t.completed).length}
              </Badge>
            </Button>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500">
            {state.tasks.length === 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                <p>Create your first task to get started!</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">No tasks match your filter</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <DragDropContainer
          tasks={filteredTasks}
          onReorder={handleReorderTasks}
          renderTask={(task) => <TaskItem key={task.id} task={task} />}
        />
      )}
    </div>
  )
}
