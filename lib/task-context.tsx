"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Task, TaskState, TaskAction } from "@/lib/types"
import { taskStorage } from "@/lib/task-storage"
import { generateUUID } from "@/lib/utils"

const TaskContext = createContext<{
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
} | null>(null)

const initialState: TaskState = {
  tasks: [],
  filter: "all",
  isLoading: true,
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "LOAD_TASKS":
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
      }

    case "ADD_TASK":
      const newTask: Task = {
        id: generateUUID(),
        title: action.payload.title,
        description: action.payload.description || "",
        priority: action.payload.priority || "medium",
        dueDate: action.payload.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      }

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload, updatedAt: new Date().toISOString() } : task,
        ),
      }

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }

    case "REORDER_TASKS":
      return {
        ...state,
        tasks: action.payload,
      }

    case "SET_FILTER":
      return {
        ...state,
        filter: action.payload,
      }

    default:
      return state
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      const tasks = await taskStorage.getTasks()
      dispatch({ type: "LOAD_TASKS", payload: tasks })
    }
    loadTasks()
  }, [])

  // Save tasks whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      taskStorage.saveTasks(state.tasks)
    }
  }, [state.tasks, state.isLoading])

  return <TaskContext.Provider value={{ state, dispatch }}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }
  return context
}
