'use client'

import { useState, useRef } from 'react'
import { createLog } from '@/app/log/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Home, Beer, Trees, Building2, Star, X, Loader2, MapPin, Wine, Martini, Lock, Calendar } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LocationPicker } from "@/components/location-picker"

export function LogForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const [drinkType, setDrinkType] = useState<string>('')
  const [locationType, setLocationType] = useState('home')
  const [rating, setRating] = useState(3)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const [visibility, setVisibility] = useState('public')

  const handleSubmit = async (formData: FormData) => {
    if (!drinkType) {
      toast.error('お酒の種類を選んでください', {
        style: { background: '#fee2e2', color: '#ef4444', border: 'none' }
      })
      return
    }
    setIsUploading(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        const supabase = createClient()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('log-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('log-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      formData.append('image_url', imageUrl)
      formData.set('drink_type', drinkType)
      formData.set('location_type', locationType)
      formData.set('rating', rating.toString())
      formData.set('visibility', visibility)
      if (location) {
        formData.set('latitude', location.lat.toString())
        formData.set('longitude', location.lng.toString())
      }

      const result = await createLog(formData)

      if (result?.error === 'unauthenticated') {
        toast("ログインが必要です", {
          description: "記録するにはログインしてください 🍶",
          action: {
            label: "ログイン",
            onClick: () => router.push('/login')
          },
          duration: 4000,
        })
        setTimeout(() => router.push('/login'), 1500)
        return
      }

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success("乾杯！記録しました 🍻", {
        style: { background: '#dcfce7', color: '#166534', border: 'none' }
      })

      if (onSuccess) {
        onSuccess()
      } else {
        // If not in modal (e.g. /log/new), redirect to home
        router.push('/')
      }
    } catch (error) {
      console.error('Error creating log:', error)
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const drinkTypes = [
    { id: 'beer', label: 'ビール', icon: Beer },
    { id: 'highball', label: 'ハイボール', icon: Beer }, // Using Beer icon as proxy
    { id: 'wine', label: 'ワイン', icon: Wine },
    { id: 'sake', label: '日本酒', icon: Martini }, // Using Martini as proxy
    { id: 'sour', label: 'サワー', icon: Beer },
    { id: 'other', label: 'その他', icon: Beer },
  ]

  return (
    <Card className="w-full border-0 shadow-none bg-transparent pt-12">
      <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-primary">記録する</CardTitle>
        <button
          type="button"
          onClick={() => setVisibility(v => v === 'public' ? 'private' : 'public')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            visibility === 'public'
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {visibility === 'public' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              公開
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              自分のみ
            </>
          )}
        </button>
      </CardHeader>
      <form action={handleSubmit} className='grid gap-6'>
        <CardContent className="grid gap-6 px-0">

          {/* Drink Type Selection (Main) */}
          <div className="grid gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">何を飲んでる？ (必須)</Label>
            <div className="grid grid-cols-3 gap-2">
              {drinkTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setDrinkType(type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all h-20",
                    drinkType === type.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="drink_type" value={drinkType} />
            <input type="hidden" name="visibility" value={visibility} />
          </div>

          {/* Date Selection */}
          <div className="grid gap-2">
            <Label htmlFor="drunk_at" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">飲んだ日時</Label>
            <div className="relative">
              <Input
                type="datetime-local"
                id="drunk_at"
                name="drunk_at"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="bg-card/50 pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Drink Name (Optional) */}
          <div className="grid gap-2">
            <Label htmlFor="drink_name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">銘柄・商品名 (任意)</Label>
            <Input
              id="drink_name"
              name="drink_name"
              placeholder="例: 角ハイボール、アサヒスーパードライ"
              className="bg-card/50"
            />
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
             <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">写真</Label>
             <div className="flex items-center gap-4">
               <Button
                 type="button"
                 variant="outline"
                 size="icon"
                 className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <Camera className="w-6 h-6 text-muted-foreground" />
               </Button>
               <input
                 type="file"
                 ref={fileInputRef}
                 className="hidden"
                 accept="image/*"
                 onChange={handleImageSelect}
               />
               {imagePreview && (
                 <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                   <button
                     type="button"
                     onClick={() => {
                       setImageFile(null)
                       setImagePreview(null)
                       if (fileInputRef.current) fileInputRef.current.value = ''
                     }}
                     className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md hover:bg-black/70"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               )}
             </div>
          </div>

          {/* Location Section */}
          <div className="grid gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              場所 (どこで飲んだ？)
            </Label>

            {/* Location Name Input */}
            <div className="flex gap-2">
              <Input
                name="location_name"
                placeholder="店名や場所の名前 (例: 鳥貴族 渋谷店)"
                className="bg-background flex-1"
              />
            {/* Location Actions */}
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 transition-colors",
                  location ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""
                )}
                onClick={() => {
                  if (location) {
                    setLocation(null)
                    toast.info("位置情報をクリアしました")
                    return
                  }
                  setIsLocating(true)
                  if (!navigator.geolocation) {
                    toast.error("お使いのブラウザは位置情報をサポートしていません")
                    setIsLocating(false)
                    return
                  }
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      })
                      toast.success("現在地を取得しました 📍")
                      setIsLocating(false)
                    },
                    (error) => {
                      console.error(error)
                      toast.error("位置情報の取得に失敗しました")
                      setIsLocating(false)
                    }
                  )
                }}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className={cn("w-4 h-4", location ? "fill-current" : "")} />
                )}
                {location ? "位置情報を削除" : "現在地を取得"}
              </Button>

              <LocationPicker
                onLocationSelect={(loc) => {
                  setLocation(loc)
                  toast.success("地図から場所を選択しました 📍")
                }}
                currentLocation={location}
              />
            </div>
            </div>

            {location && (
              <div className="text-[10px] text-primary flex items-center gap-1 px-1">
                <MapPin className="w-3 h-3 fill-current" />
                位置情報を添付済み ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </div>
            )}
            <input type="hidden" name="latitude" value={location?.lat || ''} />
            <input type="hidden" name="longitude" value={location?.lng || ''} />

            {/* Location Type Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'izakaya', icon: Beer, label: '居酒屋' },
                { id: 'bar', icon: Building2, label: 'バー' },
                { id: 'home', icon: Home, label: '家' },
                { id: 'outdoor', icon: Trees, label: '外' },
                { id: 'other', icon: MapPin, label: 'その他' },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocationType(loc.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all min-w-[60px]",
                    locationType === loc.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-background text-muted-foreground hover:bg-background/80"
                  )}
                >
                  <loc.icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{loc.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="location_type" value={locationType} />
          </div>

          {/* Rating */}
          <div className="grid gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">評価</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>

          {/* Comment */}
          <div className="grid gap-2">
            <Label htmlFor="comment" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">コメント</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="感想を一言（任意）"
              className="resize-none bg-card/50"
            />
          </div>

        </CardContent>
        <CardFooter className="px-0">
          <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" disabled={isUploading || !drinkType}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                注いでいます...
              </>
            ) : (
              '乾杯！ (保存)'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
