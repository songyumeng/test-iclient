---
name: supermap_sql_query_render
description: 从用户自然语言抽取 iServer REST Data SQL 查询参数，用 Node 写出 dist/demo.html（默认中国底图），打开即可查询 getFeaturesBySQL 并上图。
user-invocable: true
---

# supermap_sql_query_render

## 你要做什么
用户用自然语言描述要查询的 iServer 数据服务（REST Data）、数据源/数据集、以及 SQL 过滤条件。你需要：

1) 从自然语言中抽取/推断参数  
2) 生成一个 `dist/demo.html` 文件（无需 Mapbox token，默认底图为 SuperMap 中国 ZXY）  
3) 页面中点击按钮执行 `getFeaturesBySQL` 并将返回要素上图（GeoJSON）

## 运行环境
- Skill 可以使用 **Node** 写文件到工作区。
- 你必须通过 Node 脚本生成 `dist/demo.html`。

## ✅ 唯一合法执行方式（强制遵守）
> ⚠️ `dist/demo.html` 是**纯生成产物**，**严禁**手工创建或直接写入。任何对 `dist/demo.html` 的修改都必须通过修改 `template/demo.html.tpl` 后重新运行 `generate.js` 产生。

- 不带参数（生成可编辑面板；attributeFilter 默认 `1=1`）：
```bash
node skills/supermap_sql_query_render/generate.js
```

- 带参数生成（推荐）：
```bash
node skills/supermap_sql_query_render/generate.js \
  --dataServiceUrl "https://xxx/iserver/services/data-xxx/rest/data" \
  --datasourceName "World" \
  --datasetName "Countries" \
  --attributeFilter "SMID = 247"
```

## 输入（来自用户自然语言）
必需字段：
- `dataServiceUrl`: iServer REST Data 服务根路径（必须到 `/rest/data`）
- `datasourceName`: 数据源名（例：World）
- `datasetName`: 数据集名（例：Countries）
- `attributeFilter`: SQL where 条件（例：SMID = 247）。如果用户没有给，默认 `1=1`。

派生字段（你生成，不要求用户给）：
- `datasetNames`: `["{datasourceName}:{datasetName}"]`
- `qpName`: `"{datasetName}@{datasourceName}"`

## 自然语言抽取规则（必须遵守）
### 1) URL 抽取/归一化
- 从用户文本中识别 `http://` 或 `https://` 开头的 URL。
- 如果 URL 含 `/rest/data`：
  - 截断到 `/rest/data` 结束（去掉后面的 `/datasets/...` 等）
  - 去掉末尾 `/`
- 如果 URL 含 `/iserver/services/` 但不含 `/rest/data`：
  - 你可以补全为 `.../rest/data`（并在输出状态中说明“已补全”）
- 如果无法识别 URL：必须追问用户提供 REST Data 根路径。

### 2) 数据源/数据集抽取
支持用户表达：
- “数据源 World，数据集 Countries”
- “World:Countries”（解析为 datasource=World, dataset=Countries）
- “Countries@World”（解析为 dataset=Countries, datasource=World）
- “World.Countries”（优先按 datasource.dataset 解析；不确定则追问）

若冲突（同时出现多种且不一致），必须追问确认。

### 3) attributeFilter 抽取
- 优先抓取关键词后的内容：“条件：… / where … / SQL：… / 过滤：… / attributeFilter …”
- 若用户只给类似 “SMID=1”，自动规范化成 `SMID = 1`（给等号两侧加空格）
- 若缺失，默认 `1=1`，但在页面面板里仍然展示出来。

### 4) 最少追问策略
仅当以下任一缺失/不确定时追问：
- dataServiceUrl 缺失或无法归一化
- datasourceName/datasetName 缺失或冲突
- attributeFilter 无法形成可用 SQL（例如用户只说“查北京”但没字段）

追问时给用户一个“一次性补齐”的示例格式。

## 输出（必须写文件）
- 生成文件：`dist/demo.html`

页面要求：
- MapboxGL v1 + iClient-mapboxgl
- 默认底图使用 SuperMap 中国 ZXY：
  `https://iclient.supermap.io/iserver/services/map-china/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}`
- 面板输入框：dataServiceUrl/datasourceName/datasetName/attributeFilter，可编辑
- 按钮：查询并上图、清除图层
- 失败时打印 serviceResult JSON

## ❌ 严格禁止（必须遵守）

> **这是最高优先级约束，任何情况下都不得违反。**

- ❌ **禁止**直接创建或覆盖写入 `dist/demo.html`（无论是 fs.writeFileSync、重定向、还是其他方式绕过 generate.js）。
- ❌ **禁止**在 `dist/demo.html` 中添加任何模板里没有的 HTML/JS/CSS 内容。
- ❌ **禁止**修改 `template/demo.html.tpl` 里的固定内容（非占位符部分）——如需调整页面，必须先与用户确认再改模板。
- ❌ **禁止**发明/猜测占位符之外的任何逻辑写入生成文件。

## ✅ 唯一合法的生成流程

`dist/demo.html` **只能且必须**通过以下步骤生成，不得有任何例外：

```bash
node skills/supermap_sql_query_render/generate.js \
  --dataServiceUrl  "<从用户输入抽取>" \
  --datasourceName  "<从用户输入抽取>" \
  --datasetName     "<从用户输入抽取>" \
  --attributeFilter "<从用户输入抽取，缺省 1=1>"
```

该脚本会：
1. 读取 `template/demo.html.tpl`（**不得**修改此文件，除非用户明确要求调整模板本身）
2. 仅替换四个占位符：`__DATA_SERVICE_URL__` / `__DATASOURCE_NAME__` / `__DATASET_NAME__` / `__ATTRIBUTE_FILTER__`
3. 将结果写入 `dist/demo.html`

## 实现方式（Node）
你必须：
1) 运行 `generate.js`（见上方"唯一合法的生成流程"）——**不要**自行读写文件来生成 demo.html。
2) `generate.js` 内部读取模板文件 `template/demo.html.tpl`，用抽取到的值替换占位符：
   - `__DATA_SERVICE_URL__`
   - `__DATASOURCE_NAME__`
   - `__DATASET_NAME__`
   - `__ATTRIBUTE_FILTER__`
3) 写入到 `dist/demo.html`（确保 dist 目录存在）。

## 交付物
- `dist/demo.html`（**必须**由 generate.js 生成，内容与模板完全一致，只有占位符被替换）
