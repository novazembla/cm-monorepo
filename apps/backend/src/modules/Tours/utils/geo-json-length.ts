function calculateLength(lineString: any) {
  if (lineString.length < 2) return 0;

  let result = 0;
  for (let i = 1; i < lineString.length; i++)
    result += distance(
      lineString[i - 1][0],
      lineString[i - 1][1],
      lineString[i][0],
      lineString[i][1]
    );
  return result;
}

/**
 * Calculate the approximate distance between two coordinates (lat/lon)
 *
 * © Chris Veness, MIT-licensed,
 * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
 */
function distance(λ1: number, φ1: number, λ2: number, φ2: number) {
  const R = 6371000;
  const Δλ = ((λ2 - λ1) * Math.PI) / 180;
  φ1 = (φ1 * Math.PI) / 180;
  φ2 = (φ2 * Math.PI) / 180;
  const x = Δλ * Math.cos((φ1 + φ2) / 2);
  const y = φ2 - φ1;
  const d = Math.sqrt(x * x + y * y);
  return R * d;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function geoJSONLineLength(geometry: any) {
  if (geometry.type === "LineString")
    return calculateLength(geometry.coordinates);
  else if (geometry.type === "MultiLineString")
    return geometry.coordinates.reduce((acc: number, coordinates: any) => {
      return acc + calculateLength(coordinates);
    }, 0);
  else return null;
}
