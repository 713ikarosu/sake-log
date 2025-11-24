'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, getProfile } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Camera, Loader2, User } from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile()
      if (profile) {
        setUsername(profile.username || '')
        setAvatarUrl(profile.avatar_url)
      } else {
        // Redirect if not logged in
        router.push('/login')
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length < 3) {
      toast.error("ユーザー名は3文字以上にしてください")
      return
    }

    setIsSaving(true)
    try {
      let finalAvatarUrl = avatarUrl

      if (avatarFile) {
        const supabase = createClient()
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        finalAvatarUrl = publicUrl
      }

      const formData = new FormData()
      formData.append('username', username)
      if (finalAvatarUrl) {
        formData.append('avatar_url', finalAvatarUrl)
      }

      const result = await updateProfile(formData)

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success("プロフィールを更新しました")
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-md mx-auto h-14 flex items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="ml-4 text-lg font-bold tracking-tight">プロフィール編集</h1>
        </div>
      </header>

      <main className="container max-w-md mx-auto p-4">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="grid gap-8">

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-secondary flex items-center justify-center">
                    {previewUrl || avatarUrl ? (
                      <img
                        src={previewUrl || avatarUrl || ''}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">タップして画像を変更</p>
              </div>

              {/* Username Input */}
              <div className="grid gap-2">
                <Label htmlFor="username">ユーザー名</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="表示名を入力"
                  className="h-12 text-lg"
                />
                <p className="text-xs text-muted-foreground">3文字以上で入力してください</p>
              </div>

              <Button type="submit" size="lg" className="w-full font-bold" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存する'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
