'use client'

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useCallback, useMemo } from 'react'
import { Loader2, Calendar, MapPin, Beer, Wine, Martini } from 'lucide-react'
import { renderToString } from 'react-dom/server'

const containerStyle = {
  width: '100%',
  height: '100%'
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
  latitude: number | null
  longitude: number | null
  image_url: string | null
  rating: number | null
  drunk_at: string
  profiles: {
    username: string | null
  } | null | any // Relaxing type to avoid lint errors with Supabase joins
}

type MapViewProps = {
  logs: MapLog[]
}

export function MapView({ logs }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedLog, setSelectedLog] = useState<MapLog | null>(null)

  // Filter logs that have valid location data
  const validLogs = useMemo(() => {
    return logs.filter(log =>
      typeof log.latitude === 'number' &&
      typeof log.longitude === 'number'
    ) as (MapLog & { latitude: number; longitude: number })[]
  }, [logs])

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Helper to get marker icon based on drink type
  const getMarkerIcon = (drinkType: string | null) => {
    const colors: Record<string, string> = {
      beer: '#EAB308', // Yellow-500
      wine: '#EF4444', // Red-500
      sake: '#3B82F6', // Blue-500
      highball: '#F97316', // Orange-500
      sour: '#22C55E', // Green-500
      other: '#6B7280', // Gray-500
    }

    const color = colors[drinkType || 'other'] || colors['other']

    // Map drink type to Lucide icon component
    const IconComponent = (() => {
      switch (drinkType) {
        case 'beer': return Beer
        case 'highball': return Beer
        case 'sour': return Beer
        case 'wine': return Wine
        case 'sake': return Martini // Using Martini for Sake as in LogForm
        default: return Beer
      }
    })()

    // Render the icon to an SVG string
    const iconSvgString = renderToString(
      <IconComponent
        size={20}
        color={color}
        strokeWidth={2.5}
      />
    )

    // Create the pin SVG with the embedded icon
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
        <!-- Pin Shape -->
        <path d="M16 0C7.16 0 0 7.16 0 16c0 9.6 16 26 16 26s16-16.4 16-26c0-8.84-7.16-16-16-16z" fill="${color}" stroke="white" stroke-width="2"/>

        <!-- Inner White Circle -->
        <circle cx="16" cy="16" r="11" fill="white" />

        <!-- Icon Container -->
        <g transform="translate(6, 6)">
          ${iconSvgString}
        </g>
      </svg>
    `

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(40, 52),
      anchor: new google.maps.Point(20, 52),
    }
  }

  return (
    <div className="w-full h-full relative min-h-[calc(100vh-120px)]">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={validLogs.length > 0 ? { lat: validLogs[0].latitude, lng: validLogs[0].longitude } : defaultCenter}
        zoom={validLogs.length > 0 ? 12 : 13}
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
        {validLogs.map((log) => (
          <Marker
            key={log.id}
            position={{ lat: log.latitude, lng: log.longitude }}
            onClick={() => setSelectedLog(log)}
            icon={getMarkerIcon(log.drink_type)}
          />
        ))}

        {selectedLog && selectedLog.latitude && selectedLog.longitude && (
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
