'use client'

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useCallback, useEffect } from 'react'
import { Loader2, Beer, Calendar, MapPin } from 'lucide-react'
import { getMapLogs } from './actions'
import { useRouter } from 'next/navigation'

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 56px)'
}

const defaultCenter = {
  lat: 35.69575,
  lng: 139.77521
}

type MapLog = {
  id: string
  drink_type: string | null
  drink_name: string | null
  location_name: string | null
  latitude: number
  longitude: number
  image_url: string | null
  rating: number | null
  drunk_at: string
  profiles: {
    username: string | null
  } | null
}

export default function MapPage() {
  const router = useRouter()
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [logs, setLogs] = useState<MapLog[]>([])
  const [selectedLog, setSelectedLog] = useState<MapLog | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getMapLogs()
      // Filter out logs with null lat/lng just in case, though query handles it
      const validLogs = data.filter(log => log.latitude && log.longitude) as MapLog[]
      setLogs(validLogs)
    }
    fetchLogs()
  }, [])

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg inline-flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-sm font-bold">← リストに戻る</span>
        </div>
      </header>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={logs.length > 0 ? { lat: logs[0].latitude, lng: logs[0].longitude } : defaultCenter}
        zoom={logs.length > 0 ? 12 : 13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {logs.map((log) => (
          <Marker
            key={log.id}
            position={{ lat: log.latitude, lng: log.longitude }}
            onClick={() => setSelectedLog(log)}
          />
        ))}

        {selectedLog && (
          <InfoWindow
            position={{ lat: selectedLog.latitude, lng: selectedLog.longitude }}
            onCloseClick={() => setSelectedLog(null)}
          >
            <div className="p-2 max-w-[200px]">
              {selectedLog.image_url && (
                <div className="w-full h-24 mb-2 rounded-md overflow-hidden">
                  <img src={selectedLog.image_url} alt="Drink" className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-bold text-sm mb-1">{selectedLog.drink_name || selectedLog.drink_type}</h3>
              {selectedLog.location_name && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedLog.location_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(selectedLog.drunk_at).toLocaleDateString()}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
