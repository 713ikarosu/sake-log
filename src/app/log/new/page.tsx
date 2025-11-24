import Link from "next/link"
import { LogForm } from "@/components/log-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewLogPage() {
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center relative">
      <Button asChild variant="ghost" size="icon" className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/">
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">ホームに戻る</span>
        </Link>
      </Button>

      <div className="w-full max-w-md">
        <LogForm />
      </div>
    </div>
  )
}
