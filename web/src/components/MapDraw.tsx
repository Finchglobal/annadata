"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Fix for default Leaflet icon missing in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl; // eslint-disable-line @typescript-eslint/no-explicit-any
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapDrawProps {
  onPolygonDrawn: (areaHectares: number, geojson: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function MapDraw({ onPolygonDrawn }: MapDrawProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || map) return;

    const m = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);

    featureGroupRef.current.addTo(m);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: featureGroupRef.current,
      },
      draw: {
        polygon: {},
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
    });

    m.addControl(drawControl);

    m.on(L.Draw.Event.CREATED, (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const layer = e.layer;
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);

      // Calculate area in square meters using Leaflet GeometryUtil
      const latlngs = layer.getLatLngs()[0];
      const areaSqMeters = L.GeometryUtil.geodesicArea(latlngs);
      const areaHectares = areaSqMeters / 10000;

      onPolygonDrawn(areaHectares, layer.toGeoJSON());
    });

    setMap(m);

    return () => {
      m.remove();
    };
  }, [map, onPolygonDrawn]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg z-0" />;
}
