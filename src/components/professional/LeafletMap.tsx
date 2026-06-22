'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LeafletMapProps {
  value?: { lat: number; lng: number }
  onChange: (coords: { lat: number; lng: number }) => void
}

export default function LeafletMap({ value, onChange }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markerInstance = useRef<L.Marker | null>(null)
  
  const defaultLat = value?.lat || 51.505
  const defaultLng = value?.lng || -0.09

  useEffect(() => {
    if (!mapRef.current) return

    // Fix default marker icon issues in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Beautiful dark/neon-themed tiles for premium looks
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    // Add marker
    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)
    markerInstance.current = marker

    mapInstance.current = map

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      onChange({ lat, lng })
    })

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onChange({ lat: position.lat, lng: position.lng })
    })

    return () => {
      map.remove()
      mapInstance.current = null
      markerInstance.current = null
    }
  }, [])

  // Update map position when value changes externally
  useEffect(() => {
    if (mapInstance.current && markerInstance.current && value) {
      const currentLatLng = markerInstance.current.getLatLng()
      if (currentLatLng.lat !== value.lat || currentLatLng.lng !== value.lng) {
        markerInstance.current.setLatLng([value.lat, value.lng])
        mapInstance.current.setView([value.lat, value.lng], mapInstance.current.getZoom())
      }
    }
  }, [value])

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden border border-border shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 z-[1000] bg-card/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 text-[10px] font-medium text-foreground pointer-events-none">
        Click map or drag pin to update business location
      </div>
    </div>
  )
}
