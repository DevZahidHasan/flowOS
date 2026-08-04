"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      <span className="dark:hidden" aria-hidden="true">☀️</span>
      <span className="hidden dark:inline-block" aria-hidden="true">🌙</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
