import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faLocationCrosshairs,
  faArrowUpRightFromSquare,
  faCompass
} from "@fortawesome/free-solid-svg-icons";
import { getGoogleMapsUrl, formatCoordinateDisplay } from "../../utils/location.js";

// Custom SVG botanical pin marker matching the GB Herbarium aesthetic
const createBotanicalIcon = () => {
  return L.divIcon({
    className: "botanical-map-marker",
    html: `
      <div class="botanical-pin-wrapper" style="position: relative; width: 28px; height: 38px; transform: translate(-50%, -100%); cursor: pointer;">
        <svg viewBox="0 0 24 32" width="28" height="38" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 5px rgba(28,36,30,0.45));">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#1F4529" stroke="#FAF8F5" stroke-width="1.2"/>
          <circle cx="12" cy="11" r="5" fill="#FAF8F5"/>
          <circle cx="12" cy="11" r="2.8" fill="#47663B"/>
        </svg>
      </div>
    `,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  });
};

const SpecimenMapView = ({
  latitude,
  longitude,
  elevation,
  locality,
  title = "Specimen Collection Site",
  interactive = false,
  onLocationSelect = null,
  heightClass = "h-64 sm:h-72",
  showCoordinatesBadge = true,
  showGoogleMapsButton = true,
  fallbackCenter = [35.9208, 74.3080], // Gilgit-Baltistan coordinates default when no location set
  fallbackZoom = 7
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const numLat = latitude !== null && latitude !== undefined && latitude !== "" && !isNaN(Number(latitude))
    ? Number(latitude)
    : null;
  const numLng = longitude !== null && longitude !== undefined && longitude !== "" && !isNaN(Number(longitude))
    ? Number(longitude)
    : null;

  const hasValidCoords = numLat !== null && numLng !== null && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
  const googleMapsUrl = hasValidCoords ? getGoogleMapsUrl(numLat, numLng) : null;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter = hasValidCoords ? [numLat, numLng] : fallbackCenter;
    const initialZoom = hasValidCoords ? 13 : fallbackZoom;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: interactive,
      dragging: true,
      zoomControl: true,
      attributionControl: false
    });

    // High quality OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add minimal attribution in corner
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    const icon = createBotanicalIcon();

    // Create marker if coordinates exist
    if (hasValidCoords) {
      const marker = L.marker([numLat, numLng], {
        icon,
        draggable: interactive
      }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: #1F4529; display: block; margin-bottom: 2px;">${title}</strong>
          <span style="color: #566158; font-family: monospace;">${numLat}, ${numLng}</span>
          ${elevation ? `<div style="color: #6E7570; margin-top: 2px;">Elev: <strong>${elevation}</strong></div>` : ""}
          ${locality ? `<div style="color: #6E7570; font-size: 10px; margin-top: 3px; max-width: 180px;">${locality}</div>` : ""}
        </div>
      `;
      marker.bindPopup(popupContent);
      markerRef.current = marker;

      if (interactive && onLocationSelect) {
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          onLocationSelect({
            lat: Number(pos.lat.toFixed(6)),
            lng: Number(pos.lng.toFixed(6))
          });
        });
      }
    }

    // Interactive click to drop / move marker
    if (interactive && onLocationSelect) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const formattedLat = Number(lat.toFixed(6));
        const formattedLng = Number(lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([formattedLat, formattedLng]);
        } else {
          const marker = L.marker([formattedLat, formattedLng], {
            icon,
            draggable: true
          }).addTo(map);

          marker.on("dragend", (ev) => {
            const pos = ev.target.getLatLng();
            onLocationSelect({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6))
            });
          });

          markerRef.current = marker;
        }

        onLocationSelect({ lat: formattedLat, lng: formattedLng });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update marker & map position when latitude/longitude props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const icon = createBotanicalIcon();

    if (hasValidCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([numLat, numLng]);
      } else {
        const marker = L.marker([numLat, numLng], {
          icon,
          draggable: interactive
        }).addTo(map);

        if (interactive && onLocationSelect) {
          marker.on("dragend", (ev) => {
            const pos = ev.target.getLatLng();
            onLocationSelect({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6))
            });
          });
        }

        markerRef.current = marker;
      }

      // Smooth pan / fly to updated coordinates
      map.setView([numLat, numLng], map.getZoom() < 10 ? 13 : map.getZoom(), {
        animate: true
      });
    } else if (markerRef.current && !interactive) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [numLat, numLng, hasValidCoords, interactive]);

  // Non-interactive with no coordinates
  if (!hasValidCoords && !interactive) {
    return (
      <div className="p-5 rounded-sm border border-[#E0D9CE] bg-[#FAF8F5] text-center space-y-2">
        <FontAwesomeIcon icon={faLocationCrosshairs} className="w-6 h-6 mx-auto text-[#8E9990]" />
        <p className="text-xs font-semibold text-[#1C241E]">Location not available</p>
        <p className="text-[11px] text-[#6E7570] max-w-sm mx-auto">
          Geographic coordinates have not been cataloged for this botanical specimen record.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-[#E0D9CE] overflow-hidden bg-[#FAF8F5] shadow-xs flex flex-col animate-fade-in">
      {/* Map Header / Help note in interactive mode */}
      {interactive && (
        <div className="px-3.5 py-2 bg-[#FAF8F5] border-b border-[#EDE7DD] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#47663B] font-medium">
            <FontAwesomeIcon icon={faCompass} className="w-4 h-4 text-[#1F4529] shrink-0" />
            <span>Interactive Map Picker: Click map or drag marker to set exact collection point</span>
          </div>
          {hasValidCoords && (
            <span className="font-mono-acc text-[11px] text-[#1F4529] font-bold">
              {numLat}, {numLng}
            </span>
          )}
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className={`${heightClass} w-full relative z-0`}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Map Footer Bar: Coordinates & View on Google Maps Link */}
      {(showCoordinatesBadge || showGoogleMapsButton) && (
        <div className="p-3 bg-[#FAF8F5] border-t border-[#E0D9CE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {showCoordinatesBadge && (
            <div className="flex items-center gap-3 text-[#566158] font-mono-acc text-[11px] flex-wrap">
              <span>
                Lat: <strong className="text-[#1C241E]">{formatCoordinateDisplay(latitude)}</strong>
              </span>
              <span>•</span>
              <span>
                Lng: <strong className="text-[#1C241E]">{formatCoordinateDisplay(longitude)}</strong>
              </span>
              {elevation && (
                <>
                  <span>•</span>
                  <span>
                    Elevation: <strong className="text-[#1C241E]">{elevation}</strong>
                  </span>
                </>
              )}
            </div>
          )}

          {showGoogleMapsButton && hasValidCoords && googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs group whitespace-nowrap self-start sm:self-auto"
              title={`Open exact collection coordinates (${numLat}, ${numLng}) on Google Maps`}
            >
              <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#D8E6DC] group-hover:scale-110 transition-transform" />
              <span>View on Google Maps</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3 opacity-80" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export { SpecimenMapView };
