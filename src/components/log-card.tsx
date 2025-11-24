
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Beer, Star, Calendar, Home, Trees, Building2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogCardProps {
  log: {
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
    profiles: {
      username: string | null
    } | null
  }
}

const LocationIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case 'home': return <Home className="w-3 h-3" />
    case 'izakaya': return <Beer className="w-3 h-3" />
    case 'bar': return <Building2 className="w-3 h-3" />
    case 'outdoor': return <Trees className="w-3 h-3" />
    default: return <MapPin className="w-3 h-3" />
  }
}

const getLocationLabel = (type: string | null) => {
  switch (type) {
    case 'home': return '家'
    case 'izakaya': return '居酒屋'
    case 'bar': return 'バー'
    case 'outdoor': return '外'
    case 'other': return 'その他'
    default: return '不明'
  }
}

const getDrinkTypeLabel = (type: string | null) => {
  switch (type) {
    case 'beer': return 'ビール'
    case 'highball': return 'ハイボール'
    case 'wine': return 'ワイン'
    case 'sake': return '日本酒'
    case 'sour': return 'サワー'
    case 'other': return 'その他'
    default: return type
  }
}

export function LogCard({ log }: LogCardProps) {
  const displayTitle = log.drink_name || getDrinkTypeLabel(log.drink_type)

  return (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-md bg-card transition-all hover:shadow-lg">
      {log.image_url && (
        <div className="relative w-full aspect-square sm:aspect-video bg-muted">
          <img
            src={log.image_url}
            alt={displayTitle || 'Drink'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {log.rating && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {log.rating}
            </div>
          )}
        </div>
      )}

      <CardHeader className={cn("pb-2", log.image_url ? "pt-4" : "")}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold leading-tight">{displayTitle}</h3>
              {log.visibility === 'private' && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              by <span className="font-medium text-foreground">{log.profiles?.username || 'Unknown'}</span>
            </p>
          </div>
          {!log.image_url && log.rating && (
            <Badge variant="secondary" className="flex gap-1">
              <Star className="w-3 h-3 fill-current" />
              {log.rating}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 grid gap-2">
          <div className="flex flex-col gap-1 mb-2">
            {(log.location_type || log.location_name) && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <MapPin className="w-4 h-4 fill-primary/20" />
                <span>{log.location_name || getLocationLabel(log.location_type)}</span>
                {log.location_name && log.location_type !== 'other' && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({getLocationLabel(log.location_type)})
                  </span>
                )}
              </div>
            )}
          </div>

        {log.comment && (
          <p className="text-sm text-foreground/90 leading-relaxed">
            {log.comment}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 text-[10px] text-muted-foreground flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(log.drunk_at || log.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardFooter>
    </Card>
  )
}
