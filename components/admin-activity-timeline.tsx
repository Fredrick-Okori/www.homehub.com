"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ActivityTimeline({ className }: { className?: string }) {
  const items = [
    { id: 1, title: "New application", desc: "John Smith applied for Modern Downtown Loft", time: "5m ago" },
    { id: 2, title: "Property sold", desc: "Suburban Family Home marked as sold", time: "1h ago" },
    { id: 3, title: "Price update", desc: "Beachfront Luxury Condo price updated", time: "3h ago" },
  ]

  return (
    <Card className={`p-0 bg-white border-gray-200 shadow-sm ${className || ""}`}>
      <CardHeader className="p-4 border-b border-gray-100">
        <CardTitle className="text-gray-900">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">{it.title}</p>
                <p className="text-xs text-gray-500">{it.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{it.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityTimeline

