/**
 * Usage:
 *   node skills/supermap_geojson_render/generate.js \
 *     --geojsonFile "./data/my-data.geojson"
 *
 *   node skills/supermap_geojson_render/generate.js \
 *     --geojson '{"type":"FeatureCollection","features":[...]}'
 *
 * Optional:
 *   --center "104.0,35.0"   (map center lng,lat)
 *   --zoom 5                (map zoom level)
 *
 * Notes:
 * - GeoJSON can be provided via file path (--geojsonFile) or inline string (--geojson).
 * - Single Feature or bare Geometry objects are auto-wrapped into a FeatureCollection.
 * - If center is not provided, it is computed from the GeoJSON bounding box.
 */
const fs = require("fs");
const path = require("path");

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  return v == null ? fallback : String(v);
}

function replaceAll(template, map) {
  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

/**
 * Normalize any GeoJSON (Geometry / Feature / FeatureCollection) into a FeatureCollection.
 */
function toFeatureCollection(geojson) {
  if (geojson.type === "FeatureCollection") return geojson;
  if (geojson.type === "Feature") {
    return { type: "FeatureCollection", features: [geojson] };
  }
  // Bare geometry
  return { type: "FeatureCollection", features: [{ type: "Feature", geometry: geojson, properties: {} }] };
}

/**
 * Compute bounding box [minLng, minLat, maxLng, maxLat] from a FeatureCollection.
 */
function computeBBox(fc) {
  const coords = [];
  const collect = (c) => {
    if (Array.isArray(c) && typeof c[0] === "number") {
      coords.push(c);
    } else if (Array.isArray(c)) {
      c.forEach(collect);
    }
  };
  (fc.features || []).forEach((f) => {
    if (f && f.geometry && f.geometry.coordinates) {
      collect(f.geometry.coordinates);
    }
  });
  if (coords.length === 0) return null;
  let minX = coords[0][0], minY = coords[0][1], maxX = coords[0][0], maxY = coords[0][1];
  coords.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  return [minX, minY, maxX, maxY];
}

// ---- read args ----
const geojsonFile = arg("geojsonFile");
const geojsonInline = arg("geojson");
const centerArg = arg("center");
const zoomArg = arg("zoom", "3");

// ---- load GeoJSON ----
let rawGeojson;
if (geojsonFile) {
  const resolvedPath = path.resolve(geojsonFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`[error] GeoJSON file not found: ${resolvedPath}`);
    process.exit(1);
  }
  rawGeojson = fs.readFileSync(resolvedPath, "utf8");
  console.log(`[info] Loaded GeoJSON from file: ${resolvedPath}`);
} else if (geojsonInline) {
  rawGeojson = geojsonInline;
  console.log("[info] Using inline GeoJSON data.");
} else {
  console.error("[error] Must provide --geojsonFile or --geojson. Example:");
  console.error('  node generate.js --geojsonFile "./data/my-data.geojson"');
  console.error("  node generate.js --geojson '{\"type\":\"FeatureCollection\",\"features\":[]}'");
  process.exit(1);
}

let geojsonObj;
try {
  geojsonObj = JSON.parse(rawGeojson);
} catch (e) {
  console.error(`[error] Invalid JSON: ${e.message}`);
  process.exit(1);
}

if (!geojsonObj || !geojsonObj.type) {
  console.error("[error] GeoJSON must have a 'type' field (FeatureCollection, Feature, or Geometry type).");
  process.exit(1);
}

const fc = toFeatureCollection(geojsonObj);
console.log(`[info] FeatureCollection with ${fc.features.length} feature(s).`);

// ---- compute center/zoom ----
let centerLng = "104.0";
let centerLat = "35.0";
let zoom = zoomArg;

if (centerArg) {
  const parts = centerArg.split(",");
  if (parts.length === 2) {
    centerLng = parts[0].trim();
    centerLat = parts[1].trim();
  }
} else {
  const bbox = computeBBox(fc);
  if (bbox) {
    centerLng = String((bbox[0] + bbox[2]) / 2);
    centerLat = String((bbox[1] + bbox[3]) / 2);
  }
}

// ---- generate ----
const tplPath = path.join(__dirname, "template", "demo.html.tpl");
const distDir = path.join(__dirname, "dist");
const outPath = path.join(distDir, "demo.html");

fs.mkdirSync(distDir, { recursive: true });

const tpl = fs.readFileSync(tplPath, "utf8");
const html = replaceAll(tpl, {
  "__GEOJSON_DATA__": JSON.stringify(fc),
  "__MAP_CENTER_LNG__": centerLng,
  "__MAP_CENTER_LAT__": centerLat,
  "__MAP_ZOOM__": zoom,
});

fs.writeFileSync(outPath, html, "utf8");
console.log(`Generated: ${outPath}`);
