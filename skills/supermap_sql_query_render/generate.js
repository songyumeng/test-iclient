/**
 * Usage:
 *   node skills/supermap_sql_query_render/generate.js \
 *     --dataServiceUrl "https://xxx/iserver/services/data-xxx/rest/data" \
 *     --datasourceName "World" \
 *     --datasetName "Countries" \
 *     --attributeFilter "SMID = 247"
 *
 * This script is intended to be called by the OpenClaw skill runtime after
 * it extracts parameters from the user's natural language.
 */
const fs = require("fs");
const path = require("path");

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  return v == null ? fallback : v;
}

function normalizeDataUrl(u) {
  let s = (u || "").trim();
  if (!s) return s;
  while (s.endsWith("/")) s = s.slice(0, -1);
  const idx = s.indexOf("/rest/data");
  if (idx !== -1) return s.slice(0, idx + "/rest/data".length);
  // attempt补全：如果是 iServer services 根但没给 rest/data
  if (s.includes("/iserver/services/") && !s.includes("/rest/")) {
    return s + "/rest/data";
  }
  return s;
}

function replaceAll(template, map) {
  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

const dataServiceUrlRaw = arg("dataServiceUrl");
const datasourceName = arg("datasourceName");
const datasetName = arg("datasetName");
let attributeFilter = arg("attributeFilter");

if (!attributeFilter) attributeFilter = "1=1";

const dataServiceUrl = normalizeDataUrl(dataServiceUrlRaw);

if (!dataServiceUrl) throw new Error("Missing --dataServiceUrl");
if (!/\/rest\/data$/.test(dataServiceUrl)) {
  throw new Error(`dataServiceUrl must end with /rest/data, got: ${dataServiceUrl}`);
}
if (!datasourceName) throw new Error("Missing --datasourceName");
if (!datasetName) throw new Error("Missing --datasetName");

const tplPath = path.join(__dirname, "template", "demo.html.tpl");
const distDir = path.join(__dirname, "dist");
const outPath = path.join(distDir, "demo.html");

fs.mkdirSync(distDir, { recursive: true });

const tpl = fs.readFileSync(tplPath, "utf8");
const html = replaceAll(tpl, {
  "__DATA_SERVICE_URL__": dataServiceUrl,
  "__DATASOURCE_NAME__": datasourceName,
  "__DATASET_NAME__": datasetName,
  "__ATTRIBUTE_FILTER__": attributeFilter
});

fs.writeFileSync(outPath, html, "utf8");
console.log(`Generated: ${outPath}`);