"use client"

import { useState, useEffect } from "react"
import { TaskProvider } from "@/lib/task-context"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { TaskStats } from "@/components/task-stats"
import { SmartSuggestions } from "@/components/smart-suggestions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckSquare, Plus, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function SmartTaskApp() {
  const [showForm, setShowForm] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // PWA installation prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white">SmartTask</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Modern Task Management PWA</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {isInstallable && (
                  <Button onClick={handleInstallClick} size="sm">
                    Install App
                  </Button>
                )}

                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid gap-6">
            {/* Stats Overview */}
            <TaskStats />

            {/* Smart Suggestions */}
            <SmartSuggestions />

            {/* Task Form */}
            {showForm && (
              <Card className="p-6">
                <TaskForm onClose={() => setShowForm(false)} />
              </Card>
            )}

            {/* Task List */}
            <TaskList />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center text-slate-600 dark:text-slate-400">
          <p className="text-sm">SmartTask PWA - Built with modern web standards for 2025</p>
        </footer>
      </div>
    </TaskProvider>
  )
}
