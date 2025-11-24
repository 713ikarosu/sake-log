'use client'

import { useState } from 'react'
import { LogCard } from "@/components/log-card"
import { MapView } from "@/components/map-view"
import { Button } from "@/components/ui/button"
import { Beer, Map as MapIcon, List } from "lucide-react"
import { cn } from "@/lib/utils"

type Log = {
  id: string
  drink_name: string | null
  drink_type: string | null
  visibility: string | null
  location_type: string | null
  location_name: string | null
  rating: number | null
  comment: string | null
  image_url: string | null
  created_at: string
  drunk_at?: string
  latitude: number | null
  longitude: number | null
  profiles: {
    username: string | null
  } | null | any
}

export function MainView({ logs }: { logs: Log[] }) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  return (
    <div className="flex flex-col h-full">
      {/* View Toggle (Floating or Fixed) */}
      <div className="sticky top-14 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 px-4 py-2">
        <div className="flex p-1 bg-secondary rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === 'list'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
            リスト
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === 'map'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapIcon className="w-4 h-4" />
            マップ
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* List View */}
        <div className={cn(
          "container max-w-md mx-auto p-4 flex flex-col gap-6 transition-opacity duration-300",
          viewMode === 'list' ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
        )}>
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Beer className="w-8 h-8 opacity-50" />
              </div>
              <div>
                <p className="font-medium">まだ記録がありません</p>
                <p className="text-sm opacity-70">「＋」ボタンでお酒を記録しよう！</p>
              </div>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300 h-[calc(100vh-112px)]", // Adjust height for header + toggle
          viewMode === 'map' ? "opacity-100 z-10" : "opacity-0 pointer-events-none -z-10"
        )}>
          <MapView logs={logs.map(log => ({
            ...log,
            drunk_at: log.drunk_at || log.created_at, // Fallback to created_at
            latitude: log.latitude,
            longitude: log.longitude
          }))} />
        </div>
      </div>
    </div>
  )
}
