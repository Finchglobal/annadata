"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { MOCK_LOCATIONS } from "@/lib/indiaData";

interface MapDrawProps {
  onPolygonDrawn: (areaHectares: number, geojson: object) => void;
  initialSearch?: {
    state?: string;
    district?: string;
    village?: string;
    ward?: string;
  };
}

export default function MapDraw({ onPolygonDrawn, initialSearch }: MapDrawProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const featureGroupRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  
  const [searchQuery, setSearchQuery] = useState({
    state: initialSearch?.state || "",
    district: initialSearch?.district || "",
    village: initialSearch?.village || "",
    ward: initialSearch?.ward || "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [potentialReward, setPotentialReward] = useState<number | null>(null);

  const onPolygonDrawnRef = useRef(onPolygonDrawn);
  useEffect(() => {
    onPolygonDrawnRef.current = onPolygonDrawn;
  }, [onPolygonDrawn]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet-draw");

      // Fix icon paths
      // @ts-expect-error - _getIconUrl is not in types
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

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
        edit: {
          featureGroup: featureGroup,
          remove: true,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#1b4332",
              fillColor: "#d8f3dc",
              fillOpacity: 0.4,
              weight: 3,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
      });
      map.addControl(drawControl);

      // Handle creation
      map.on(L.Draw.Event.CREATED, (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const layer = e.layer;
        featureGroup.clearLayers();
        featureGroup.addLayer(layer);
        updatePolygonData(L, layer);
      });

      // Handle edits (dragging points)
      map.on(L.Draw.Event.EDITED, (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        e.layers.eachLayer((layer: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          updatePolygonData(L, layer);
        });
      });

      function updatePolygonData(L_inst: any, layer: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const latlngs = layer.getLatLngs()[0];
        const areaSqMeters = L_inst.GeometryUtil.geodesicArea(latlngs);
        const areaHectares = areaSqMeters / 10000;
        
        // Pass directly without turf mutation to avoid breaking leaflet-draw
        const geojson = layer.toGeoJSON();

        // Potential reward calc (Base: 10000 INR per AIC approx)
        // Assume base multiplier of 1.0 for projection
        const multiplier = areaHectares < 2.0 ? 1.5 : 0.8;
        const estAic = areaHectares * multiplier; 
        setPotentialReward(Math.round(estAic * 10000));

        onPolygonDrawnRef.current(areaHectares, geojson);
      }

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 500);

      // Auto-trigger search if initial data exists
      if (initialSearch?.village || initialSearch?.district) {
        performSearch(map, initialSearch.village || "", initialSearch.district || "", initialSearch.state || "Uttar Pradesh");
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function performSearch(map: any, village: string, district: string, state: string) {
    const q = `${village}, ${district}, ${state}, India`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.setView([parseFloat(lat), parseFloat(lon)], 16);
      }
    } catch (e) {
      console.warn("Auto-search failed:", e);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.village && !searchQuery.district) return;
    
    setIsSearching(true);
    await performSearch(mapInstanceRef.current, searchQuery.village, searchQuery.district, searchQuery.state);
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <select
          className="p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-primary bg-white text-gray-800"
          value={searchQuery.state}
          onChange={(e) => setSearchQuery({ ...searchQuery, state: e.target.value, district: "", village: "", ward: "" })}
        >
          <option value="">Select State</option>
          {Object.keys(MOCK_LOCATIONS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-primary bg-white text-gray-800"
          value={searchQuery.district}
          onChange={(e) => setSearchQuery({ ...searchQuery, district: e.target.value, village: "", ward: "" })}
          disabled={!searchQuery.state}
        >
          <option value="">Select District</option>
          {searchQuery.state && MOCK_LOCATIONS[searchQuery.state] && Object.keys(MOCK_LOCATIONS[searchQuery.state]).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-primary bg-white text-gray-800"
          value={searchQuery.village}
          onChange={(e) => setSearchQuery({ ...searchQuery, village: e.target.value, ward: "" })}
          disabled={!searchQuery.district}
        >
          <option value="">Select Village</option>
          {searchQuery.state && searchQuery.district && MOCK_LOCATIONS[searchQuery.state]?.[searchQuery.district] && Object.keys(MOCK_LOCATIONS[searchQuery.state][searchQuery.district]).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select
          className="p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-primary bg-white text-gray-800"
          value={searchQuery.ward}
          onChange={(e) => setSearchQuery({ ...searchQuery, ward: e.target.value })}
          disabled={!searchQuery.village}
        >
          <option value="">Select Ward</option>
          {searchQuery.state && searchQuery.district && searchQuery.village && MOCK_LOCATIONS[searchQuery.state]?.[searchQuery.district]?.[searchQuery.village] && MOCK_LOCATIONS[searchQuery.state][searchQuery.district][searchQuery.village].map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-primary text-accent p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Find Location
        </button>
      </form>

      <div className="relative">
        <div
          ref={mapRef}
          style={{ height: "450px", width: "100%" }}
          className="rounded-2xl border-2 border-emerald-50 shadow-inner overflow-hidden z-0"
        />
        
        {/* Instructions overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-sm border border-gray-100 p-3 rounded-xl z-[1000] text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">
          Use the toolbar to DRAW or EDIT points
        </div>

        {/* Real-time Reward Counter */}
        {potentialReward !== null && (
          <div className="absolute top-4 right-4 bg-primary text-accent px-4 py-3 rounded-2xl shadow-2xl border border-white/20 z-[1000] flex flex-col items-end animate-in fade-in slide-in-from-top-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Projected Reward</span>
            <span className="text-xl font-black flex items-center gap-1">
              ₹ {potentialReward.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
