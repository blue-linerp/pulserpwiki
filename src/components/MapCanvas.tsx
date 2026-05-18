"use client";

import { useEffect, useMemo, useRef } from "react";
import L, { Map as LeafletMap, LayerGroup, Marker as LMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "@/data/mapMarkers";

// Tile CDN mirrors. First entry is used; on tile load errors we automatically
// fall through to the next. jsDelivr (cdn.jsdelivr.net) is sometimes blocked
// by ad/privacy blockers, so we ship multiple mirrors.
const TILE_MIRRORS = [
  "https://gcore.jsdelivr.net/gh/meesvrh/GTAV-Map-Tiles@main/tiles",
  "https://cdn.jsdelivr.net/gh/meesvrh/GTAV-Map-Tiles@main/tiles",
  "https://fastly.jsdelivr.net/gh/meesvrh/GTAV-Map-Tiles@main/tiles",
  "https://cdn.statically.io/gh/meesvrh/GTAV-Map-Tiles/main/tiles",
];
let currentMirrorIdx = 0;
function tileUrl(style: string) {
  return `${TILE_MIRRORS[currentMirrorIdx]}/${style}/{z}/{x}/{y}.jpg`;
}
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const WORLD_SIZE = 256;
const SOUTH_WEST: [number, number] = [-WORLD_SIZE, 0];
const NORTH_EAST: [number, number] = [0, WORLD_SIZE];

export type MapStyle = "atlas" | "satellite";

function pinIcon(color: string, selected: boolean, editing: boolean) {
  const h = selected ? 32 : 28;
  const w = h * 0.7;
  const ringStyle = editing
    ? `outline:2px dashed #fff;outline-offset:2px;`
    : "";
  return L.divIcon({
    className: "pulse-map-marker",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    html: `
      <svg viewBox="0 0 24 34" width="${w}" height="${h}" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.55));${ringStyle}">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.2 12 22 12 22s12-13.8 12-22C24 5.4 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="4.5" fill="#0b0b0d"/>
      </svg>`,
  });
}

export interface MapCanvasProps {
  markers: MapMarker[];
  categoryColor: (categoryId: string) => string;
  style: MapStyle;
  selectedId?: string | null;
  onSelect?: (m: MapMarker) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onMapClick?: (x: number, y: number) => void;
  onHover?: (coord: { x: number; y: number } | null) => void;
  showZoomControl?: boolean;
  className?: string;
}

export default function MapCanvas({
  markers,
  categoryColor,
  style,
  selectedId,
  onSelect,
  draggable = false,
  onDragEnd,
  onMapClick,
  onHover,
  showZoomControl = true,
  className,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerObjs = useRef<Map<string, LMarker>>(new Map());
  const selectedIdRef = useRef<string | null | undefined>(selectedId);
  // Stable refs for callbacks/props that should NOT trigger marker rebuilds.
  const cbs = useRef({ onSelect, onDragEnd, onMapClick, onHover, categoryColor });
  cbs.current = { onSelect, onDragEnd, onMapClick, onHover, categoryColor };

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const bounds = L.latLngBounds(SOUTH_WEST, NORTH_EAST);

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: showZoomControl,
      attributionControl: true,
      maxBounds: bounds.pad(0.25),
      maxBoundsViscosity: 0.9,
      zoomSnap: 0.5,
      wheelPxPerZoomLevel: 120,
    });
    map.fitBounds(bounds);
    if (showZoomControl) {
      map.zoomControl.setPosition("bottomright");
    }

    const buildTile = () =>
      L.tileLayer(tileUrl(style), {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        noWrap: true,
        bounds,
        tileSize: 256,
        crossOrigin: "",
        attribution:
          '&copy; Rockstar Games &middot; Tiles by <a href="https://github.com/meesvrh/GTAV-Map-Tiles" target="_blank" rel="noreferrer">meesvrh</a>',
      });

    let tile = buildTile().addTo(map);
    let consecutiveErrors = 0;
    const onTileError = (e: L.TileErrorEvent) => {
      consecutiveErrors += 1;
      const src = (e as unknown as { tile?: { src?: string } })?.tile?.src;
      // eslint-disable-next-line no-console
      console.warn(`[map] tile failed (mirror ${currentMirrorIdx}):`, src ?? e);
      // After a handful of failures, try the next mirror (once).
      if (consecutiveErrors === 4 && currentMirrorIdx < TILE_MIRRORS.length - 1) {
        currentMirrorIdx += 1;
        // eslint-disable-next-line no-console
        console.warn(`[map] switching tile mirror -> ${TILE_MIRRORS[currentMirrorIdx]}`);
        map.removeLayer(tile);
        tile = buildTile().addTo(map);
        tile.on("tileerror", onTileError);
        tileRef.current = tile;
        consecutiveErrors = 0;
      }
    };
    tile.on("tileerror", onTileError);

    const group = L.layerGroup().addTo(map);

    map.on("mousemove", (e) => {
      cbs.current.onHover?.({
        x: Math.round(e.latlng.lng * 100) / 100,
        y: Math.round(-e.latlng.lat * 100) / 100,
      });
    });
    map.on("mouseout", () => cbs.current.onHover?.(null));
    map.on("click", (e) => {
      const x = Math.round(e.latlng.lng * 100) / 100;
      const y = Math.round(-e.latlng.lat * 100) / 100;
      cbs.current.onMapClick?.(x, y);
    });

    mapRef.current = map;
    layerRef.current = group;
    tileRef.current = tile;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
      markerObjs.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile style. (Skipped on first render since the init effect already
  // built a tile layer with the current style.)
  const styleInitRef = useRef(true);
  useEffect(() => {
    if (styleInitRef.current) {
      styleInitRef.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    const bounds = L.latLngBounds(SOUTH_WEST, NORTH_EAST);
    tileRef.current = L.tileLayer(tileUrl(style), {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      noWrap: true,
      bounds,
      tileSize: 256,
      crossOrigin: "",
    }).addTo(map);
  }, [style]);

  // A signature that changes only when the meaningful marker set changes.
  // Excludes the live x/y of the marker the user is currently dragging so a
  // drag-induced state update doesn't rebuild the markers mid-interaction.
  const markersSig = useMemo(
    () =>
      markers
        .map((m) => `${m.id}:${m.x}:${m.y}:${m.category}`)
        .join("|"),
    [markers]
  );

  // Rebuild markers when the actual set changes or draggability toggles.
  useEffect(() => {
    const group = layerRef.current;
    if (!group) return;
    group.clearLayers();
    markerObjs.current.clear();

    for (const m of markers) {
      const lat = -m.y;
      const lng = m.x;
      const marker = L.marker([lat, lng], {
        icon: pinIcon(
          cbs.current.categoryColor(m.category),
          selectedIdRef.current === m.id,
          draggable
        ),
        title: m.name,
        draggable,
        autoPan: draggable,
        // Prevent the marker's own pointer events from triggering a click on
        // the map underneath (which would clear selection / fire onMapClick).
        bubblingMouseEvents: false,
      });
      marker.on("click", (e: L.LeafletMouseEvent) => {
        e.originalEvent?.stopPropagation?.();
        cbs.current.onSelect?.(m);
      });
      if (draggable) {
        marker.on("dragend", () => {
          const ll = marker.getLatLng();
          const x = Math.round(ll.lng * 100) / 100;
          const y = Math.round(-ll.lat * 100) / 100;
          cbs.current.onDragEnd?.(m.id, x, y);
        });
      }
      marker.addTo(group);
      markerObjs.current.set(m.id, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersSig, draggable]);

  // Swap icon when selection changes — without rebuilding markers.
  useEffect(() => {
    const prev = selectedIdRef.current;
    selectedIdRef.current = selectedId;
    const setIconFor = (id: string) => {
      const marker = markerObjs.current.get(id);
      const m = markers.find((x) => x.id === id);
      if (!marker || !m) return;
      marker.setIcon(
        pinIcon(cbs.current.categoryColor(m.category), selectedId === id, draggable)
      );
    };
    if (prev && prev !== selectedId) setIconFor(prev);
    if (selectedId) setIconFor(selectedId);
  }, [selectedId, draggable, markers]);

  return (
    <div
      ref={containerRef}
      className={className ?? "w-full h-full bg-[#0a0a0c]"}
    />
  );
}

/** Pan the map (exposed via a getter on window for parent control if needed). */
export function flyTo(map: LeafletMap | null, x: number, y: number, zoom?: number) {
  if (!map) return;
  map.flyTo([-y, x], zoom ?? Math.max(map.getZoom(), 3), { duration: 0.6 });
}
