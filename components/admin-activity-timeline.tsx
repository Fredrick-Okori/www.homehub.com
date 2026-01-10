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
    <Card className={`p-0 bg-zinc-900 border-zinc-800 ${className || ""}`}>
      <CardHeader className="p-4 border-b border-zinc-800">
        <CardTitle className="text-white">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-white">{it.title}</p>
                <p className="text-xs text-zinc-400">{it.desc}</p>
                <p className="text-[10px] text-zinc-500 mt-1">{it.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="p-4 border-b border-zinc-800">
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <Button className="w-full">Create Listing</Button>
          <Button variant="ghost" className="w-full">Review Applications</Button>
          <Button variant="outline" className="w-full">Export Data</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityTimeline
