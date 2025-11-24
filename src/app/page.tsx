import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { LogCard } from "@/components/log-card"
import { LogModal } from "@/components/log-modal"
import { MainView } from "@/components/main-view"
import { Button } from "@/components/ui/button"
import { Beer, User } from "lucide-react"

export default async function Home() {
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('logs')
    .select(`
      *,
      profiles (username)
    `)
    .order('drunk_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-md mx-auto h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Beer className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">ちどりマップ</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <MainView logs={logs || []} />
      </main>

      <LogModal />
    </div>
  )
}
