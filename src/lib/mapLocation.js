function finiteCoordinate(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validCoordinates(latitude, longitude) {
  const lat = finiteCoordinate(latitude);
  const lng = finiteCoordinate(longitude);
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function coordinatePair(first, second) {
  const latitude = finiteCoordinate(first);
  const longitude = finiteCoordinate(second);
  return validCoordinates(latitude, longitude) ? { latitude, longitude } : null;
}

export function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function isShortMapsUrl(value) {
  try {
    const host = new URL(String(value || '').trim()).hostname.toLowerCase();
    return host === 'maps.app.goo.gl' || host === 'goo.gl';
  } catch {
    return false;
  }
}

export function extractMapCoordinates(value) {
  const source = String(value || '').trim();
  if (!source || isShortMapsUrl(source)) return null;

  const decoded = (() => {
    try {
      return decodeURIComponent(source);
    } catch {
      return source;
    }
  })();
  const patterns = [
    /(?:\/maps\/(?:search|place)\/)(-?\d+(?:\.\d+)?)[,\s+]+(-?\d+(?:\.\d+)?)(?:[/?#&]|$)/i,
    /[?&](?:q|query|destination|ll)=(?:loc:)?(-?\d+(?:\.\d+)?)[,\s+]+(-?\d+(?:\.\d+)?)(?:[&/#]|$)/i,
    /[?&]center=(-?\d+(?:\.\d+)?)[,\s+]+(-?\d+(?:\.\d+)?)(?:[&/#]|$)/i,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?)[,\s+]+(-?\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) {
      const pair = coordinatePair(match[1], match[2]);
      if (pair) return pair;
    }
  }

  const direct = source.match(/^\s*\(?\[?\s*(-?\d+(?:\.\d+)?)\s*(?:,|;|\s)\s*(-?\d+(?:\.\d+)?)\s*\)?\]?\s*$/);
  if (!direct) return null;
  return coordinatePair(direct[1], direct[2]);
}

function extractPlaceId(value) {
  const source = String(value || '').trim();
  if (!source) return '';
  try {
    const url = new URL(source);
    return String(url.searchParams.get('query_place_id') || '').trim();
  } catch {
    return '';
  }
}

function osmEmbedUrl(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const latDelta = 0.006;
  const lngDelta = 0.009;
  const bounds = [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta]
    .map((value) => value.toFixed(6))
    .join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}

export function resolveMapLocation({ mapsUrl, venueName, address }) {
  const source = String(mapsUrl || '').trim();
  const coordinates = extractMapCoordinates(source);
  const placeId = extractPlaceId(source);
  const query = [venueName, address].filter(Boolean).join(', ').trim();
  const suppliedUrl = safeExternalUrl(source);

  if (coordinates) {
    const coordinateText = `${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`;
    return {
      available: true,
      exact: true,
      coordinates,
      coordinateText,
      embedUrl: osmEmbedUrl(coordinates.latitude, coordinates.longitude),
      navigationUrl: suppliedUrl || `https://www.google.com/maps/search/?api=1&query=${coordinateText}`,
      kind: 'coordinates',
    };
  }

  if (placeId) {
    return {
      available: true,
      exact: true,
      coordinates: null,
      coordinateText: '',
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(`place_id:${placeId}`)}&output=embed`,
      navigationUrl: suppliedUrl,
      kind: 'place',
    };
  }

  if (source && query) {
    return {
      available: true,
      exact: false,
      coordinates: null,
      coordinateText: '',
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
      navigationUrl: suppliedUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      kind: isShortMapsUrl(source) ? 'short-link' : 'address',
    };
  }

  return {
    available: false,
    exact: false,
    coordinates: null,
    coordinateText: '',
    embedUrl: '',
    navigationUrl: suppliedUrl,
    kind: source ? 'invalid' : 'empty',
  };
}
