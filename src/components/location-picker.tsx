'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useState, useCallback, useEffect } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

const containerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 35.69575,
  lng: 139.77521
}

type LocationPickerProps = {
  onLocationSelect: (location: { lat: number; lng: number }) => void
  currentLocation?: { lat: number; lng: number } | null
}

export function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(currentLocation || null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation)
    }
  }, [currentLocation])

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      })
    }
  }, [])

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          地図から選択
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>場所を選択</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[400px] relative rounded-md overflow-hidden border">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={selectedLocation || defaultCenter}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            この場所で決定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
