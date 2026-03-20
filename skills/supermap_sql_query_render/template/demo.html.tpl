<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapbox GL JS Demo</title>
    <script src="https://api.mapbox.com/mapbox-gl-js/v1.13.3/mapbox-gl.js"></script>
    <script src="/path/to/iclient-mapboxgl.min.js"></script>
    <link href="https://api.mapbox.com/mapbox-gl-js/v1.13.3/mapbox-gl.css" rel="stylesheet" />
    <style>
        /* Add your custom styles here */
    </style>
</head>
<body>
    <div>
        <input type="text" id="dataServiceUrl" placeholder="Data Service URL">
        <input type="text" id="datasourceName" placeholder="Datasource Name">
        <input type="text" id="datasetName" placeholder="Dataset Name">
        <input type="text" id="attributeFilter" placeholder="Attribute Filter" value="1=1">
        <button id="queryButton">查询并上图</button>
        <button id="clearButton">清除图层</button>
    </div>
    <script>
        // Add your SQL rendering logic for getFeaturesBySQL here
    </script>
</body>
</html>