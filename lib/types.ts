export interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskState {
  tasks: Task[]
  filter: "all" | "active" | "completed"
  isLoading: boolean
}

export type TaskAction =
  | { type: "LOAD_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_TASK"; payload: Partial<Task> & { id: string } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: Task[] }
  | { type: "SET_FILTER"; payload: TaskState["filter"] }

export interface SmartSuggestion {
  id: string
  type: "overdue" | "priority" | "completion" | "organization"
  title: string
  description: string
  action?: () => void
}
