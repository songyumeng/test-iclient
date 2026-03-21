---
name: supermap_geojson_render
description: 将用户提供的 GeoJSON 数据添加到 MapboxGL 地图上进行可视化渲染，支持 Point/Line/Polygon 等所有几何类型，默认使用 SuperMap 中国底图，无需 Mapbox token。
user-invocable: true
---

# supermap_geojson_render

## 你要做什么
用户提供 GeoJSON 数据（文件路径或内联 JSON），你需要：

1) 从用户输入中获取 GeoJSON 数据
2) 生成一个 `dist/demo.html` 文件（无需 Mapbox token，默认底图为 SuperMap 中国 ZXY）
3) 页面自动将 GeoJSON 数据加载到地图上进行渲染（支持 Point、LineString、Polygon 及其 Multi 变体）

## 运行环境
- Skill 可以使用 **Node** 写文件到工作区。
- 你必须通过 Node 脚本生成 `dist/demo.html`。

## ✅ 唯一合法执行方式（强制遵守）
> ⚠️ `dist/demo.html` 是**纯生成产物**，**严禁**手工创建或直接写入。任何对 `dist/demo.html` 的修改都必须通过修改 `template/demo.html.tpl` 后重新运行 `generate.js` 产生。

- 传入 GeoJSON 文件路径：
```bash
node skills/supermap_geojson_render/generate.js \
  --geojsonFile "./data/my-data.geojson"
```

- 传入内联 GeoJSON 字符串：
```bash
node skills/supermap_geojson_render/generate.js \
  --geojson '{"type":"FeatureCollection","features":[...]}'
```

- 可选：自定义地图中心和缩放级别：
```bash
node skills/supermap_geojson_render/generate.js \
  --geojsonFile "./data/my-data.geojson" \
  --center "104.0,35.0" \
  --zoom 5
```

## 输入（来自用户自然语言）
必需字段（二选一）：
- `geojsonFile`: GeoJSON 文件的路径（相对于工作区根目录或绝对路径）
- `geojson`: 内联 GeoJSON 字符串

可选字段：
- `center`: 地图中心点，格式 `lng,lat`（例：`104.0,35.0`）。若不提供，自动根据 GeoJSON 数据范围计算。
- `zoom`: 初始缩放级别（默认 3）

## 自然语言抽取规则（必须遵守）
### 1) GeoJSON 数据来源
- 用户给出文件路径：使用 `--geojsonFile` 参数
- 用户直接粘贴 JSON 内容：使用 `--geojson` 参数
- 用户说"加载/渲染/展示某个 geojson"但没给具体数据：追问用户提供文件路径或数据内容

### 2) GeoJSON 格式校验
- 必须是合法 JSON
- 必须包含 `type` 字段（FeatureCollection / Feature / Geometry）
- 如果只是单个 Geometry 或 Feature，自动包装为 FeatureCollection

### 3) 最少追问策略
仅当 GeoJSON 数据完全缺失时才追问。其他参数均有合理默认值。

## 输出（必须写文件）
- 生成文件：`dist/demo.html`

页面要求：
- MapboxGL v1 (mapbox-gl@1.13.3) + iClient-mapboxgl（与 supermap_sql_query_render 保持一致）
- 默认底图使用 SuperMap 中国 ZXY：
  `https://iclient.supermap.io/iserver/services/map-china/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}`
- 自动根据 GeoJSON 数据范围 fitBounds
- 支持 Point（圆点）、LineString（线条）、Polygon（填充+边框）渲染
- 鼠标点击要素显示属性弹窗（popup）
- 状态栏显示加载的要素数量

## ❌ 严格禁止（必须遵守）

> **这是最高优先级约束，任何情况下都不得违反。**

- ❌ **禁止**直接创建或覆盖写入 `dist/demo.html`（无论是 fs.writeFileSync、重定向、还是其他方式绕过 generate.js）。
- ❌ **禁止**在 `dist/demo.html` 中添加任何模板里没有的 HTML/JS/CSS 内容。
- ❌ **禁止**修改 `template/demo.html.tpl` 里的固定内容（非占位符部分）——如需调整页面，必须先与用户确认再改模板。
- ❌ **禁止**发明/猜测占位符之外的任何逻辑写入生成文件。

## ✅ 唯一合法的生成流程

1. 读取 `template/demo.html.tpl`
2. 将 `__GEOJSON_DATA__` 占位符替换为实际 GeoJSON 数据
3. 将 `__MAP_CENTER_LNG__`、`__MAP_CENTER_LAT__`、`__MAP_ZOOM__` 替换为地图参数
4. 写出 `dist/demo.html`
