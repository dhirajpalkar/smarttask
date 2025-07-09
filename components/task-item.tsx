"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import type { Task } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, Edit, Trash2, MoreVertical, AlertTriangle, GripVertical } from "lucide-react"
import { formatDate, isOverdue, getPriorityColor } from "@/lib/utils"
import { TaskForm } from "@/components/task-form"

interface TaskItemProps {
  task: Task
  isDragging?: boolean
}

export function TaskItem({ task, isDragging }: TaskItemProps) {
  const { dispatch } = useTaskContext()
  const [isEditing, setIsEditing] = useState(false)

  const handleToggleComplete = () => {
    dispatch({
      type: "UPDATE_TASK",
      payload: { id: task.id, completed: !task.completed },
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      dispatch({ type: "DELETE_TASK", payload: task.id })
    }
  }

  const isTaskOverdue = task.dueDate && !task.completed && isOverdue(task.dueDate)

  if (isEditing) {
    return (
      <Card className="p-4">
        <TaskForm task={task} onClose={() => setIsEditing(false)} />
      </Card>
    )
  }

  return (
    <Card
      className={`p-4 transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      } ${task.completed ? "opacity-75" : ""} ${
        isTaskOverdue ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab active:cursor-grabbing" />
          <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} className="mt-1" />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`font-medium text-slate-900 dark:text-white ${
                  task.completed ? "line-through text-slate-500" : ""
                }`}
              >
                {task.title}
                {isTaskOverdue && <AlertTriangle className="inline h-4 w-4 text-red-500 ml-2" />}
              </h3>

              {task.description && (
                <p
                  className={`text-sm text-slate-600 dark:text-slate-400 mt-1 ${task.completed ? "line-through" : ""}`}
                >
                  {task.description}
                </p>
              )}

              {/* Task Meta */}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </Badge>

                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isTaskOverdue ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDate(task.createdAt)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  )
}
