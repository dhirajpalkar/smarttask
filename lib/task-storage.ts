import type { Task } from "@/lib/types"

class TaskStorage {
  private readonly STORAGE_KEY = "smarttask_tasks"
  private readonly VERSION_KEY = "smarttask_version"
  private readonly CURRENT_VERSION = "1.0.0"

  async getTasks(): Promise<Task[]> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        return []
      }

      // Version check for data migration
      const storedVersion = localStorage.getItem(this.VERSION_KEY)
      if (storedVersion !== this.CURRENT_VERSION) {
        await this.migrateData(storedVersion)
      }

      const tasksJson = localStorage.getItem(this.STORAGE_KEY)
      if (!tasksJson) {
        return []
      }

      const tasks = JSON.parse(tasksJson) as Task[]
      return this.validateTasks(tasks)
    } catch (error) {
      console.error("Error loading tasks:", error)
      return []
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      if (typeof window === "undefined") {
        return
      }

      const validTasks = this.validateTasks(tasks)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validTasks))
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)
    } catch (error) {
      console.error("Error saving tasks:", error)
    }
  }

  async clearTasks(): Promise<void> {
    try {
      if (typeof window === "undefined") {
        return
      }

      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing tasks:", error)
    }
  }

  async exportTasks(): Promise<string> {
    const tasks = await this.getTasks()
    return JSON.stringify(
      {
        version: this.CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        tasks,
      },
      null,
      2,
    )
  }

  async importTasks(jsonData: string): Promise<Task[]> {
    try {
      const data = JSON.parse(jsonData)
      const tasks = Array.isArray(data) ? data : data.tasks || []
      const validTasks = this.validateTasks(tasks)
      await this.saveTasks(validTasks)
      return validTasks
    } catch (error) {
      console.error("Error importing tasks:", error)
      throw new Error("Invalid task data format")
    }
  }

  private validateTasks(tasks: any[]): Task[] {
    return tasks
      .filter((task) => {
        return (
          task &&
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.completed === "boolean" &&
          task.createdAt &&
          task.updatedAt
        )
      })
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate,
        completed: task.completed,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
  }

  private async migrateData(oldVersion: string | null): Promise<void> {
    // Handle data migration for future versions
    console.log(`Migrating data from version ${oldVersion} to ${this.CURRENT_VERSION}`)
    // Migration logic would go here
  }
}

export const taskStorage = new TaskStorage()
