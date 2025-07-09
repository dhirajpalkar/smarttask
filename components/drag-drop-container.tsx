"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Task } from "@/lib/types"

interface DragDropContainerProps {
  tasks: Task[]
  onReorder: (tasks: Task[]) => void
  renderTask: (task: Task, isDragging?: boolean) => React.ReactNode
}

export function DragDropContainer({ tasks, onReorder, renderTask }: DragDropContainerProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedTask) return

    const dragIndex = tasks.findIndex((task) => task.id === draggedTask.id)
    if (dragIndex === dropIndex) return

    const newTasks = [...tasks]
    const [removed] = newTasks.splice(dragIndex, 1)
    newTasks.splice(dropIndex, 0, removed)

    onReorder(newTasks)
    setDraggedTask(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-all duration-200 ${dragOverIndex === index ? "transform scale-105" : ""}`}
        >
          {renderTask(task, draggedTask?.id === task.id)}
        </div>
      ))}
    </div>
  )
}
