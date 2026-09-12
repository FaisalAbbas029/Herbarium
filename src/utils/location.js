/**
 * Utility functions for specimen geographic coordinates, elevation, and Google Maps integration.
 * Ensures the specimen's stored latitude and longitude act as the single source of truth,
 * without loss of precision.
 */

/**
 * Returns the official cross-platform Google Maps URL for exact coordinate targeting.
 * The map marker will drop precisely at latitude, longitude.
 */
export function getGoogleMapsUrl(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
  if (lat === "" || lng === "") return null;

  const latNum = typeof lat === "number" ? lat : parseFloat(lat);
  const lngNum = typeof lng === "number" ? lng : parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return null;
  }

  // Preserve exact input string when available, or exact float without artificial rounding
  const latStr = typeof lat === "string" && lat.trim() !== "" ? lat.trim() : String(latNum);
  const lngStr = typeof lng === "string" && lng.trim() !== "" ? lng.trim() : String(lngNum);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latStr},${lngStr}`)}`;
}

/**
 * Formats a coordinate for UI display without unnecessary rounding.
 */
export function formatCoordinateDisplay(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" && !isNaN(val)) return String(val);
  return "—";
}

/**
 * Parses coordinates string if latitude and longitude are not directly available as numbers.
 * Supports:
 * - DMS: 30°20'39.8"N 119°26'20.0"E
 * - Decimal with direction: 35.9208° N, 74.3080° E
 * - Plain decimal: 35.9208, 74.3080
 */
export function parseCoordinatesString(coordStr) {
  if (!coordStr || typeof coordStr !== "string") return null;

  const trimmed = coordStr.trim();

  // Try DMS regex: e.g. 30°20'39.8"N 119°26'20.0"E
  const dmsRegex = /(\d+(?:\.\d+)?)[°\s]+(\d+(?:\.\d+)?)?['\s]*([\d.]+)?["\s]*([NSEW])/gi;
  const dmsMatches = [...trimmed.matchAll(dmsRegex)];

  if (dmsMatches.length >= 2) {
    const parsePart = (m) => {
      const deg = parseFloat(m[1]) || 0;
      const min = parseFloat(m[2]) || 0;
      const sec = parseFloat(m[3]) || 0;
      const dir = (m[4] || "").toUpperCase();
      let val = deg + min / 60 + sec / 3600;
      if (dir === "S" || dir === "W") val = -val;
      return val;
    };

    const lat = parsePart(dmsMatches[0]);
    const lng = parsePart(dmsMatches[1]);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Try Decimal format with optional directions: e.g. 35.9208 N, 74.3080 E or -35.9208, 74.3080
  const decRegex = /([-+]?\d+(?:\.\d+)?)\s*([NSEW])?[\s,]+([-+]?\d+(?:\.\d+)?)\s*([NSEW])?/i;
  const decMatch = trimmed.match(decRegex);

  if (decMatch) {
    let lat = parseFloat(decMatch[1]);
    const latDir = (decMatch[2] || "").toUpperCase();
    let lng = parseFloat(decMatch[3]);
    const lngDir = (decMatch[4] || "").toUpperCase();

    if (latDir === "S") lat = -Math.abs(lat);
    if (latDir === "N") lat = Math.abs(lat);
    if (lngDir === "W") lng = -Math.abs(lng);
    if (lngDir === "E") lng = Math.abs(lng);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Extracts and formats elevation/altitude from specimen data.
 * Returns formatted string like "1,500 m" or null if not available.
 */
export function extractElevation(specimen) {
  if (!specimen) return null;

  // 1. Direct elevation field
  if (specimen.elevation !== undefined && specimen.elevation !== null && specimen.elevation !== "") {
    const str = String(specimen.elevation).trim();
    if (/^\d+[\d,]*(\.\d+)?\s*m?$/i.test(str)) {
      return str.toLowerCase().endsWith("m") ? str : `${str} m`;
    }
    return str;
  }

  // 2. Direct altitude field
  if (specimen.altitude !== undefined && specimen.altitude !== null && specimen.altitude !== "") {
    const str = String(specimen.altitude).trim();
    if (/^\d+[\d,]*(\.\d+)?\s*m?$/i.test(str)) {
      return str.toLowerCase().endsWith("m") ? str : `${str} m`;
    }
    return str;
  }

  // 3. Parse from collectionLocation, habitat, or location
  const candidateTexts = [
    specimen.collectionLocation,
    specimen.habitat,
    specimen.location
  ].filter(Boolean);

  for (const text of candidateTexts) {
    // Matches e.g. "850m elevation", "920m", "2,050m elevation", "1,100 m a.s.l.", "850 meters"
    const match = text.match(/(?:elevation|altitude|elev\.?|a\.s\.l\.?)\s*:?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:m\b|meters?|metres?)/i)
      || text.match(/(\d[\d,]*(?:\.\d+)?)\s*(?:m\b|meters?|metres?)\s*(?:elevation|a\.s\.l\.|altitude)?/i);

    if (match && match[1]) {
      const numStr = match[1];
      return `${numStr} m`;
    }
  }

  return null;
}

/**
 * Resolves complete geo data for a specimen.
 * Preserves the actual stored latitude and longitude values without rounding loss.
 */
export function getSpecimenGeoData(specimen) {
  if (!specimen) {
    return {
      hasCoordinates: false,
      latitude: null,
      longitude: null,
      elevation: null,
      coordinatesText: null,
      googleMapsUrl: null,
      googleMapsEmbedUrl: null,
      locationName: null
    };
  }

  let lat = null;
  let lng = null;

  // Check numeric or parseable string latitude/longitude
  if (specimen.latitude !== undefined && specimen.latitude !== null && specimen.latitude !== "") {
    const parsed = typeof specimen.latitude === "number" ? specimen.latitude : parseFloat(specimen.latitude);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
      lat = typeof specimen.latitude === "number" ? specimen.latitude : parsed;
    }
  }

  if (specimen.longitude !== undefined && specimen.longitude !== null && specimen.longitude !== "") {
    const parsed = typeof specimen.longitude === "number" ? specimen.longitude : parseFloat(specimen.longitude);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      lng = typeof specimen.longitude === "number" ? specimen.longitude : parsed;
    }
  }

  // Fallback: parse from specimen.coordinates string
  if ((lat === null || lng === null) && specimen.coordinates) {
    const parsedCoords = parseCoordinatesString(specimen.coordinates);
    if (parsedCoords) {
      if (lat === null) lat = parsedCoords.lat;
      if (lng === null) lng = parsedCoords.lng;
    }
  }

  const hasCoordinates = lat !== null && lng !== null;
  const elevation = extractElevation(specimen);
  const locationName = specimen.collectionLocation || specimen.location || specimen.region || null;

  let googleMapsUrl = null;
  let googleMapsEmbedUrl = null;

  if (hasCoordinates) {
    googleMapsUrl = getGoogleMapsUrl(lat, lng);
    googleMapsEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=12&output=embed`;
  }

  return {
    hasCoordinates,
    latitude: lat,
    longitude: lng,
    elevation,
    coordinatesText: specimen.coordinates || (hasCoordinates ? `${lat}, ${lng}` : null),
    googleMapsUrl,
    googleMapsEmbedUrl,
    locationName
  };
}
