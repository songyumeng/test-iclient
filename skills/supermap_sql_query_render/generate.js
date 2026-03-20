/**
 * Usage:
 *   node skills/supermap_sql_query_render/generate.js \
 *     --dataServiceUrl "https://xxx/iserver/services/data-xxx/rest/data" \
 *     --datasourceName "World" \
 *     --datasetName "Countries" \
 *     --attributeFilter "SMID = 247"
 *
 * Notes:
 * - "宽松模式"：允许缺参生成 demo.html（输入框留空/默认 1=1），仅打印 warn，不 throw。
 * - dataServiceUrl 会做 /rest/data 归一化与可选补全：
 *   - 若包含 /rest/data：截断到 /rest/data
 *   - 若包含 /iserver/services/ 且不含 /rest/：自动补全为 .../rest/data，并提示“已补全”
 */
const fs = require("fs");
const path = require("path");

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  return v == null ? fallback : String(v);
}

function normalizeDataUrl(u) {
  let s = (u || "").trim();
  if (!s) return { url: "", fixed: false };

  while (s.endsWith("/")) s = s.slice(0, -1);

  const idx = s.indexOf("/rest/data");
  if (idx !== -1) {
    return { url: s.slice(0, idx + "/rest/data".length), fixed: false };
  }

  // attempt 补全：如果是 iServer services 根但没给 rest/data
  if (s.includes("/iserver/services/") && !s.includes("/rest/")) {
    return { url: s + "/rest/data", fixed: true };
  }

  return { url: s, fixed: false };
}

function replaceAll(template, map) {
  let out = template;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}

// ---- read args (OpenClaw runtime will pass these) ----
const dataServiceUrlRaw = arg("dataServiceUrl");
const datasourceName = arg("datasourceName");
const datasetName = arg("datasetName");
let attributeFilter = arg("attributeFilter");

if (!attributeFilter) attributeFilter = "1=1";

const { url: dataServiceUrl, fixed } = normalizeDataUrl(dataServiceUrlRaw);

// ---- warn-only validation (宽松模式) ----
if (!dataServiceUrl) {
  console.warn("[warn] Missing --dataServiceUrl (will generate demo.html with empty input)");
} else if (!/\/rest\/data$/.test(dataServiceUrl)) {
  console.warn(
    `[warn] dataServiceUrl should end with /rest/data. Got: ${dataServiceUrl}\n` +
      "       (demo.html will still be generated; you can fix it in the page UI)"
  );
} else if (fixed) {
  console.warn(`[info] dataServiceUrl was auto-completed to: ${dataServiceUrl}`);
}

if (!datasourceName) console.warn("[warn] Missing --datasourceName (will generate demo.html with empty input)");
if (!datasetName) console.warn("[warn] Missing --datasetName (will generate demo.html with empty input)");

// ---- generate ----
const tplPath = path.join(__dirname, "template", "demo.html.tpl");
const distDir = path.join(__dirname, "dist");
const outPath = path.join(distDir, "demo.html");

fs.mkdirSync(distDir, { recursive: true });

const tpl = fs.readFileSync(tplPath, "utf8");
const html = replaceAll(tpl, {
  "__DATA_SERVICE_URL__": dataServiceUrl || "",
  "__DATASOURCE_NAME__": datasourceName || "",
  "__DATASET_NAME__": datasetName || "",
  "__ATTRIBUTE_FILTER__": attributeFilter || "1=1",
});

fs.writeFileSync(outPath, html, "utf8");
console.log(`Generated: ${outPath}`);
