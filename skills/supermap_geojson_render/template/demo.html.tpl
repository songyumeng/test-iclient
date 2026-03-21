<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>GeoJSON 数据可视化 - MapboxGL + SuperMap iClient</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Mapbox GL JS v1 -->
  <link href="https://cdn.jsdelivr.net/npm/mapbox-gl@1.13.3/dist/mapbox-gl.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/mapbox-gl@1.13.3/dist/mapbox-gl.js"></script>

  <!-- SuperMap iClient for MapboxGL -->
  <script src="https://iclient.supermap.io/dist/mapboxgl/iclient-mapboxgl.min.js"></script>

  <style>
    body { margin: 0; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial; }
    #map { position: absolute; inset: 0; }
    #status {
      position: absolute; z-index: 10; bottom: 12px; left: 12px;
      max-width: 480px; background: rgba(255,255,255,0.92); padding: 8px 12px;
      border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      font-size: 12px; color: #111827; white-space: pre-wrap;
    }
    .mapboxgl-popup-content {
      max-height: 300px; overflow-y: auto; font-size: 12px;
    }
    .popup-table { border-collapse: collapse; width: 100%; }
    .popup-table td, .popup-table th {
      border: 1px solid #e5e7eb; padding: 3px 6px; text-align: left; font-size: 12px;
    }
    .popup-table th { background: #f3f4f6; font-weight: 600; }
  </style>
</head>
<body>
  <div id="status"></div>
  <div id="map"></div>

  <script>
    // ---- GeoJSON data (injected by generate.js) ----
    var geojsonData = __GEOJSON_DATA__;

    // ---- Default base map (SuperMap China ZXY tiles) ----
    var CHINA_ZXY = "https://iclient.supermap.io/iserver/services/map-china/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}";

    var RASTER_STYLE = {
      version: 8,
      sources: {
        china: {
          type: "raster",
          tiles: [CHINA_ZXY],
          tileSize: 256
        }
      },
      layers: [
        { id: "background", type: "background", paint: { "background-color": "#f8fafc" } },
        { id: "china-tiles", type: "raster", source: "china", paint: { "raster-opacity": 1 } }
      ]
    };

    var map = new mapboxgl.Map({
      container: "map",
      style: RASTER_STYLE,
      center: [__MAP_CENTER_LNG__, __MAP_CENTER_LAT__],
      zoom: __MAP_ZOOM__
    });

    var sourceId = "geojson-source";
    var layerFill = "geojson-fill";
    var layerLine = "geojson-line";
    var layerCircle = "geojson-circle";

    function setStatus(msg) {
      document.getElementById("status").textContent = msg;
    }

    function buildPopupHTML(properties) {
      if (!properties || Object.keys(properties).length === 0) {
        return "<p>无属性信息</p>";
      }
      var rows = "";
      for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
          var val = properties[key];
          if (val === null || val === undefined) val = "";
          rows += "<tr><th>" + escapeHtml(key) + "</th><td>" + escapeHtml(String(val)) + "</td></tr>";
        }
      }
      return '<table class="popup-table"><tbody>' + rows + "</tbody></table>";
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function addGeoJSON(fc) {
      map.addSource(sourceId, { type: "geojson", data: fc });

      // Polygon fill
      map.addLayer({
        id: layerFill,
        type: "fill",
        source: sourceId,
        filter: ["any",
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"]
        ],
        paint: { "fill-color": "#3b82f6", "fill-opacity": 0.35 }
      });

      // Line + polygon outline
      map.addLayer({
        id: layerLine,
        type: "line",
        source: sourceId,
        filter: ["any",
          ["==", ["geometry-type"], "LineString"],
          ["==", ["geometry-type"], "MultiLineString"],
          ["==", ["geometry-type"], "Polygon"],
          ["==", ["geometry-type"], "MultiPolygon"]
        ],
        paint: { "line-color": "#111827", "line-width": 2 }
      });

      // Point circle
      map.addLayer({
        id: layerCircle,
        type: "circle",
        source: sourceId,
        filter: ["any",
          ["==", ["geometry-type"], "Point"],
          ["==", ["geometry-type"], "MultiPoint"]
        ],
        paint: {
          "circle-radius": 6,
          "circle-color": "#ef4444",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1
        }
      });

      // Fit bounds
      try {
        var coords = [];
        var collect = function(c) {
          if (Array.isArray(c) && typeof c[0] === "number") coords.push(c);
          else if (Array.isArray(c)) c.forEach(collect);
        };
        (fc.features || []).forEach(function(f) {
          if (f && f.geometry && f.geometry.coordinates) collect(f.geometry.coordinates);
        });
        if (coords.length) {
          var minX = coords[0][0], minY = coords[0][1], maxX = coords[0][0], maxY = coords[0][1];
          coords.forEach(function(c) {
            minX = Math.min(minX, c[0]); minY = Math.min(minY, c[1]);
            maxX = Math.max(maxX, c[0]); maxY = Math.max(maxY, c[1]);
          });
          map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 40, maxZoom: 12 });
        }
      } catch (e) { /* ignore */ }

      setStatus("已加载 " + (fc.features ? fc.features.length : 0) + " 个要素。");
    }

    // Click popup
    map.on("click", function(e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: [layerFill, layerLine, layerCircle]
      });
      if (!features || features.length === 0) return;
      var feature = features[0];
      new mapboxgl.Popup({ maxWidth: "360px" })
        .setLngLat(e.lngLat)
        .setHTML(buildPopupHTML(feature.properties))
        .addTo(map);
    });

    // Cursor style
    map.on("mouseenter", layerFill, function() { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", layerFill, function() { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", layerCircle, function() { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", layerCircle, function() { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", layerLine, function() { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", layerLine, function() { map.getCanvas().style.cursor = ""; });

    map.on("load", function() {
      addGeoJSON(geojsonData);
    });
  </script>
</body>
</html>
