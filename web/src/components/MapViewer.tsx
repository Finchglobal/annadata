"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface MapViewerProps {
  geojson: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function MapViewer({ geojson }: MapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current || !geojson) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      const layer = L.geoJSON(geojson, {
        style: {
          color: "#10b981", // primary
          fillColor: "#FFB703", // accent
          fillOpacity: 0.4,
          weight: 3,
        }
      }).addTo(map);

      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      mapInstanceRef.current = map;
      
      setTimeout(() => map.invalidateSize(), 500);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson]);

  if (!geojson) return <div className="text-gray-400 text-xs italic text-center p-4">No map data available</div>;

  return (
    <div className="relative rounded-2xl border-2 border-emerald-50 shadow-inner overflow-hidden z-0">
      <div ref={mapRef} style={{ height: "200px", width: "100%" }} />
    </div>
  );
}
