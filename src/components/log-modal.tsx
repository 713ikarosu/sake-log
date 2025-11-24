'use client'

import { useState } from 'react'
import { LogForm } from '@/components/log-form'
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export function LogModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 z-50 transition-transform hover:scale-105 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-8 h-8" />
        <span className="sr-only">ログ追加</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <LogForm onSuccess={() => setIsOpen(false)} />
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  )
}
