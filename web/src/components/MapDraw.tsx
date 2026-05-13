"use client";

import { useEffect, useRef, useCallback } from "react";

interface MapDrawProps {
  onPolygonDrawn: (areaHectares: number, geojson: object) => void;
}

export default function MapDraw({ onPolygonDrawn }: MapDrawProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const featureGroupRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const handlePolygonDrawn = useCallback(
    (areaHectares: number, geojson: object) => {
      onPolygonDrawn(areaHectares, geojson);
    },
    [onPolygonDrawn]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to ensure it only runs client-side
    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet-draw");

      // Fix Leaflet default icon paths broken by webpack
      // @ts-expect-error - _getIconUrl is not in the types
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Init map centered on India
      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const featureGroup = new L.FeatureGroup();
      featureGroup.addTo(map);
      featureGroupRef.current = featureGroup;

      const drawControl = new L.Control.Draw({
        edit: { featureGroup },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#1b4332", fillColor: "#d8f3dc", fillOpacity: 0.4 },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const layer = e.layer;
        featureGroup.clearLayers();
        featureGroup.addLayer(layer);

        const latlngs = layer.getLatLngs()[0];
        const areaSqMeters = L.GeometryUtil.geodesicArea(latlngs);
        const areaHectares = areaSqMeters / 10000;

        handlePolygonDrawn(areaHectares, layer.toGeoJSON());
      });

      mapInstanceRef.current = map;

      // Force Leaflet to recalculate size after mount
      setTimeout(() => map.invalidateSize(), 200);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [handlePolygonDrawn]);

  return (
    <div
      ref={mapRef}
      style={{ height: "420px", width: "100%" }}
      className="rounded-xl border border-gray-200 overflow-hidden z-0"
    />
  );
}
