"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
    document.documentElement.classList.add('theme-transition')

    return () => {
      document.documentElement.style.removeProperty('--theme-transition')
      document.documentElement.classList.remove('theme-transition')
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-transform duration-500 ease-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-transform duration-500 ease-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}