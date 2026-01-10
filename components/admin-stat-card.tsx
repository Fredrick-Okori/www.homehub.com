"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
}: {
  title: string
  value: string
  trend?: { value: string; direction: "up" | "down" }
  icon?: IconComponent
}) {
  return (
    <Card className="p-4 bg-zinc-900 border-zinc-800">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">{title}</p>
          <p className="text-xl font-bold text-white mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  subValue?: string
  icon?: IconComponent
  color?: "blue" | "green" | "purple" | "orange"
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  }

  return (
    <Card className="p-4 bg-zinc-900 border-zinc-800">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="text-xl font-bold text-white mt-1">{value}</p>
          {subValue && <p className="text-sm text-zinc-400">{subValue}</p>}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", color ? colorMap[color] : "bg-zinc-800") }>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
